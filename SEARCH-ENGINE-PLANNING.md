# Luxraj Search Engine — Planning Decisions

Language architecture — Three independent website versions: blog.luxraj.com/ (English, default), blog.luxraj.com/ar/ (Arabic), and blog.luxraj.com/es/ (Spanish). Manual language switching through the topbar only; no automatic detection, recommendation, redirection or preference restoration.

Phase 1 — Use three external libraries: Pagefind, RiveScript.js and NLP.js.

Phase 2 — Retain the existing search UI and styling; retire search.js, article-index.js and the empty pages/search.html, replacing the old search logic with the new engine.

Keep the existing tag system and its association files unchanged; review them separately later.

Phase 3 — Store the pinned, self-hosted browser dependencies and their licenses in site/assets/js/search-dependencies/ (pagefind/, rivescript/, nlp/); keep custom engine logic and build tools separate, with Pagefind indexes generated during the site build.

Phase 4.1 — Use Pagefind's native indexing and search features for all HTML pages, excluding its built-in UI. Maintain three independent language websites with one universal engine, shared libraries and separate language indexes. GitHub remains the working platform; each once-daily Cloudflare production deployment automatically builds all three versions and regenerates their indexes in a single Pagefind run, with no manual index maintenance.

Phase 4.2.1 — RiveScript execution and communication: Retain the original interpreter and connect it to Pagefind and authorized website controls through explicitly registered custom JavaScript functions; prevent arbitrary JavaScript execution from user input.

Phase 4.2.2 — RiveScript rule setting: Develop our own language-specific conversation rules for English, Arabic and Spanish, gradually utilizing all native RiveScript features in a controlled manner.

Phase 4.3.1 — NLP.js infrastructure: Set up training, model loading, execution and communication, using minimal sample data to verify functionality.

Phase 4.3.2 — NLP.js training: Prepare English, Arabic and Spanish training data, train and save the models, and test intent recognition.
