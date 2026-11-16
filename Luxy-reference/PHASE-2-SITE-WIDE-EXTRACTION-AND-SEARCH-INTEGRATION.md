# Luxy — Phase 2: Site-wide Extraction and Search Integration

**Project:** Luxy v3.6 — Luxraj Blog Integration  
**Phase:** 2 — Site-wide Content Extraction and Search Integration  
**Branch baseline:** feature/luxy-integration  
**Audited commit:** b715caee4cd6e687fb41b4cae8c750a6a23f43b6  
**Status:** Phase 2 planning and acceptance record; implementation has not been performed by this document.

> **Phase isolation:** This document is valid only for Phase 2. Its decisions do not affect or constrain any other phase.

> **Overarching project direction:** The owner’s explicit product principles remain relevant across the project: the breadcrumb presence/population check is an intentional gate and must be preserved; after a page passes that gate, unfinished or placeholder-filled body content must not create additional arbitrary barriers; future publications must be able to enter the same pipeline without manual article registration; no temporary “demo” or “test work” wording is to be added to Luxy’s user-facing experience; other website search engines remain independently identified add-ons or modes; and page categories receive consistent treatment. These are project-owner directions, not Phase 2 technical decisions.

## 1. Purpose

Phase 2 takes the standalone V3.6 raw implementation and connects the website content that it can fetch to the existing Luxy retrieval and response pipeline.

The Phase 2 objective is to make the crawler extract useful content from the full HTML document, register that content as compatible chunks, and make the existing search and response features work against those chunks.

Phase 2 is not a redesign of the ranking algorithm. It is not the final search-quality phase, the cleanup phase, the modularization phase, or the website integration phase.

The target is a working Luxy implementation that can continue receiving new website content as Luxraj grows, rather than a temporary build that must be replaced later.

## 2. Phase sequence and boundaries

The project sequence currently directed by the owner is:

1. **Phase 1 — Initial crawling research/reference.** The existing Phase 1 document is retained as historical material only. Its old eligibility rules have been superseded and are not the authority for Phase 2.
2. **Phase 2 — Site-wide extraction and search integration.** Improve extraction coverage, preserve the V3.6 search contract, connect extracted chunks to the engine, and verify existing features.
3. **Phase 3 — Search-engine perfection.** Improve relevance, ranking, query handling, crawling/discovery behavior, and the quality of synthesized answers.
4. **Phase 4 — Cleanup.** Remove genuinely unnecessary implementation pieces while retaining useful features and capabilities.
5. **Phase 5 — Modularization.** Separate responsibilities into maintainable modules without silently changing behavior.
6. **Phase 6 — Website integration.** Make Luxy part of the actual Luxraj website.
7. **Phase 7 — Test-reference separation.** Remove remaining test/reference material from the main project and place the retained material in a separate repository.

The order above is the intended roadmap. Decisions recorded in this Phase 2 document do not pre-approve, prohibit, or dictate implementation choices in Phases 3–7. Those phases must be assessed independently when reached.

## 3. Phase 2 scope

### Included

- Whole-document HTML extraction rather than extraction limited to selected article wrappers.
- Extraction of page headings, paragraphs, lists, tables, code blocks, and hyperlinks.
- A page/fetch record for every URL supplied to the current crawl process, including its breadcrumb-gate result and fetch status. The record remains available even when the URL fails the gate or its content contains placeholders; content extraction/indexing follows the gate.
- A compatible chunk-registration path into Luxy’s existing index.
- Explicit capture of link information from all page regions, including navigation, breadcrumbs, cards, content, and footer.
- Protection against repeated shared-component text distorting the search corpus.
- A structure that can accept future page types and first-party content resources without a hardcoded list of article IDs.
- Connection of the current crawler to the existing search and response flow.
- Regression verification of existing V3.6 behavior.

### Not included

