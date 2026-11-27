import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { interpret, locales, restoreModel } from "../../site/assets/js/nlp/interpret.js";
import { ambiguous, negatives, grammar } from "./corpora/entities.mjs";
import { collectArticleKnowledge } from "./article-knowledge.mjs";
import { readCorpora } from "./train.mjs";

const site = fileURLToPath(new URL("../../_site/", import.meta.url));
const normalize = value => value.toLowerCase().replace(/[^\p{L}\p{N}\s]+/gu, "").trim();
const results = [];
const [corpora, knowledge] = await Promise.all([readCorpora(), collectArticleKnowledge(site)]);
const holdout = JSON.parse(await readFile(new URL("evaluation/holdout.json", import.meta.url), "utf8"));

for (const [index, locale] of locales.entries()) {
  const [bytes, calibration] = await Promise.all([
    readFile(path.join(site, "assets/js/search-dependencies/nlp/models", locale + ".json")),
    readFile(new URL("evaluation/" + locale + ".json", import.meta.url), "utf8").then(JSON.parse)
  ]);
  const cases = [...calibration, ...holdout[locale]];
  const training = new Set([
    ...Object.values(corpora[index]).flat(),
    ...ambiguous[locale],
    ...negatives[locale],
    ...knowledge[locale].samples.map(subject => grammar[locale].generated + subject)
  ].map(normalize));
  const init = performance.now();
  const engine = restoreModel(JSON.parse(bytes), locale);
  const restoreMs = performance.now() - init;
  const durations = [];
  const confusion = {};
  const misses = [];
  let correct = 0;
  let unknown = 0;
  let unknownCount = 0;
  let entityCount = 0;
  let entitiesCorrect = 0;
  let holdoutCorrect = 0;

  for (const [caseIndex, [message, expected, entities = {}]] of cases.entries()) {
    assert(!training.has(normalize(message)), "Training and evaluation overlap: " + message);
    const start = performance.now();
    const actual = await interpret(engine, message, {}, { diagnostics: true });
    durations.push(performance.now() - start);
    if (actual.intent === expected) {
      correct++;
      if (caseIndex >= calibration.length) holdoutCorrect++;
    }
    else {
      const key = expected + " -> " + actual.intent;
      confusion[key] = (confusion[key] ?? 0) + 1;
      misses.push({ message, expected, actual: actual.intent, scores: actual.classification.alternatives.slice(0, 3),
        input: actual.classification.input });
    }
    if (expected === "None") {
      unknownCount++;
      if (actual.intent === "None") unknown++;
    }
    for (const [name, value] of Object.entries(entities)) {
      entityCount++;
      if (actual.entities.some(entity => entity.entity === name &&
        (entity.option ?? entity.utteranceText) === value)) entitiesCorrect++;
      else misses.push({ message, expectedEntity: [name, value], actualEntities: actual.entities });
    }
  }

  const p95 = durations.sort((a, b) => a - b)[Math.ceil(durations.length * 0.95) - 1];
  console.log(JSON.stringify({ locale, accuracy: [correct, cases.length], holdout: [holdoutCorrect, holdout[locale].length],
    unknown: [unknown, unknownCount],
    entities: [entitiesCorrect, entityCount], confusion, restoreMs: +restoreMs.toFixed(2), p95Ms: +p95.toFixed(2),
    bytes: bytes.length, gzipBytes: gzipSync(bytes).length, misses }, null, 2));
  const entityChars = Object.values(knowledge[locale].entities).flat().reduce(
    (size, [name, aliases]) => size + name.length + aliases.join("").length, 0);
  results.push({ locale, correct, cases, unknown, unknownCount, entitiesCorrect, entityCount, bytes, p95, entityChars });
}

for (const { locale, correct, cases, unknown, unknownCount, entitiesCorrect, entityCount, bytes, p95, entityChars } of results) {
  assert(correct / cases.length >= 0.85, locale + " intent accuracy must reach 85%.");
  assert(unknown / unknownCount >= 0.85, locale + " unknown rejection must reach 85%.");
  assert(entitiesCorrect / entityCount >= 0.9, locale + " entity recall must reach 90%.");
  assert(bytes.length < 512 * 1024 + 16 * entityChars, locale + " model grew beyond the feature and entity budget.");
  assert(p95 < 300, locale + " diagnostic p95 exceeds 300 ms.");
}
