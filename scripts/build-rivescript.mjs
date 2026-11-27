import { spawnSync } from "node:child_process";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import assert from "node:assert/strict";
import { dependency } from "./nlp/dependencies.mjs";
import { archive, distribution, workingBundle } from "./bundle-rivescript.mjs";

const { parse } = dependency("parse5");
const repo = fileURLToPath(new URL("../", import.meta.url));
const attr = (node, key) => node?.attrs?.find(field => field.name === key)?.value;
const value = node => node?.value ?? (node?.childNodes ?? []).map(value).join("");
const tidy = string => string?.trim().replace(/\s+/gu, " ") || "";
export const destinations = {
  home: "index.html", about: "pages/about.html", archive: "pages/archive.html",
  contact: "pages/contact.html", editorial: "pages/editorial.html", advertising: "pages/advertising.html",
  privacy: "pages/privacy.html", unsubscribe: "pages/newsletter/unsubscribe.html"
};

function* elements(node) {
  if (node.tagName) yield node;
  for (const child of node.childNodes ?? []) yield* elements(child);
}

async function* htmlFiles(directory, prefix = "") {
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name < b.name ? -1 : 1)) {
    const route = prefix + entry.name;
    if (entry.isDirectory()) yield* htmlFiles(path.join(directory, entry.name), route + "/");
    else if (entry.isFile() && /\.html?$/iu.test(entry.name)) yield route;
  }
}

export async function collectSiteKnowledge(root) {
  const locales = Object.fromEntries(["en", "ar", "es"].map(locale => [locale, {
    pages: {}, categories: [], articles: {}, authors: {}
  }]));
  const routes = new Set();
  for await (const route of htmlFiles(root)) {
    routes.add(route);
    const languagePrefix = route.match(/^(ar|es)\//u)?.[0] ?? "";
    const locale = locales[languagePrefix.slice(0, -1) || "en"];
    const localRoute = route.slice(languagePrefix.length);
    const page = Object.keys(destinations).find(key => destinations[key] === localRoute);
    const articleRoute = /(?:^|\/)articles\//u.test(localRoute);
    const category = localRoute.startsWith("categories/") && !articleRoute;
    const authorRoute = localRoute.startsWith("authors/");
    if (!page && !articleRoute && !category && !authorRoute) continue;

    const nodes = [...elements(parse(await readFile(path.join(root, route), "utf8")))];
    const meta = key => tidy(attr(nodes.find(node => node.tagName === "meta" &&
      (attr(node, "property") ?? attr(node, "name")) === key), "content"));
    const title = tidy(value(nodes.find(node => node.tagName === "h1"))) ||
      tidy(value(nodes.find(node => node.tagName === "title")));
    const item = { route, title };
    if (page) locale.pages[page] = item;
    if (category) {
      const slug = localRoute.split("/").at(-2);
      locale.categories.push({ ...item, slug });
    }
    if (articleRoute) {
      const bar = nodes.find(node => attr(node, "data-author-id"));
      const main = nodes.find(node => node.tagName === "article" && (attr(node, "class") ?? "").split(/\s+/u).includes("article-entry"))
        ?? nodes.find(node => node.tagName === "main");
      const headings = [...elements(main ?? { childNodes: nodes.filter(node => /^h[23]$/u.test(node.tagName)) })]
        .filter(node => /^h[23]$/u.test(node.tagName)).map(node => tidy(value(node))).filter(Boolean);
      const tags = nodes.filter(node => node.tagName === "meta" &&
        ["article:tag", "keywords"].includes(attr(node, "property") ?? attr(node, "name")))
        .flatMap(node => tidy(attr(node, "content")).split(/[,;]/u).map(tidy)).filter(Boolean);
      locale.articles[route] = {
        title, headings: headings.slice(0, 24), tags: tags.slice(0, 24),
        description: meta("description") || meta("og:description"),
        authorId: attr(bar, "data-author-id") || "",
        author: meta("author") || meta("article:author"),
        published: attr(bar, "data-published-date") || meta("article:published_time"),
        modified: attr(bar, "data-modified-date") || meta("article:modified_time")
      };
    }
    if (authorRoute && title) locale.authors[title] = item;
  }
  return { locales, routes: [...routes] };
}

export async function verifyLibrary() {
  const expected = await workingBundle();
  assert((await readFile(distribution)).equals(expected), "Rebuild the pinned browser distribution");
  const original = spawnSync("tar", ["-xOf", archive, "package/LICENSE"]);
  assert.equal(original.status, 0, String(original.stderr));
  for (const file of ["search-dependencies/rivescript/LICENSE", "site/assets/js/search-dependencies/rivescript/LICENSE"]) {
    const bytes = await readFile(path.join(repo, file));
    assert(bytes.equals(original.stdout), "Upstream bytes for " + file);
  }
}

export async function buildRiveScript(root = path.join(repo, "_site")) {
  const start = performance.now();
  const knowledge = await collectSiteKnowledge(root);
  const output = path.join(root, "assets/js/luxy");
  await mkdir(output, { recursive: true });
  const text = JSON.stringify(knowledge);
  await writeFile(path.join(output, "knowledge.json"), text);
  console.log("Luxy knowledge", JSON.stringify({ bytes: Buffer.byteLength(text),
    articles: Object.values(knowledge.locales).reduce((count, region) => count + Object.keys(region.articles).length, 0),
    ms: Math.round(performance.now() - start) }));
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const start = performance.now();
  await verifyLibrary();
  await buildRiveScript();
  console.log("RiveScript verification and knowledge build " + Math.round(performance.now() - start) + " ms");
}
