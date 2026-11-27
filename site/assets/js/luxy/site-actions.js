import { AUTHORS_BY_ID } from "../author-library.js";
import { lazyLoader } from "../lazy-loader/index.js";
import { keyOf, safeSiteUrl } from "./site-data.js";
import { retrieve } from "./retrieval.js";
import { actionPermission, prohibitedAction } from "../nlp/request-policy.js";

const articleCapabilities = new Map(); // Register future article functions here as trusted references.
const selected = (scope, type) => {
  const entity = scope.packet.entities.find(item => item.entity === type);
  return entity?.option ?? entity?.utteranceText;
};
const link = item => {
  const url = safeSiteUrl(item?.route);
  return url ? { title: item.title || item.route, url: url.href } : null;
};
const result = (status, fields = {}) => ({ status, ...fields });
const destination = (scope, key) => {
  const item = Object.hasOwn(scope.region.pages, key) ? link(scope.region.pages[key]) : null;
  return item ? result("destination", { items: [item] }) : result("unavailable");
};

function language(scope) {
  const target = selected(scope, "language");
  const region = ["en", "ar", "es"].includes(target) ? scope.knowledge.locales[target] : undefined;
  const item = link(region?.pages.home);
  return item ? result("destination", { items: [item] }) : result("language_unavailable");
}

function category(scope) {
  const filters = scope.packet.search?.categories ?? [];
  const matches = scope.region.categories.filter(item => !filters.length || filters.some(filter =>
    keyOf(filter) === keyOf(item.title) || keyOf(filter) === keyOf(item.slug.replaceAll("-", " "))));
  const items = matches.map(link).filter(Boolean);
  return items.length ? result("categories", { items }) : result("unavailable");
}

function theme(scope) {
  const requested = selected(scope, "theme");
  const control = document.querySelector("[data-theme-toggle]");
  if (!control || (requested && !["light", "dark"].includes(requested))) return result("unavailable");
  const html = document.documentElement;
  const target = requested ?? (html.dataset.theme === "light" ? "dark" : "light");
  if (html.dataset.theme !== target) control.click();
  return result(html.dataset.theme === target ? "theme_" + target : "unavailable");
}

const searchControls = [
  ["tag", /(?:\btag search\b|البحث بالوسوم|b[uú]squeda por etiquetas)/iu],
  ["[data-ns-view='advanced']", /(?:\badvanced\b|المتقدم|avanzada)/iu],
  ["[data-ns-view='settings']", /(?:\bsettings\b|إعدادات|configura)/iu],
  ["[data-ns-view='sort']", /(?:\bsort\b|الترتيب|أرتب|orden)/iu],
  ["[data-ns-filter-toggle]", /(?:\bfilters?\b|مرشح|مرشحات|فلاتر|filtros)/iu]
];

function searchInterface(scope) {
  // The native rule already selected the search-interface intent.
  const panel = searchControls.find(([, pattern]) => pattern.test(scope.packet.message))?.[0];
  const mode = panel === "tag" ? "tag" : "general";
  const radio = document.getElementById("search-mode-" + mode);
  if (!radio) return result("unavailable");
  radio.click();
  const view = document.getElementById(mode === "tag" ? "tag-search-view" : "general-search-view");
  if (!view || view.hidden) return result("unavailable");
  if (panel && panel !== "tag") {
    const control = view.querySelector(panel);
    if (!control || control.hidden) return result("unavailable");
    control.click();
  }
  return result("opened");
}

function newsletter() {
  const trigger = document.querySelector("[data-newsletter-open]");
  if (!trigger) return result("unavailable");
  return result("offer_newsletter", { interaction: async (signal, button, event) => {
    await lazyLoader.activate("newsletter", button, event, () => {
      signal.check();
      document.getElementById("search-dialog")?.close();
    });
    signal.check();
    return result(document.querySelector("#luxraj-newsletter #house-popup-backdrop:not(.hidden)") ?
      "newsletter_opened" : "unavailable");
  } });
}

