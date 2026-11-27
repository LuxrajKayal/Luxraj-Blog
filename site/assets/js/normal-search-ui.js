import * as pagefind from "./adapter/search-adapters/ui-pagefind.js";
// Load native destination highlighting only when a result link requests it.
if(new URLSearchParams(location.search).has("pagefind-highlight")){
  import("./search-dependencies/pagefind/pagefind-highlight.js").then(()=>{if(typeof window.PagefindHighlight==="function")new window.PagefindHighlight({markContext:"main",highlightParam:"pagefind-highlight"});}).catch(()=>{});
}
// Normal Search presentation and native Pagefind connection. Build-time indexing remains outside the browser.
// All result/filter examples are explicitly illustrative, not live search output.
function normalMarkup(lang) {
  const t=(en,ar,es)=>({en,ar,es}[lang]||en);
  const e=v=>String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  const L=(en,ar,es)=>e(t(en,ar,es));
  const text={
    filters:t("Filters","عوامل التصفية","Filtros"),sort:t("Sort","الترتيب","Ordenar"),advanced:t("Advanced","بحث متقدم","Avanzado"),
    settings:t("Settings","الإعدادات","Ajustes"),diagnostics:t("Diagnostics","التشخيص","Diagnóstico"),engine:t("Engine configuration","تهيئة المحرك","Configuración del motor"),index:t("Index configuration","تهيئة الفهرس","Configuración del índice"),
    results:t("Results","النتائج","Resultados"),clear:t("Clear","مسح","Limpiar"),reset:t("Reset","إعادة ضبط","Restablecer"),
    preview:t("UI preview only · Pagefind is not connected. Example data is illustrative; search and engine operations are unavailable.","معاينة الواجهة فقط · Pagefind غير متصل. البيانات توضيحية؛ البحث وعمليات المحرك غير متاحة.","Solo vista previa de la interfaz · Pagefind no está conectado. Datos ilustrativos; la búsqueda y las operaciones del motor no están disponibles."),
    unavailable:t("Not available in browser search","غير متاح في بحث المتصفح","No disponible en la búsqueda del navegador"),demo:t("","", ""),
    category:t("Category","الفئة","Categoría"),type:t("Page type","نوع الصفحة","Tipo de página"),author:t("Author","المؤلف","Autor"),tags:t("Tags","الوسوم","Etiquetas"),year:t("Publication year","سنة النشر","Año de publicación"),extra:t("Additional indexed filters","عوامل تصفية إضافية","Filtros indexados adicionales"),
    list:t("List","قائمة","Lista"),grid:t("Grid","شبكة","Cuadrícula"),compact:t("Compact","مختصر","Compacto"),relevance:t("Relevance","الصلة","Relevancia"),ascending:t("Ascending","تصاعدي","Ascendente"),descending:t("Descending","تنازلي","Descendente"),
    open:t("Open page","فتح الصفحة","Abrir página"),newtab:t("New tab","علامة تبويب جديدة","Nueva pestaña"),details:t("Result details","تفاصيل النتيجة","Detalles del resultado"),sections:t("Matching sections","الأقسام المطابقة","Secciones coincidentes"),
    more:t("More matching sections","المزيد من الأقسام","Más secciones coincidentes"),load:t("Load more results","تحميل نتائج إضافية","Cargar más resultados"),noData:t("No indexed values available","لا توجد قيم مفهرسة","No hay valores indexados"),
    add:t("Add","إضافة","Añadir"),remove:t("Remove","إزالة","Quitar"),all:t("All","الكل","Todos"),none:t("None","لا شيء","Ninguno"),on:t("On","تشغيل","Activado"),off:t("Off","إيقاف","Desactivado"),
    label:t("Label","التسمية","Etiqueta"),value:t("Value","القيمة","Valor"),field:t("Field","الحقل","Campo"),direction:t("Direction","الاتجاه","Dirección"),done:t("Done","تم","Listo")
  };
  const label=k=>e(text[k]||k);
  const icon=(name)=>{const paths={search:'<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.5 4.5"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',filter:'<path d="M4 6h16M7 12h10M10 18h4"/><circle cx="8" cy="6" r="2"/><circle cx="15" cy="12" r="2"/>',sort:'<path d="M8 4v16m-4-4 4 4 4-4M16 20V4m-4 4 4-4 4 4"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3M5 5l2 2m10 10 2 2M19 5l-2 2M7 17l-2 2"/>',grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',list:'<path d="M8 5h13M8 12h13M8 19h13M3 5h1M3 12h1M3 19h1"/>',external:'<path d="M13 5h6v6M19 5l-9 9M10 5H5v14h14v-5"/>',image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m4 18 6-6 4 4 3-3 4 5"/>',info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-9h.01"/>',back:'<path d="m10 5-7 7 7 7M3 12h18"/>',chevron:'<path d="m8 10 4 4 4-4"/>',pin:'<path d="M16 3l5 5-3 1-3 5v3l-2 2-8-8 2-2h3l5-3 1-3ZM9 15l-6 6"/>',pinOff:'<path d="m3 3 18 18M16 3l5 5-3 1-2 3M9 9H7l-2 2 8 8 2-2v-2M9 15l-6 6"/>'};return `<svg class="ns-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.info}</svg>`;};
  const btn=(s,attrs="",i="")=>`<button type="button" ${attrs}>${i?icon(i):""}<span>${e(s)}</span></button>`;
  const dead=(s,i="")=>btn(s,`disabled title="${e(text.unavailable)}"`,i);
  const opt=(v,s)=>`<option value="${e(v)}">${e(s)}</option>`;
  const select=(name,options,attrs="")=>`<label class="ns-field"><span>${e(name)}</span><select ${attrs}>${options.map(o=>Array.isArray(o)?opt(o[0],o[1]):opt(o,o)).join("")}</select></label>`;
  const field=(name,value="",attrs="",type="text")=>`<label class="ns-field"><span>${e(name)}</span><input type="${type}" value="${e(value)}" ${attrs}></label>`;
  const check=(name,checked=false,attrs="")=>`<label class="ns-check"><input type="checkbox" ${checked?"checked":""} ${attrs}><span>${e(name)}</span></label>`;
  const num=(name,v,min=0,max=100000,attrs="")=>field(name,v,`min="${min}" max="${max}" ${attrs}`,"number");
  const area=(name,value="",attrs="")=>`<label class="ns-field"><span>${e(name)}</span><textarea rows="3" ${attrs}>${e(value)}</textarea></label>`;
  const section=(title,content)=>`<section class="ns-section"><h3>${e(title)}</h3>${content}</section>`;
  const accordion=(title,content,open=false)=>`<details class="ns-accordion"${open?" open":""}><summary>${e(title)}${icon("chevron")}</summary><div class="ns-accordion-body">${content}</div></details>`;
  const actions=(...buttons)=>`<div class="ns-actions">${buttons.join("")}</div>`;
  const fields=arr=>`<div class="ns-field-grid">${arr.join("")}</div>`;
  const table=(heads,rows)=>`<div class="ns-table-scroll" tabindex="0" role="region" aria-label="${e(heads.join(" / "))}"><table><thead><tr>${heads.map(x=>`<th scope="col">${e(x)}</th>`).join("")}</tr></thead><tbody>${rows.map(row=>`<tr>${row.map(x=>`<td>${e(x)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
  const panel=(name,title,body)=>`<section class="ns-panel" data-ns-panel="${name}"${["details","diagnostics","engine","index"].includes(name)?" data-ns-developer-only":""} hidden aria-label="${e(title)}"><div class="ns-panel-head"><h3 tabindex="-1">${e(title)}</h3>${btn(t("Back to results","العودة للنتائج","Volver a resultados"),'data-ns-view="results"',"back")}</div>${body}</section>`;
  const order=[["default",t("Default order","الترتيب الافتراضي","Orden predeterminado")],["alphabetical",t("Alphabetical","أبجدي","Alfabético")],["count-desc",t("Highest count first","الأكثر أولاً","Mayor cantidad primero")],["count-asc",t("Lowest count first","الأقل أولاً","Menor cantidad primero")],["custom",t("Custom pill ordering","ترتيب مخصص","Orden personalizado")]];
  const groups=[
    ["category",text.category,[["Engineering",t("Engineering","الهندسة","Ingeniería"),24],["Hardware",t("Hardware","الأجهزة","Hardware"),18],["Software",t("Software","البرمجيات","Software"),12],["Reviews",t("Reviews","المراجعات","Reseñas"),0]]],
    ["type",text.type,[["Article",t("Article","مقال","Artículo"),24],["Category page",t("Category page","صفحة فئة","Página de categoría"),8],["General page",t("General page","صفحة عامة","Página general"),3]]],
    ["author",text.author,[["Example author",t("Example author","مؤلف تجريبي","Autor de ejemplo"),12],["Guest author",t("Guest author","مؤلف ضيف","Autor invitado"),4]]],
    ["tags",text.tags,[["Technology",t("Technology","تقنية","Tecnología"),24],["Electronics",t("Electronics","إلكترونيات","Electrónica"),7]]],
    ["year",text.year,[["2026","2026",14],["2025","2025",6]]],
    ["additional",text.extra,[]]
  ];
  const filterGroups=groups.map(([key,name,vals],i)=>`<details class="ns-filter-group" data-ns-group="${key}"${i===0?" open":""}><summary><span>${e(name)}</span><span data-ns-group-count class="ns-count">0</span>${icon("chevron")}</summary><div class="ns-filter-body">${vals.length?`<fieldset><legend class="ns-sr">${e(name)}</legend>${vals.map(([value,caption,count])=>`<label class="ns-filter-option" data-ns-zero="${count===0}"><input type="checkbox" data-ns-filter="${key}" value="${e(value)}" data-caption="${e(caption)}"><span>${e(caption)}</span><span class="ns-count">${count}</span></label>`).join("")}</fieldset>${btn(t("Clear group","مسح المجموعة","Limpiar grupo"),'data-ns-clear-group class="ns-quiet"')}`:`<p class="ns-muted">${label("noData")}</p>`}</div></details>`).join("");
  const pills=groups.map(([key,name,vals])=>`<div class="ns-pill-group" data-ns-filter-key="${key}"><h4>${e(name)}</h4><div class="ns-actions">${btn(text.all,'data-ns-pill-all="'+key+'" aria-pressed="true"')}${vals.map(([v,c,n])=>btn(c+" · "+n,`data-ns-pill="${key}" data-value="${e(v)}" data-ns-zero="${n===0}" data-ns-count="${n}" data-ns-caption="${e(c)}" aria-pressed="false"`)).join("")||`<span class="ns-muted">${label("noData")}</span>`}</div></div>`).join("");
  const dropdowns=groups.map(([key,name,vals])=>`<details class="ns-filter-group" data-ns-dropdown data-ns-filter-key="${key}"><summary>${e(name)} ${icon("chevron")}</summary><div class="ns-filter-body">${vals.length?vals.map(([v,c,n])=>`<label class="ns-filter-option" data-ns-zero="${n===0}"><input type="checkbox" data-ns-mirror="${key}" value="${e(v)}" data-caption="${e(c)}"><span>${e(c)}</span><span class="ns-count">${n}</span></label>`).join(""):`<span class="ns-muted">${label("noData")}</span>`}${btn(text.clear,`data-ns-clear-key="${key}" class="ns-quiet"`)}</div></details>`).join("");
  const single=select(t("Single-select filter","عامل تصفية أحادي","Filtro de selección única"),[["",text.all]],'data-ns-single');
  const filterPane=`<aside class="ns-filters" id="ns-filters" aria-label="${label("filters")}"><div class="ns-side-heading"><h3>${label("filters")}</h3>${btn(text.reset,'data-ns-reset-filters class="ns-quiet"')}${btn(text.done,'data-ns-filter-close class="ns-mobile-close"')}</div><div class="ns-filter-scroll">${select(t("Presentation","العرض","Presentación"),[["pane",t("Filter pane","لوحة التصفية","Panel de filtros")],["dropdown",t("Dropdowns","قوائم منسدلة","Desplegables")],["pills",t("Filter pills","شرائح التصفية","Chips de filtro")]],'data-ns-filter-style')}${select(t("Option ordering","ترتيب الخيارات","Orden de opciones"),order,'data-ns-order')}${check(t("Show zero-result options","إظهار خيارات بلا نتائج","Mostrar opciones sin resultados"),true,'data-ns-show-zero')}${check(t("Multiple selection","اختيارات متعددة","Selección múltiple"),true,'data-ns-multiple')}${single}<div data-ns-filter-variant="pane"></div><div data-ns-filter-variant="dropdown" hidden></div><div data-ns-filter-variant="pills" hidden></div></div></aside>`;
  const filterFields=[["",t("Choose indexed field","اختر حقلاً مفهرساً","Elegir campo indexado")],...groups.map(([key,name])=>[key,name])];
  const operators=[["all",t("All conditions · all","كل الشروط · all","Todas las condiciones · all")],["any",t("Any condition · any","أي شرط · any","Cualquier condición · any")],["not",t("Not all · not","ليس الكل · not","No todas · not")],["none",t("None · none","لا شيء · none","Ninguna · none")]];
  const condition=`<div class="ns-condition" data-ns-condition>${fields([select(text.field,filterFields,'data-native="filters.field"'),select(t("Match","مطابقة","Coincidencia"),operators,'data-native="filters.operator"'),field(text.value,"",'data-native="filters.value" placeholder="…"')])}${btn(text.remove,'data-ns-remove class="ns-quiet"')}</div>`;
  const group=`<fieldset class="ns-condition-group" data-ns-condition-group><legend>${L("Condition group","مجموعة الشروط","Grupo de condiciones")}</legend>${select(t("Group operator","عامل المجموعة","Operador del grupo"),operators,'data-native="filters.operator"')}<div data-ns-conditions>${condition}</div>${actions(btn(t("Add condition","إضافة شرط","Añadir condición"),'data-ns-add-condition'),btn(t("Add nested group","إضافة مجموعة متداخلة","Añadir grupo anidado"),'data-ns-add-group'),btn(text.remove,'data-ns-remove-group class="ns-quiet"'))}</fieldset>`;
  const advanced=panel("advanced",t("Advanced search","بحث متقدم","Búsqueda avanzada"),`<div class="ns-form">${section(t("Query mode","وضع الاستعلام","Modo de consulta"),`${field(t("Search term","عبارة البحث","Término de búsqueda"),"",'data-native="term"')}${select(t("Search mode","وضع البحث","Modo de búsqueda"),[["standard",t("Standard / prefix / multiple words","عادي / بادئة / كلمات متعددة","Normal / prefijo / varias palabras")],["phrase",t("Exact phrase (quotation marks)","عبارة مطابقة (علامات اقتباس)","Frase exacta (comillas)")],["faceted",t("Browse without a keyword (null)","تصفح دون كلمة (null)","Explorar sin palabra (null)")]],'data-native="term.mode"')}${check(t("Exact diacritics","مطابقة التشكيل بدقة","Diacríticos exactos"),false,'data-native="exactDiacritics"')}${check(t("Destination highlighting","تمييز في الصفحة المقصودة","Resaltado en página de destino"),false,'data-native="highlightParam"')}<p class="ns-muted" data-ns-developer-only>${L("Queries preserve punctuation, technical identifiers, emoji, compound words, Unicode and quotes. Matching, stemming and ranking are handled later by Pagefind.","تحتفظ الاستعلامات بالترقيم والمعرفات والرموز والكلمات المركبة وUnicode والاقتباسات. يتولى Pagefind المطابقة والاشتقاق والترتيب لاحقاً.","Las consultas conservan puntuación, identificadores, emojis, compuestos, Unicode y comillas. Pagefind realizará la coincidencia, lematización y clasificación después.")}</p>`)}${section(t("Compound filters","عوامل تصفية مركبة","Filtros compuestos"),`<div data-ns-advanced-root>${group}</div><template data-ns-condition-template>${condition}</template><template data-ns-group-template>${group}</template>`)}${section(t("Native request shape (reference)","بنية الطلب الأصلية (مرجع)","Estructura nativa de solicitud (referencia)"),`<pre class="ns-code" dir="ltr">${e('search("drone battery", {\n  filters: { category: { any: ["Engineering", "Hardware"] } },\n  sort: { date: "desc" }\n})\nsearch(null, { filters: {} })')}</pre><p class="ns-muted">${L("Reference syntax only. No requests are executed.","بنية مرجعية فقط. لا يتم تنفيذ الطلبات.","Solo sintaxis de referencia. No se ejecutan solicitudes.")}</p>`)}${actions(btn(text.reset,'data-ns-form-reset'),btn(t("Apply search","تطبيق البحث","Aplicar búsqueda"),'data-ns-apply-advanced'))}</div>`);
  const sorts=[["",text.relevance]];
  const sortPanel=panel("sort",t("Sort results","ترتيب النتائج","Ordenar resultados"),`<div class="ns-form">${section(t("Indexed field and direction","الحقل المفهرس والاتجاه","Campo indexado y dirección"),fields([select(text.field,sorts,'data-native="sort.field" data-ns-sort'),select(text.direction,[["asc",text.ascending],["desc",text.descending]],'data-native="sort.direction"'),field(t("Custom sort key","مفتاح ترتيب مخصص","Clave de orden personalizada"),"",'data-native="sort.custom"')])+`<p class="ns-muted" data-ns-developer-only>${L("Example fields only. Actual sort keys will be configured later. Pagefind excludes pages lacking the selected sort field.","حقول توضيحية فقط. ستُهيأ مفاتيح الترتيب لاحقاً. يستبعد Pagefind الصفحات التي لا تحتوي على الحقل المحدد.","Solo ejemplos. Las claves reales se configurarán después. Pagefind excluye páginas sin el campo elegido.")}</p>`)}${actions(btn(t("Restore relevance","استعادة ترتيب الصلة","Restaurar relevancia"),'data-ns-sort-reset'),btn(t("Apply sort","تطبيق الترتيب","Aplicar orden"),'data-ns-apply-sort'))}</div>`);
  const statuses=[
    ["idle",t("Ready to search","جاهز للبحث","Listo para buscar"),t("Enter a keyword or browse with filters.","أدخل كلمة أو تصفح باستخدام التصفية.","Introduce una palabra o explora con filtros.")],
    ["disconnected",t("Search not connected","البحث غير متصل","Búsqueda no conectada"),text.preview],
    ["initial-loading",t("Preparing search","تهيئة البحث","Preparando búsqueda"),t("Loading search resources…","جارٍ تحميل موارد البحث…","Cargando recursos de búsqueda…")],
    ["searching",t("Searching","جارٍ البحث","Buscando"),t("Finding matching pages…","جارٍ العثور على صفحات مطابقة…","Buscando páginas coincidentes…")],
    ["one",t("1 matching page","صفحة مطابقة واحدة","1 página coincidente"),text.demo],
    ["many",t("24 matching pages","24 صفحة مطابقة","24 páginas coincidentes"),text.demo],
    ["faceted",t("Browse indexed pages","تصفح الصفحات المفهرسة","Explorar páginas indexadas"),text.demo],
    ["no-results",t("No results","لا توجد نتائج","Sin resultados"),t("Try another term or remove filters.","جرب عبارة أخرى أو أزل عوامل التصفية.","Prueba otro término o quita filtros.")],
    ["filter-loading",t("Loading filter values","تحميل قيم التصفية","Cargando valores de filtro"),text.demo],
    ["missing-filter",t("Missing filter","عامل تصفية مفقود","Filtro ausente"),text.noData],
    ["result-loading",t("Loading result details","تحميل تفاصيل النتائج","Cargando detalles del resultado"),text.demo],
    ["detail-error",t("Result could not load","تعذر تحميل النتيجة","No se pudo cargar el resultado"),text.demo],
    ["bundle-error",t("Search bundle unavailable","حزمة البحث غير متاحة","Paquete de búsqueda no disponible"),text.demo],
    ["search-error",t("Search failed","فشل البحث","Error de búsqueda"),text.demo],
    ["superseded",t("Superseded search","استعلام تم استبداله","Búsqueda reemplazada"),t("Older requests will be discarded after integration.","سيتم تجاهل الطلبات الأقدم بعد الربط.","Las solicitudes anteriores se descartarán tras la integración.")],
    ["reset",t("Search reset","إعادة ضبط البحث","Búsqueda restablecida"),text.demo],
    ["complete",t("All results loaded","تم تحميل كل النتائج","Todos los resultados cargados"),text.demo]
  ];
  const skeleton=`<div class="ns-skeleton" aria-hidden="true"><span></span><div><i></i><i></i><i></i></div></div>`;
  const statusHtml=statuses.map(([v,name,description])=>`<div class="ns-status" data-ns-status="${v}"${v==="idle"?"":" hidden"} role="status"><div class="ns-status-head">${icon(v.includes("error")?"info":"search")}<div><strong>${e(name)}</strong><p>${e(description)}</p></div></div>${["initial-loading","searching","result-loading"].includes(v)?skeleton+skeleton:""}${v==="filter-loading"?'<div class="ns-filter-skeleton" aria-hidden="true"><i></i><i></i><i></i></div>':""}${v.includes("error")?btn(t("Retry","إعادة المحاولة","Reintentar"),'data-ns-retry'):""}</div>`).join("");
  const resultArea=`<section class="ns-results-area" aria-label="${label("results")}"><div class="ns-result-heading"><div><h3>${L("Search results","نتائج البحث","Resultados de búsqueda")}</h3><p class="ns-muted" data-ns-summary aria-live="polite" data-native="unfilteredResultCount"></p></div>${actions(btn(text.list,'data-ns-layout="list" aria-pressed="true"',"list"),btn(text.grid,'data-ns-layout="grid" aria-pressed="false"',"grid"),btn(text.compact,'data-ns-layout="compact" aria-pressed="false"'))}</div>${select(t("Search state","حالة البحث","Estado de búsqueda"),statuses.map(([v,name])=>[v,name]),'data-ns-state disabled')}<div data-ns-statuses>${statusHtml}</div><div class="ns-results" data-ns-results data-layout="list" data-native="results"></div><div data-ns-compact hidden class="ns-compact"><label class="ns-field"><span>${L("Compact searchbox","مربع بحث مختصر","Cuadro de búsqueda compacto")}</span><input type="search" role="combobox" aria-expanded="true" aria-controls="ns-compact-list" aria-autocomplete="list" aria-describedby="ns-compact-help" placeholder="${L("Search…","بحث…","Buscar…")}"></label><div id="ns-compact-list" role="listbox" aria-label="${label("results")}"></div><p class="ns-muted" id="ns-compact-help">↑ ↓ · Enter · Esc · ${label("demo")}</p></div><div class="ns-pagination">${btn(text.load,'data-ns-load-more')}<span class="ns-muted" data-ns-developer-only></span></div></section>`;
  const details=panel("details",text.details,`<p class="ns-muted" data-ns-detail-label></p><div data-ns-detail-fields></div>`);
  const showChecks=[
    ["images",t("Show result images","عرض صور النتائج","Mostrar imágenes"),true],["highlight",t("Show highlighted excerpts","إظهار تمييز المقتطفات","Mostrar extractos resaltados"),true],["sections",t("Show matching sections","عرض الأقسام المطابقة","Mostrar secciones coincidentes"),true],["metadata",t("Show metadata","عرض البيانات الوصفية","Mostrar metadatos"),true],["urls",t("Show result URLs","عرض روابط النتائج","Mostrar URLs"),true],["scores",t("Show relevance scores","عرض درجات الصلة","Mostrar puntuaciones"),false]];
  const settings=panel("settings",text.settings,`<div class="ns-form">${section(t("Result presentation","عرض النتائج","Presentación de resultados"),`<div class="ns-check-grid">${showChecks.map(([key,name,v])=>check(name,v,`data-ns-display="${key}"`)).join("")}</div>${fields([num(t("Excerpt length (words)","طول المقتطف (كلمات)","Longitud del extracto (palabras)"),30,1,10000,'data-native="excerptLength"'),field(t("Excerpt ellipsis","علامة حذف المقتطف","Elipsis del extracto"),"…",'data-native="excerptEllipsis"'),num(t("Maximum sub-results","أقصى عدد للأقسام","Máximo de subresultados"),3,0,10000,'data-native="maxSubResults"'),num(t("Maximum results (0 = unlimited)","أقصى النتائج (0 = بلا حد)","Máximo de resultados (0 = ilimitado)"),0,0,100000,'data-native="maxResults"'),num(t("Results per batch","نتائج الدفعة","Resultados por lote"),10,1,1000,'data-native="pageSize"'),select(t("Link target","هدف الرابط","Destino del enlace"),[["_self",t("Same tab","نفس علامة التبويب","Misma pestaña")],["_blank",text.newtab]],'data-native="linkTarget"'),select(t("Layout","التخطيط","Diseño"),[["list",text.list],["grid",text.grid],["compact",text.compact]],'data-ns-layout-select'),select(t("Card density","كثافة البطاقات","Densidad de tarjetas"),[["comfortable",t("Comfortable","مريح","Cómoda")],["compact",text.compact]],'data-ns-density'),select(t("Theme preview","معاينة المظهر","Vista previa del tema"),[["site",t("Follow site theme","مظهر الموقع","Tema del sitio")],["light",t("Light","فاتح","Claro")],["dark",t("Dark","داكن","Oscuro")]],'data-ns-theme')])}`)}${section(t("Search interaction","التفاعل مع البحث","Interacción de búsqueda"),`<div class="ns-check-grid">${[[t("Live input","إدخال مباشر","Entrada en vivo"),"live",true],[t("Autofocus","تركيز تلقائي","Enfoque automático"),"autofocus",true],[t("Faceted browsing","تصفح بالمرشحات","Navegación facetada"),"faceted",true],[t("Keyboard hints","تلميحات لوحة المفاتيح","Atajos de teclado"),"keyboardHints",true],[t("Reset on close","إعادة ضبط عند الإغلاق","Restablecer al cerrar"),"resetOnClose",false],[t("Hide shortcut badge","إخفاء اختصار لوحة المفاتيح","Ocultar distintivo de atajo"),"hideShortcut",false],[t("Focus on slash","التركيز بالشرطة المائلة","Enfocar con barra"),"focusOnSlash",true],[t("Compact trigger","مشغل مختصر","Activador compacto"),"compact",false],[t("Lazy result rendering","عرض النتائج عند الحاجة","Renderizado diferido"),"lazy",true],[t("Keyboard result preloading","تحميل مسبق عبر لوحة المفاتيح","Precarga con teclado"),"keyboardPreload",true]].map(([name,key,v])=>check(name,v,`data-native="${key}"`)).join("")}</div>${fields([num(t("Debounce duration (ms)","مدة تأخير البحث (مللي ثانية)","Intervalo de espera (ms)"),300,0,10000,'data-native="debounceTimeoutMs"'),field(t("Search shortcut","اختصار البحث","Atajo de búsqueda"),"mod+k",'data-native="shortcut"'),field(t("Initial search term","عبارة البحث الأولية","Término inicial"),"",'data-native="triggerSearch"'),field(t("Input placeholder","نص الإدخال","Marcador de entrada"),"",'data-native="placeholder"'),field(t("Default summary","ملخص افتراضي","Resumen predeterminado"),"",'data-native="defaultMessage"')])}`)}${section(t("Filter presentation","عرض عوامل التصفية","Presentación de filtros"),`${fields([select(t("Filter style","نمط التصفية","Estilo de filtros"),[["pane",t("Pane","لوحة","Panel")],["dropdown",t("Dropdown","منسدلة","Desplegable")],["pills",t("Pills","شرائح","Chips")]],'data-ns-style-setting'),select(t("Option order","ترتيب الخيارات","Orden de opciones"),order,'data-native="sort" data-ns-order-setting'),field(t("Initial open filter keys","مفاتيح التصفية المفتوحة","Claves inicialmente abiertas"),"category",'data-native="open"'),num(t("Auto-open threshold","عتبة الفتح التلقائي","Umbral de apertura automática"),6,0,10000,'data-native="autoOpenThreshold"'),field(t("Custom pill order","ترتيب الشرائح","Orden personalizado de chips"),"",'data-native="ordering"'),field(t("Preselected filters (JSON)","تصفية محددة مسبقاً (JSON)","Filtros preseleccionados (JSON)"),"{}",'data-native="selectedFilters"')])}<div class="ns-check-grid">${check(t("Show empty options","إظهار الخيارات الفارغة","Mostrar opciones vacías"),true,'data-native="showEmpty"')}${check(t("Wrap long labels","التفاف التسميات الطويلة","Ajustar etiquetas largas"),true,'data-native="wrap"')}${check(t("Show clear controls","عرض أزرار المسح","Mostrar controles de limpieza"),true,'data-native="hideClear"')}${check(t("Expand all groups","توسيع كل المجموعات","Expandir todos los grupos"),false,'data-native="expanded"')}${check(t("Always show filter pills","عرض الشرائح دائماً","Mostrar chips siempre"),true,'data-native="alwaysShow"')}${check(t("Single-select mode","اختيار واحد","Selección única"),false,'data-native="singleSelect"')}</div>`)}${section(t("Templates and localization","القوالب والترجمة","Plantillas y localización"),fields([select(t("Interface language preview","معاينة لغة الواجهة","Idioma de vista previa"),[["en","English"],["ar","العربية"],["es","Español"]],`data-ns-language`),area(t("Custom translation strings","نصوص ترجمة مخصصة","Textos de traducción personalizados"),"{}",'data-native="translations"'),area(t("Result template","قالب النتيجة","Plantilla de resultado"),"{{ meta.title }}\n{{+ excerpt +}}",'data-native="resultTemplate"'),area(t("Placeholder template","قالب التحميل","Plantilla de marcador"),"",'data-native="placeholderTemplate"'),area(t("Term-processing hook (later)","معالجة العبارة (لاحقاً)","Gancho de término (después)"),"",'data-native="processTerm" readonly'),area(t("Result-processing hook (later)","معالجة النتيجة (لاحقاً)","Gancho de resultado (después)"),"",'data-native="processResult" readonly')]))}${section(t("Design tokens","رموز التصميم","Variables de diseño"),fields([field(t("Text / secondary / muted","النص / الثانوي / الخافت","Texto / secundario / tenue"),"",'data-native="text-colors"'),field(t("Surface / border / focus / hover","السطح / الحدود / التركيز / التحويم","Superficie / borde / foco / hover"),"",'data-native="surface-colors"'),field(t("Mark / skeleton / error / shadows","تمييز / هيكل / خطأ / ظلال","Resaltado / esqueleto / error / sombras"),"",'data-native="state-colors"'),field(t("Font, sizes and spacing","الخط والأحجام والمسافات","Fuente, tamaños y espaciado"),"",'data-native="typography"'),field(t("Image size, grid, wrapping","حجم الصورة والشبكة والالتفاف","Tamaño de imagen, cuadrícula, ajuste"),"",'data-native="layout"'),field(t("Modal, dropdown and icon dimensions","أبعاد النافذة والقائمة والأيقونات","Dimensiones de ventana, menú e iconos"),"",'data-native="dimensions"')]))}${actions(btn(t("Restore defaults","استعادة الافتراضي","Restaurar valores"),'data-ns-form-reset'),btn(t("Apply settings","تطبيق الإعدادات","Aplicar ajustes"),'data-ns-apply-settings'))}</div>`);
  const rankings=[["termSimilarity",t("Term similarity","تشابه الكلمات","Similitud del término"),1,0,10,.1],["pageLength",t("Page length","طول الصفحة","Longitud de página"),.75,0,1,.05],["termSaturation",t("Term saturation","تشبع الكلمات","Saturación del término"),1.2,0,2,.1],["termFrequency",t("Term frequency","تكرار الكلمات","Frecuencia del término"),1,0,1,.05],["diacriticSimilarity",t("Diacritic similarity","تشابه التشكيل","Similitud diacrítica"),.8,0,10,.1]];
  const diagnostics=panel("diagnostics",text.diagnostics,`<div class="ns-form">${section(t("Ranking configuration","تهيئة الترتيب","Configuración de relevancia"),rankings.map(([key,name,v,min,max,step])=>`<label class="ns-range"><span>${e(name)} <output>${v}</output></span><input type="range" min="${min}" max="${max}" step="${step}" value="${v}" data-native="ranking.${key}" data-ns-range></label>`).join("")+fields([num(t("Index weight","وزن الفهرس","Peso del índice"),1,0,1000,'step="0.1" data-native="indexWeight"')])+`<h4>metaWeights</h4><div data-ns-rows>${fields([field(text.field,"title",'data-native="ranking.metaWeights.key"'),num(text.value,5,0,1000,'step="0.1" data-native="ranking.metaWeights.value"')])}</div>${btn(t("Add metadata field","إضافة حقل وصفي","Añadir campo de metadatos"),'data-ns-add-row="weight"')}`)}${section(t("Ranking presets","إعدادات ترتيب مسبقة","Preajustes de relevancia"),fields([select(t("Preset","إعداد مسبق","Preajuste"),[["default",t("Default","افتراضي","Predeterminado")]]),field(t("Preset name","اسم الإعداد","Nombre del preajuste"))])+actions(dead(t("Load preset","تحميل الإعداد","Cargar preajuste")),dead(t("Save preset","حفظ الإعداد","Guardar preajuste")),dead(t("Delete presets","حذف الإعدادات","Eliminar preajustes")),btn(text.reset,'data-ns-form-reset')))}${section(t("Pinned result comparison","مقارنة النتائج المثبتة","Comparación de resultados fijados"),`<div class="ns-actions">${dead(t("Pin result","تثبيت نتيجة","Fijar resultado"))}${dead(t("Unpin","إلغاء التثبيت","Desfijar"))}</div>${table([t("Result","النتيجة","Resultado"),t("Previous position","الموضع السابق","Posición anterior"),t("Current position","الموضع الحالي","Posición actual"),t("Previous score","الدرجة السابقة","Puntuación anterior"),t("Current score","الدرجة الحالية","Puntuación actual")],[["—","—","—","—","—"]])}`)}${section(t("Execution and timing","التنفيذ والتوقيت","Ejecución y tiempos"),`<div class="ns-metrics">${["preload","search","total"].map(k=>`<div data-native="timings.${k}"><small>${k}</small><strong>— ms</strong></div>`).join("")}</div><p class="ns-muted" data-native="search_environment">${label("unavailable")} · worker / mainthread</p>`)}${accordion(t("Search keywords and IDF","كلمات البحث وIDF","Palabras de búsqueda e IDF"),table(["search_keywords","query_term_idfs.term","idf"],[["—","—","—"]]))}${accordion(t("Term scoring breakdown","تفاصيل درجات الكلمات","Desglose de puntuación de términos"),table(["search_term","idf","saturating_tf","raw_tf","pagefind_tf","score"],[["—","—","—","—","—","—"]]))}${accordion(t("Document and term scoring parameters","معلمات تقييم المستند والكلمات","Parámetros de puntuación del documento y términos"),table(["document_length","average_page_length","total_pages","weighted_term_frequency","pages_containing_term","length_bonus"],[["—","—","—","—","—","—"]]))}${accordion(t("Weighted word locations","مواضع الكلمات الموزونة","Posiciones ponderadas"),table(["word_string","location","weight","balanced_score","length_bonus"],[["—","—","—","—","—"]]))}${accordion(t("Metadata boost and coverage","تعزيز البيانات الوصفية والتغطية","Impulso y cobertura de metadatos"),table(["field_name","field_weight","matched_terms","matched_idf","query_total_idf","coverage","coverage_boost"],[["—","—","—","—","—","—","—"]]))}${btn(t("Apply ranking","تطبيق الترتيب","Aplicar relevancia"),'data-ns-apply-ranking')}</div>`);
  const engine=panel("engine",text.engine,`<div class="ns-form">${section(t("Bundle and instance","الحزمة والمثيل","Paquete e instancia"),fields([field("basePath","",'placeholder="/pagefind/" data-native="basePath"'),field("bundlePath","",'data-native="bundlePath"'),field("baseUrl","",'placeholder="/" data-native="baseUrl"'),field(t("Instance name","اسم المثيل","Nombre de instancia"),"default",'data-native="instance"'),select(t("Instance selector","اختيار المثيل","Selector de instancia"),[["default","default"]]),select(t("Language","اللغة","Idioma"),[["en","English"],["ar","العربية"],["es","Español"]],'data-native="language"'),select(text.direction,[["ltr","LTR"],["rtl","RTL"]],'data-native="direction"')])+actions(dead(t("Create instance","إنشاء مثيل","Crear instancia")),dead(t("Remove instance","إزالة مثيل","Quitar instancia")),btn(t("Initialize","تهيئة","Inicializar"),'data-ns-engine-action="init"'),btn(t("Destroy","إنهاء","Destruir"),'data-ns-engine-action="destroy"'),btn(t("Reinitialize","إعادة التهيئة","Reinicializar"),'data-ns-engine-action="reinit"'))+check(t("Primary index (internal)","الفهرس الأساسي (داخلي)","Índice principal (interno)"),true,'data-native="primary" disabled'))}${section(t("Merged indexes","الفهارس المدمجة","Índices combinados"),`<div data-ns-rows>${fields([field(t("Index name / path","اسم / مسار الفهرس","Nombre / ruta de índice"),"",'data-native="mergeIndex.bundlePath"'),field("baseUrl","",'data-native="mergeIndex.baseUrl"'),num("indexWeight",1,0,1000,'step="0.1" data-native="mergeIndex.indexWeight"'),area("mergeFilter","{}",'data-native="mergeFilter"')])}</div>${actions(btn(t("Add index","إضافة فهرس","Añadir índice"),'data-ns-add-row="index"'),dead(t("Merge indexes","دمج الفهارس","Combinar índices")))}`)}${section(t("Search options","خيارات البحث","Opciones de búsqueda"),fields([num("excerptLength",30,1,10000,'data-native="excerptLength"'),field("excerptEllipsis","…",'data-native="excerptEllipsis"'),field("sort","",'data-native="sort"'),field("metaCacheTag","",'data-native="metaCacheTag"')])+`<div class="ns-check-grid">${check("exactDiacritics",false,'data-native="exactDiacritics"')}${check("faceted",false,'data-native="faceted"')}${check("preload",false,'data-native="preload"')}${check("noWorker",false,'data-native="noWorker"')}${check("verbose",false,'data-native="verbose"')}</div>${actions(btn(t("Preload query assets","تحميل أصول الاستعلام مسبقاً","Precargar recursos de consulta"),'data-ns-engine-action="preload"'),btn(t("Retrieve filters","استرداد عوامل التصفية","Obtener filtros"),'data-ns-engine-action="filters"'))}`)}${section(t("Destination highlighting","تمييز الصفحة المقصودة","Resaltado de destino"),check(t("Enable destination highlighting","تفعيل تمييز الصفحة","Activar resaltado de destino"),false,'data-native="highlightParam.enabled"')+fields([field("highlightParam","pagefind-highlight",'data-native="highlightParam"'),field("markContext","",'data-native="markContext"'),field("markOptions.className","pagefind-highlight",'data-native="markOptions.className"'),field("markOptions.exclude","[data-pagefind-ignore]",'data-native="markOptions.exclude"'),area("markOptions","{}",'data-native="markOptions"')])+check("addStyles",true,'data-native="addStyles"'))}${section(t("Engine status (informational)","حالة المحرك (معلومات)","Estado del motor (informativo)"),table([text.field,text.value],["WASM","Web Worker / fallback","Index chunks","Filter chunks","Result fragments","Compression","Fetch throttling","Cache / failed-fetch retry","Stemming","Unicode / segmentation","Independent instances","Named component events","search / loading / results / filters / error / translations","options() / init() / destroy() / createInstance()","search() / debouncedSearch() / preload() / filters() / mergeIndex()","data() / native response fragments","registerInput / registerResults / registerSummary / registerFilter / registerSort / registerUtility"].map(x=>[x,text.unavailable])))}${actions(btn(text.reset,'data-ns-form-reset'),btn(t("Apply configuration","تطبيق التهيئة","Aplicar configuración"),'data-ns-engine-action="apply"'))}</div>`);
  const attrs=[["data-pagefind-body",t("Searchable region","منطقة قابلة للبحث","Región indexable")],["data-pagefind-ignore",t("Ignore all / index only","تجاهل الكل / الفهرسة فقط","Ignorar todo / solo índice")],["data-pagefind-weight",t("Content weight","وزن المحتوى","Peso de contenido")],["data-pagefind-filter",t("Filter key / value","مفتاح / قيمة التصفية","Clave / valor de filtro")],["data-pagefind-meta",t("Metadata","البيانات الوصفية","Metadatos")],["data-pagefind-default-meta",t("Fallback metadata","البيانات الاحتياطية","Metadatos alternativos")],["data-pagefind-sort",t("Sort key / value","مفتاح / قيمة الترتيب","Clave / valor de orden")],["data-pagefind-index-attrs",t("Index HTML attributes","فهرسة سمات HTML","Indexar atributos HTML")],["data-pagefind-title",t("Explicit sub-result title","عنوان القسم الصريح","Título explícito de subresultado")]];
  const index=panel("index",text.index,`<div class="ns-form">${section(t("Source and output","المصدر والمخرجات","Origen y salida"),fields([field("site","",'data-native="site"'),field("source (legacy)","",'data-native="source"'),field("glob","**/*.html",'data-native="glob"'),field("output_subdir","",'data-native="output_subdir"'),field("output_path","",'data-native="output_path"'),field("bundle_dir (legacy)","",'data-native="bundle_dir"'),field("root_selector","body",'data-native="root_selector"'),area("exclude_selectors","",'data-native="exclude_selectors"'),select("force_language",[["",t("Automatic","تلقائي","Automático")],["en","English"],["ar","العربية"],["es","Español"]],'data-native="force_language"'),field("include_characters","",'data-native="include_characters"'),num("max_fragments (0 = unset)",0,0,100000,'data-native="max_fragments"'),field("logfile","",'data-native="logfile"'),select(t("Configuration source","مصدر التهيئة","Origen de configuración"),["CLI","Environment","JSON","YAML","TOML"])] )+`<div class="ns-check-grid">${["keep_index_url","serve","verbose","quiet","silent","write_playground","service"].map(k=>check(k,false,`data-native="${k}"`)).join("")}</div>`)}${section(t("Indexing attributes and mappings","سمات الفهرسة والتعيينات","Atributos y asignaciones de índice"),`<div class="ns-index-attrs">${attrs.map(([key,name])=>accordion(key,`<p class="ns-muted">${e(name)}</p>${fields([field(t("Selector / element","المحدد / العنصر","Selector / elemento"),""),field(t("Key / value / attribute","مفتاح / قيمة / سمة","Clave / valor / atributo"),""),field(t("Default / source value","القيمة الافتراضية / المصدر","Valor predeterminado / origen"),"")])}`,false)).join("")}</div>${select("data-pagefind-ignore",[["all","all"],["index","index"]])}<div data-ns-rows>${fields([select(t("Mapping type","نوع التعيين","Tipo de asignación"),attrs.map(([key])=>key)),field(text.field),field(text.value)])}</div>${btn(t("Add mapping","إضافة تعيين","Añadir asignación"),'data-ns-add-row="mapping"')}`)}${section(t("Indexing APIs and custom records","واجهات الفهرسة والسجلات المخصصة","APIs de indexación y registros personalizados"),fields([field("url"),field("language"),field("sourcePath"),area("content"),area("meta","{}"),area("filters","{}"),area("sort","{}")])+actions(...[["Add HTML","إضافة HTML","Añadir HTML"],["Add directory","إضافة مجلد","Añadir directorio"],["Add custom record","إضافة سجل مخصص","Añadir registro"],["Generate index","إنشاء فهرس","Generar índice"],["Get generated files","الحصول على الملفات","Obtener archivos"],["Write files","كتابة الملفات","Escribir archivos"],["Delete index","حذف الفهرس","Eliminar índice"],["Serve / preview","خدمة / معاينة","Servir / previsualizar"],["Generate playground","إنشاء ساحة التشخيص","Generar entorno de diagnóstico"]].map(x=>dead(t(...x)))))}${section(t("Build status (informational)","حالة البناء (معلومات)","Estado de compilación (informativo)"),table([text.field,text.value],["Indexed pages","Indexed languages","Indexed words","Indexed filters","Indexed sorts","Fragment count","Output files","Log messages"].map(x=>[x,"—"])))}${actions(btn(text.reset,'data-ns-form-reset'),dead(t("Apply indexing configuration","تطبيق تهيئة الفهرسة","Aplicar configuración de índice")))}</div>`);
  const shortcuts=panel("keyboard",t("Keyboard and accessibility reference","مرجع لوحة المفاتيح وإمكانية الوصول","Referencia de teclado y accesibilidad"),`<p class="ns-muted" data-ns-developer-only>${L("Shortcut designs are shown here; engine-related actions will be wired later.","تصاميم الاختصارات معروضة هنا؛ ستُربط عمليات المحرك لاحقاً.","Se muestran los atajos previstos; las acciones del motor se conectarán después.")}</p>${table([t("Key","المفتاح","Tecla"),t("Planned action","الإجراء المخطط","Acción prevista")],[["Ctrl / Cmd + K",t("Open search","فتح البحث","Abrir búsqueda")],["↑ / ↓",t("Navigate results or filters","التنقل بين النتائج والتصفية","Navegar por resultados o filtros")],["Enter",t("Open result / select","فتح نتيجة / تحديد","Abrir resultado / seleccionar")],["Ctrl / Cmd / Shift + Enter",text.newtab],["Esc",t("Clear / close panel / close dialog","مسح / إغلاق اللوحة / إغلاق النافذة","Limpiar / cerrar panel / cerrar ventana")],["Tab / Shift + Tab",t("Focus controls","التنقل بين عناصر التحكم","Enfocar controles")],["Home / End",t("First / last filter option","أول / آخر خيار","Primera / última opción")],["Space",t("Toggle filter","تبديل عامل التصفية","Alternar filtro")],["/",t("Focus input","التركيز على الإدخال","Enfocar entrada")],["Backspace / printable key",t("Return to input","العودة للإدخال","Volver a entrada")]])}${section(t("Accessibility provisions","إمكانية الوصول","Accesibilidad"),table([text.field,text.value],[["ARIA live / atomic / busy",t("Status and announcement regions","مناطق الحالة والإعلان","Regiones de estado y anuncio")],["focus-visible",t("Visible focus outlines","حدود تركيز مرئية","Contornos de enfoque visibles")],["IME / Unicode",t("Composition-safe native input","إدخال أصلي آمن للتركيب","Entrada nativa segura para composición")],["RTL / LTR",t("Logical layout","تخطيط منطقي","Diseño lógico")],["prefers-reduced-motion",t("Reduced animation","حركة مخفضة","Animación reducida")]]))}`);
  return `<div class="ns-workspace" data-ns-workspace lang="${lang}" dir="${lang==="ar"?"rtl":"ltr"}" data-theme="site"><div class="ns-top-shell" data-ns-top-shell data-expanded="true"><div class="ns-top-rail"><button type="button" class="ns-top-handle" data-ns-top-handle aria-expanded="true" aria-controls="ns-top-controls" aria-label="${L("Hide search controls","إخفاء أدوات البحث","Ocultar controles de búsqueda")}">${icon("chevron")}</button><button type="button" class="ns-top-pin" data-ns-top-pin aria-pressed="false" aria-label="${L("Pin search controls","تثبيت أدوات البحث","Fijar controles de búsqueda")}">${icon("pinOff")}${icon("pin")}</button></div><div class="ns-top-fold"><div class="ns-top-clip"><div class="ns-top" id="ns-top-controls"><p class="ns-preview" role="note" data-ns-developer-only>${icon("info")}<span>${label("preview")}</span></p><form class="ns-searchbar" id="ns-query-form" role="search"><label class="ns-query-label" for="ns-query">${icon("search")}<span class="ns-sr">${L("Search keyword or phrase","ابحث بكلمة أو عبارة","Buscar palabra o frase")}</span><input id="ns-query" type="search" autocomplete="off" data-native="term" placeholder="${L("Search keywords, phrases or technical terms…","ابحث عن كلمات أو عبارات أو مصطلحات تقنية…","Buscar palabras, frases o términos técnicos…")}"></label><button type="button" data-ns-clear-query aria-label="${L("Clear search input","مسح إدخال البحث","Limpiar búsqueda")}">${icon("close")}</button><button type="submit">${icon("search")}<span>${L("Search","بحث","Buscar")}</span></button></form><nav class="ns-toolbar" aria-label="${L("Search tools","أدوات البحث","Herramientas de búsqueda")}">${btn(text.filters,'data-ns-filter-toggle aria-controls="ns-filters" aria-expanded="false"',"filter")}${btn(text.sort+" · "+text.relevance,'data-ns-view="sort"',"sort")}${btn(text.advanced,'data-ns-view="advanced"',"settings")}${btn(text.settings,'data-ns-view="settings"',"settings")}${btn(text.diagnostics,'data-ns-view="diagnostics" data-ns-developer-only')}${btn(text.engine,'data-ns-view="engine" data-ns-developer-only')}${btn(text.index,'data-ns-view="index" data-ns-developer-only')}</nav><div class="ns-selection-bar"><div data-ns-selected aria-live="polite"><span class="ns-muted">${L("No filters selected","لم يتم تحديد عوامل تصفية","Sin filtros seleccionados")}</span></div>${btn(text.reset,'data-ns-reset-filters class="ns-quiet"')}</div></div></div></div></div><div class="ns-body"><div class="ns-main" data-ns-panel="results">${filterPane}${resultArea}</div>${sortPanel}${advanced}${settings}${details}${diagnostics}${engine}${index}${shortcuts}</div><footer class="ns-footer"><span class="ns-keyboard-hints"><kbd>↑ ↓</kbd> ${L("Navigate","تنقل","Navegar")} <kbd>Enter</kbd> ${L("Open","فتح","Abrir")} <kbd>/</kbd> ${L("Search","بحث","Buscar")} <kbd>Esc</kbd> ${L("Close","إغلاق","Cerrar")}</span>${btn(t("Keyboard reference","مرجع لوحة المفاتيح","Referencia de teclado"),'data-ns-view="keyboard" class="ns-quiet"')}<span class="ns-muted">${label("demo")}</span></footer><template data-ns-row-template="weight"><div class="ns-extra-row">${fields([field(text.field),num(text.value,1,0,1000,'step="0.1"')])}${btn(text.remove,'data-ns-remove')}</div></template><template data-ns-row-template="index"><div class="ns-extra-row">${fields([field("bundlePath"),field("baseUrl"),num("indexWeight",1,0,1000,'step="0.1"'),area("mergeFilter","{}")])}${btn(text.remove,'data-ns-remove')}</div></template><template data-ns-row-template="mapping"><div class="ns-extra-row">${fields([select(t("Mapping type","نوع التعيين","Tipo de asignación"),attrs.map(([key])=>key)),field(text.field),field(text.value)])}${btn(text.remove,'data-ns-remove')}</div></template><template data-ns-no-selection><span class="ns-muted">${L("No filters selected","لم يتم تحديد عوامل تصفية","Sin filtros seleccionados")}</span></template></div>`;
}

// Presentation-only toolbar. The preference stores one boolean, never a query,
// filter, language or developer-mode value.
function initAdaptiveTopbar(view, dialog, currentPanel, translate) {
  const key="luxraj.normal-search.toolbar-pinned";
  let pinned=false;
  try { pinned=localStorage.getItem(key)==="1"; } catch {}
  const q=s=>view.querySelector(s);
  const hoverMedia=window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
  const shortMedia=window.matchMedia("(max-height: 480px)");
  const reduced=window.matchMedia("(prefers-reduced-motion: reduce)");
  const now=()=>performance.now();
  let shell,top,workspace,body,handle,pin,resizeObserver;
  let expanded=true,hovered=false,hoverReveal=false,enterTimer=0,leaveTimer=0;
  let collapsedBySearch=false;
  let lastScroll=0,distance=0,direction=0,settleUntil=0;
  let scrollIntentUntil=0,scrollIntentType="",lastTyping=-Infinity;
  const scrollRoot=()=>shortMedia.matches?workspace:body;
  const visible=()=>dialog.open&&!view.hidden;
  const cancelHover=()=>{clearTimeout(enterTimer);clearTimeout(leaveTimer);enterTimer=leaveTimer=0;};
  const focused=()=>top?.contains(document.activeElement);
  const editing=()=>document.activeElement?.matches("input,textarea,select,[contenteditable]:not([contenteditable=false])");
  function mayReleaseFocus(){
    if(!focused())return true;
    // The existing dialog autofocuses the query. Deliberate result scrolling
    // may leave it, but never hide a focused editor during touch-keyboard use
    // or while the visitor is actively typing.
    return now()<scrollIntentUntil&&now()-lastTyping>600&&(!editing()||scrollIntentType==="wheel");
  }
  function baseline(){
    lastScroll=Math.max(0,scrollRoot()?.scrollTop||0);
    distance=0;direction=0;
  }
  function syncSize(){
    if(!workspace||!shell)return;
    // The short-screen fallback scrolls the workspace, not .ns-body.
    // Reserve room for results even if the toolbar has many controls.
    const footer=q(".ns-footer");
    const available=Math.max(44,workspace.clientHeight-100-shell.querySelector(".ns-top-rail").offsetHeight-(shortMedia.matches?0:footer.offsetHeight));
    shell.style.setProperty("--ns-top-available",available+"px");
    baseline();
  }
  function setExpanded(next, reason="automatic"){
    if(!shell)return;
    if(!next&&(pinned||focused()||currentPanel()!=="results"))return;
    if(next===expanded&&shell.dataset.expanded===String(next))return;
    expanded=next;
    collapsedBySearch=!next&&reason==="search";
    if(reason!=="hover")hoverReveal=false;
    shell.dataset.expanded=String(next);
    handle.setAttribute("aria-expanded",String(next));
    handle.setAttribute("aria-label",next?translate("Hide search controls","إخفاء أدوات البحث","Ocultar controles de búsqueda"):translate("Show search controls","إظهار أدوات البحث","Mostrar controles de búsqueda"));
    top.inert=!next;
    settleUntil=now()+(reduced.matches?40:240);
    baseline();
  }
  function syncPin(){
    shell.dataset.pinned=String(pinned);
    pin.setAttribute("aria-pressed",String(pinned));
    // The toggle has a stable accessible name and a pressed state.
    handle.disabled=pinned;
    if(pinned)setExpanded(true,"pin");
  }
  function reveal(){
    cancelHover();hoverReveal=false;
    setExpanded(true,"manual");
    baseline();
  }
  function collapseAfterSearch(){
    cancelHover();
    hoverReveal=false;
    if(pinned){reveal();return;}
    // Move focus out of the folding controls (also dismisses the touch keyboard).
    if(focused())handle.focus({preventScroll:true});
    setExpanded(false,"search");
  }
  function resetOnOpen(){
    cancelHover();hovered=false;hoverReveal=false;scrollIntentUntil=0;scrollIntentType="";
    reveal();syncSize();
  }
  function onScroll(event){
    const root=scrollRoot();
    // Only the active scroll container can control visibility. Nested filter,
    // textarea and horizontal toolbar scrolls never count.
    if(event.target!==root||!visible())return;
    const position=Math.max(0,root.scrollTop);
    const delta=position-lastScroll;
    lastScroll=position;
    if(now()<settleUntil){distance=direction=0;return;}
    if(pinned||currentPanel()!=="results"||!mayReleaseFocus()||hovered){
      distance=direction=0;return;
    }
    if(position<=4){if(delta<0)setExpanded(true);distance=direction=0;return;}
    if(Math.abs(delta)<1)return;
    const sign=Math.sign(delta);
    if(sign!==direction){direction=sign;distance=0;}
    distance+=Math.abs(delta);
    if(sign>0&&position>=64&&distance>=24&&expanded){
      if(focused())document.activeElement.blur();
      setExpanded(false);
    }
    else if(sign<0&&distance>=12&&!expanded)setExpanded(true);
  }
  function bind(){
    cancelHover();
    resizeObserver?.disconnect();
    workspace=q(".ns-workspace");shell=q("[data-ns-top-shell]");top=q("#ns-top-controls");
    body=q(".ns-body");handle=q("[data-ns-top-handle]");pin=q("[data-ns-top-pin]");
    expanded=true;collapsedBySearch=false;hoverReveal=hovered=false;scrollIntentUntil=0;scrollIntentType="";lastTyping=-Infinity;
    shell.dataset.expanded="true";top.inert=false;
    handle.setAttribute("aria-expanded","true");
    syncPin();syncSize();
    shell.addEventListener("pointerenter",event=>{
      if(!hoverMedia.matches||event.pointerType==="touch")return;
      hovered=true;clearTimeout(leaveTimer);
      if(!expanded)enterTimer=setTimeout(()=>{
        if(!hovered||!visible()||expanded)return;
        hoverReveal=true;setExpanded(true,"hover");
      },100);
    });
    shell.addEventListener("pointerleave",event=>{
      if(event.pointerType==="touch")return;
      hovered=false;clearTimeout(enterTimer);
      if(hoverReveal)leaveTimer=setTimeout(()=>{
        if(!hovered&&!focused()&&!pinned&&visible())setExpanded(false);
      },250);
    });
    handle.addEventListener("click",()=>{
      cancelHover();
      // A click after hover expansion makes the reveal intentional.
      if(hoverReveal||!expanded){reveal();return;}
      if(!pinned)setExpanded(false,"manual");
    });
    pin.addEventListener("click",()=>{
      pinned=!pinned;
      try {localStorage.setItem(key,pinned?"1":"0");} catch {}
      reveal();syncPin();
    });
    shell.addEventListener("focusin",event=>{
      // Keyboard focus on the reveal button must not toggle it behind the user.
      if(event.target===handle||event.target===pin)return;
      reveal();
    });
    shell.addEventListener("focusout",()=>{
      baseline();
    });
    top.addEventListener("input",()=>{lastTyping=now();});
    top.addEventListener("keydown",event=>{if(event.key.length===1||event.isComposing||["Backspace","Delete"].includes(event.key))lastTyping=now();});
    // Record pointer intent only outside the toolbar and nested controls.
    const isResultScroll=target=>body.contains(target)&&!target.closest(".ns-filters,.ns-table-scroll,textarea,select");
    workspace.addEventListener("wheel",event=>{
      if(event.ctrlKey||!isResultScroll(event.target))return;
      if(event.deltaY<0&&!expanded&&scrollRoot().scrollTop<=4){reveal();return;}
      if(event.deltaY<=0)return;
      scrollIntentType="wheel";scrollIntentUntil=now()+500;
    },{passive:true});
    workspace.addEventListener("pointerdown",event=>{
      if(event.pointerType!=="touch"||!isResultScroll(event.target))return;
      scrollIntentType="touch";scrollIntentUntil=now()+1200;
    },{passive:true});
    workspace.addEventListener("scroll",onScroll,{passive:true});
    body.addEventListener("scroll",onScroll,{passive:true});
    if(typeof ResizeObserver==="function"){
      resizeObserver=new ResizeObserver(syncSize);
      resizeObserver.observe(workspace);
      resizeObserver.observe(top);
      resizeObserver.observe(body);
      resizeObserver.observe(q(".ns-footer"));
    }
  }
  const visibility=new MutationObserver(()=>{
    if(visible())resetOnOpen();
    else {cancelHover();hovered=hoverReveal=false;baseline();}
  });
  visibility.observe(dialog,{attributes:true,attributeFilter:["open","data-normal-workspace"]});
  visibility.observe(view,{attributes:true,attributeFilter:["hidden"]});
  shortMedia.addEventListener("change",()=>{
    // A touch keyboard can cross the short-viewport breakpoint as it closes.
    // Keep an explicit Search collapse intact during that resize.
    if(!collapsedBySearch)reveal();
    syncSize();
    settleUntil=now()+(reduced.matches?40:240);
  });
  hoverMedia.addEventListener("change",()=>{cancelHover();hovered=hoverReveal=false;baseline();});
  bind();
  return {bind,reveal,baseline,collapseAfterSearch};
}

export function initNormalSearch(view) {
  if (view.dataset.nsReady === "true") return;
  const dialog=view.closest("#search-dialog");
  if(!dialog)return;
  view.dataset.nsReady = "true";
  const supported=["en","ar","es"];
  let language=(document.documentElement.lang||"en").toLowerCase().split("-")[0];
  if(!supported.includes(language)) language="en";
  const mount=()=>{view.innerHTML=normalMarkup(language);view.querySelector("[data-ns-language]").value=language;};
  mount();
  const q=s=>view.querySelector(s), qa=s=>[...view.querySelectorAll(s)];
  let activePanel="results", previousControl=null;
  let lastPresentation=null;
  const parkedOptions=new WeakMap();
  const developerMode=()=>dialog.getAttribute("data-search-ui-mode")==="developer";
  const local=(en,ar,es)=>({en,ar,es}[language]||en);
  const adaptiveTopbar=initAdaptiveTopbar(view,dialog,()=>activePanel,local);
  const mark=el=>el?.setAttribute("data-ns-developer-only","");
  // Mark whole controls/sections, never just input fields, so no orphan labels or gaps remain.
  function classifyPresentation(){
    const settings=q('[data-ns-panel="settings"]');
    const publicSettings=new Set(["excerptLength","maxSubResults","linkTarget","live","keyboardHints","resetOnClose","shortcut","sort"]);
    for(const control of settings.querySelectorAll("input,select,textarea")){
      const visible=(control.hasAttribute("data-ns-display")&&control.dataset.nsDisplay!=="scores")
        ||control.hasAttribute("data-ns-layout-select")||control.hasAttribute("data-ns-density")
        ||control.hasAttribute("data-ns-style-setting")||publicSettings.has(control.dataset.native);
      if(!visible)mark(control.closest("label"));
    }
    for(const native of ["translations","text-colors"])mark(settings.querySelector('[data-native="'+native+'"]')?.closest(".ns-section"));
    // This filter-configuration checkbox grid has no public controls.
    mark(settings.querySelector('[data-native="showEmpty"]')?.closest(".ns-check-grid"));
    for(const selector of ["[data-ns-filter-style]","[data-ns-order]","[data-ns-show-zero]","[data-ns-multiple]","[data-ns-single]","[data-ns-state]","[data-native='sort.custom']"])
      for(const el of qa(selector))mark(el.closest("label"));
    for(const el of qa('[data-ns-group="additional"],[data-ns-filter-key="additional"]'))mark(el);
    mark(q(".ns-code")?.closest(".ns-section"));
    const keyboard=q('[data-ns-panel="keyboard"]');
    for(const section of keyboard.querySelectorAll(".ns-section"))mark(section);
    // Technical choices remain available in Developer Mode, including in dynamically added groups.
    for(const el of qa("[data-ns-sort] option,[data-ns-order] option,[data-ns-order-setting] option,[data-native='filters.field'] option"))
      if(["decimal","custom","additional"].includes(el.value))mark(el);
    // Hide technical captions in User Mode without changing native values.
    for(const el of qa("[data-native='filters.operator'] option,[data-native='term.mode'] option,[data-native='filters.field'] option,[data-ns-sort] option")){
      if(!el.hasAttribute("data-ns-developer-label"))el.dataset.nsDeveloperLabel=el.textContent;
      const map=el.closest("select").dataset.native==="filters.operator"?{
        all:local("Match all conditions","مطابقة كل الشروط","Coincidir con todas las condiciones"),
        any:local("Match any condition","مطابقة أي شرط","Coincidir con cualquier condición"),
        not:local("Exclude matches to all conditions","استبعاد ما يطابق كل الشروط","Excluir coincidencias con todas las condiciones"),
        none:local("Exclude matches to any condition","استبعاد ما يطابق أي شرط","Excluir coincidencias con cualquier condición")
      }:el.closest("select").dataset.native==="term.mode"?{
        standard:local("Keyword search","بحث بالكلمات","Buscar palabras"),
        faceted:local("Browse without keywords","تصفح دون كلمات","Explorar sin palabras")
      }:el.closest("select").dataset.native==="filters.field"?{
        "":local("Choose a filter","اختر عامل تصفية","Elegir un filtro")
      }:{
        title:local("Title","العنوان","Título"),date:local("Publication date","تاريخ النشر","Fecha de publicación"),
        word_count:local("Word count","عدد الكلمات","Cantidad de palabras")
      };
      if(Object.hasOwn(map,el.value))el.dataset.nsUserLabel=map[el.value];
    }
    function caption(el,publicText){if(!el)return;if(!el.hasAttribute("data-ns-developer-label"))el.dataset.nsDeveloperLabel=el.textContent;el.dataset.nsUserLabel=publicText;}
    caption(q(".ns-preview > span"),local("Pagefind search","بحث Pagefind","Búsqueda Pagefind"));
    caption(q('[data-ns-panel="sort"] .ns-section h3'),local("Sort by","ترتيب حسب","Ordenar por"));
    caption(q('[data-ns-panel="sort"] [data-ns-sort]')?.closest("label")?.querySelector("span"),local("Sort field","حقل الترتيب","Campo de orden"));
    caption(q('[data-ns-panel="keyboard"] .ns-panel-head h3'),local("Keyboard shortcuts","اختصارات لوحة المفاتيح","Atajos de teclado"));
    const apply=settings.querySelector("[data-ns-apply-settings] > span");
    caption(apply,local("Apply settings","تطبيق الإعدادات","Aplicar ajustes"));
    // The preview still needs an honest example-data notice in both presentations.
  }
  function syncOptionPresentation(){
    const dev=developerMode();
    for(const el of qa("[data-ns-developer-label]"))
      el.textContent=dev?el.dataset.nsDeveloperLabel:(el.dataset.nsUserLabel??el.dataset.nsDeveloperLabel);
    // Remove developer-only options from native pickers in public mode.
    // Some native mobile pickers do not reliably honour CSS on option elements.
    // Park the original nodes and restore them, in order, on switching back.
    for(const select of qa("select")){
      const value=select.value;
      if(dev){
        const parked=parkedOptions.get(select);
        if(parked){for(const {option,index} of parked)select.add(option,index);parkedOptions.delete(select);select.value=value;}
      }else if(!parkedOptions.has(select)){
        const parked=[...select.options].map((option,index)=>({option,index})).filter(({option})=>option.hasAttribute("data-ns-developer-only"));
        if(parked.length){
          const selectedWasDeveloper=parked.some(({option})=>option.value===value);
          for(const {option} of parked)option.remove();
          parkedOptions.set(select,parked);
          if(!selectedWasDeveloper)select.value=value;
          else {
            select.selectedIndex=0;
            if(select.matches("[data-ns-order],[data-ns-order-setting]"))select.dispatchEvent(new Event("change",{bubbles:true}));
          }
        }
      }
    }
    updateSortCaption();
    const keyboard=q('[data-ns-panel="keyboard"]');
    keyboard.setAttribute("aria-label",keyboard.querySelector(".ns-panel-head h3").textContent);
  }
  function updateSortCaption(){
    const control=q("[data-ns-sort]"),label=q(".ns-toolbar [data-ns-view='sort'] span");
    if(!label.dataset.base)label.dataset.base=label.textContent.split(" · ")[0];
    label.textContent=label.dataset.base+" · "+(control.selectedOptions[0]?.textContent||local("Relevance","الصلة","Relevancia"));
  }
  function syncPresentation(){
    classifyPresentation();
    const dev=developerMode(),changed=lastPresentation!==dev;
    const focused=document.activeElement;
    syncOptionPresentation();
    if(!dev&&changed){
      // Only preview state is reset, never the query, selected filters or result layout.
      updateState();
      if(q('[data-ns-panel="'+activePanel+'"]')?.hasAttribute("data-ns-developer-only"))showPanel("results");
      else if(dialog.open&&!view.hidden&&(!focused||focused===document.body||(view.contains(focused)&&focused.closest("[data-ns-developer-only]"))))q("#ns-query").focus();
    }
    lastPresentation=dev;
  }
  const presentationObserver=new MutationObserver(syncPresentation);
  presentationObserver.observe(dialog,{attributes:true,attributeFilter:["data-search-ui-mode"]});
  function syncFilterVisibility(){const pane=q(".ns-filters");const wide=window.matchMedia("(min-width:1024px)").matches;q("[data-ns-filter-toggle]").setAttribute("aria-expanded",String(wide?!pane.classList.contains("ns-filter-hidden"):pane.classList.contains("ns-filter-open")));}
  window.matchMedia("(min-width:1024px)").addEventListener("change",syncFilterVisibility);
  function showPanel(name,control=null) {
    const target=qa("[data-ns-panel]").find(el=>el.dataset.nsPanel===name);
    if(!target||(!developerMode()&&target.hasAttribute("data-ns-developer-only")))return;
    if(name!=="results"&&activePanel==="results")previousControl=control;
    qa("[data-ns-panel]").forEach(el=>{el.hidden=el!==target;});
    activePanel=name;
    adaptiveTopbar.reveal();
    q(".ns-body").scrollTop=0;
    if(window.matchMedia("(max-height: 480px)").matches)q(".ns-workspace").scrollTop=0;
    adaptiveTopbar.baseline();
    qa(".ns-toolbar [data-ns-view]").forEach(el=>el.setAttribute("aria-pressed",String(el.dataset.nsView===name)));
    if(name==="results"){if(previousControl?.isConnected&&(developerMode()||!previousControl.closest("[data-ns-developer-only]")))previousControl.focus();else if(dialog.open&&!view.hidden)q("#ns-query").focus();previousControl=null;}
    else target.querySelector("h3[tabindex]")?.focus();
  }
  function selected() {return qa("[data-ns-filter]:checked");}
  function syncFilters() {
    const picked=selected(),bar=q("[data-ns-selected]");bar.replaceChildren();
    if(!picked.length)bar.append(q("[data-ns-no-selection]").content.cloneNode(true));
    for(const input of picked){const chip=document.createElement("button");chip.type="button";chip.className="ns-pill";chip.dataset.nsRemoveFilter=input.dataset.nsFilter;chip.dataset.value=input.value;chip.textContent=input.dataset.caption+" ×";bar.append(chip);}
    const toggle=q("[data-ns-filter-toggle]");const original=toggle.querySelector("span");if(!original.dataset.base)original.dataset.base=original.textContent;original.textContent=original.dataset.base+(picked.length?" ("+picked.length+")":"");
    for(const g of qa("[data-ns-group]"))g.querySelector("[data-ns-group-count]").textContent=String(g.querySelectorAll("input:checked").length);
    for(const item of qa("[data-ns-mirror]"))item.checked=picked.some(x=>x.dataset.nsFilter===item.dataset.nsMirror&&x.value===item.value);
    for(const item of qa("[data-ns-pill]"))item.setAttribute("aria-pressed",String(picked.some(x=>x.dataset.nsFilter===item.dataset.nsPill&&x.value===item.dataset.value)));
    for(const item of qa("[data-ns-pill-all]"))item.setAttribute("aria-pressed",String(!picked.some(x=>x.dataset.nsFilter===item.dataset.nsPillAll)));
    const single=q("[data-ns-single]");single.value=picked.find(x=>x.dataset.nsFilter==="category")?.value||"";
    updateZero();
  }
  function updateZero(){const show=q("[data-ns-show-zero]").checked;for(const row of qa("[data-ns-zero='true']")){const input=row.querySelector("input");row.hidden=!show&&!(input?.checked||row.getAttribute("aria-pressed")==="true");}}
  function setFilter(key,value,checked) {
    if(checked&&developerMode()&&!q("[data-ns-multiple]").checked)qa("[data-ns-filter]").filter(x=>x.dataset.nsFilter===key).forEach(x=>x.checked=false);
    qa("[data-ns-filter]").filter(x=>x.dataset.nsFilter===key&&x.value===value).forEach(x=>x.checked=checked);
    syncFilters();
  }
  function resetFilters(key){qa("[data-ns-filter]").filter(x=>!key||x.dataset.nsFilter===key).forEach(x=>x.checked=false);syncFilters();}
  function setStyle(style){qa("[data-ns-filter-variant]").forEach(el=>el.hidden=el.dataset.nsFilterVariant!==style);q("[data-ns-filter-style]").value=style;q("[data-ns-style-setting]").value=style;}
  function setLayout(layout){q("[data-ns-results]").dataset.layout=layout;q("[data-ns-layout-select]").value=layout;qa("[data-ns-layout]").forEach(el=>el.setAttribute("aria-pressed",String(el.dataset.nsLayout===layout)));updateState();}

  // UI state and rendering live here; the adapter only forwards native calls.
  let liveState="idle", response=null, catalog={}, indexManifest=null, requestId=0;
  let initialized=null, rendered=0, loadingBatch=false, advancedFilter=null, queryMode="standard", browse=false;
  let resultRecords=new Map(), rankingOptions={}, lastError=null, lastTerm="";
  const node=(tag,cls="",value)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(value!==undefined)n.textContent=String(value);return n;};
  const button=(value,cls,attrs={})=>{const b=node("button",cls,value);b.type="button";for(const [k,v] of Object.entries(attrs))b.dataset[k]=v;return b;};
  const native=(panel,key)=>q('[data-ns-panel="'+panel+'"] [data-native="'+key+'"]');
  const setting=key=>native("settings",key);
  const integer=(key,fallback,min=0,max=10000)=>{const n=Number(setting(key)?.value);return Number.isFinite(n)?Math.max(min,Math.min(max,Math.trunc(n))):fallback;};
  const fmt=n=>new Intl.NumberFormat(language).format(n);
  const groupLabel=key=>({category:local("Category","الفئة","Categoría"),type:local("Page type","نوع الصفحة","Tipo de página"),author:local("Author","المؤلف","Autor"),tags:local("Tags","الوسوم","Etiquetas"),year:local("Publication year","سنة النشر","Año de publicación")})[key]||key;
  const sortLabel=key=>({title:local("Title","العنوان","Título"),date:local("Publication date","تاريخ النشر","Fecha de publicación"),word_count:local("Word count","عدد الكلمات","Cantidad de palabras")})[key]||key;
  const selectedMap=()=>{const m=new Map();for(const el of selected()){if(!m.has(el.dataset.nsFilter))m.set(el.dataset.nsFilter,new Set());m.get(el.dataset.nsFilter).add(el.value);}return m;};
  function fillOptions(select,entries){const value=select.value;parkedOptions.delete(select);select.replaceChildren(...entries.map(([key,label])=>{const o=node("option","",label);o.value=key;return o;}));if(entries.some(([k])=>k===value))select.value=value;}
  function populateAdvancedFields(){
    const entries=[["",local("Choose a filter","اختر عامل تصفية","Elegir un filtro")],...Object.keys(catalog).map(k=>[k,groupLabel(k)])];
    for(const el of qa('[data-native="filters.field"]'))fillOptions(el,entries);
    for(const tpl of qa("[data-ns-condition-template],[data-ns-group-template]"))for(const el of tpl.content.querySelectorAll('[data-native="filters.field"]'))fillOptions(el,entries);
  }
  function drawFilters(counts=null,totals=null){
    const selection=selectedMap(),open=new Set(qa("[data-ns-group][open]").map(el=>el.dataset.nsGroup));
    const roots=Object.fromEntries(qa("[data-ns-filter-variant]").map(el=>[el.dataset.nsFilterVariant,el]));
    for(const el of Object.values(roots))el.replaceChildren();
    const keys=Object.keys(catalog);
    for(const [i,key] of keys.entries()){
      const values=Object.entries(catalog[key]||{}),name=groupLabel(key);
      const pane=node("details","ns-filter-group");pane.dataset.nsGroup=key;pane.open=open.has(key)||(!open.size&&i===0);
      const summary=node("summary");summary.append(node("span","",name));const n=node("span","ns-count","0");n.dataset.nsGroupCount="";summary.append(n,node("span","","⌄"));pane.append(summary);
      const paneBody=node("div","ns-filter-body"),fieldset=node("fieldset"),legend=node("legend","ns-sr",name);fieldset.append(legend);
      const drop=node("details","ns-filter-group");drop.dataset.nsDropdown="";drop.dataset.nsFilterKey=key;drop.append(node("summary","",name+" ⌄"));const dropBody=node("div","ns-filter-body");
      const pill=node("div","ns-pill-group");pill.dataset.nsFilterKey=key;pill.append(node("h4","",name));const pillActions=node("div","ns-actions");
      const all=button(local("All","الكل","Todos"),"",{nsPillAll:key});all.setAttribute("aria-pressed","true");pillActions.append(all);
      for(const [j,[value,initial]] of values.entries()){
        const checked=selection.get(key)?.has(value)||false;
        const count=counts?(checked?(totals?.[key]?.[value]??counts?.[key]?.[value]??0):(counts?.[key]?.[value]??0)):initial;
        for(const [dest,marker] of [[fieldset,"nsFilter"],[dropBody,"nsMirror"]]){
          const row=node("label","ns-filter-option");row.dataset.nsZero=String(count===0);row.dataset.originalIndex=String(j);
          const input=node("input");input.type="checkbox";input.value=value;input.checked=checked;input.dataset[marker]=key;input.dataset.caption=value;row.append(input,node("span","",value),node("span","ns-count",fmt(count)));dest.append(row);
          row.lastElementChild.dataset.count=String(count);
        }
        const b=button(value+" · "+fmt(count),"",{nsPill:key,value,nsZero:String(count===0),nsCount:String(count),nsCaption:value,originalIndex:String(j)});b.setAttribute("aria-pressed",String(checked));pillActions.append(b);
      }
      paneBody.append(fieldset,button(local("Clear group","مسح المجموعة","Limpiar grupo"),"ns-quiet",{nsClearGroup:""}));pane.append(paneBody);roots.pane.append(pane);
      dropBody.append(button(local("Clear","مسح","Limpiar"),"ns-quiet",{nsClearKey:key}));drop.append(dropBody);roots.dropdown.append(drop);
      pill.append(pillActions);roots.pills.append(pill);
    }
    if(!keys.length)for(const root of Object.values(roots))root.append(node("p","ns-muted",local("No filters available","لا توجد عوامل تصفية","No hay filtros disponibles")));
    fillOptions(q("[data-ns-single]"),[["",local("All","الكل","Todos")],...Object.keys(catalog.category||{}).map(v=>[v,v])]);
    syncFilters();
    const ordering=q("[data-ns-order]");if(ordering.value!=="custom")ordering.dispatchEvent(new Event("change",{bubbles:true}));
  }
  function safeUrl(value,base=pagefind.siteRoot,external=false){
    if(!value)return null;
    try{const url=new URL(value,base);if(!["http:","https:"].includes(url.protocol))return null;if(!external&&(url.origin!==pagefind.siteRoot.origin||!url.pathname.startsWith(pagefind.siteRoot.pathname)))return null;if(!external&&!native("advanced","highlightParam")?.checked)url.searchParams.delete("pagefind-highlight");return url.href;}catch{return null;}
  }
  function excerptInto(el,markup){
    // The inert template is never attached. Only text and native mark tags are rebuilt.
    const template=document.createElement("template");template.innerHTML=String(markup||"");
    const copy=(from,to)=>{for(const child of from.childNodes){if(child.nodeType===3)to.append(document.createTextNode(child.textContent));else if(child.nodeType===1){if(child.tagName==="MARK"){const mark=node("mark");copy(child,mark);to.append(mark);}else if(!["SCRIPT","STYLE","TEMPLATE","IFRAME","OBJECT"].includes(child.tagName))copy(child,to);}}};
    copy(template.content,el);
  }
  function link(label,url,target="_self",cls=""){
    const a=node("a",cls,label);if(url){a.href=url;a.target=target;if(target==="_blank")a.rel="noopener noreferrer";}else{a.setAttribute("aria-disabled","true");a.tabIndex=-1;}return a;
  }
  function resultCard(ref,data){
    const meta=data.meta||{},url=safeUrl(data.url),target=setting("linkTarget")?.value==="_blank"?"_blank":"_self";
    const card=node("article","ns-result");card.dataset.nsResult="";card.dataset.resultId=ref.id;
    const main=node("div","ns-card-main"),copy=node("div","ns-card-copy"),imgUrl=safeUrl(meta.image,url||pagefind.siteRoot,true);
    if(imgUrl){const thumb=node("div","ns-thumb"),image=node("img");image.src=imgUrl;image.alt=meta.image_alt||"";image.loading="lazy";image.decoding="async";image.addEventListener("error",()=>thumb.remove(),{once:true});thumb.append(image);main.append(thumb);}
    if(meta.category||meta.type)copy.append(node("div","ns-eyebrow",[meta.category,meta.type].filter(Boolean).join(" · ")));
    const title=node("h4");title.append(link(meta.title||data.url||ref.id,url,target,"ns-result-link"));copy.append(title);
    const urlText=node("p","ns-url",url||data.url);urlText.dir="ltr";copy.append(urlText);
    const excerpt=node("p","ns-excerpt");excerptInto(excerpt,data.excerpt);copy.append(excerpt);
    const metadata=node("div","ns-card-meta");for(const item of [meta.author,meta.date,meta.updated,Number.isFinite(data.word_count)?fmt(data.word_count)+" "+local("words","كلمة","palabras"):null])if(item)metadata.append(node("span","",item));
    const score=node("span","ns-score",Number.isFinite(ref.score)?"score: "+ref.score.toFixed(3):"");score.dataset.nsDeveloperOnly="";metadata.append(score);copy.append(metadata);
    const tags=node("div","ns-actions ns-card-tags");for(const value of new Set(Object.values(data.filters||{}).flat()))tags.append(node("span","ns-pill",value));for(const value of ref.matchedMetaFields||[])tags.append(node("span","ns-pill",local("Match: ","مطابقة: ","Coincidencia: ")+value));copy.append(tags);main.append(copy);card.append(main);
    const sections=(data.sub_results||[]).filter(x=>x.url&&x.url!==data.url);
    const max=integer("maxSubResults",3,0,100);
    if(sections.length&&max>0){const group=node("div","ns-subresults");group.append(node("h5","",local("Matching sections","الأقسام المطابقة","Secciones coincidentes")));
      for(const sub of sections.slice(0,max)){const row=node("div","ns-subresult");row.append(link(sub.title||sub.url,safeUrl(sub.url),target,"ns-subtitle"));const snippet=node("p");excerptInto(snippet,sub.excerpt);row.append(snippet);group.append(row);}
      if(sections.length>max){const more=node("details");more.append(node("summary","",local("More matching sections","المزيد من الأقسام","Más secciones coincidentes")));for(const sub of sections.slice(max)){const row=node("div","ns-subresult");row.append(link(sub.title||sub.url,safeUrl(sub.url),target,"ns-subtitle"));const snippet=node("p");excerptInto(snippet,sub.excerpt);row.append(snippet);more.append(row);}group.append(more);}card.append(group);}
    const actions=node("div","ns-actions ns-result-actions");actions.append(link(local("Open page","فتح الصفحة","Abrir página"),url,target,"ns-action-link"),link(local("New tab","علامة تبويب جديدة","Nueva pestaña"),url,"_blank","ns-action-link"));
    const detail=button(local("Result details","تفاصيل النتيجة","Detalles del resultado"),"",{nsLiveDetails:ref.id,nsDeveloperOnly:""});actions.append(detail);card.append(actions);
    const compact=node("div","ns-compact-option");compact.setAttribute("role","option");compact.setAttribute("aria-selected","false");const compactTitle=node("strong");compactTitle.append(link(meta.title||data.url,url,target,"ns-result-link"));const cp=node("p");excerptInto(cp,data.excerpt);compact.append(compactTitle,cp);
    return {card,compact};
  }
  function showDetails(id,b){
    const record=resultRecords.get(id);if(!record)return;const panel=q('[data-ns-panel="details"]');
    const title=panel.querySelector("[data-ns-detail-label]");title.textContent=id;
    const fields=panel.querySelector("[data-ns-detail-fields]");fields.replaceChildren();
    const ref=record.ref,data=record.data;
    const groups=[
      [local("Identity and metadata","الهوية والبيانات الوصفية","Identidad y metadatos"),{id,score:ref.score,url:data.url,raw_url:data.raw_url,word_count:data.word_count,meta:data.meta}],
      [local("Content and excerpts","المحتوى والمقتطفات","Contenido y extractos"),{excerpt:data.excerpt,plain_excerpt:data.plain_excerpt,content:data.content,raw_content:data.raw_content}],
      [local("Filters and sections","عوامل التصفية والأقسام","Filtros y secciones"),{filters:data.filters,sub_results:data.sub_results,anchors:data.anchors}],
      [local("Technical result fields","حقول النتائج التقنية","Campos técnicos"),{words:ref.words,matchedMetaFields:ref.matchedMetaFields,locations:data.locations,weighted_locations:data.weighted_locations,params:ref.params,scores:ref.scores,verbose_meta_scores:ref.verbose_meta_scores}]
    ];
    for(const [name,values] of groups){const group=node("details","ns-accordion");group.append(node("summary","",name));group.append(node("pre","ns-code",JSON.stringify(values,null,2)));fields.append(group);}fields.firstElementChild.open=true;
    showPanel("details",b);
  }
  function clearResults(){rendered=0;resultRecords.clear();q("[data-ns-results]").replaceChildren();q("#ns-compact-list").replaceChildren();}
  function updateState(){
    const state=liveState,layout=q("[data-ns-results]").dataset.layout;
    const has=!!response&&["one","many","faceted","complete","result-loading","detail-error"].includes(state);
    q("[data-ns-state]").value=state;
    for(const el of qa("[data-ns-status]"))el.hidden=el.dataset.nsStatus!==state||["one","many","faceted","complete"].includes(state);
    q("[data-ns-results]").hidden=!has||layout==="compact";q("[data-ns-compact]").hidden=!has||layout!=="compact";
    const cap=response?Math.min(response.results.length,integer("maxResults",0)||Infinity):0;
    q(".ns-pagination").hidden=!has||rendered>=cap;
    q("[data-ns-load-more]").disabled=loadingBatch;
    const summary=q("[data-ns-summary]");
    summary.textContent=has?local(fmt(response.results.length)+" results · "+fmt(rendered)+" shown",fmt(response.results.length)+" نتيجة · "+fmt(rendered)+" معروضة",fmt(response.results.length)+" resultados · "+fmt(rendered)+" mostrados")+(response.unfilteredResultCount!==response.results.length?" / "+fmt(response.unfilteredResultCount):""):"";
    if(state==="no-results")summary.textContent=local("0 results","0 نتائج","0 resultados");
    q(".ns-results-area").setAttribute("aria-busy",String(["searching","initial-loading","result-loading"].includes(state)));
  }
  function state(value){liveState=value;updateState();}
  function updateDiagnostics(r){
    const panel=q('[data-ns-panel="diagnostics"]'),timings=Array.isArray(r.timings)?r.timings[0]:r.timings;
    for(const key of ["preload","search","total"]){const el=panel.querySelector('[data-native="timings.'+key+'"] strong');if(el)el.textContent=Number.isFinite(timings?.[key])?timings[key].toFixed(1)+" ms":"—";}
    const env=panel.querySelector('[data-native="search_environment"]');if(env)env.textContent=r.search_environment||"—";
    let pre=panel.querySelector("[data-ns-native-response]");if(!pre){pre=node("pre","ns-code");pre.dataset.nsNativeResponse="";panel.append(pre);}
    pre.textContent=JSON.stringify({filters:r.filters,totalFilters:r.totalFilters,unfilteredResultCount:r.unfilteredResultCount,timings:r.timings,search_keywords:r.search_keywords,query_term_idfs:r.query_term_idfs,search_environment:r.search_environment},null,2);
  }
  async function ensureIndex(){
    if(!initialized){
      state("initial-loading");
      initialized=Promise.all([pagefind.filters(),pagefind.manifest()]).then(([values,manifest])=>{
        catalog=values||{};indexManifest=manifest;
        fillOptions(q("[data-ns-sort]"),[["",local("Relevance","الصلة","Relevancia")],...manifest.sortFields.map(k=>[k,sortLabel(k)])]);
        populateAdvancedFields();drawFilters();syncPresentation();
        const notice=q(".ns-preview > span");notice.textContent="Pagefind "+manifest.version+" · "+fmt(manifest.pages)+" "+local("indexed pages","صفحات مفهرسة","páginas indexadas");notice.dataset.nsDeveloperLabel=notice.textContent;notice.dataset.nsUserLabel=notice.textContent;
        const index=q('[data-ns-panel="index"]');for(const row of index.querySelectorAll("tr")){const k=row.cells[0]?.textContent;const v={"Indexed pages":manifest.pages,"Indexed languages":manifest.languages.join(", "),"Indexed sorts":manifest.sortFields.join(", ")}[k];if(v!==undefined&&row.cells[1])row.cells[1].textContent=String(v);}
        if(liveState==="initial-loading")state("idle");
      }).catch(error=>{initialized=null;lastError=error;state("bundle-error");throw error;});
    }
    return initialized;
  }
  function readConditionGroup(group){
    if(!group)return null;const operator=group.querySelector(':scope > label [data-native="filters.operator"]')?.value||"all",children=[];
    for(const el of group.querySelector(":scope > [data-ns-conditions]").children){
      if(el.matches("[data-ns-condition-group]")){const nested=readConditionGroup(el);if(nested)children.push(nested);continue;}
      const key=el.querySelector('[data-native="filters.field"]')?.value,val=el.querySelector('[data-native="filters.value"]')?.value,op=el.querySelector('[data-native="filters.operator"]')?.value||"all";
      if(key&&val&&Object.hasOwn(catalog,key))children.push({[key]:{[op]:[val]}});
    }
    return children.length?{[operator]:children}:null;
  }
  function requestOptions(){
    const terms=[...selectedMap()].map(([key,values])=>({[key]:{any:[...values]}}));
    if(advancedFilter)terms.push(advancedFilter);
    const opts={filters:terms.length?{all:terms}:{},verbose:developerMode()};
    const field=q("[data-ns-sort]").value,dir=native("sort","sort.direction")?.value;
    if(field&&indexManifest?.sortFields.includes(field))opts.sort={[field]:dir==="desc"?"desc":"asc"};
    return opts;
  }
  async function loadMore(token=requestId){
    if(!response||loadingBatch||token!==requestId)return;loadingBatch=true;state("result-loading");
    const current=response,limit=Math.min(current.results.length,integer("maxResults",0)||Infinity),end=Math.min(limit,rendered+integer("pageSize",10,1,100));
    try{
      const slice=current.results.slice(rendered,end);
      const loaded=await Promise.all(slice.map(async ref=>({ref,data:await pagefind.data(ref)})));
      if(token!==requestId)return;
      for(const {ref,data} of loaded){const {card,compact}=resultCard(ref,data);resultRecords.set(ref.id,{ref,data});q("[data-ns-results]").append(card);q("#ns-compact-list").append(compact);}
      rendered=end;state(current.results.length===1?"one":rendered>=limit?"complete":lastTerm===null?"faceted":"many");displaySettings();
    }catch(error){if(token===requestId){lastError=error;state("detail-error");}}
    finally{if(token===requestId){loadingBatch=false;updateState();}}
  }
  async function runSearch({debounce=false,forceBrowse=false}={}){
    const token=++requestId;loadingBatch=false;
    const query=q("#ns-query").value.trim();
    browse=forceBrowse||browse;
    const hasFilters=selected().length>0||!!advancedFilter;
    let term=queryMode==="faceted"||(!query&&(hasFilters||browse))?null:query;
    if(queryMode==="phrase"&&term&&!/^".*"$/.test(term))term='"'+term+'"';
    if(term===""&&!hasFilters&&!browse){response=null;clearResults();state("idle");try{await ensureIndex();if(token===requestId)drawFilters();}catch{}return;}
    lastTerm=term;response=null;clearResults();state("searching");
    try{
      await ensureIndex();if(token!==requestId)return;
      const opts=requestOptions();
      const advanced=native("advanced","exactDiacritics");
      const excerptLength=integer("excerptLength",30,1,1000);
      const engineOptions={excerptLength,excerptEllipsis:setting("excerptEllipsis")?.value||"…",exactDiacritics:!!advanced?.checked};
      if(Object.keys(rankingOptions).length)engineOptions.ranking=rankingOptions;
      await pagefind.options(engineOptions);if(token!==requestId)return;
      const result=debounce?await pagefind.debouncedSearch(term,opts,integer("debounceTimeoutMs",300,0,3000)):await pagefind.search(term,opts);
      if(token!==requestId||result===null)return;
      response=result;drawFilters(result.filters,result.totalFilters);updateDiagnostics(result);
      if(!result.results.length){state("no-results");return;}
      await loadMore(token);
    }catch(error){if(token===requestId){lastError=error;state("search-error");}}
  }
  function applyRanking(){
    const panel=q('[data-ns-panel="diagnostics"]');rankingOptions={};
    for(const el of panel.querySelectorAll("[data-ns-range]"))rankingOptions[el.dataset.native.split(".")[1]]=Number(el.value);
    const weights={};for(const el of panel.querySelectorAll('[data-native="ranking.metaWeights.key"]')){const value=el.closest(".ns-field-grid")?.querySelector('[data-native="ranking.metaWeights.value"]');if(el.value&&value&&Number.isFinite(Number(value.value)))Object.defineProperty(weights,el.value,{value:Number(value.value),enumerable:true});}
    if(Object.keys(weights).length)rankingOptions.metaWeights=weights;
    runSearch({forceBrowse:!!response&&!lastTerm});
  }
  async function engineAction(action){
    if(!developerMode())return;
    try{
      if(action==="destroy"||action==="reinit"){requestId++;response=null;loadingBatch=false;initialized=null;catalog={};clearResults();await pagefind.destroy();drawFilters();state("idle");if(action==="destroy")return;}
      if(action==="init"||action==="reinit"||action==="filters"){await ensureIndex();if(action==="filters"){catalog=await pagefind.filters();drawFilters();populateAdvancedFields();syncPresentation();}return;}
      if(action==="preload"){await ensureIndex();await pagefind.preload(q("#ns-query").value||null,requestOptions());return;}
      if(action==="apply"){const opts={excerptLength:Math.max(1,Math.min(1000,Number(native("engine","excerptLength").value)||30)),excerptEllipsis:native("engine","excerptEllipsis").value,exactDiacritics:native("engine","exactDiacritics").checked};
        const tag=native("engine","metaCacheTag").value;if(tag)opts.metaCacheTag=tag;
        setting("excerptLength").value=opts.excerptLength;setting("excerptEllipsis").value=opts.excerptEllipsis;native("advanced","exactDiacritics").checked=opts.exactDiacritics;
        await pagefind.options(opts);await runSearch({forceBrowse:browse});
      }
    }catch(error){lastError=error;state("search-error");showPanel("results");}
  }
  function prepareLive(){
    requestId++;response=null;loadingBatch=false;advancedFilter=null;queryMode="standard";browse=false;clearResults();
    // Remove all example details and counts, even in developer mode.
    for(const el of qa('[data-ns-panel="details"] .ns-accordion'))el.hidden=true;
    q("[data-ns-detail-label]").textContent="";
    for(const el of qa('[data-ns-panel="diagnostics"] tbody td'))el.textContent="—";
    q("[data-ns-state]").disabled=true;
    const preview=q(".ns-preview > span");preview.textContent="Pagefind";preview.dataset.nsDeveloperLabel="Pagefind";preview.dataset.nsUserLabel="Pagefind";
    const sortHelp=q('[data-ns-panel="sort"] .ns-section > p');if(sortHelp)sortHelp.textContent=local("Pages without the selected sort field are excluded.","تستبعد الصفحات دون حقل الترتيب المحدد.","Se excluyen páginas sin el campo elegido.");
    const advancedHelp=q('[data-ns-panel="advanced"] .ns-section > p');if(advancedHelp)advancedHelp.textContent=local("Pagefind processes the query and native filters.","يعالج Pagefind الاستعلام والتصفية.","Pagefind procesa la consulta y los filtros.");
    const statuses=qa("[data-ns-status]");for(const el of statuses){const p=el.querySelector(".ns-status-head p");if(p&&!p.textContent.trim())p.hidden=true;}
    fillOptions(q("[data-ns-sort]"),[["",local("Relevance","الصلة","Relevancia")],...(indexManifest?.sortFields||[]).map(k=>[k,sortLabel(k)])]);
    populateAdvancedFields();drawFilters();state("idle");
  }
  function startIfVisible(){if(dialog.open&&!view.hidden&&dialog.hasAttribute("data-normal-workspace"))ensureIndex().catch(()=>{});}
  const liveObserver=new MutationObserver(startIfVisible);
  liveObserver.observe(dialog,{attributes:true,attributeFilter:["open","data-normal-workspace"]});
  liveObserver.observe(view,{attributes:true,attributeFilter:["hidden"]});

  function displaySettings(){const map={images:".ns-thumb",highlight:null,sections:".ns-subresults",metadata:".ns-card-meta,.ns-card-tags,.ns-eyebrow",urls:".ns-url",scores:".ns-score"};for(const el of qa("[data-ns-display]")){const key=el.dataset.nsDisplay;if(key==="highlight"){q("[data-ns-workspace]").classList.toggle("ns-no-highlight",!el.checked);continue;}for(const target of qa(map[key]))target.hidden=!el.checked;}if(!q("[data-ns-display='metadata']").checked)qa(".ns-score").forEach(el=>el.hidden=true);}
  function resetPanel(panel){for(const el of panel.querySelectorAll("input,select,textarea")){if(el.type==="checkbox"||el.type==="radio")el.checked=el.defaultChecked;else if(el.tagName==="SELECT")el.selectedIndex=0;else el.value=el.defaultValue;if(el.matches("[data-ns-range]"))el.closest("label").querySelector("output").textContent=el.value;}if(panel.dataset.nsPanel==="advanced"){q("[data-ns-advanced-root]").replaceChildren(q("[data-ns-group-template]").content.cloneNode(true));}panel.querySelectorAll(".ns-extra-row").forEach(el=>el.remove());if(panel.dataset.nsPanel==="sort"){q("[data-ns-sort]").dispatchEvent(new Event("change",{bubbles:true}));}if(panel.dataset.nsPanel==="settings"){q("[data-ns-language]").value=language;displaySettings();setStyle("pane");setLayout("list");q("[data-ns-workspace]").dataset.theme="site";q("[data-ns-workspace]").dataset.density="comfortable";}}
  view.addEventListener("submit",ev=>{
    ev.preventDefault();
    if(ev.target.id!=="ns-query-form")return;
    if(activePanel!=="results")showPanel("results");
    adaptiveTopbar.collapseAfterSearch();
    runSearch({forceBrowse:true});
  });
  view.addEventListener("click",ev=>{
    const b=ev.target.closest("button");if(!b||!view.contains(b)||b.disabled||(!developerMode()&&b.closest("[data-ns-developer-only]")))return;
    const d=b.dataset;
    if("nsView" in d){if(d.nsView==="advanced"){native("advanced","term").value=q("#ns-query").value;populateAdvancedFields();}showPanel(d.nsView,b);return;}
    if("nsLiveDetails" in d){showDetails(d.nsLiveDetails,b);return;}
    if("nsLoadMore" in d){loadMore();return;}
    if("nsRetry" in d){if(liveState==="detail-error"&&response)loadMore();else runSearch({forceBrowse:browse});return;}
    if("nsApplyAdvanced" in d){const term=native("advanced","term");q("#ns-query").value=term.value;queryMode=native("advanced","term.mode").value;advancedFilter=readConditionGroup(q("[data-ns-advanced-root] > [data-ns-condition-group]"));browse=queryMode==="faceted";showPanel("results");adaptiveTopbar.collapseAfterSearch();runSearch({forceBrowse:browse});return;}
    if("nsApplySort" in d||"nsApplySettings" in d){showPanel("results");runSearch({forceBrowse:browse});return;}
    if("nsApplyRanking" in d){applyRanking();return;}
    if("nsEngineAction" in d){engineAction(d.nsEngineAction);return;}
    if("nsClearQuery" in d){q("#ns-query").value="";browse=false;queryMode="standard";q("#ns-query").focus();runSearch();}
    if("nsFilterToggle" in d){const fromPanel=activePanel!=="results";if(fromPanel)showPanel("results");const pane=q(".ns-filters");if(window.matchMedia("(min-width:1024px)").matches){if(fromPanel)pane.classList.remove("ns-filter-hidden");else pane.classList.toggle("ns-filter-hidden");}else{if(fromPanel)pane.classList.add("ns-filter-open");else pane.classList.toggle("ns-filter-open");}syncFilterVisibility();}
    if("nsFilterClose" in d){q(".ns-filters").classList.remove("ns-filter-open");syncFilterVisibility();q("[data-ns-filter-toggle]").focus();}
    if("nsResetFilters" in d){resetFilters();runSearch();}
    if("nsClearGroup" in d){resetFilters(b.closest("[data-ns-group]").dataset.nsGroup);runSearch();}
    if("nsClearKey" in d){resetFilters(d.nsClearKey);runSearch();}
    if("nsRemoveFilter" in d){setFilter(d.nsRemoveFilter,d.value,false);q("[data-ns-filter-toggle]").focus();runSearch();}
    if("nsPill" in d){setFilter(d.nsPill,d.value,b.getAttribute("aria-pressed")!=="true");runSearch();}
    if("nsPillAll" in d){resetFilters(d.nsPillAll);runSearch();}
    if("nsLayout" in d)setLayout(d.nsLayout);
    if("nsSortReset" in d){const select=q("[data-ns-sort]");select.selectedIndex=0;select.dispatchEvent(new Event("change",{bubbles:true}));}
    if("nsFormReset" in d){const p=b.closest("[data-ns-panel]");resetPanel(p);if(p.dataset.nsPanel==="advanced"){advancedFilter=null;queryMode="standard";browse=false;populateAdvancedFields();}if(p.dataset.nsPanel==="diagnostics"){rankingOptions={};pagefind.options({ranking:{}}).catch(()=>{});}syncPresentation();runSearch();}
    if("nsAddCondition" in d){b.closest("[data-ns-condition-group]").querySelector(":scope > [data-ns-conditions]").append(q("[data-ns-condition-template]").content.cloneNode(true));syncPresentation();}
    if("nsAddGroup" in d){b.closest("[data-ns-condition-group]").querySelector(":scope > [data-ns-conditions]").append(q("[data-ns-group-template]").content.cloneNode(true));syncPresentation();}
    if("nsRemove" in d)b.closest("[data-ns-condition],.ns-extra-row")?.remove();
    if("nsRemoveGroup" in d){const g=b.closest("[data-ns-condition-group]");if(g.parentElement.matches("[data-ns-advanced-root]"))g.querySelector(":scope > [data-ns-conditions]").replaceChildren();else g.remove();}
    if("nsAddRow" in d){const parent=b.closest(".ns-section");const template=qa("[data-ns-row-template]").find(x=>x.dataset.nsRowTemplate===d.nsAddRow);if(template)parent.querySelector("[data-ns-rows]").append(template.content.cloneNode(true));}
  });
  view.addEventListener("change",ev=>{
    const el=ev.target,d=el.dataset;
    if("nsFilter" in d){setFilter(d.nsFilter,el.value,el.checked);runSearch();}
    if("nsMirror" in d){setFilter(d.nsMirror,el.value,el.checked);runSearch();}
    if("nsSingle" in d){const value=el.value;resetFilters("category");if(value)setFilter("category",value,true);runSearch();}
    if("nsMultiple" in d&&developerMode()&&!el.checked){for(const g of qa("[data-ns-group]"))[...g.querySelectorAll("input:checked")].slice(1).forEach(x=>x.checked=false);syncFilters();runSearch();}
    if("nsShowZero" in d)updateZero();
    if("nsFilterStyle" in d||"nsStyleSetting" in d)setStyle(el.value);
    if(("nsOrder" in d||"nsOrderSetting" in d)&&el.value!=="custom"){q("[data-ns-order]").value=el.value;q("[data-ns-order-setting]").value=el.value;for(const g of qa("[data-ns-group] fieldset,[data-ns-dropdown] .ns-filter-body,.ns-pill-group .ns-actions")){const rows=[...g.children].filter(x=>x.matches(".ns-filter-option,[data-ns-pill]"));const caption=x=>x.dataset.nsCaption||x.querySelector("input")?.dataset.caption||x.textContent;const count=x=>Number(x.dataset.nsCount||x.querySelector(".ns-count")?.dataset.count||x.querySelector(".ns-count")?.textContent||0);if(el.value==="default")rows.sort((a,b)=>Number(a.dataset.originalIndex)-Number(b.dataset.originalIndex));else if(el.value==="alphabetical")rows.sort((a,b)=>caption(a).localeCompare(caption(b),language));else rows.sort((a,b)=>(count(a)-count(b))*(el.value==="count-desc"?-1:1));const after=[...g.children].find(x=>x.matches("[data-ns-clear-key]"));for(const row of rows)g.insertBefore(row,after||null);}}
    if("nsState" in d&&developerMode())updateState();
    if("nsLayoutSelect" in d)setLayout(el.value);
    if("nsDisplay" in d)displaySettings();
    if("nsSort" in d||el===native("sort","sort.direction")){updateSortCaption();if(response)runSearch({forceBrowse:browse});}
    if("nsDensity" in d)q("[data-ns-workspace]").dataset.density=el.value;
    if("nsTheme" in d&&developerMode())q("[data-ns-workspace]").dataset.theme=el.value;
    if("nsLanguage" in d&&developerMode()&&supported.includes(el.value)){const term=q("#ns-query").value;language=el.value;mount();adaptiveTopbar.bind();prepare();q("#ns-query").value=term;activePanel="results";showPanel("settings");if(term)runSearch();}
  });
  view.addEventListener("input",ev=>{
    if(ev.target.matches("[data-ns-range]"))ev.target.closest("label").querySelector("output").textContent=ev.target.value;
    if(ev.isComposing)return;
    if(ev.target===q("#ns-query")||ev.target.matches("[data-ns-compact] input")){
      if(ev.target!==q("#ns-query"))q("#ns-query").value=ev.target.value;
      browse=false;queryMode="standard";
      if(setting("live")?.checked)runSearch({debounce:true});
    }
  });
  view.addEventListener("compositionend",ev=>{if(ev.target===q("#ns-query")&&setting("live")?.checked)runSearch({debounce:true});});
  view.addEventListener("keydown",ev=>{
    if(ev.isComposing||ev.keyCode===229)return;
    if(ev.key==="Escape"&&activePanel!=="results"){ev.preventDefault();ev.stopPropagation();showPanel("results");return;}
    if(activePanel!=="results")return;
    const editing=ev.target.matches("input,textarea,select,[contenteditable]");
    if(ev.key==="/"&&!editing){ev.preventDefault();adaptiveTopbar.reveal();q("#ns-query").focus();return;}
    if(["ArrowDown","ArrowUp"].includes(ev.key)&&(ev.target===q("#ns-query")||ev.target.matches(".ns-result-link"))){
      const root=q("[data-ns-results]").dataset.layout==="compact"?q("#ns-compact-list"):q("[data-ns-results]");
      const links=[...root.querySelectorAll(".ns-result-link[href]")];
      if(!links.length)return;ev.preventDefault();
      const i=links.indexOf(ev.target)+(ev.key==="ArrowDown"?1:-1);
      if(i<0){adaptiveTopbar.reveal();q("#ns-query").focus();}else links[Math.min(i,links.length-1)].focus();
    }
  });
  function prepare(){prepareLive();syncFilterVisibility();syncPresentation();startIfVisible();}
  prepare();
}