- Search-ranking optimization or a new relevance formula.
- A new tokenizer, stemming model, stop-word policy, synonym system, or query grammar.
- A redesign of the current UI, mascot artwork, content-tagging rules, or expression controller.
- Merging, copying, replacing, or absorbing the website’s existing search engine.
- Final cleanup, modularization, or integration into the live website.
- A final project-wide content-eligibility policy.

## 4. Read-only repository audit

### 4.1 Branch and raw V3.6 source

The audit was performed on feature/luxy-integration at commit b715caee4cd6e687fb41b4cae8c750a6a23f43b6. The repository default branch is main. No main-branch files or deployment settings were changed during this work.

The reference snapshot is Luxy-reference/Luxy-V3.6.html. The working standalone copy is site/features/luxy-V3.6-raw-test.html.

Both files contain 3,972 lines. The reference snapshot has 158,174 characters and the working copy has 158,147 characters. A line comparison found seven differing lines. Those differences are relative asset paths and the sitemap path/comment needed by the copy under site/features. The crawler, extraction, retrieval, tagging, and expression logic otherwise match line-for-line in the comparison.

The reference folder also contains V3.4 and V3.5 snapshots, the original inline V3.6 article material, and Luxy-Content-Tagging-and-Expression-Plan.txt. These are historical or design references; they must not silently override the Phase 2 decisions or the owner’s latest directions.

### 4.2 Current site inventory

At the audited commit, the active repository tree contains 681 entries in total, 251 active files outside Restore, and 207 files under site. The current HTML inventory contains 134 files:

| Site structure | Current count |
|---|---:|
| Article pages | 60 |
| Category and subcategory index pages | 51 |
| Informational pages under site/pages | 7 |
| Top-level pages: home, 404, newsletter thank-you, unsubscribe | 4 |
| Shared partials | 5 |
| Article fixtures under site/test-luxy-articles | 6 |
| Standalone Luxy feature page | 1 |
| **Total HTML files** | **134** |

The 51 category index pages cover the current top-level and nested category structure. They are not one special category: the same extraction model must work across all of them.

The seven informational pages include About, Advertising, Archive, Contact, Editorial, Privacy, and Search. They are listed here only to describe the site inventory. No named page receives special extraction priority merely because it was mentioned during planning.

### 4.3 Current sitemap coverage

The active site/sitemap.xml contains 114 URLs. At this commit, those URLs comprise the homepage, 51 category index pages, 60 article pages, Contact, and Editorial.

The sitemap is therefore a current discovery input, not a complete list of every HTML file in the repository. For example, several other informational pages and standalone/supporting resources are not currently in it.

Phase 2 must not convert this inventory difference into a permanent exclusion rule. The extractor must be page-type-neutral. Phase 2 keeps the current sitemap candidate source as the current crawl input; it does not settle the final discovery boundary. Every internal hyperlink is to be recorded so later crawling/discovery improvements have the information available.

A future publication whose URL is included in the sitemap must enter the same generic fetch-and-extract pipeline on the next crawl without a new article-specific code change or manual registration. Discovering pages that are neither in the sitemap nor reached by the current crawl process is a broader discovery question for Phase 3.

A previous local crawl report supplied during the project showed 114 candidates checked, 54 passed the breadcrumb checks, 60 were skipped because of unresolved breadcrumb/template content, and zero fetch failures. This is a diagnostic snapshot of the gate's effect. It does not authorize removing or weakening the breadcrumb gate.

### 4.4 Build and page structure

The site is assembled by scripts/build-site.mjs. It expands article layout slots and inserts shared topbar, main-header, and footer partials into the built pages. It also prepares the newsletter popup as a separate asset. The raw Luxy feature page is copied as a standalone page and bypasses the normal site shell.

This matters because extraction from a built page sees the assembled header and footer repeatedly, while extraction from source templates can see unresolved layout or metadata tokens. The crawler must operate on the intended fetched HTML representation and must not treat an unresolved token as proof that the entire page is unusable.

