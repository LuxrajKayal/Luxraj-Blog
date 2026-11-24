function validPath(path) {
  return typeof path === "string" && /^categories\/(?:[a-zA-Z0-9_-]+\/)+articles\/[a-zA-Z0-9_-]+\.html$/.test(path);
}
function validateSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      !["manual", "auto"].includes(value.mode) ||
      !Number.isInteger(value.maximumArticles) || value.maximumArticles < 1 || value.maximumArticles > 5 ||
      !Number.isInteger(value.rotationIntervalMs) || value.rotationIntervalMs < 3000 || value.rotationIntervalMs > 15000 ||
      !Array.isArray(value.manualArticles) || value.manualArticles.length > 5 ||
      !value.manualArticles.every(validPath) || new Set(value.manualArticles).size !== value.manualArticles.length) {
    throw new Error("Invalid hero settings. Use one to five articles, unique website-relative article paths, and a rotation interval of 3–15 seconds.");
  }
  return { mode: value.mode, maximumArticles: value.maximumArticles, rotationIntervalMs: value.rotationIntervalMs, manualArticles: [...value.manualArticles] };
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function makeArrow(direction, onClick, disabled) {
  const previous = direction === "prev";
  const button = el("button", "hero-showcase__arrow hero-showcase__arrow--" + (previous ? "prev" : "next"));
  button.type = "button";
  button.disabled = disabled;
  button.setAttribute("aria-label", previous ? "Previous featured article" : "Next featured article");
  button.innerHTML = previous
    ? '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m14.5 5-7 7 7 7" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"></path></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m9.5 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  button.addEventListener("click", onClick);
  return button;
}

