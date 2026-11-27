import * as pagefind from "../adapter/search-adapters/rivescript-pagefind.js";
import { keyOf, safeSiteUrl } from "./site-data.js";

// Match the existing Normal Search default. Additional results remain available.
const batchSize = 10;
const fields = {
  categories: ["category", "subcategory", "section"],
  authors: ["author", "byline"],
  dates: ["published", "date", "published_date", "publication_date", "published_time"]
};
const normalizeDate = value => value.replace(/[٠-٩۰-۹]/gu, char => String(char.charCodeAt(0) -
  (char.charCodeAt(0) < 0x6f0 ? 0x660 : 0x6f0)));

function datesMatch(value, request, qualifier) {
  const date = normalizeDate(request);
  if (!/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/u.test(date)) return false;
  const candidate = normalizeDate(value).slice(0, date.length);
  if (!/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/u.test(candidate)) return false;
  if (qualifier === "before") return candidate < date;
  if (qualifier === "after") return candidate > date;
  return candidate === date;
}

function dateQualifier(packet, phrase) {
  const entity = packet.entities.find(item => item.entity === "date" && item.utteranceText === phrase);
  if (!Number.isInteger(entity?.start)) return "";
  // Read the modifier next to the NLP date span. Intent stays entirely NLP-owned.
  const before = packet.message.slice(0, entity.start).trimEnd();
  if (/(?:\bbefore|\bantes de|قبل)$/iu.test(before)) return "before";
  if (/(?:\bafter|\bdespu[eé]s de|بعد)$/iu.test(before)) return "after";
  return "";
}

export function nativeOptions(packet, request, catalog, sortFields) {
  const filters = {};
  const unavailable = [];
  const used = [];
  for (const [key, aliases] of Object.entries(fields)) {
    const values = request[key] ?? [];
    if (!values.length) continue;
    const candidates = Object.entries(catalog).filter(([field]) => aliases.includes(field.toLowerCase()));
    for (const value of values) {
      const qualifier = key === "dates" ? dateQualifier(packet, value) : "";
      const match = candidates.map(([field, known]) => [field, Object.keys(known).filter(item =>
        key === "dates" ? datesMatch(item, value, qualifier) : keyOf(item) === keyOf(value))])
        .find(([, matches]) => matches.length);
      if (!match) {
        if (!unavailable.includes(key)) unavailable.push(key);
        continue;
      }
      const [field, matches] = match;
      filters[field] = [...new Set([...(filters[field] ?? []), ...matches])];
      if (!used.includes(key)) used.push(key);
    }
  }
  const latest = packet.intent === "content.date" &&
    (!request.dates?.length || request.dates.some(value => /^(?:recently|recientemente|مؤخرا)$/iu.test(value)));
  const sort = latest && sortFields.find(field => fields.dates.includes(field.toLowerCase()));
  if (latest && !sort && !unavailable.includes("dates")) unavailable.push("dates");
  if (sort && unavailable.includes("dates")) unavailable.splice(unavailable.indexOf("dates"), 1);
  return { options: { ...(Object.keys(filters).length ? { filters } : {}), ...(sort ? { sort: { [sort]: "desc" } } : {}) },
    unavailable, used };
}

const articleOnly = path => /(?:^|\/)articles\//u.test(path);

export async function retrieve(packet, state, { page, signal, region, engine = pagefind }) {
  const more = packet.intent === "content.more";
  if (!more || !state.search) {
    const request = packet.search ?? {};
    const query = request.query || (more ? page?.title : "") || "";
    if (more && !query) return { status: "clarify_query" };
    const manifest = await engine.manifest();
    signal.check();
    if (!manifest.languages.includes(packet.locale)) return { status: "local_index_unavailable" };
    const catalog = await engine.filters();
    signal.check();
    const config = nativeOptions(packet, request, catalog, manifest.sortFields);
    if (packet.intent === "content.date" && !query && config.unavailable.includes("dates") &&
        !config.used.includes("dates") && !config.options.sort) return { status: "date_unavailable" };
    const authorText = config.unavailable.includes("authors") && !query ? request.authors?.join(" ") : "";
    const categoryText = config.unavailable.includes("categories") && !query ? request.categories?.join(" ") : "";
    const start = performance.now();
    const response = await engine.search(query || authorText || categoryText || null, config.options);
    signal.check();
    state.search = { refs: response.results, offset: 0, unavailable: config.unavailable,
      excludedPath: more ? page?.route : undefined, started: start };
    if (!request.followUp) state.seen.clear();
  }
  const current = state.search;
  const items = [];
  const omit = new Set();
  let offset = current.offset;
  while (offset < current.refs.length && items.length < batchSize) {
    const batch = current.refs.slice(offset, offset + batchSize - items.length);
    const rows = await Promise.all(batch.map(engine.data));
    signal.check();
    offset += rows.length;
    for (const row of rows) {
      const url = safeSiteUrl(row.url, engine.siteRoot);
      if (!url) continue;
      let route;
      try { route = decodeURI(url.pathname.slice(engine.siteRoot.pathname.length)); }
      catch { continue; }
      const canonical = url.pathname;
      if (current.excludedPath === route || omit.has(canonical) ||
          (packet.search?.followUp && state.seen.has(canonical))) continue;
      if (packet.search?.browse && !region.articles[route] && !articleOnly(route)) continue;
      omit.add(canonical);
      items.push({ title: row.meta?.title || region.articles[route]?.title || route, url: url.href,
        excerpt: String(row.plain_excerpt ?? row.excerpt ?? "").replace(/<\/?mark>/giu, "") });
    }
  }
  current.offset = offset;
  for (const canonical of omit) state.seen.add(canonical);
  return { status: items.length ? packet.intent === "content.explain" ? "explained" : "found"
    : more ? "exhausted" : "empty", items, unavailable: current.unavailable,
    more: offset < current.refs.length, elapsedMs: performance.now() - current.started };
}