The current article layout has a main page shell, an article entry, article header content, and an article content column. Category pages use section headings, topic navigation, story cards, card headings, and summaries. Informational pages use different combinations of sections, articles, headings, paragraphs, lists, and links. The extractor must handle these structures generically rather than assuming one article template.

### 4.5 First-party content that is loaded dynamically

The audit found several examples where the initial HTML response is not the full visitor-facing content:

- The homepage hero showcase is populated by site/assets/js/hero-showcase.js, which fetches featured article pages and builds the showcase after initial page load.
- The Editorial page loads content from site/content/editorial-notes.md through site/assets/js/editorial.js.
- The newsletter popup is loaded on demand from the built assets/components/newsletter-popup.html resource by the newsletter lazy-loader.

A plain HTML fetch does not execute the page’s JavaScript, so content inserted after page load is not automatically present in the initial DOM response. Phase 2 must not hardwire its entire architecture to the initial document body. The content-ingestion design should be able to accept additional first-party HTML or Markdown payloads through source adapters, associate each payload with its originating page/resource, and avoid duplicate indexing when the same article is also available as a normal page.

These examples are representative technical findings, not a priority ranking of particular pages or resources.

## 5. Current raw crawler and extractor findings

### 5.1 The current fetch path does not yet populate the search index

The working raw file defines MultiPageSiteCrawler, extractChunksFromRoot(), registerChunk(), fetchAndParsePage(), and crawlEntireSite().

At the audited commit:

- extractChunksFromRoot() is defined around line 1772.
- registerChunk() is defined around line 1860.
- fetchAndParsePage() is defined around line 1893.
- crawlEntireSite() is defined around line 1949.
- The current fetchAndParsePage() records HTTP and breadcrumb status but does not call extractChunksFromRoot().
- The current crawlEntireSite() clears index, vocabulary, and global term frequencies before fetching sitemap candidates. Its worker calls fetchAndParsePage(), not the extractor.

Consequently, the existence of an extractor method does not yet form a connected end-to-end website indexing path. Connecting this path is a central Phase 2 task.

### 5.2 The current extraction boundary is too narrow

The existing extractor selects article and data-crawlable elements. It derives an article title from an H1 or .article-title, reads a .tag element, prefers .article-content, and creates section chunks from H2 and H3 headings.

This misses or mishandles important site structures:

- Homepage headings and paragraphs outside article wrappers.
- Page-level introductions on category and informational pages.
- Heading levels other than the currently selected H2/H3 section boundaries.
- Link information across the page.
- Content that is not wrapped in article or data-crawlable elements.
- Some card-level context where the page title and category context belong to the parent page rather than the individual card.

Category story cards can be seen as article elements, but the present fallback behavior can assign an artificial “Untitled Document” title and the default “Engineering” tag when the actual source does not provide those fields. Those defaults must not become invented searchable facts or misclassify non-engineering pages.

### 5.3 Existing chunk compatibility contract

The current search engine consumes chunk records with these established fields:

- id
- pageUrl
- articleId
- articleTitle
- heading
- tag
- text
- bulletPoints
- codeSnippets
- tableRows
- elementId
- tokens
- stemmedTokens
- termFreq
- stemFreq
- wordCount
- hasCode
- hasTable

Keep the names, meanings, and types of these fields compatible. In particular, codeSnippets and tableRows must remain arrays, and hasCode/hasTable must continue to represent the available structured code/table content.

Phase 2 may add metadata fields, but must not silently rename or remove fields that the existing engine, response formatter, autocomplete, or UI uses.

### 5.4 Current extraction and indexing risks

