# Training roadmap — proposed, not implementation authorization
Goal: correct understanding and judgment first, then personality, then retrieval integration. Data-first; do not patch one failure at a time without measuring generalization. External AI systems generate research material offline; runtime stays native and lightweight.

| Stage | Work | Status |
|---|---|---|
| T01 | Personality constitution and labeling policy | Owner's core principle established; detailed labels proposed |
| T02 | Collect datasets and research from Gemini, ChatGPT, Claude | CURRENT |
| T03 | Review, normalize, deduplicate, resolve conflicts and curate | Pending |
| T04 | Train experimental English NLP.js models | Pending GREEN |
| T05 | Independent understanding diagnostics before RiveScript | Pending |
| T06 | Native RiveScript decision and personality design | Pending |
| T07 | Verify retrieval relevance and context | Pending |
| T08 | Extend validated behavior to Arabic and Spanish | Pending |
| T09 | Full regression, performance, security and independent evaluation | Pending |
| T10 | Explicit release approval and deployment | Pending |

## Training coverage groups
01 social; 02 identity/personality; 03 emotional expressions; 04 judgment/insults/criticism; 05 political/religious/cultural neutrality; 06 website knowledge; 07 standalone technical subjects; 08 retrieval/filtering; 09 conversation context; 10 site controls; 11 safety/negation/quotation; 12 capability boundaries/ambiguity.

## Proposed experiment
Compare original native model with approved expanded corpus, one variable at a time. Measure precision/recall by intent, confusion matrix, entity extraction accuracy, out-of-scope false acceptance, context fidelity, action authorization, retrieval relevance, response quality, bundle/model raw+gzip size, browser memory, cold/warm latency and build duration. Initial proposed corpus totals across languages: 1500, 3000, 6000, not mandatory quotas. Keep native libraries, no unnecessary fourth model. Browser explanatory model was a tentative later idea, outside current scope.

Independent acceptance proposal: 1000 representative unseen messages per locale; >=800 positive, <=200 safe uncertainty, 0 observed wrong; zero unauthorized actions/runtime errors in tests. Never promise zero future errors; 0/1000 implies only an approximate upper 95% error bound of 0.3% under independent representative sampling. Treat repeated contrast families as correlated; use grouped splits. Report uncertainty by category and locale. Existing 335-turn report is regression material, not a final blind test. Maintain exact rollback and separate explicit approval before publishing changes.
