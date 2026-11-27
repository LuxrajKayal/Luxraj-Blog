# Luxy RiveScript Phase 4.3

Phases 4.3.1 and 4.3.2 connect the existing Luxy composer to native RiveScript conversation and execution rules. NLP.js interprets each turn, RiveScript selects and executes the rule, and Pagefind retrieves indexed information. The response adapter sends the assistant reply, links and action outcome directly to the composer.

## Release and browser distribution

RiveScript.js 2.2.1 is the pinned MIT-licensed release. The original npm archive contains the upstream source and both webpack distributions. Its SHA-512 matches the npm publication. The original license is included in the archive, in the root dependency folder and alongside the public asset. [Official v2.2.1 release](https://github.com/aichaos/rivescript-js/releases/tag/v2.2.1) · [Published npm package](https://www.npmjs.com/package/rivescript/v/2.2.1)

The upstream browser distributions use webpack's eval-based module loader. The public ES module is compiled from the verified package source with the project's pinned esbuild. It preserves the interpreter, parser, rule sorting and memory session manager, and substitutes the inline JavaScript object compiler and Node file loaders for the browser build. The build reproduces the checked-in public module and verifies its bytes. Luxy fetches the module, current locale's UTF-8 rules and website data on its first turn.

## Rules and native state

Each locale has one editable foundation under site/assets/js/luxy/rules/. Each handles all 28 foundational intents in the NLP corpora. The exact trigger is the intent name in lower case with dots changed to spaces, prefixed by intent. For example, article.copyLink maps to intent article copylink. Unknown and ambiguous packets use dedicated recovery triggers. A wildcard redirects unrecognized internal triggers to the same recovery path.

Native features include exact and wildcard matching, weighted and alternate replies, a bot name, session variables, conditions, redirects, a recovery topic, native rule parsing and sorting, and asynchronous registered subroutines. Session variables track greetings and carry the current turn's typed missing parameter. The recovery topic handles a subsequent request for help. Function calls return structured execution outcomes through a separate turn object. The rule engine turns each outcome into localized user text. Native interpreter diagnostics are available in build tests and remain outside the public conversation.

The English, Arabic and Spanish files organize rules in the same order. They contain greetings and small talk, assistant identity and guidance, factual site information, action rules, search and clarification outcomes, button and date labels, and recovery behavior. The translated responses are independently worded. Arabic assistant messages use right-to-left direction.

## Adapters and state

| Adapter | Contract |
|---|---|
| ui-pagefind.js | Shared native Pagefind initialization and API for Normal Search |
| ui-nlp.js | Submits the original message and page context, maintains NLP state, and accepts an optional cancellation signal |
| nlp-rivescript.js | Supplies the full versioned NLP packet to the receiver for its conversation ID. The existing unscoped receiver API is retained for integrations such as isolated NLP evaluation |
| rivescript-pagefind.js | Exposes the existing Pagefind instance's search, filter catalog, manifest and result handles |
| rivescript-ui.js | Delivers a response keyed by conversation ID and turn, with localized text, sources, outcome, and an optional trusted action callback |

NLP owns term and slot recognition. RiveScript holds one native session per open conversation. Retrieval holds only Pagefind result handles, the current position and URLs already shown for follow-up deduplication. The composer keeps transcript history while the page is open. Selecting or starting a new chat cancels the previous active turn before a deferred action can run. A failed load can be retried in place, including a failed rule fetch. A new chat starts with a fresh NLP and RiveScript session.

## Registered functions

| Subroutine | Behavior |
|---|---|
| about, contact, navigate, category, language, unsubscribe | Offer verified local destinations from the assembled site. Language links require an explicit request and a published locale homepage |
| theme | Activates the existing theme control and checks the resulting theme |
| search_interface | Opens the existing Normal Search or Tag Search interface, including the available public filters, sorting, advanced panel or settings |
| newsletter | Offers a button to open the existing Luxy's Cottage signup form through the site lazy loader. Subscription remains with the newsletter provider |
| author, article_dates | Reports an actual byline or publication and update dates from the current article. Shows an author profile link when the corresponding route exists |
| copy, share | Offer the existing article link or a trusted click that invokes the clipboard or device sharing control. Success text follows the browser operation |
| calculate | Checks for an explicitly registered calculator associated with the current article and validates its structured expression before execution. The current site has no connected calculator |
| retrieve | Requests the existing Pagefind engine and presents the next batch of sources. Explanation rules introduce source excerpts |

The registrar permits only the listed function references and accepts no arguments from rule text. Only allowlisted intent identifiers become input triggers. Original messages, parameters, article metadata and results stay separate from rule source. The composer uses text nodes for all displayed content and checks every link against the current site's origin and base path. Clipboard and newsletter operations are guarded before deferred activation. No form is submitted automatically.

## Dynamic knowledge and retrieval

Build scripts regenerate a JSON snapshot from assembled HTML. It records available page and locale roots, categories, article routes, public byline references, dates and author destinations. It reads current files, including article placeholders, and leaves the underlying HTML bytes intact. Conversation rules are independent of the number of articles. The author library supplies canonical bylines when the current article has an author ID.

Pagefind retains native ranking and selects its index from the website's page language. Luxy checks the deployed language manifest and filter catalog before applying native filters and sort. Results show native source URLs and excerpts in existing Normal Search-sized batches of ten, with further results available. For unsupported author or category filters Luxy can search the supplied term and explicitly disclose the missing filter. If a date-only request cannot be applied, Luxy reports the missing date capability. [Pagefind search API](https://pagefind.app/docs/api/)

## Build, validate and extend

Run the existing site, Pagefind and NLP build steps, then run node scripts/build-rivescript.mjs and node scripts/test-rivescript.mjs. The Pages workflow runs both after the existing tests. The build uses the same locked npm installation as NLP. To update the dependency, obtain the official npm archive, verify the pinned integrity and license, regenerate the browser asset with node scripts/bundle-rivescript.mjs and run the complete build. The public output includes the browser assets, rules, license and generated knowledge JSON. Archives and tests stay outside the public directory.

To add an intent, update the NLP corpora and add the same mapped trigger to all three rule files. To enable an article function, register a trusted function reference in site-actions.js with its validator and mark the associated article control with data-article-capability. Add the appropriate localized outcome and tests. Existing HTML, routes and library sources supply normal site updates automatically.

## Verification

The rule suite checks all 84 locale-intent combinations, native async callbacks, session isolation, response variants, clarification, safe input and links, filter selection, pagination and rebuild fixtures. The Chrome suite exercises native replies, Pagefind sources, execution, chat history, retry, cancelled turns, mobile RTL and hostile user and source text under a policy that blocks JavaScript eval. The existing Pagefind and NLP test suites act as independent regressions.

| Asset | Bytes |
|---|---:|
| RiveScript browser module | 41,927 |
| English rules | 6,304 |
| Arabic rules | 7,772 |
| Spanish rules | 6,560 |
| Generated site snapshot | 30,068 |

Each locale contains 72 triggers, including the 28 intent triggers. The deployed index currently contains English content and lacks category, author and date filter and sort metadata. The English index can return intentional placeholders and shared content in excerpts. Arabic and Spanish conversation rules are available, with retrieval and language navigation becoming available as their sites are published. The current author library has no published matching profile route. Explanations are source excerpts. Chat history stays within the current page.

The full local Node 26 and Chrome 158 run measured 2.38 s for the first composer reply, 319 ms for a warm conversation reply, and 1.39 s for the first Pagefind-backed turn. These timings include browser interaction and test polling. A warm native Pagefind query plus its first result took 20.5 ms. Verifying and rebuilding the browser dependency and generating the site snapshot took 902 ms, including 609 ms for the snapshot.

## File inventory

| Area | Added or updated |
|---|---|
| Planning and build | SEARCH-ENGINE-PLANNING.md, .github/workflows/pages.yml, .gitattributes, this document |
| Build and test scripts | scripts/build-rivescript.mjs, scripts/bundle-rivescript.mjs, scripts/test-rivescript.mjs, scripts/rivescript/test-rules.mjs, scripts/rivescript/test-browser.mjs |
| Upstream dependency | search-dependencies/rivescript/rivescript-2.2.1.tgz and LICENSE |
| Public dependency | site/assets/js/search-dependencies/rivescript/rivescript.js and LICENSE |
| Rules | site/assets/js/luxy/rules/en.rive, ar.rive and es.rive |
| RiveScript runtime | site/assets/js/luxy/library.js, rule-engine.js, runtime.js, retrieval.js, site-data.js and site-actions.js |
| Adapters | site/assets/js/adapter/search-adapters/ui-nlp.js, nlp-rivescript.js, rivescript-pagefind.js and rivescript-ui.js |
| Website integration | site/assets/js/luxy-nlp-ui.js, site/assets/js/article-share.js, site/assets/js/lazy-loader/core.js and site/assets/css/luxy-assistant.css |
| Generated output | _site/assets/js/luxy/knowledge.json |