async function readArticle(path, siteRoot) {
  if (!validPath(path)) throw new Error("Invalid article path");
  const url = new URL(path, siteRoot);
  const response = await fetch(url, { headers: { Accept: "text/html" }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error("Article request failed: " + response.status);
  const finalUrl = new URL(response.url || url.href);
  if (finalUrl.origin !== siteRoot.origin || !finalUrl.pathname.startsWith(siteRoot.pathname)) throw new Error("Article is outside the website");
  const doc = new DOMParser().parseFromString(await response.text(), "text/html");
  const article = doc.querySelector("main article, article");
  const title = article?.querySelector("h1")?.textContent.trim();
  const image = article && [...article.querySelectorAll("img")].find(node => !node.closest("header, nav, aside, footer, .author-bar"));
  const src = image?.getAttribute("src")?.trim() || image?.getAttribute("data-src")?.trim();
  if (!title || !src || /\{\{|\}\}/.test(title + src)) throw new Error("Article has incomplete content");
  const imageUrl = new URL(src, finalUrl);
  if (!["http:", "https:"].includes(imageUrl.protocol)) throw new Error("Invalid image URL");
  const date = article.querySelector("[data-published-date]")?.getAttribute("data-published-date") || "";
  const published = /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date ? date : "";
  return { url: url.href, title, imageUrl: imageUrl.href, alt: (image.getAttribute("alt") || title).trim(), published };
}

async function discoverArticles(siteRoot) {
  const response = await fetch(new URL("sitemap.xml", siteRoot), { signal: AbortSignal.timeout(12000) });
  if (!response.ok) throw new Error("Sitemap request failed");
  const doc = new DOMParser().parseFromString(await response.text(), "application/xml");
  if (doc.querySelector("parsererror")) throw new Error("Invalid sitemap");
  const paths = [...doc.getElementsByTagNameNS("*", "loc")].flatMap(loc => {
    try {
      const url = new URL(loc.textContent.trim(), siteRoot);
      const path = url.pathname.startsWith(siteRoot.pathname) ? url.pathname.slice(siteRoot.pathname.length) : url.pathname.replace(/^\/+/, "");
      return validPath(path) ? [path] : [];
    } catch { return []; }
  });
  return [...new Set(paths)];
}

async function loadArticles(settings, siteRoot) {
  const paths = settings.mode === "auto" ? await discoverArticles(siteRoot) : settings.manualArticles;
  const results = new Array(paths.length);
  let cursor = 0;
  async function worker() {
    while (cursor < paths.length) {
      const index = cursor++;
      try { results[index] = await readArticle(paths[index], siteRoot); }
      catch { results[index] = null; }
    }
  }
  await Promise.all(Array.from({ length: Math.min(6, paths.length) }, worker));
  let articles = results.filter(Boolean);
  if (settings.mode === "auto") {
    const today = new Date().toISOString().slice(0, 10);
    articles = articles.filter(article => article.published && article.published <= today)
      .sort((a, b) => b.published.localeCompare(a.published) || a.url.localeCompare(b.url));
  }
  return articles.slice(0, settings.maximumArticles);
}

function buildSlide(article, onPrevious, onNext, canNavigate) {
  const item = el("article", "hero-showcase__item");
  const imageLink = el("a", "hero-showcase__image-link");
  imageLink.href = article.url;
  imageLink.setAttribute("aria-label", "Read article: " + article.title);
  const image = el("img", "hero-showcase__image");
  image.src = article.imageUrl;
  image.alt = article.alt;
  image.width = 480;
  image.height = 270;
  image.loading = "eager";
  image.decoding = "async";
  imageLink.append(image);

  const caption = el("div", "hero-showcase__caption");
  const titleLink = el("a", "hero-showcase__headline");
  titleLink.href = article.url;
  titleLink.setAttribute("aria-label", article.title);
  const titleText = el("span", "hero-showcase__headline-text", article.title);
  const openIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  openIcon.setAttribute("class", "hero-showcase__open-icon");
  openIcon.setAttribute("viewBox", "0 0 24 24");
  openIcon.setAttribute("aria-hidden", "true");
  openIcon.setAttribute("focusable", "false");
  openIcon.innerHTML = '<path d="M14 4h6v6M20 4 10.5 13.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><path d="M18 13v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>';
  titleLink.append(titleText, openIcon);
  caption.append(titleLink);

  item.append(imageLink, caption);
  item.append(makeArrow("prev", onPrevious, !canNavigate), makeArrow("next", onNext, !canNavigate));
  return item;
}

export function initHeroShowcase() {
  const root = document.querySelector("[data-hero-showcase]");
  if (!root) return;
  const siteRoot = new URL(document.body.dataset.siteRoot || "./", document.baseURI);
  const slide = root.querySelector("[data-hero-slide]");
  const count = root.querySelector("[data-hero-count]");
  if (!slide || !count) return;

  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  let articles = [];
  let current = 0;
  let hovering = false;
  let focused = false;
  let timer = null;
  let rotationIntervalMs = 5000;

  function updateCount() {
    const total = articles.length;
    count.textContent = total ? String(current + 1).padStart(2, "0") + " / " + String(total).padStart(2, "0") : "0 / 0";
  }
  function stopTimer() {
    if (timer !== null) window.clearInterval(timer);
    timer = null;
  }
  function syncTimer() {
    stopTimer();
    if (articles.length < 2 || hovering || focused || document.hidden || reducedMotion) return;
    timer = window.setInterval(() => show(current + 1), rotationIntervalMs);
  }
  function navigate(offset) {
    show(current + offset);
    syncTimer();
  }
  function show(index) {
    if (!articles.length) return;
    current = (index + articles.length) % articles.length;
    const article = articles[current];
    slide.replaceChildren(buildSlide(article, () => navigate(-1), () => navigate(1), articles.length > 1));
    slide.classList.remove("is-entering");
    void slide.offsetWidth;
    slide.classList.add("is-entering");
    updateCount();
  }
  function unavailable() {
    count.textContent = "0 / 0";
    const message = el("p", "hero-showcase__status", "Featured articles are temporarily unavailable.");
    const link = el("a", "", "Browse Tech News");
    link.href = new URL("categories/tech-news/tech-news-index.html", siteRoot).href;
    message.append(document.createElement("br"), link);
    slide.replaceChildren(message);
  }

  root.addEventListener("pointerenter", () => { hovering = true; syncTimer(); });
  root.addEventListener("pointerleave", () => { hovering = false; syncTimer(); });
  root.addEventListener("focusin", () => { focused = true; syncTimer(); });
  root.addEventListener("focusout", event => {
    focused = root.contains(event.relatedTarget);
    syncTimer();
  });
  document.addEventListener("visibilitychange", syncTimer);

  fetch(new URL("settings/hero-settings.json", siteRoot), { cache: "no-cache", signal: AbortSignal.timeout(12000) })
    .then(response => {
      if (!response.ok) throw new Error("Hero settings request failed");
      return response.json();
    })
    .then(validateSettings)
    .then(settings => {
      rotationIntervalMs = settings.rotationIntervalMs;
      return loadArticles(settings, siteRoot);
    })
    .then(results => {
      articles = results;
      if (!articles.length) { unavailable(); return; }
      show(0);
      syncTimer();
    })
    .catch(error => {
      console.warn("[Luxraj hero]", error);
      unavailable();
    });
}
