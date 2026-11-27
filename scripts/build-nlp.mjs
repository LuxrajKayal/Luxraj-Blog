#!/usr/bin/env node
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { collectArticleKnowledge } from "./nlp/article-knowledge.mjs";
import { browserBundle, bundlePath } from "./nlp/bundle.mjs";
import { readCorpora, trainLocale } from "./nlp/train.mjs";
import { interpret, locales, restoreModel } from "../site/assets/js/nlp/interpret.js";

const root = fileURLToPath(new URL("../", import.meta.url));
const cache = path.join(root, "search-dependencies/nlp/.model-cache");
const inputFiles = ["scripts/build-nlp.mjs", "scripts/nlp/train.mjs", "scripts/nlp/corpora/entities.mjs",
  "site/assets/js/nlp/interpret.js", "site/assets/js/nlp/request-policy.js", "site/assets/js/nlp/entity-text.js", "search-dependencies/nlp/package-lock.json"];
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const smokeChecks = {
  en: ["What is Luxy?", "Find articles about zeta storage"],
  ar: ["من هو لوكسي؟", "أريد مقالات عن التخزين الهجين"],
  es: ["¿Quién es Luxy?", "Busca artículos sobre baterías híbridas"]
};

async function writeAtomic(file, text) {
  const temporary = file + "." + randomUUID();
  try {
    await writeFile(temporary, text);
    await rename(temporary, file);
  } finally {
    await rm(temporary, { force: true });
  }
}

async function serializeModel(locale, corpus, knowledge, fingerprint, cacheDirectory) {
  const file = path.join(cacheDirectory, locale + ".json");
  let model;
  let reused = false;
  try {
    const cached = JSON.parse(await readFile(file, "utf8"));
    if (cached.fingerprint === fingerprint && digest(JSON.stringify(cached.model)) === cached.sha256) {
      model = cached.model;
      reused = true;
    }
  } catch (error) {
    if (error.code !== "ENOENT" && !(error instanceof SyntaxError)) throw error;
  }
  model ??= await trainLocale(locale, corpus, knowledge);
  const serialized = JSON.stringify(model);
  const restored = restoreModel(JSON.parse(serialized), locale);
  const [identity, search] = await Promise.all(smokeChecks[locale].map(message => interpret(restored, message)));
  if (identity.intent !== "assistant.identity" || search.intent !== "content.search" || !search.subject) {
    throw new Error("NLP smoke validation failed for " + locale + " " + JSON.stringify({
      identity: identity.intent, search: search.intent, subject: search.subject
    }));
  }
  if (!reused) {
    await mkdir(cacheDirectory, { recursive: true });
    await writeAtomic(file, JSON.stringify({ fingerprint, sha256: digest(serialized), model }));
  }
  return { serialized, reused };
}

export async function buildNlp(site = path.join(root, "_site"), { cacheDirectory = cache } = {}) {
  const [corpora, knowledge, committedBundle, rebuiltBundle, ...inputs] = await Promise.all([
    readCorpora(),
    collectArticleKnowledge(site),
    readFile(bundlePath),
    browserBundle(),
    ...inputFiles.map(file => readFile(path.join(root, file)))
  ]);
  if (committedBundle.toString("utf8").replace(/\r\n/gu, "\n") !== Buffer.from(rebuiltBundle).toString("utf8")) {
    throw new Error("NLP.js browser distribution is stale. Run node scripts/nlp/bundle.mjs.");
  }
  const implementation = digest(Buffer.concat([rebuiltBundle, ...inputs]));
  const bundles = await Promise.all(locales.map(async (locale, index) => {
    const articles = knowledge[locale];
    const fingerprint = digest(JSON.stringify([implementation, locale, corpora[index], articles.entities, articles.samples]));
    const start = performance.now();
    const { serialized, reused } = await serializeModel(locale, corpora[index], articles, fingerprint, cacheDirectory);
    return { locale, serialized, reused, ms: Math.round(performance.now() - start), articles: articles.articles,
      options: Object.values(articles.entities).reduce((sum, values) => sum + values.length, 0) };
  }));
  const output = path.join(site, "assets/js/search-dependencies/nlp/models");
  await mkdir(output, { recursive: true });
  for (const { locale, serialized, reused, ms, articles, options } of bundles) {
    await writeAtomic(path.join(output, locale + ".json"), serialized);
    console.log(JSON.stringify({ locale, articles, options, bytes: Buffer.byteLength(serialized), reused, ms }));
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildNlp();
}
