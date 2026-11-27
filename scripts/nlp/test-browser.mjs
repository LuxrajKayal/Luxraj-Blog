import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dependency } from "./dependencies.mjs";

const { chromium } = dependency("playwright-core");
const root = fileURLToPath(new URL("../../_site/", import.meta.url));
const prefix = "/Luxraj-Blog/";
const mime = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json", ".svg": "image/svg+xml", ".webp": "image/webp", ".png": "image/png", ".wasm": "application/wasm"
};
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    if (!url.pathname.startsWith(prefix)) return response.writeHead(404).end();
    let file = path.resolve(root, decodeURIComponent(url.pathname.slice(prefix.length)));
    const relative = path.relative(root, file);
    if (relative.startsWith("..") || path.isAbsolute(relative)) return response.writeHead(404).end();
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    const bytes = await readFile(file);
    response.writeHead(200, { "Content-Type": mime[path.extname(file)] ?? "application/octet-stream" }).end(bytes);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));

let browser;
try {
  const executablePath = process.env.CHROME_BIN;
  browser = await chromium.launch(executablePath ? { executablePath } : { channel: "chrome" });
  const page = await browser.newPage();
  const origin = "http://127.0.0.1:" + server.address().port;
  const nlpRequests = [];
  await page.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (url.origin !== origin) return route.abort();
    if (url.pathname.includes("/search-dependencies/nlp/")) nlpRequests.push(url.pathname);
    return route.continue();
  });
  await page.goto(origin + prefix, { waitUntil: "load" });
  assert.equal(nlpRequests.length, 0, "NLP download must wait for use.");
  await page.evaluate(async () => {
    const { connectNlpReceiver } = await import("./assets/js/adapter/search-adapters/nlp-rivescript.js");
    window.testNlpTurns = [];
    window.disconnectTestNlp = connectNlpReceiver(packet => window.testNlpTurns.push(packet));
  });

  const open = page.locator('[data-search-open="luxy"]').first();
  await open.click();
  const input = page.locator("[data-luxy-message-input]");
  const first = "  Show me engineering articles about cascode amplifiers.  ";
  const start = performance.now();
  await input.fill(first);
  await input.press("Enter");
  await page.waitForFunction(() => window.testNlpTurns.length === 1);
  const coldMs = performance.now() - start;
  const rendered = page.locator("[data-luxy-messages] .luxy-message--user");
  await rendered.first().waitFor({ state: "visible" });
  assert.equal(await rendered.first().textContent(), first);
  const result = await page.evaluate(() => window.testNlpTurns[0]);
  assert.equal(result.message, first);
  assert.equal(result.schemaVersion, 1);
  assert.equal(result.conversation.turn, 1);
  assert.equal(result.page.path, prefix);
  assert.equal(result.intent, "content.search");
  assert.equal(result.search.query, "cascode amplifiers");
  assert.deepEqual(result.search.categories, ["Engineering"]);
  assert(nlpRequests.some(file => file.endsWith("/nlpjs.js")));
  assert.deepEqual(nlpRequests.filter(file => file.includes("/models/")), [prefix + "assets/js/search-dependencies/nlp/models/en.json"]);

  await input.fill("Show me more articles like these");
  await page.locator("[data-luxy-send]").click();
  await page.waitForFunction(() => window.testNlpTurns.length === 2);
  const followUp = await page.evaluate(() => window.testNlpTurns[1]);
  assert.equal(followUp.subject, result.subject);
  assert.equal(followUp.conversation.id, result.conversation.id);
  assert.equal(followUp.conversation.turn, 2);
  assert.equal(await page.locator(".luxy-message--assistant").count(), 0);

  await page.locator("[data-luxy-new-chat]").click();
  await input.fill("Show me more articles like these");
  await input.press("Enter");
  await page.waitForFunction(() => window.testNlpTurns.length === 3);
  const isolated = await page.evaluate(() => window.testNlpTurns[2]);
  assert.notEqual(isolated.conversation.id, result.conversation.id);
  assert.deepEqual(isolated.parameters.missing, ["query"]);
  assert.equal(await rendered.count(), 1);
  await page.evaluate(() => window.disconnectTestNlp());

  const otherModels = await page.evaluate(async () => {
    const { createNlpConversation } = await import("./assets/js/adapter/search-adapters/ui-nlp.js");
    const results = [];
    for (const [locale, message] of [
      ["ar", "أرني مقالات عن دوائر القدرة"],
      ["es", "¿Qué significa la óptica cuántica?"]
    ]) {
      const session = createNlpConversation({ locale });
      const start = performance.now();
      const turn = await session.submit(message, { diagnostics: true });
      results.push({ locale: turn.locale, intent: turn.intent, subject: turn.subject, coldMs: performance.now() - start });
    }
    const automatic = await createNlpConversation().submit("How do I search for articles about semiconductors?");
    const automaticArabic = await createNlpConversation().submit("ما هي مدونة لوكسراج وما المواضيع التي تغطيها؟");
    const automaticSpanish = await createNlpConversation().submit("¿Cómo puedo encontrar artículos escritos en español?");
    const timingSession = createNlpConversation({ locale: "en" });
    const durations = [];
    for (let index = 0; index < 20; index++) {
      const start = performance.now();
      await timingSession.submit("Show me engineering articles about cascode amplifiers.");
      durations.push(performance.now() - start);
    }
    return { results, guessed: [automatic.locale, automaticArabic.locale, automaticSpanish.locale],
      warmP95: durations.sort((a, b) => a - b)[18] };
  });
  assert.deepEqual(otherModels.results.map(turn => [turn.locale, turn.intent, turn.subject]), [
    ["ar", "content.search", "دوائر القدرة"],
    ["es", "content.explain", "la óptica cuántica"]
  ]);
  assert.deepEqual(otherModels.guessed, ["en", "ar", "es"]);
  assert(otherModels.warmP95 < 300);
  assert(coldMs < 5000);

  // A failed fetch is evicted so the next submission can retry the same locale.
  let failOnce = true;
  await page.route("**/models/es.json", route => {
    if (!failOnce) return route.fallback();
    failOnce = false;
    return route.fulfill({ status: 503, body: "" });
  });
  await page.reload({ waitUntil: "load" });
  const retry = await page.evaluate(async () => {
    const { createNlpConversation } = await import("./assets/js/adapter/search-adapters/ui-nlp.js");
    const session = createNlpConversation({ locale: "es" });
    try {
      await session.submit("¿Quién es Luxy?");
      return null;
    } catch {
      return session.submit("¿Quién es Luxy?");
    }
  });
  assert.equal(retry.intent, "assistant.identity");
  assert.equal(retry.conversation.turn, 1);

  await page.evaluate(() => document.dispatchEvent(new CustomEvent("luxraj:tag-select", {
    detail: { tagId: "Box1", tagName: "Artificial Intelligence" }
  })));
  assert(await page.locator("#tag-search-view").isVisible());
  assert((await page.locator("#tag-search-results .search-result").count()) > 0);
  console.log(JSON.stringify({ browser: browser.version(), englishComposerColdMs: Math.round(coldMs),
    warmP95Ms: +otherModels.warmP95.toFixed(2), languages: otherModels.results }, null, 2));
  console.log("Browser composer, adapters, native language recognition, retry, and Tag Search passed.");
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
