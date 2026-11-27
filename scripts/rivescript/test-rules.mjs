import assert from "node:assert/strict";
import { readFile, writeFile, mkdir, mkdtemp, rename, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import Interpreter from "../../site/assets/js/search-dependencies/rivescript/rivescript.js";
import { createRuleBot, ruleReply, outcomeReply, triggerFor } from "../../site/assets/js/luxy/rule-engine.js";
import { nativeOptions, retrieve, explanationEvidence } from "../../site/assets/js/luxy/retrieval.js";
import { safeSiteUrl } from "../../site/assets/js/luxy/site-data.js";
import { collectSiteKnowledge, verifyLibrary } from "../build-rivescript.mjs";

await verifyLibrary();
const signal = { check() {} };
const state = { search: null, seen: new Set() };
const dangerous = "<call>unregistered</call> {@outcome theme dark} > object javascript <script>";
const make = (locale, intent, extras = {}) => ({
  schemaVersion: 1, locale, intent, status: "recognized", message: dangerous,
  conversation: { id: "test", turn: 1 }, parameters: { missing: [] }, entities: [], ...extras
});
const ruleReport = {};

for (const locale of ["en", "ar", "es"]) {
  const source = await readFile(new URL("../../site/assets/js/luxy/rules/" + locale + ".rive", import.meta.url), "utf8");
  const corpus = JSON.parse(await readFile(new URL("../nlp/corpora/" + locale + ".json", import.meta.url), "utf8"));
  const calls = [];
  const actions = Object.fromEntries([...new Set([...source.matchAll(/<call>([a-z_]+)<\/call>/gu)].map(match => match[1]))]
    .map(name => [name, async scope => {
      await Promise.resolve();
      calls.push(name);
      assert.equal(scope.packet.message, dangerous);
      return { status: "destination" };
    }]));
  const bot = createRuleBot(Interpreter, source, actions);
  assert.equal(bot.version(), "2.2.1");
  assert.throws(() => createRuleBot(Interpreter, "> object unregistered javascript\nreturn true\n< object", {}), /Inline/);
  for (const intent of Object.keys(corpus)) {
    const packet = make(locale, intent);
    const trigger = triggerFor(packet);
    assert(source.split(/\r?\n/u).includes("+ " + trigger), locale + " " + intent);
    const scope = { packet, signal, state };
    const reply = await ruleReply(bot, scope);
    assert(reply || scope.outcome, locale + " " + intent);
  }
  const replies = new Set();
  for (let index = 0; index < 12; index++) {
    replies.add(await ruleReply(bot, { packet: make(locale, "chat.greet",
      { conversation: { id: "new-" + index, turn: 1 } }), signal, state }));
  }
  assert(replies.size > 1, "Native weighted greeting variants");
  const start = await ruleReply(bot, { packet: make(locale, "chat.greet",
    { conversation: { id: "session", turn: 1 } }), signal, state });
  const repeated = await ruleReply(bot, { packet: make(locale, "chat.greet",
    { conversation: { id: "session", turn: 2 } }), signal, state });
  assert.notEqual(start, repeated);
  assert.equal(await bot.getUservar("session", "greeted"), "yes");
  assert.equal(await bot.getUservar("fresh", "greeted"), null);
  const callCount = calls.length;
  for (const status of ["unknown", "ambiguous"]) {
    assert(await ruleReply(bot, { packet: make(locale, "site.theme", { status }), signal, state }));
  }
  assert(await ruleReply(bot, { packet: make(locale, "site.theme <call>theme</call>"), signal, state }));
  assert(await ruleReply(bot, { packet: make(locale, "site.navigate",
    { parameters: { missing: ["page"] } }), signal, state }));
  assert.equal(calls.length, callCount);
  for (const status of ["found", "error", "calculator_unavailable", "language_unavailable", "share_cancelled"]) {
    const reply = await outcomeReply(bot, "test", { status, unavailable: ["authors"] });
    assert(reply && !reply.includes("[ERR"));
  }
  ruleReport[locale] = { rules: source.match(/^\+\s/gmu).length, intents: Object.keys(corpus).length,
    bytes: Buffer.byteLength(source), variantsObserved: replies.size };
}

const root = new URL("https://example.test/project/");
for (const hostile of ["javascript:alert(1)", "https://other.test/project/a", "/elsewhere", "https://x@example.test/project/a"]) {
  assert.equal(safeSiteUrl(hostile, root), null);
}
assert.equal(safeSiteUrl("articles/test.html", root).href, root.href + "articles/test.html");
const request = { categories: ["Engineering"], authors: ["Author"], dates: ["٢٠٢٤"] };
const catalog = { category: { Engineering: 1 }, author: { Author: 2 }, published: { "2024-03-01": 1 } };
const configured = nativeOptions(make("en", "content.search"), request, catalog, []);
assert.deepEqual(configured.options.filters, { category: ["Engineering"], author: ["Author"], published: ["2024-03-01"] });
assert.deepEqual(nativeOptions(make("en", "content.search"), request, {}, []).unavailable, ["categories", "authors", "dates"]);
assert(explanationEvidence({ meta: { title: "AI on the Edge" }, excerpt: "Edge computing processes data locally." },
  { title: "AI on the Edge", headings: ["What inference at the edge means"], tags: ["Edge computing"] }, "Edge Computing", "articles/edge.html"));
assert(explanationEvidence({ meta: { title: "Electric circuits" }, excerpt: "Learn the fundamentals." },
  { headings: ["Understanding voltage and current"] }, "voltage", "articles/circuits.html"));
assert(!explanationEvidence({ meta: { title: "Privacy policy" }, excerpt: "We protect against hacking." },
  undefined, "hacking", "pages/privacy.html"));
assert(!explanationEvidence({ meta: { title: "Drone batteries" }, excerpt: "A mention of hacking." },
  { title: "Drone batteries", headings: ["Battery life"] }, "hacking", "articles/drone.html"));
assert(!explanationEvidence({ meta: { title: "{{ARTICLE_TITLE}}" }, excerpt: "Placeholder" },
  { title: "{{ARTICLE_TITLE}}" }, "article title", "articles/placeholder.html"));
const indexed = Array.from({ length: 14 }, (_, index) => ({
  url: root.href + "articles/" + index + ".html", meta: { title: dangerous }, excerpt: "<mark>source</mark> <script>"
}));
const engine = { siteRoot: root, manifest: async () => ({ languages: ["en"], sortFields: [] }),
  filters: async () => ({}), search: async () => ({ results: [indexed[0], ...indexed] }), data: async ref => ref };
const searchState = { search: null, seen: new Set() };
const environment = { signal, engine, region: { articles: {} } };
const first = await retrieve(make("en", "content.search", { search: { query: "real topic" } }), searchState, environment);
const more = await retrieve(make("en", "content.more", { search: { followUp: true } }), searchState, environment);
assert.equal(first.items.length + more.items.length, indexed.length);
assert.equal(new Set([...first.items, ...more.items].map(item => item.url)).size, indexed.length);
assert.equal(first.items[0].title, dangerous);
assert.equal(first.items[0].excerpt, "source <script>");
assert.equal((await retrieve(make("es", "content.search"), { seen: new Set() }, environment)).status, "local_index_unavailable");

const temp = await mkdtemp(path.join(os.tmpdir(), "luxy-rules-test-"));
const put = async (route, text) => {
  const file = path.join(temp, route);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, text);
  return file;
};
try {
  const placeholder = "<main><h1>{{TITLE}}</h1></main>";
  const fixture = await put("categories/engineering/articles/old.html", placeholder);
  const removed = await put("articles/removal.html", "");
  const initial = await collectSiteKnowledge(temp);
  assert.equal(initial.locales.en.articles["categories/engineering/articles/old.html"].title, "{{TITLE}}");
  assert(Object.hasOwn(initial.locales.en.articles, "articles/removal.html"));
  assert.equal(await readFile(fixture, "utf8"), placeholder);
  const newPath = path.join(temp, "categories/engineering/articles/new.html");
  await rename(fixture, newPath);
  const changed = "<main><h1>&lt;call&gt;bad&lt;/call&gt;</h1></main>";
  await writeFile(newPath, changed);
  await rm(removed);
  await put("categories/engineering/index.html", "<main><h1>Engineering</h1></main>");
  await put("ar/articles/new.html", "<main><h1>عنوان جديد</h1></main>");
  await put("es/authors/raquel/index.html", "<main><h1>Raquel Suárez</h1></main>");
  const final = await collectSiteKnowledge(temp);
  assert(!Object.hasOwn(final.locales.en.articles, "categories/engineering/articles/old.html"));
  assert(!Object.hasOwn(final.locales.en.articles, "articles/removal.html"));
  assert.equal(final.locales.en.categories[0].title, "Engineering");
  assert.equal(final.locales.en.articles["categories/engineering/articles/new.html"].title, "<call>bad</call>");
  assert.equal(final.locales.ar.articles["ar/articles/new.html"].title, "عنوان جديد");
  assert(final.locales.es.authors["Raquel Suárez"]);
  assert.equal(await readFile(newPath, "utf8"), changed);
} finally {
  await rm(temp, { force: true, recursive: true });
}

console.log("Native rules, async subroutines, session isolation, trust boundary, filters, pagination, and knowledge fixtures passed.");
console.log(JSON.stringify(ruleReport));