- Section extraction currently stops only at the next H2 or H3. Nested heading hierarchy and other standard heading levels are not represented consistently.
- The current parser adds synthetic IDs to headings that have no ID. Because this is a separately parsed fetched document, that generated ID may not exist on the actual website page. A synthetic chunk identifier must never be presented as a working source-navigation anchor.
- registerChunk() updates vocabulary and globalTermFreq before removing a previous chunk with the same ID. Re-registering a chunk can therefore inflate global counters. Rebuild or calculate index statistics from the final de-duplicated chunk set.
- A full-page extractor will encounter the shared header and footer on many pages. Indexing identical shared copy as fresh independent body text on every page would distort document-frequency statistics and produce repetitive results.
- All link records need to be retained, but repeated navigation links should not automatically become repeated full-text chunks.
- The breadcrumb presence/population check is an intentional gate and must be preserved. Missing or unresolved breadcrumbs remain reasons to skip content extraction/indexing. After a page passes that gate, unresolved placeholders elsewhere in the page, incomplete body content, or an empty content area must not create an additional skip rule.

## 6. Phase 2 extraction decisions

### 6.1 Page presence and content completeness are separate

A discovered URL, a successful HTTP fetch, the content extracted from it, and its ability to match a particular query are separate states.

Every URL supplied to the current Phase 2 crawl input must receive a page/fetch record after the fetch attempt, regardless of whether it passes the breadcrumb gate. The record must preserve the gate result, HTTP status, and any fetch/parsing error. A successfully fetched URL remains represented in the page registry even when its breadcrumb gate fails.

The existing breadcrumb gate is intentional and remains in force:

- A breadcrumb navigation element must be present (the current implementation recognizes a navigation element labelled `breadcrumb` or carrying the `.breadcrumbs` class).
- The breadcrumb must pass the existing population check: it must not contain unresolved template tokens; each breadcrumb link must have a usable `href` and non-empty visible label; and the breadcrumb must contain non-empty text.
- A page with no breadcrumb or a breadcrumb that fails this population check does not pass the gate. It remains recorded with its skip status, but its page content is not extracted into the searchable index in Phase 2.
- Phase 2 must preserve this gate; it must not silently remove, bypass, or weaken it.

The breadcrumb gate is the deliberate exception to the general placeholder rule. Once a page passes the breadcrumb gate, unresolved template placeholders in its title, metadata, body, or other non-breadcrumb content do not by themselves cause the page to be skipped. Short/incomplete body content, a loading message, a missing body heading, or a dynamic section that has not loaded must not create another exclusion gate.

When a page that passes the gate currently contains meaningful text, extract the available text. When it does not, preserve the page identity and whatever metadata/links are available; do not invent content to make the page appear complete. A later crawl should pick up newly published content automatically through the same pipeline.

Actual HTTP or parsing failures remain diagnosable fetch failures. They must not be conflated with a page that fetched successfully but failed the breadcrumb gate, or with a page that passed the gate but currently contains incomplete body content.

### 6.2 One generic extraction pipeline for all page types

The extractor must not depend on an allowlist of article IDs, page filenames, category names, or named examples.

Use page type and content-region information as descriptive metadata only. They may help organize chunks and source presentation, but must not become arbitrary eligibility gates. The owner-defined breadcrumb presence/population check remains the deliberate gate.

The same extraction foundation must work for:

- homepage and other top-level pages;
- top-level category pages;
- nested category and subcategory pages;
- article pages;
- informational and policy pages;
- archive and search pages;
- pages with cards, navigation, forms, or other structured content;
- pages with incomplete or future content;
- additional page types introduced after this audit.

The examples named during planning are not special targets. Validation must cover the full page taxonomy.

### 6.3 Whole-document content extraction

The Phase 2 extraction pass must inspect the complete fetched HTML document, not only article wrappers.

The extraction model must recognize:

- H1 through H6 headings, preserving heading level, order, and parent/section context;
- all paragraph elements throughout the page;
- unordered and ordered lists, with their list items and ordering;
- blockquotes, figures, captions, and other meaningful reader-facing text structures;
- tables, preserving headers and rows in structured form;
- preformatted and code-block content, preserving code separately from surrounding prose;
- images and meaningful alternative text where available;
- all hyperlinks throughout the HTML document.

Content should be grouped into useful, navigable chunks using heading hierarchy and document order. A paragraph should be assigned to its appropriate page/section context rather than being silently lost because it is outside a particular class name.

