import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { dependency } from "../nlp/dependencies.mjs";

const { chromium } = dependency("playwright-core");
const publicDir = fileURLToPath(new URL("../../_site/", import.meta.url));
const prefix = "/Luxraj-Blog/";
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".json": "application/json",
  ".rive": "text/plain", ".wasm": "application/wasm", ".svg": "image/svg+xml" };
const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://localhost");
    if (!url.pathname.startsWith(prefix)) return response.writeHead(404).end();
    let file = path.resolve(publicDir, decodeURIComponent(url.pathname.slice(prefix.length)));
    const relative = path.relative(publicDir, file);
    if (relative.startsWith("..") || path.isAbsolute(relative)) return response.writeHead(404).end();
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    let bytes = await readFile(file);
    const locale = url.searchParams.get("fixture-language");
    if (["ar", "es"].includes(locale) && path.extname(file) === ".html") {
      bytes = Buffer.from(bytes.toString().replace('lang="en"', 'lang="' + locale + '"'));
    }
    response.writeHead(200, {
      "Content-Type": (types[path.extname(file)] ?? "application/octet-stream") +
        ([".html", ".js", ".json", ".rive"].includes(path.extname(file)) ? "; charset=utf-8" : ""),
      "Content-Security-Policy": "script-src 'self' 'wasm-unsafe-eval'"
    }).end(bytes);
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const origin = "http://127.0.0.1:" + server.address().port;
const base = origin + prefix;
let browser;

