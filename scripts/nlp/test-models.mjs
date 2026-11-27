import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildNlp } from "../build-nlp.mjs";
import { collectArticleKnowledge } from "./article-knowledge.mjs";
import { interpret, locales, restoreModel } from "../../site/assets/js/nlp/interpret.js";

const repo = fileURLToPath(new URL("../../", import.meta.url));
const models = "assets/js/search-dependencies/nlp/models";
const bytesFor = (root, locale) => readFile(path.join(root, models, locale + ".json"));
const readEngine = async (root, locale) => restoreModel(JSON.parse(await bytesFor(root, locale)), locale);

async function snapshotHtml(root) {
  const { readdir } = await import("node:fs/promises");
  const { createHash } = await import("node:crypto");
  const files = (await readdir(root, { recursive: true })).filter(file => /\.html?$/iu.test(file)).sort();
  return Promise.all(files.map(async file => [
    file, createHash("sha256").update(await readFile(path.join(root, file))).digest("hex")
  ]));
}

const current = path.join(repo, "_site");
const [assembledBefore, sourceBefore, artifacts] = await Promise.all([
  snapshotHtml(current),
  snapshotHtml(path.join(repo, "site")),
  Promise.all(locales.map(locale => bytesFor(current, locale)))
]);
await buildNlp(current);
assert.deepEqual(await Promise.all(locales.map(locale => bytesFor(current, locale))), artifacts);
assert.deepEqual(await snapshotHtml(current), assembledBefore);
assert.deepEqual(await snapshotHtml(path.join(repo, "site")), sourceBefore);

const real = await readEngine(current, "en");
const explain = await interpret(real, "What is Python?", {}, { diagnostics: true });
assert.equal(explain.intent, "content.explain");
assert.equal(explain.subject, "Python");
assert(explain.classification.alternatives.some(candidate => candidate.intent === explain.intent));
assert(explain.classification.explanation.length > 0);
assert.equal((await interpret(real, "Edge Computing")).subject, "Edge Computing");
assert.equal((await interpret(real, "  What is Python?  ")).subject, "Python");
const first = await interpret(real, "Find articles about Python");
const follow = await interpret(real, "Show me more articles like these", first.context);
assert.equal(follow.subject, "Python");
assert.equal(follow.search.followUp, true);
const refine = await interpret(real, "Only in engineering", first.context);
assert.equal(refine.subject, "Python");
assert.deepEqual(refine.search.categories, ["Engineering"]);
const newRequest = await interpret(real, "Show me more articles like these");
assert.deepEqual(newRequest.parameters.missing, ["query"]);
const start = await interpret(real, "Explain this");
assert.equal(start.intent, "content.explain");
assert.deepEqual(start.parameters.missing, ["query"]);
for (const text of ["singlet photonics", "Edge Computing"]) {
  const answered = await interpret(real, text, start.context);
  assert.equal(answered.intent, "content.explain");
  assert.equal(answered.subject, text);
  assert.deepEqual(answered.parameters.missing, []);
}
const author = await interpret(real, "Find articles written by Ana Núñez");
assert.equal(author.intent, "content.author");
assert(author.search.authors.includes("Ana Núñez"));
const newsletter = await interpret(real, "Subscribe me with reader@example.test");
assert.equal(newsletter.intent, "newsletter.subscribe");
assert(newsletter.entities.some(entity => entity.entity === "email" && entity.utteranceText === "reader@example.test"));
assert.equal((await interpret(real, "Do that")).status, "ambiguous");
assert.equal((await interpret(real, "zbl plk grn")).status, "unknown");
assert.equal((await interpret(real, "What is tomorrow's weather?")).status, "unknown");
const spaces = "   Explain Python. ";
const spaced = await interpret(real, spaces);
const querySpan = spaced.entities.find(entity => entity.entity === "query");
assert.equal(spaces.slice(querySpan.start, querySpan.end + 1), "Python");
assert.throws(() => restoreModel(JSON.parse(artifacts[0]), "ar"), /locale/);