The extraction must not duplicate the same paragraph into multiple overlapping chunks merely because it is nested inside several wrappers. It should preserve the text in reading order and keep enough structure for later response synthesis.

Raw script/style content, implementation code, and markup syntax are not human-readable page prose. They may be recorded as technical resource references when needed, but must not be mixed into ordinary reader-facing text chunks.

### 6.4 Complete link capture

Capture every anchor link in the fetched HTML, not only links inside article content. This includes links in:

- topbar and primary navigation;
- dropdown navigation, including links whose menus are collapsed by default;
- breadcrumbs;
- category/topic chips;
- article/story cards;
- main content and inline links;
- buttons implemented as anchors;
- newsletter and other shared components;
- footer and quick links;
- fragment links and external links.

For each link, retain the source page, visible anchor text, original href, resolved destination, link kind (same-page fragment, same-origin route, or external), nearby heading/context, and source location when one exists. Preserve repeated occurrences and their region context even when destinations are deduplicated in a destination map.

The link inventory is distinct from the main BM25 chunk text. It must remain available for source navigation, page relationships, link discovery, and later search improvements without allowing repeated site navigation to dominate ordinary relevance ranking.

Do not discard a link merely because it is inside a collapsed dropdown or has a hidden-state attribute. Record its source state where useful; do not confuse initial visual state with absence from the website structure.

### 6.5 Page, chunk, link, and shared-component records

The implementation should keep distinct responsibilities for:

1. **Page registry:** one record per discovered/fetched URL, including URL, document title, available metadata, page-type description, breadcrumb when present, fetch status, content state, and last-fetch information.
2. **Search chunks:** the compatible records consumed by the current Luxy engine, with additive context such as heading level, section path, reading order, region, and source kind where useful.
3. **Link registry:** every extracted anchor and its source/destination context.
4. **Shared-component registry:** reusable site-wide content such as the shared header, topbar, footer, and lazy-loaded newsletter component, with references to the pages where each component occurs.
5. **First-party content sources:** additional HTML or Markdown payloads that provide visitor-facing content not present in the initial HTML response.

These are logical responsibilities, not a commitment to a final file layout. Final modularization belongs to Phase 5.

### 6.6 Shared components must remain accessible without being counted repeatedly

The shared header, topbar, and footer are assembled into many built pages. Their text and links must not disappear from Luxy’s collected site structure. At the same time, copying identical shared text into every page’s independent BM25 body chunks would over-weight it.

Record shared text and link destinations once as reusable component data, then retain the page/region occurrences that show where they appear. This preserves access to navigation and site-wide information without turning repeated chrome into the dominant search corpus.

The same principle applies to other repeated shared components. It is not a reason to ignore their links or information.

### 6.7 Real source anchors versus internal chunk identifiers

Use an actual element ID from the fetched source when one exists. Keep the internal chunk ID separate from a real DOM source anchor.

Do not insert a synthetic ID into a fetched DOM and then claim that the live page can navigate to it. If the source has no anchor, keep a page-level source URL and a stable internal chunk identity; indicate that a precise element anchor is unavailable.

### 6.8 Placeholder handling and metadata fallbacks

Unresolved template tokens outside the breadcrumb must not cause a page that has passed the breadcrumb gate to be skipped. Preserve the fact that those values remain unresolved as diagnostic metadata, but do not turn raw template syntax into fabricated article titles or useful prose. Unresolved tokens inside the breadcrumb still fail the intentional breadcrumb gate.

Use actual document metadata and page headings when available. If no source tag exists, keep the tag field compatible without assigning an unrelated default category. Avoid inserting artificial content such as “Untitled Document” or a default Engineering label into the searchable text.

No user-facing copy such as “This is a demo” or “test work” is to be introduced as a workaround for incomplete source content.

### 6.9 Future publication compatibility

No new article should require a special Luxy code edit, a hardcoded ID, or a per-article extractor rule.

