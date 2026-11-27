import { getPagefind } from "./adapter/search-adapters/ui-pagefind.js";

const messages = {
  en: { library:"LUXRAJ LIBRARY", title:"Search website", label:"Search titles or content", placeholder:"Search the website…", clear:"Clear", filters:"Filters", hint:"Use ↑ and ↓ to navigate results. Enter to open a focused link.", idle:"Enter a search term.", loading:"Searching…", count:n=>n+" matching "+(n===1?"page":"pages"), none:"No matching pages. Try another search term or clear the filters.", relevance:"BY RELEVANCE", more:"Load more results", retry:"Retry", error:"Search is unavailable. Please retry.", detailError:"Some results could not be loaded. Please retry.", results:"Search results", untitled:"Untitled page", loadingMore:"Loading results…" },
  ar: { library:"مكتبة لوكسراج", title:"البحث في الموقع", label:"البحث في العناوين أو المحتوى", placeholder:"ابحث في الموقع…", clear:"مسح", filters:"عوامل التصفية", hint:"استخدم ↑ و ↓ للتنقل بين النتائج، و Enter لفتح الرابط المحدد.", idle:"أدخل كلمة للبحث.", loading:"جارٍ البحث…", count:n=>"الصفحات المطابقة: "+n, none:"لا توجد صفحات مطابقة. جرّب كلمات أخرى أو أزل عوامل التصفية.", relevance:"حسب الصلة", more:"تحميل المزيد", retry:"إعادة المحاولة", error:"البحث غير متاح. أعد المحاولة.", detailError:"تعذّر تحميل بعض النتائج. أعد المحاولة.", results:"نتائج البحث", untitled:"صفحة بلا عنوان", loadingMore:"جارٍ تحميل النتائج…" },
  es: { library:"BIBLIOTECA LUXRAJ", title:"Buscar en el sitio", label:"Buscar títulos o contenido", placeholder:"Buscar en el sitio…", clear:"Borrar", filters:"Filtros", hint:"Usa ↑ y ↓ para navegar por los resultados y Enter para abrir el enlace enfocado.", idle:"Introduce un término de búsqueda.", loading:"Buscando…", count:n=>n+" "+(n===1?"página coincidente":"páginas coincidentes"), none:"No hay páginas coincidentes. Prueba otro término o borra los filtros.", relevance:"POR RELEVANCIA", more:"Cargar más resultados", retry:"Reintentar", error:"La búsqueda no está disponible. Inténtalo de nuevo.", detailError:"No se pudieron cargar algunos resultados. Inténtalo de nuevo.", results:"Resultados de búsqueda", untitled:"Página sin título", loadingMore:"Cargando resultados…" }
};
const PAGE_SIZE = 10;
const element = (tag, className, text) => {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
};
function safeUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  try {
    const url = new URL(value, document.baseURI);
    return ["http:", "https:"].includes(url.protocol) ? url.href : null;
  } catch { return null; }
}
function appendExcerpt(parent, excerpt) {
  if (!excerpt) return;
  // Pagefind encodes source text and inserts mark tags. Allow only those tags.
  const template = document.createElement("template");
  template.innerHTML = excerpt;
  const copy = (from, to) => {
    for (const child of from.childNodes) {
      if (child.nodeType === 3) to.append(document.createTextNode(child.textContent));
      else if (child.nodeType === 1 && child.localName === "mark") {
        const mark = document.createElement("mark");
        copy(child, mark);
        to.append(mark);
      } else if (child.nodeType === 1) copy(child, to);
    }
  };
  copy(template.content, parent);
}
function resultCard(data, labels) {
  const card = element("article", "search-result normal-search-result");
  const body = element("div", "normal-search-result__body");
  const heading = element("h3");
  const title = data.meta?.title || labels.untitled;
  const href = safeUrl(data.url);
  if (href) {
    const link = element("a", "", title);
    link.href = href;
    heading.append(link);
  } else heading.textContent = title;
  body.append(heading);
  if (data.url) body.append(element("p", "normal-search-result__url", data.url));
  if (data.excerpt) {
    const excerpt = element("p", "normal-search-result__excerpt");
    appendExcerpt(excerpt, data.excerpt);
    body.append(excerpt);
  }
  const imageUrl = safeUrl(data.meta?.image);
  if (imageUrl) {
    const image = element("img", "normal-search-result__image");
    image.src = imageUrl;
    image.alt = data.meta?.image_alt || "";
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => image.remove(), { once:true });
    card.append(image);
  }
  const sections = element("ul", "normal-search-result__sections");
  for (const sub of data.sub_results || []) {
    const subUrl = safeUrl(sub.url);
    if (!subUrl || subUrl === href || !new URL(subUrl).hash) continue;
    const item = element("li");
    const link = element("a", "", sub.title || title);
    link.href = subUrl;
    item.append(link);
    if (sub.excerpt) {
      const excerpt = element("p");
      appendExcerpt(excerpt, sub.excerpt);
      item.append(excerpt);
    }
    sections.append(item);
  }
  if (sections.children.length) body.append(sections);
  card.append(body);
  return card;
}

