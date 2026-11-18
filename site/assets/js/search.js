import { ARTICLES } from "./article-index.js";
import { getArticleIdsByBoxId, getArticleTagNames } from "./tag-indexer.js";

const titleCompare = (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
const catCompare = (a, b) => a.category.localeCompare(b.category, undefined, { sensitivity: "base" });
const escapeHTML = value => String(value)
  .replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
const fmtDate = value => new Date(value + "T12:00:00Z").toLocaleDateString("en-GB", {
  day: "numeric", month: "short", year: "numeric", timeZone: "UTC"
});

function renderArticleCard(article, root) {
  return '<article class="search-result"><div class="search-result__eyebrow"><span>' +
    escapeHTML(article.parentCategory) + " / " + escapeHTML(article.category) +
    '</span><span>' + escapeHTML(fmtDate(article.published)) +
    '</span></div><h3><a href="' + root + escapeHTML(article.href) + '">' +
    escapeHTML(article.title) + '</a></h3><p>' + escapeHTML(article.summary) +
    '</p><div class="search-result__footer"><span>' + article.readingMinutes +
    ' min read</span></div></article>';
}

export function initSearch() {
  const dialog = document.querySelector("#search-dialog");
  const eyebrow = document.querySelector("#search-dialog-eyebrow");
  const title = document.querySelector("#search-dialog-title");
  const dialogHeader = document.querySelector(".search-dialog__header");
  const generalView = document.querySelector("#general-search-view");
  const luxyView = document.querySelector("#luxy-search-view");
  const tagView = document.querySelector("#tag-search-view");
  const modeSwitch = document.querySelector("[data-search-mode-switch]");
  const modeRadios = modeSwitch
    ? [...modeSwitch.querySelectorAll('input[name="search-mode"]')]
    : [];
  const form = document.querySelector("#search-form");
  const input = document.querySelector("#search-query");
  const category = document.querySelector("#search-category-filter");
  const sort = document.querySelector("#search-sort");
  const slider = document.querySelector("#search-reading-time");
  const output = document.querySelector("#search-reading-output");
  const results = document.querySelector("#search-results");
  const count = document.querySelector("#search-result-count");
  const tagResults = document.querySelector("#tag-search-results");
  const tagCount = document.querySelector("#tag-search-result-count");
  const loadMore = document.querySelector("#tag-search-load-more");

  if (!dialog || !eyebrow || !title || !dialogHeader || !generalView || !luxyView || !tagView ||
      !modeSwitch || modeRadios.length !== 3 ||
      !form || !input || !category || !sort || !slider || !output ||
      !results || !count || !tagResults || !tagCount || !loadMore) return;

  [...new Set(ARTICLES.map(article => article.category))]
    .sort((a, b) => a.localeCompare(b))
    .forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      category.append(option);
    });

  function matches() {
    const query = input.value.trim().toLocaleLowerCase();
    const selectedCategory = category.value;
    const maxReadingTime = Number(slider.value);
    const list = ARTICLES.filter(article => {
      const tagNames = getArticleTagNames(article.id);
      const searchable = [article.title, article.summary, article.category, article.parentCategory, ...tagNames]
        .join(" ").toLocaleLowerCase();
      return (!query || searchable.includes(query)) &&
        (!selectedCategory || article.category === selectedCategory) &&
        article.readingMinutes <= maxReadingTime;
    });

    switch (sort.value) {
      case "date-asc": list.sort((a, b) => a.published.localeCompare(b.published) || titleCompare(a, b)); break;
      case "category-asc": list.sort((a, b) => catCompare(a, b) || titleCompare(a, b)); break;
      case "title-asc": list.sort(titleCompare); break;
      case "title-desc": list.sort((a, b) => titleCompare(b, a)); break;
      default: list.sort((a, b) => b.published.localeCompare(a.published) || titleCompare(a, b));
    }
    return list;
  }

  function renderGeneralSearch() {
    const max = Number(slider.value);
    output.textContent = (max === 15 ? "15+" : String(max)) + " min max";
    const list = matches();
    count.textContent = list.length + " sample article" + (list.length === 1 ? "" : "s");
    if (!list.length) {
      results.innerHTML = '<p class="search-empty">No sample articles match those filters. Try a broader term, another category or a longer reading time.</p>';
      return;
    }
    const root = document.body.dataset.siteRoot || "";
    results.innerHTML = list.map(article => renderArticleCard(article, root)).join("");
  }

  const tagState = {
    boxId: null,
    tagName: "",
    articles: [],
    visibleCount: 0
  };

  function setMode(mode) {
    const generalMode = mode === "general";
    const luxyMode = mode === "luxy";
    const tagMode = mode === "tag";

    generalView.hidden = !generalMode;
    luxyView.hidden = !luxyMode;
    tagView.hidden = !tagMode;
    dialogHeader.hidden = luxyMode;

    modeSwitch.dataset.mode = mode;
    modeRadios.forEach(radio => {
      radio.checked = radio.value === mode;
    });

    if (tagMode) {
      eyebrow.textContent = "TAG SEARCH";
      title.textContent = tagState.tagName || "Tag Search";
    } else if (luxyMode) {
      eyebrow.textContent = "LUXY SEARCH";
      title.textContent = "Luxy Assistant";
    } else {
      eyebrow.textContent = "LUXRAJ LIBRARY";
      title.textContent = "Search articles";
    }
  }

  function openDialog() {
    if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
    else if (!dialog.open) dialog.setAttribute("open", "");
  }

  function renderTagSearch(reset = false) {
    if (reset) tagState.visibleCount = Math.min(10, tagState.articles.length);

    const total = tagState.articles.length;
    const visible = tagState.articles.slice(0, tagState.visibleCount);
    const noun = total === 1 ? "article" : "articles";
    tagCount.textContent = "Showing " + visible.length + " of " + total + " " + noun;

    if (!total) {
      tagResults.innerHTML = '<p class="search-empty">No articles are currently connected to this tag.</p>';
    } else {
      const root = document.body.dataset.siteRoot || "";
      tagResults.innerHTML = visible.map(article => renderArticleCard(article, root)).join("");
    }

    loadMore.hidden = tagState.visibleCount >= total;
  }

  let lastTrigger = null;

  // Explicit entry-point modes allow Ask Luxy and normal Search to share this dialog.
  // Unlabelled legacy triggers retain their previous Luxy default.
  document.querySelectorAll("[data-search-open]").forEach(button => button.addEventListener("click", () => {
    lastTrigger = button;
    tagState.boxId = null;
    const requestedMode = button.dataset.searchOpen === "general" ? "general" : "luxy";
    setMode(requestedMode);
    renderGeneralSearch();
    openDialog();
  }));

  document.querySelector("[data-search-close]")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => {
    setMode("luxy");
    lastTrigger?.focus();
  });

  modeSwitch.addEventListener("change", event => {
    const radio = event.target;
    if (!modeRadios.includes(radio)) return;

    setMode(radio.value);
    if (radio.value === "general") renderGeneralSearch();
    if (radio.value === "tag") renderTagSearch();
  });

  form.addEventListener("submit", event => { event.preventDefault(); renderGeneralSearch(); });
  input.addEventListener("input", renderGeneralSearch);
  category.addEventListener("change", renderGeneralSearch);
  sort.addEventListener("change", renderGeneralSearch);
  slider.addEventListener("input", renderGeneralSearch);

  loadMore.addEventListener("click", () => {
    tagState.visibleCount = Math.min(tagState.visibleCount + 10, tagState.articles.length);
    renderTagSearch();
  });

  document.addEventListener("luxraj:tag-select", event => {
    const detail = event.detail || {};
    if (!detail.tagId) return;

    lastTrigger = document.activeElement;
    tagState.boxId = detail.tagId;
    tagState.tagName = detail.tagName || "Selected tag";

    const articleIds = new Set(getArticleIdsByBoxId(tagState.boxId));
    tagState.articles = ARTICLES
      .filter(article => articleIds.has(article.id))
      .sort((a, b) => b.published.localeCompare(a.published) || titleCompare(a, b));

    setMode("tag");
    renderTagSearch(true);
    openDialog();
  });

  renderGeneralSearch();
}