A new page included in the current sitemap must be fetched and processed by the same generic pipeline on the next crawl. Its headings, paragraphs, lists, links, tables, and code structures must be extracted using the same rules as existing pages.

All links discovered in existing pages must be recorded, giving Phase 3 a reliable basis for deciding whether and how to expand discovery beyond the sitemap. Phase 2 does not freeze the final URL-discovery strategy or prevent a later expansion.

A page that is presently incomplete must be eligible to contribute more content after publication updates and a subsequent crawl. Luxy must not require manual changes merely because the content grew or the page changed from a placeholder state to a complete article.

## 7. Preserve the current Luxy engine contract during Phase 2

The current LuxyConversationalEngine is a V3.6 BM25+ retrieval engine with prefix expansion, substring matching, typo recovery, stemming, synonym expansion, query operators, conversation context, and structured response synthesis.

The Phase 2 work must connect content to this engine without tuning the engine itself. Preserve the current behavior and compatibility, including:

- k1 = 1.5 and b = 0.75;
- title, heading, and tag boosts;
- exact-phrase and adjacent-bigram boosts;
- synonym weighting and stem fallback;
- the current result threshold;
- exact-phrase, tag, page, has:code, has:table, and excluded-term operators;
- prefix, substring, and Levenshtein resolution order;
- query corrections and the current synonym graph;
- the existing conversation-memory behavior and limit;
- autocomplete behavior and its current vocabulary/heading suggestions;
- page-scope filtering and its UI dependency;
- success and fallback response fields, source references, structured code/table output, and follow-up behavior.

Known current scoring values are title +3.0, heading +2.5, tag +2.0, exact phrase +8.0, adjacent bigram +3.2, synonym weighting 0.55, and stem fallback 0.85. The current result threshold is greater than 0.35. These values are recorded as compatibility baselines, not recommendations for final relevance.

The goal in Phase 2 is to supply better-structured website data to the existing engine, not to hide extraction defects by changing scoring or tokenization. Ranking and relevance changes belong to Phase 3.

## 8. Keep the other systems independent

The website already has a separate article-library search implementation involving site/assets/js/search.js, article-index.js, tag-indexer.js, and tag-fetcher.js.

That search system is not Luxy’s replacement, not a source to copy into Luxy, and not an implementation to merge into Luxy’s core. Its identity and responsibilities remain separate. It may exist as an independently identified add-on or selectable mode alongside Luxy.

Luxy’s own content tagging and expression architecture is also separate from retrieval:

- Search retrieves relevant content.
- The content tagger examines the selected content’s author-facing prose.
- The expression controller resolves the tag combination into a mascot expression.
- The response-enrichment wrapper applies this independently and is failure-isolated.

The five content tags in the existing plan are CODE, EXPLANATION, DEMONSTRATION, SPEC, and INTERACTIVE. The query itself must not be converted directly into content tags. Phase 2 should preserve this separation and the existing mascot artwork/behavior.

## 9. Phase 2 implementation order

The following is the recommended sequence once Phase 2 implementation is separately authorized:

1. Capture a baseline of current raw-page behavior, search UI behavior, and the existing engine contract.
2. Introduce the generic page/document extraction pass and verify it against the complete page taxonomy.
3. Add structured heading, paragraph, list, table, code, image-alt, and hyperlink extraction.
4. Add page, chunk, link, shared-component, and first-party source records while preserving the existing chunk fields.
5. Connect successful page fetches that pass the breadcrumb gate to extraction and registration. Preserve the existing breadcrumb presence/population check and its skip statuses. Do not add further skip rules for body placeholders, incomplete text, or page type.
6. Make registration and global index statistics deterministic across a full rebuild and repeated registration.
7. Connect the populated index to the existing search, autocomplete, source, response, and enrichment paths.
8. Run the regression matrix below and compare output against the baseline.

This document records a plan. It does not itself implement any of these steps.

## 10. Verification matrix