export function initNormalSearch(view) {
  const labels = messages[document.documentElement.lang.toLowerCase().split("-")[0]] || messages.en;
  const byId = id => view.querySelector("#"+id);
  const form = byId("search-form"), input = byId("search-query"), clear = byId("search-clear");
  const panel = byId("search-filter-panel"), filterBox = byId("search-filters");
  const count = byId("search-result-count"), relevance = byId("search-relevance");
  const results = byId("search-results"), more = byId("search-load-more"), retry = byId("search-retry");
  view.setAttribute("aria-label", labels.title);
  byId("search-query-label").textContent = labels.label;
  byId("search-filter-label").textContent = labels.filters;
  byId("search-keyboard-hint").textContent = labels.hint;
  input.placeholder = labels.placeholder;
  clear.textContent = labels.clear;
  relevance.textContent = labels.relevance;
  more.textContent = labels.more;
  retry.textContent = labels.retry;
  results.setAttribute("aria-label", labels.results);

  let active = false, generation = 0, nativeFilters = null, filterControls = [];
  let refs = [], shown = 0, busy = false;
  const selected = () => {
    const groups = new Map();
    for (const entry of filterControls) if (entry.checkbox.checked) {
      if (!groups.has(entry.key)) groups.set(entry.key, []);
      groups.get(entry.key).push(entry.value);
    }
    return Object.fromEntries([...groups].map(([key, values]) => [key, { any: values }]));
  };
  function setBusy(value) {
    busy = value;
    results.setAttribute("aria-busy", String(value));
    more.disabled = value;
  }
  function showError(message) {
    count.textContent = message;
    retry.hidden = false;
    setBusy(false);
  }
  function setCounts(counts) {
    for (const entry of filterControls) {
      const n = counts?.[entry.key]?.[entry.value] ?? nativeFilters?.[entry.key]?.[entry.value] ?? 0;
      entry.label.textContent = entry.value+" ("+n+")";
    }
  }
  function buildFilters(filters) {
    nativeFilters = filters;
    filterBox.replaceChildren();
    filterControls = [];
    for (const [key, values] of Object.entries(filters || {})) {
      if (!Object.keys(values).length) continue;
      const fieldset = element("fieldset", "normal-search-filter");
      fieldset.append(element("legend", "", key));
      for (const [value, n] of Object.entries(values)) {
        const wrapper = element("label");
        const checkbox = element("input");
        checkbox.type = "checkbox";
        const label = element("span", "", value+" ("+n+")");
        wrapper.append(checkbox, label);
        fieldset.append(wrapper);
        filterControls.push({key,value,checkbox,label});
      }
      filterBox.append(fieldset);
    }
    panel.hidden = filterControls.length === 0;
  }
  async function connect() {
    const pagefind = await getPagefind();
    if (nativeFilters === null) {
      const filters = await pagefind.filters();
      if (nativeFilters === null) buildFilters(filters);
    }
    return pagefind;
  }
  async function appendBatch(token) {
    const end = Math.min(shown+PAGE_SIZE, refs.length);
    const batch = await Promise.all(refs.slice(shown,end).map(result => result.data()));
    if (!active || token !== generation) return;
    const fragment = document.createDocumentFragment();
    for (const data of batch) fragment.append(resultCard(data,labels));
    results.append(fragment);
    shown = end;
    more.hidden = shown >= refs.length;
    setBusy(false);
  }
  async function run({ debounce = false } = {}) {
    if (!active) return;
    const token = ++generation;
    const term = input.value.trim();
    const filters = selected();
    const hasFilters = Object.keys(filters).length > 0;
    clear.hidden = !input.value && !hasFilters;
    results.replaceChildren();
    results.scrollTop = 0;
    refs = [];
    shown = 0;
    more.hidden = retry.hidden = relevance.hidden = true;
    setBusy(true);
    count.textContent = term || hasFilters ? labels.loading : labels.idle;
    try {
      const pagefind = await connect();
      if (!active || token !== generation) return;
      if (!term && !hasFilters) {
        setCounts(nativeFilters);
        setBusy(false);
        return;
      }
      const options = { filters };
      const response = debounce && term
        ? await pagefind.debouncedSearch(term, options)
        : await pagefind.search(term || null, options);
      if (!active || token !== generation || response === null) return;
      refs = response.results;
      setCounts(response.filters || response.totalFilters || nativeFilters);
      count.textContent = labels.count(refs.length);
      relevance.hidden = !term || !refs.length;
      if (!refs.length) {
        results.append(element("p", "search-empty", labels.none));
        setBusy(false);
        return;
      }
      await appendBatch(token);
    } catch (error) {
      if (!active || token !== generation) return;
      console.error("[Luxraj Normal Search]",error);
      showError(labels.error);
    }
  }
  form.addEventListener("submit", event => { event.preventDefault(); void run(); });
  input.addEventListener("input", event => { if (!event.isComposing) void run({debounce:true}); });
  input.addEventListener("compositionend", () => { void run({debounce:true}); });
  filterBox.addEventListener("change", () => { void run(); });
  clear.addEventListener("click", () => {
    input.value = "";
    for (const entry of filterControls) entry.checkbox.checked = false;
    input.focus();
    void run();
  });
  retry.addEventListener("click", () => { void run(); });
  more.addEventListener("click", async () => {
    if (!active || busy || shown >= refs.length) return;
    const token = generation, previous = shown;
    retry.hidden = true;
    setBusy(true);
    count.textContent = labels.loadingMore;
    try {
      await appendBatch(token);
      if (active && token === generation) {
        count.textContent = labels.count(refs.length);
        if (more.hidden) results.children[previous]?.querySelector("h3 a")?.focus();
      }
    } catch (error) {
      if (!active || token !== generation) return;
      console.error("[Luxraj Normal Search]",error);
      showError(labels.detailError);
    }
  });
  view.addEventListener("keydown", event => {
    if (!["ArrowDown","ArrowUp"].includes(event.key)) return;
    const links = [...results.querySelectorAll("a[href]")];
    const index = links.indexOf(document.activeElement);
    if (event.target !== input && event.target !== results && index < 0) return;
    if (!links.length) return;
    if (index < 0 && event.key === "ArrowUp") return;
    event.preventDefault();
    const next = event.key === "ArrowDown" ? index+1 : index-1;
    if (next < 0) input.focus();
    else links[Math.min(next,links.length-1)].focus();
  });
  return {
    labels,
    activate() { active = true; void run(); },
    deactivate() { active = false; generation++; setBusy(false); },
    focus() { input.focus(); }
  };
}