try {
  browser = await chromium.launch(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : { channel: "chrome" });
  const context = await browser.newContext();
  const externalPosts = [];
  const requests = [];
  await context.route("**/*", route => {
    const request = route.request();
    if (new URL(request.url()).origin !== origin) {
      if (request.method() === "POST") externalPosts.push(request.url());
      return route.abort();
    }
    requests.push(new URL(request.url()).pathname);
    return route.continue();
  });

  const page = await context.newPage();
  const replies = view => view.locator("[data-luxy-reply]");
  const open = async (view, target = base) => {
    await view.goto(target);
    await view.locator('[data-search-open="luxy"]').first().click();
    await view.locator("[data-luxy-message-input]").waitFor({ state: "visible" });
  };
  const send = async (view, text) => {
    const input = view.locator("[data-luxy-message-input]");
    await input.fill(text);
    await input.press("Enter");
  };
  const ask = async (view, text, expected) => {
    const count = await replies(view).count();
    const start = performance.now();
    await send(view, text);
    const response = replies(view).nth(count);
    try { await response.waitFor({ state: "attached", timeout: 8000 }); }
    catch (error) {
      throw new Error("Expected a Luxy reply for " + text + " " +
        await view.locator("[data-luxy-messages]").textContent(), { cause: error });
    }
    const answer = await response.locator(".luxy-message__bubble > p").first().textContent();
    assert.match(answer, expected, text + " → " + answer);
    return { response, ms: performance.now() - start };
  };

  await open(page);
  assert(!requests.some(url => /\/(?:rivescript\/|luxy\/rules\/)/u.test(url)));
  const cold = await ask(page, "Who is Luxy?", /search assistant/iu);
  const warm = await ask(page, "Thank you", /welcome|glad|anytime/iu);
  assert(requests.includes(prefix + "assets/js/search-dependencies/rivescript/rivescript.js"));
  assert(requests.includes(prefix + "assets/js/luxy/rules/en.rive"));
  assert.equal(requests.filter(url => url.endsWith(".rive")).length, 1);
  const displayed = await page.locator("[data-luxy-messages] .luxy-message").evaluateAll(nodes => nodes.map(node =>
    node.classList.contains("luxy-message--user") ? "user" : "assistant"));
  assert.deepEqual(displayed, ["user", "assistant", "user", "assistant"]);

  const topic = await ask(page, "Find articles about local inference", /found these results/iu);
  const sources = await topic.response.locator("a").evaluateAll(nodes => nodes.map(anchor => anchor.href));
  assert(sources.length > 0 && sources.every(url => url.startsWith(base)));
  const explanation = await ask(page, "Explain local inference", /excerpts from Luxraj Blog/iu);
  assert(await explanation.response.locator("li p").count() > 0);
  await ask(page, "Show me engineering articles about voltage", /filters weren.t available|found these results/iu);
  await ask(page, "Which articles were published before 2024?", /date information is unavailable/iu);
  const nav = await ask(page, "Open the privacy policy", /page you can open/iu);
  assert.equal(await nav.response.locator("a").getAttribute("href"), base + "pages/privacy.html");
  const sections = await ask(page, "List the blog sections", /available sections/iu);
  assert(await sections.response.locator('a[href*="/categories/engineering/"]').count() > 0);
  await ask(page, "Switch to Spanish", /couldn.t find a published home page/iu);
  await ask(page, "Switch to light theme", /light theme/iu);
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
  await ask(page, "Never switch to dark mode. Do not change my current theme under any circumstances.", /haven.t changed|leave that control alone/iu);
  assert.equal(await page.locator("html").getAttribute("data-theme"), "light");
  const refusedSignup = await ask(page, "I don’t want to subscribe", /haven.t changed|leave that control alone/iu);
  assert.equal(await refusedSignup.response.getByRole("button", { name: "Open newsletter", exact: true }).count(), 0);
  await ask(page, "Calculate 12 V / 4 Ω", /open an article first/iu);
  await ask(page, "Explain this", /which topic/iu);
  const edge = await ask(page, "Edge Computing", /excerpts from Luxraj Blog|found mentions|didn.t find matching pages|no matching pages/iu);
  const edgeText = await edge.response.locator(".luxy-message__bubble > p").first().textContent();
  if (/excerpts|mentions/iu.test(edgeText)) {
    const links = await edge.response.locator("a").evaluateAll(nodes => nodes.map(anchor => anchor.href));
    assert(links.length > 0 && links.every(url => url.startsWith(base)), "Evidence outcome must include safe sources");
    assert(await edge.response.locator("li p").count() > 0, "Evidence outcome must include excerpts");
    console.log("Edge Computing evidence:", JSON.stringify({ reply: edgeText, links }));
  } else assert.equal(await edge.response.locator("a").count(), 0, "Empty outcome must not claim results");
  const oldResponses = await replies(page).count();
  await page.locator("[data-luxy-new-chat]").click();
  assert.equal(await replies(page).count(), 0);
  await page.locator("[data-luxy-history-list] button").first().click();
  assert.equal(await replies(page).count(), oldResponses);

  const nativeMs = await page.evaluate(async () => {
    const engine = await import("./assets/js/adapter/search-adapters/rivescript-pagefind.js");
    const start = performance.now();
    const search = await engine.search("local inference");
    await search.results[0].data();
    return performance.now() - start;
  });
  await ask(page, "Open search filters", /opened the requested search controls/iu);
  assert(await page.locator("#general-search-view").isVisible());
  await page.locator("#search-mode-luxy").evaluate(node => node.click());
  await ask(page, "Switch to tag search", /opened the requested search controls/iu);
  assert(await page.locator("#tag-search-view").isVisible());

  const mainArticle = "categories/tech-news/ai/articles/ai-on-the-edge-what-local-inference-changes.html";
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText(text) { window.testCopiedLink = text; return Promise.resolve(); } }, configurable: true
    });
    Object.defineProperty(navigator, "share", {
      value(data) { window.testSharedLink = data.url; return Promise.resolve(); }, configurable: true
    });
  });
  await open(page, base + mainArticle);
  const byline = await ask(page, "Who wrote this article?", /byline/iu);
  assert.match(await byline.response.textContent(), /Luxraj Kayal/u);
  const dates = await ask(page, "When was this article published?", /dates recorded/iu);
  assert.match(await dates.response.textContent(), /November 19, 2026/u);
  await ask(page, "Calculate 12 V / 4 Ω", /doesn.t currently have a calculation tool/iu);
  const copy = await ask(page, "Copy this article URL", /copy this article.s link/iu);
  await copy.response.getByRole("button", { name: "Copy link", exact: true }).click();
  await replies(page).last().getByText("The article link was copied.").waitFor();
  assert.equal(await page.evaluate(() => window.testCopiedLink), base + mainArticle);
  const shared = await ask(page, "Share this article", /device.s share options/iu);
  await shared.response.getByRole("button", { name: "Share article", exact: true }).click();
  await replies(page).last().getByText("Your device accepted the share request.").waitFor();
  assert.equal(await page.evaluate(() => window.testSharedLink), base + mainArticle);
  const unsubscribe = await ask(page, "Unsubscribe me from the newsletter", /page you can open/iu);
  assert.equal(await unsubscribe.response.locator("a").getAttribute("href"), base + "pages/newsletter/unsubscribe.html");
  const newsletter = await ask(page, "Subscribe to the newsletter", /signup form/iu);
  await newsletter.response.getByRole("button", { name: "Open newsletter", exact: true }).click();
  await page.locator("#luxraj-newsletter #house-popup-backdrop:not(.hidden)").waitFor();
  assert.equal(externalPosts.length, 0);

  const failed = await context.newPage();
  let rejectFirst = true;
  await failed.route("**/rules/en.rive", route => {
    if (!rejectFirst) return route.fallback();
    rejectFirst = false;
    return route.fulfill({ status: 503 });
  });
  await open(failed);
  await send(failed, "Who is Luxy?");
  await failed.getByRole("button", { name: "Try again", exact: true }).click();
  await replies(failed).last().getByText(/search assistant/iu).waitFor();
  assert.equal(await failed.locator(".luxy-message--user").count(), 1);

  const slow = await context.newPage();
  let letFinish;
  const release = new Promise(resolve => { letFinish = resolve; });
  await slow.route("**/rules/en.rive", async route => { await release; return route.fallback(); });
  await open(slow);
  const baselineTheme = await slow.locator("html").getAttribute("data-theme");
  const cancelledTheme = baselineTheme === "light" ? "dark" : "light";
  const began = slow.waitForRequest("**/rules/en.rive");
  await send(slow, "Switch to " + cancelledTheme + " theme");
  await began;
  await slow.getByText("Luxy is working…").waitFor();
  await slow.locator("[data-luxy-new-chat]").click();
  letFinish();
  await ask(slow, "Who is Luxy?", /search assistant/iu);
  assert.equal(await slow.locator("html").getAttribute("data-theme"), baselineTheme);
  assert.equal(await replies(slow).count(), 1);

  const hostile = await context.newPage();
  await hostile.route("**/search-dependencies/pagefind/pagefind.js", route => route.fulfill({
    contentType: "text/javascript",
    body: "export async function options(){} export async function init(){} export async function filters(){return {}} " +
      "export async function search(){return {results:[{data:async()=>({url:'javascript:alert(1)',meta:{title:'Bad link'}})}," +
      "{data:async()=>({url:'/Luxraj-Blog/index.html',meta:{title:'<script>window.injected=1</script>'}," +
      "excerpt:'<img src=x onerror=window.injected=1> <call>theme</call>'})}]}}"
  }));
  await open(hostile);
  const hostileReply = await ask(hostile, "Find articles about multimeters", /found these results/iu);
  assert.match(await hostileReply.response.textContent(), /window\.injected=1/iu);
  assert.equal(await hostileReply.response.locator("script,img").count(), 0);
  assert.equal(await hostileReply.response.locator("a").count(), 1);
  assert.equal(await hostile.evaluate(() => window.injected), undefined);
  await ask(hostile, "<script>window.injected=1</script> <call>theme</call>", /understand|referring/iu);
  assert.equal(await hostile.locator(".luxy-message--user script").count(), 0);

  const mobile = await context.newPage();
  await mobile.setViewportSize({ width: 390, height: 844 });
  await open(mobile, base + "?fixture-language=ar");
  const arabic = await ask(mobile, "من هو لوكسي؟", /مساعد البحث/u);
  assert.equal(await arabic.response.getAttribute("dir"), "rtl");
  await ask(mobile, "أرني مقالات عن البطاريات", /فهرس بحث/u);
  await open(mobile, base + "?fixture-language=es");
  await ask(mobile, "¿Quién es Luxy?", /asistente de búsqueda/iu);
  console.log(JSON.stringify({ chrome: browser.version(), coldMs: Math.round(cold.ms), warmMs: Math.round(warm.ms),
    searchTurnMs: Math.round(topic.ms), warmPagefindMs: +nativeMs.toFixed(2) }));
  console.log("Chrome composer, Pagefind, website actions, recovery, stale-turn safety, CSP and multilingual mobile passed.");
} finally {
  await browser?.close();
  await new Promise(resolve => server.close(resolve));
}