Verification must cover the site as a whole, not just individually named examples.

| Area | Required verification |
|---|---|
| Homepage | Page identity, H1, paragraphs, static content, and dynamically populated sections are accounted for. |
| Category pages | All parent and nested category pages use the same extraction foundation. |
| Article pages | Title, headings, paragraphs, lists, code, tables, metadata, and source links are retained. |
| Informational pages | Their actual headings, paragraphs, cards, forms, and links are extracted without a page-specific allowlist. |
| Breadcrumbs | A missing breadcrumb or one that fails the existing population check fails the intentional gate; the fetched URL remains recorded but its content is not indexed. A valid breadcrumb allows extraction to proceed. |
| Placeholders | After the breadcrumb gate passes, unresolved tokens elsewhere in the page do not cause a skip; available content is extracted, while unresolved template strings are not presented as useful article text. |
| Headings | H1 through H6 are recognized with heading level and hierarchy preserved. |
| Paragraphs | Paragraphs outside article wrappers are not lost. |
| Links | Anchors in content, header, dropdowns, breadcrumbs, cards, and footer are recorded with their destinations and context. |
| Lists | Ordered/unordered list items remain associated with the correct section and retain order. |
| Tables and code | Structured rows/snippets are preserved and the existing has:table/has:code behavior continues to work. |
| Shared components | Repeated navigation/footer content remains accessible without being counted as repeated independent article content. |
| Dynamic sources | The ingestion design can accept the identified first-party Markdown/HTML resources without requiring the browser to execute remote page scripts. |
| Future publication | A new URL added to the current sitemap is processed through the same generic path without article-specific code. |
| Re-crawl | Rebuilding or re-registering the same page does not inflate vocabulary/global term statistics or create duplicate chunks. |
| Search compatibility | Existing query operators, ranking baseline, typo/prefix recovery, autocomplete, conversation context, response format, source links, and fallbacks continue to function. |
| Independent systems | The website’s existing search and tag system remains separate from Luxy. |
| User-facing copy | No new temporary “demo” or “test work” messaging is added to Luxy’s interface or responses. |

## 11. Phase 2 acceptance criteria

Phase 2 is complete only when:

1. The current fetch pipeline actually invokes the generic extractor and registers chunks in the index.
2. A fetched URL always receives a page/fetch record. Content extraction/indexing preserves the intentional breadcrumb gate: missing or unpopulated breadcrumbs fail it, while other placeholders, incomplete content, or page type do not create additional gates after it passes.
3. Whole-document extraction captures H1–H6, paragraphs, lists, tables, code, and all hyperlinks across the page.
4. The same extraction behavior works across all current site page categories and can accept future page types.
5. The existing chunk contract and V3.6 engine behavior remain compatible.
6. Shared components and links remain accessible without repeated boilerplate distorting ranking statistics.
7. Real source anchors are never confused with internal synthetic chunk identifiers.
8. A future sitemap publication can be ingested without manual per-article registration.
9. The existing independent site search, content tagging, mascot expression, and response-enrichment behaviors are not accidentally merged or broken.
10. No website integration, ranking redesign, cleanup, or modularization is performed as an unplanned side effect of Phase 2.

## 12. Deferred to later phases

- Final ranking and relevance tuning, tokenizer changes, new synonym coverage, and query understanding: Phase 3.
- Final crawl-discovery strategy beyond the present sitemap input, including how to follow discovered internal links: Phase 3.
- Any final decision about content ranking, filtering, and source-priority beyond the Phase 2 compatibility requirements: Phase 3.
- Removal of genuinely unnecessary implementation: Phase 4.
- Final module/file architecture: Phase 5.
- Integration into the actual website shell and production experience: Phase 6.
- Removal and relocation of remaining test/reference materials into a separate repository: Phase 7.

No Phase 2 technical decision should be treated as a permanent restriction on a later phase. Later phases may revise these technical choices after their own review, while continuing to respect the owner’s overarching product directions stated at the beginning of this document.
