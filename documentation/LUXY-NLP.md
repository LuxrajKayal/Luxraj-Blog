# Luxy NLP.js Phase 4.2

The site build trains one NLP.js model each for English, Arabic and Spanish. Luxy loads the active model when a visitor submits a message. The browser interprets the message locally and hands a structured result to the NLP-to-RiveScript adapter. Phase 4.3 supplies the receiver that will respond, query Pagefind or call registered website controls.

## Build and maintain

Run these commands from the repository root with Node.js and Chrome installed. Set CHROME_BIN to the Chrome executable if Playwright cannot find it.

```sh
npm ci --prefix search-dependencies/nlp --ignore-scripts --no-fund --no-audit
node scripts/build-site.mjs
node scripts/nlp/verify-upstream.mjs
node scripts/build-nlp.mjs
node scripts/test-nlp.mjs
```

- The Pages workflow runs the same NLP steps after site assembly alongside the existing Pagefind build and test. It publishes the browser distribution, license and three models from _site/assets/js/search-dependencies/nlp/ with the assembled website.
- For a new intent, add varied examples to each language corpus under scripts/nlp/corpora/ and add distinct examples to scripts/nlp/evaluation/. The intent keys are shared across languages. Placeholders such as @query, @category and @expression describe reusable patterns. Put localized entity synonyms and argument grammar in entities.mjs.
- For article or navigation updates, edit the site as usual. The collector reads titles, bounded headings and tags, category paths and labels, author metadata and existing author/tag associations for current article routes. It also reads explicit data-article-capability labels when present. It collects terms from incomplete pages in the same way as other pages and reads no article paragraph text into the model. It recreates the inputs for every build. An article-derived value disappears once it is no longer present in any contributing source.
- The build deduplicates known phrases and uses up to 80 distinct article-title examples per language for supplementary classification training. All discovered articles can contribute entity phrases. A repeat build reuses a validated local model when the effective inputs match. A fresh runner trains all three in under one second on the reference machine. The public exports contain trained parameters, the native stem lexicon and entity rules. Corpora, archived npm distributions, tests and build caches live outside the public tree.
- For a dependency update, pin the new versions, refresh the lockfile and replace the corresponding npm pack archives under search-dependencies/nlp/upstream/. Run node scripts/nlp/verify-upstream.mjs --write-license to refresh the browser notices and node scripts/nlp/bundle.mjs to regenerate the distribution. CI verifies the archived tarballs against the lockfile and rebuilds the browser bundle for comparison. [NLP.js browser distribution guide](https://github.com/axa-group/nlp.js/blob/master/docs/v4/webandreact.md) and [native language support](https://github.com/axa-group/nlp.js/blob/master/docs/v4/language-support.md).

## Adapter contract

The existing composer uses createNlpConversation({ locale, page }) from ui-nlp.js and calls submit(message). The locale comes from the page's HTML language. A caller that omits it can use NLP.js language detection on the first turn. Further turns use the selected model until the caller starts a new conversation. This has no effect on site language navigation.

The future receiver registers with connectNlpReceiver(handler) from nlp-rivescript.js. The function returns a disconnect callback. The receiver gets a copy of the packet and submit resolves to it after delivery. A failed model request can be retried. The browser test supplies the isolated receiver.

| Field | Meaning |
|---|---|
| schemaVersion | Contract version, currently 1 |
| message | Original message, including punctuation and whitespace |
| locale, language | Selected model locale and NLP.js language name |
| conversation | In-memory conversation ID and one-based turn number |
| page | Optional page path and page type supplied by the UI |
| intent, status | Accepted intent or None. Status is recognized, unknown or ambiguous |
| classification | NLP.js intent, score and ranked alternatives from the selected text representation. submit(message, { diagnostics: true }) adds the classifier input and native explanation where available |
| entities | Native enum and regex spans, plus contextual entities when a parameter is inherited or supplied in a follow-up. Current-turn spans are inclusive UTF-16 offsets. Enum option is the canonical value and utteranceText is the text matched in the message |
| subject, search | Extracted topic and optional search request. The request includes a query, categories, authors, date phrases, and follow-up and browse flags for the receiver |
| parameters | Required and missing slot names from the NLP.js slot configuration |
| context | Conversation locale, last recognized intent, search context and any pending slot |

Classification scores are relative model signals. Arbitration uses native stem matches, learned feature contributions, a minimum score and the gap between leading intents. Opt-in spelling support is available through submit(message, { spellCheck: true }). Query and date text are inputs to future rules, including any date-range interpretation or mapping to Pagefind filters. Article calculation requests can supply an expression to the receiver. Calculating an answer and determining whether a site function is available are Phase 4.3 responsibilities.

## Verification on 27 November 2026

The benchmark used 162 labelled requests absent from the training corpora. It includes 114 calibration cases and 48 additional cases. The feature-evidence gate was refined after reviewing Arabic unknown-request errors in the additional cases, so the combined results are regression measurements.

| Model | Intents correct | Unknown requests withheld | Expected entities found | JSON size | Gzip size |
|---|---:|---:|---:|---:|---:|
| English | 53/54 | 11/11 | 20/20 | 188,961 B | 60,131 B |
| Arabic | 54/54 | 11/11 | 18/18 | 191,808 B | 61,622 B |
| Spanish | 52/54 | 11/11 | 18/18 | 164,609 B | 55,438 B |

The remaining confusion was one English site-purpose question interpreted as a topic explanation and two Spanish questions, about site purpose and similar articles, withheld as uncertain. The automated gates require 85% intent accuracy, 85% unknown handling and 90% entity recall per language. The tests also check a size budget that scales with extracted entity data and a 300 ms diagnostic inference p95 ceiling.

The assembled site provided 60 English articles and no Arabic or Spanish articles. Isolated fixtures populated placeholder metadata, added and removed articles, renamed and moved an article, and added Arabic and Spanish subjects. Tests verified removal of stale terms, byte-identical results after rebuilding, model restoration and byte-identical article HTML. Chrome exercised the real composer, both adapters, language recognition, follow-up context, new-chat isolation, network retry and existing Tag Search. The existing native Pagefind regression suite passed using the official Pagefind 1.6.0 Windows release for the local run.

In the Node 26.13.1 and Chrome 158 run, each model restored in 7–20 ms. Native diagnostic inference p95 was below 5 ms for each language. Warm browser inference p95 was 1 ms. The first English composer submission took 1.54 s including browser interaction, the initial local asset downloads and test polling. Cold Arabic and Spanish submissions with the shared bundle loaded took 35 ms and 26 ms respectively. The uncompressed shared browser bundle is 384,571 bytes.

## File inventory

| Area | Added or changed |
|---|---|
| Planning and build | SEARCH-ENGINE-PLANNING.md, .github/workflows/pages.yml, .gitignore, this document |
| NLP build | scripts/build-nlp.mjs and scripts/nlp/{article-knowledge,browser-entry,bundle,dependencies,train,verify-upstream}.mjs |
| Training data | scripts/nlp/corpora/{en,ar,es}.json and scripts/nlp/corpora/entities.mjs |
| Evaluation and test suite | scripts/test-nlp.mjs, scripts/nlp/{evaluate,test-models,test-browser}.mjs and scripts/nlp/evaluation/{en,ar,es,holdout}.json |
| Composer and adapters | site/assets/js/search.js, site/assets/js/luxy-nlp-ui.js, site/assets/js/adapter/search-adapters/{ui-nlp,nlp-rivescript}.js |
| Runtime interpretation | site/assets/js/nlp/{entity-text,interpret}.js |
| Browser library | site/assets/js/search-dependencies/nlp/{nlpjs.js,THIRD-PARTY-LICENSES.txt} |
| Pinned upstream library | search-dependencies/nlp/{.gitignore,LICENSE,package.json,package-lock.json} and 13 upstream npm archives for core, lang-ar, lang-en-min, lang-es, language-min, ner, neural, nlg, nlp, nlu, sentiment, similarity and slot |
| Generated build output | _site/assets/js/search-dependencies/nlp/models/{en,ar,es}.json |