function publicAuthor(scope) {
  const article = scope.page;
  if (!article) return result("article_needed");
  const author = Object.hasOwn(AUTHORS_BY_ID, article.authorId) ? AUTHORS_BY_ID[article.authorId] : null;
  const name = author?.name || article.author;
  if (!name || /\{\{|^https?:\/\//iu.test(name)) return result("author_unavailable");
  const profile = author?.profileUrl;
  const profileExists = profile && (scope.knowledge.routes.includes(profile) ||
    scope.knowledge.routes.includes(profile.replace(/\/?$/u, "/") + "index.html"));
  const item = Object.hasOwn(scope.region.authors, name) ? scope.region.authors[name]
    : profileExists ? { route: profile, title: name } : null;
  return result("author", { details: [name], items: [link(item)].filter(Boolean) });
}

function articleDates(scope) {
  if (!scope.page) return result("article_needed");
  const dates = Object.fromEntries(["published", "modified"].flatMap(key => {
    const value = scope.page[key];
    if (!/^\d{4}-\d{2}-\d{2}(?:T|$)/u.test(value ?? "") || !Number.isFinite(Date.parse(value))) return [];
    return [[key, new Intl.DateTimeFormat(scope.packet.locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(value))]];
  }));
  return Object.keys(dates).length ? result("article_dates", { dates }) : result("date_unavailable");
}

function articleShare(scope, share) {
  if (!scope.page) return result("article_needed");
  const item = link(scope.page);
  if (!item) return result("unavailable");
  const control = document.querySelector(share ? "[data-article-share], [data-author-bar-instagram]" : "[data-article-copy]");
  if (!control) return result("destination", { items: [item] });

  // Open the existing capability from a new click so Clipboard and Web Share
  // receive a real browser user activation after the asynchronous reply.
  const module = import("../article-share.js");
  return module.then(({ copyArticleUrl, getArticleShareData }) => result(share ? "offer_share" : "offer_copy", {
    items: [item],
    interaction: async signal => {
      signal.check();
      if (share && navigator.share) {
        try {
          await navigator.share(getArticleShareData());
          return result("shared");
        } catch (error) {
          if (error?.name === "AbortError") return result("share_cancelled");
          signal.check();
        }
      }
      const status = await copyArticleUrl({ check: signal.check, allowManual: false });
      return result(status === "copied" ? "copied" : "copy_manually", { items: [item] });
    }
  }));
}

async function calculate(scope) {
  if (!scope.page) return result("article_needed");
  const expression = selected(scope, "expression");
  const capability = [...document.querySelectorAll("[data-article-capability]")]
    .map(node => articleCapabilities.get(node.dataset.articleCapability))
    .find(Boolean);
  if (!capability) return result("calculator_unavailable");
  if (typeof expression !== "string" || !capability.validate(expression)) return result("clarify_expression");
  scope.signal.check();
  return result("calculated", { details: [String(await capability.execute(expression, scope.signal))] });
}

// Independent execution gate, even if the classifier incorrectly recognized an action.
const guarded = (capability, callback) => scope => {
  const { locale, message } = scope.packet;
  if (!actionPermission(locale, message, capability)) return result(prohibitedAction(locale, message) ? "action_blocked" : "action_uncertain");
  scope.signal.check();
  return callback(scope);
};

export const actions = Object.freeze({
  navigate: scope => destination(scope, selected(scope, "page")),
  language, category, theme: guarded("theme", theme), search_interface: guarded("search_interface", searchInterface), newsletter: guarded("newsletter", newsletter),
  contact: scope => destination(scope, "contact"),
  about: scope => scope.region.pages.about ? destination(scope, "about") : undefined,
  unsubscribe: scope => destination(scope, "unsubscribe"),
  author: publicAuthor, article_dates: articleDates, calculate: guarded("calculate", calculate),
  share: guarded("share", scope => articleShare(scope, true)),
  copy: guarded("copy", scope => articleShare(scope, false)),
  retrieve: scope => retrieve(scope.packet, scope.state, scope)
});