const temporary = await mkdtemp(path.join(os.tmpdir(), "luxraj-nlp-"));
const root = path.join(temporary, "public");
const options = { cacheDirectory: path.join(temporary, "cache") };
const article = (locale, title, tag, heading, metaTitle = title) => '<html lang="' + locale +
  '" data-cms-seo-type="BlogPosting"><head><meta property="og:title" content="' + metaTitle +
  '"><meta property="article:tag" content="' + tag + '"></head><body><main><article class="article-entry"><h1>' +
  title + '</h1><h2>' + heading + '</h2><p>Uncopied paragraph qubitol.</p></article></main></body></html>';
async function put(route, html) {
  const target = path.join(root, route);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, html);
  return target;
}

try {
  const unfinished = await put("categories/equipment/articles/draft.html",
    article("en", "{{ARTICLE_TITLE}}", "{{TAG}}", "Unfilled waveguide"));
  const removed = await put("categories/equipment/articles/retired.html",
    article("en", "Retired sensor", "zeptosensor", "Old title"));
  await put("ar/articles/radar.html", article("ar", "استشعار الرادار", "مستشعرات الرادار", "الموجات الدقيقة"));
  const original = await snapshotHtml(root);
  const initial = await collectArticleKnowledge(root);
  assert.equal(initial.en.articles, 2);
  assert.equal(initial.ar.articles, 1);
  assert(initial.en.samples.includes("{{ARTICLE_TITLE}}"));
  await buildNlp(root, options);
  const oldBytes = await bytesFor(root, "en");
  const oldAr = await bytesFor(root, "ar");
  assert(!oldBytes.toString().includes("qubitol"));
  assert.equal((await interpret(await readEngine(root, "en"), "zeptosensor")).subject, "zeptosensor");
  assert.equal((await interpret(await readEngine(root, "ar"), "مُستشعرات الرادار")).subject, "مستشعرات الرادار");
  assert.deepEqual(await snapshotHtml(root), original);

  const relocated = await put("categories/photonic-tools/articles/draft.html",
    article("en", "Photonic workbench", "ribwaveguide", "Dielectric measurements", "Photonic test workbench"));
  const updated = path.join(path.dirname(relocated), "photonics.html");
  await rename(relocated, updated);
  await rm(unfinished);
  await rm(removed);
  await put("es/articles/optica.html", article("es", "Óptica integrada", "guía fotónica", "Fotodiodos"));
  const changed = await snapshotHtml(root);
  await buildNlp(root, options);
  const newBytes = await bytesFor(root, "en");
  const updatedKnowledge = await collectArticleKnowledge(root);
  assert.equal(updatedKnowledge.en.articles, 1);
  assert.equal(updatedKnowledge.es.articles, 1);
  assert.notDeepEqual(newBytes, oldBytes);
  assert.deepEqual(await bytesFor(root, "ar"), oldAr);
  assert.deepEqual(await snapshotHtml(root), changed);
  assert(newBytes.toString().includes("Photonic test workbench"));
  for (const stale of ["{{ARTICLE_TITLE}}", "{{TAG}}", "zeptosensor", "Unfilled waveguide"]) {
    assert(!newBytes.toString().includes(stale), "Stale entity survived rebuild: " + stale);
  }
  const en = await readEngine(root, "en");
  assert.equal((await interpret(en, "ribwaveguide")).subject, "ribwaveguide");
  assert.equal((await interpret(en, "photonics")).subject, "Photonic workbench");
  assert.equal((await interpret(en, "Find articles about zeptosensor")).subject, "zeptosensor");
  const es = await readEngine(root, "es");
  assert.equal((await interpret(es, "guía fotónica")).subject, "guía fotónica");
  await buildNlp(root, { cacheDirectory: path.join(temporary, "second-cache") });
  assert.deepEqual(await bytesFor(root, "en"), newBytes);
  assert.deepEqual(await bytesFor(root, "ar"), oldAr);
} finally {
  await rm(temporary, { recursive: true, force: true });
}

console.log("NLP export, context, slots, ambiguity, deterministic refresh, and HTML preservation passed.");
