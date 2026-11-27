import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { dependency } from "./dependencies.mjs";

const { parse } = dependency("parse5");

const languages = ["en", "ar", "es"];
const clean = value => (value ?? "").replace(/\s+/gu, " ").trim().normalize("NFC");
const wordsFromSlug = value => clean(value.replace(/[-_]+/gu, " "));
const attr = (node, name) => node?.attrs?.find(item => item.name === name)?.value;
const content = node => node.nodeName === "#text" ? node.value : (node.childNodes ?? []).map(content).join("");

function* elements(node) {
  if (node.tagName) yield node;
  for (const child of node.childNodes ?? []) yield* elements(child);
}

async function* pages(root, directory = "") {
  for (const entry of (await readdir(path.join(root, directory), { withFileTypes: true }))
    .sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0)) {
    const relative = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) yield* pages(root, relative);
    if (entry.isFile() && /\.html?$/iu.test(entry.name)) yield relative;
  }
}

function readPage(route, html) {
  const tree = [...elements(parse(html))];
  const segments = route.split("/");
  const rootLanguage = ["ar", "es"].includes(segments[0]) ? segments.shift() : undefined;
  const declaredLanguage = attr(tree[0], "lang")?.toLowerCase().split("-")[0];
  const locale = rootLanguage ?? declaredLanguage ?? "en";
  const metadata = name => tree
    .filter(node => node.tagName === "meta" && (attr(node, "property") ?? attr(node, "name"))?.toLowerCase() === name)
    .map(node => clean(attr(node, "content"))).filter(Boolean);
  const article = segments.slice(0, -1).includes("articles") ||
    /^(?:BlogPosting|Article|NewsArticle)$/iu.test(attr(tree[0], "data-cms-seo-type") ?? "") ||
    metadata("og:type").includes("article");
  const categoryPath = segments[0] === "categories" ? segments.slice(1, -1) : [];
  const main = tree.find(node => node.tagName === "article" &&
    (attr(node, "class") ?? "").split(/\s+/u).includes("article-entry")) ??
    tree.find(node => node.tagName === "main");
  const headings = [...elements(main ?? { childNodes: tree.filter(node => /^h[1-3]$/u.test(node.tagName)) })]
    .filter(node => /^h[1-3]$/u.test(node.tagName))
    .map(node => ({ tag: node.tagName, text: clean(content(node)) })).filter(heading => heading.text);
  const titles = [
    ...headings.filter(heading => heading.tag === "h1").map(heading => heading.text),
    ...metadata("og:title"),
    ...metadata("twitter:title"),
    clean(tree.find(node => node.tagName === "title")?.childNodes?.map(content).join(""))
  ].filter(Boolean);
  const body = tree.find(node => node.tagName === "body");
  return {
    locale, route, article, categoryPath, titles, headings,
    articleId: attr(body, "data-article-id"),
    authorIds: tree.map(node => attr(node, "data-author-id")).filter(Boolean),
    capabilities: tree.map(node => attr(node, "data-article-capability")).filter(Boolean),
    tags: [...metadata("article:tag"), ...metadata("keywords")].flatMap(text => text.split(/[,;]/u)),
    authors: [...metadata("author"), ...metadata("article:author")],
    sections: metadata("article:section")
  };
}

function record(entities, type, value, aliases = []) {
  const canonical = clean(value);
  if (!canonical || canonical.length > 180) return;
  const options = (entities[type] ??= new Map());
  const key = canonical.toLowerCase();
  if (!options.has(key)) options.set(key, { value: canonical, aliases: new Set() });
  const kept = options.get(key).aliases;
  for (const alias of [canonical, ...aliases].map(clean)) {
    if (alias && alias.length <= 180) kept.add(alias);
  }
}

async function loadSiteModule(root, name) {
  const file = path.join(root, "assets/js", name);
  try {
    return await import(pathToFileURL(file).href);
  } catch (error) {
    if (error.code === "ERR_MODULE_NOT_FOUND" && error.url === pathToFileURL(file).href) return {};
    throw error;
  }
}

export async function collectArticleKnowledge(root) {
  const documents = [];
  const categories = new Map();
  const [{ AUTHORS_BY_ID = {} }, { getArticleTagNames }, { ARTICLES = [] }] = await Promise.all([
    loadSiteModule(root, "author-library.js"),
    loadSiteModule(root, "tag-indexer.js"),
    loadSiteModule(root, "article-index.js")
  ]);
  const idsByRoute = new Map(ARTICLES.map(({ href, id }) => [href.replace(/^\.?\//u, ""), id]));
  const state = Object.fromEntries(languages.map(locale => [locale, {
    entities: {}, samples: new Set(), articles: 0
  }]));

  for await (const route of pages(root)) {
    const page = readPage(route, await readFile(path.join(root, route), "utf8"));
    if (!Object.hasOwn(state, page.locale)) continue;
    if (page.article) documents.push(page);
    const title = page.titles[0];
    if (!page.article && page.categoryPath.length && title) {
      const key = [page.locale, ...page.categoryPath].join("/");
      categories.set(key, title);
      record(state[page.locale].entities, "category", title, [
        wordsFromSlug(page.categoryPath.at(-1))
      ]);
    }
  }

  for (const page of documents) {
    const { locale, route, titles, headings, categoryPath } = page;
    const { entities, samples } = state[locale];
    state[locale].articles++;
    const slug = wordsFromSlug(path.posix.basename(route).replace(/\.html?$/iu, ""));
    const title = titles[0];
    record(entities, "subject", title || slug, [slug]);
    for (const alternative of titles.slice(1, 4)) record(entities, "subject", alternative);
    if (title || slug) samples.add(title || slug);
    for (const heading of headings.filter(item => item.tag !== "h1").slice(0, 8)) {
      record(entities, "subject", heading.text);
    }
    const id = page.articleId ?? idsByRoute.get(route);
    const assignedTags = id ? getArticleTagNames?.(id) ?? [] : [];
    for (const value of [...page.tags, ...assignedTags].slice(0, 24)) {
      const abbreviation = value.match(/\(([\p{L}\p{N}-]{2,12})\)$/u)?.[1];
      record(entities, "subject", value, abbreviation ? [abbreviation] : []);
    }
    for (const category of page.sections) record(entities, "category", category);
    const parents = categoryPath.slice(0, categoryPath.indexOf("articles") < 0
      ? categoryPath.length : categoryPath.indexOf("articles"));
    for (const [index, segment] of parents.entries()) {
      const alias = wordsFromSlug(segment);
      const name = categories.get([locale, ...parents.slice(0, index + 1)].join("/")) ?? alias;
      record(entities, "category", name, [alias]);
    }
    for (const id of new Set(page.authorIds)) {
      if (Object.hasOwn(AUTHORS_BY_ID, id)) {
        const author = AUTHORS_BY_ID[id];
        record(entities, "author", author.name, [author.handle]);
      }
    }
    for (const capability of page.capabilities) record(entities, "capability", capability);
    for (const author of page.authors) record(entities, "author", author);
  }

  return Object.fromEntries(languages.map(locale => {
    const { articles, entities, samples } = state[locale];
    const options = Object.entries(entities).sort().map(([type, entries]) => [type,
      [...entries.keys()].sort().map(key => {
        const { value, aliases } = entries.get(key);
        return [value, [...aliases].sort()];
      })
    ]);
    return [locale, { articles, entities: Object.fromEntries(options), samples: [...samples].sort().slice(0, 80) }];
  }));
}
