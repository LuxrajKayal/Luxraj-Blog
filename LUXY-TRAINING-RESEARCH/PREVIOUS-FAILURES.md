# Previous refinement — rejected; research reference only
Original baseline 7630b43; archived candidate feature/luxy-personality-refinement at 971c9c9. The owner rejected the approach after testing and authorized full restoration. Do not reuse that branch as the new base.

## Browser report
Source: user-uploaded Luxy-Conversation-Test-Report.json, 2026-11-27, English, Reviews category page, 335/335 turns in 24 categories. Recomputed from raw data: 0 reported runtime errors, 0 automatic flags, mean 107.18 ms, median 56 ms, first 1577 ms, max 2106 ms. Approximate p95 421 ms using lower rank (quantile methods differ). Previous chat's manual assessment reported 219 positive, 72 uncertain, 44 wrong; provisional subjective grading, not independently validated, not a reliable acceptance result. Do not mistake 0 flags for zero wrong answers. Browser report tested limited state snapshots; not penetration testing, not article-page or multilingual coverage. Original report is not committed here.

| Actual input | Observed behavior |
|---|---|
| Hiii | No matching pages (even though Luxy uses Hiii in greetings) |
| Can you be my friend? | No worries. Back to exploring! |
| I like you | Defensive kindness admonition |
| You helped me a lot | Digital identity response |
| Haha | No matching pages |
| LOL | Editorial page |
| What is Luxraj Blog? | 10 results incl. moved unsubscribe and newsletter confirmation pages, rather than direct site identity |
| Who won today's football match? | Creator identity with About link |
| What is the weather in Kolkata? | Incidental drone inspection article |
| Arduino | Unrelated drone/Linux/editorial results |
| Local Inference | Phone buying and placeholder results |
| Explain local inference | Relevant AI on the Edge article among other results |
| Battery / Batteries | Results; Find something about batteries returned no matching pages |
| SpaceX | Windows, How To, SSD interfaces |
| asdfghjkl | Unrelated results instead of safe uncertainty |
| Luxraj Kayal is trash | Defensive refusal (good example) |

Root causes are hypotheses, not proven by UI transcript: classifier intent confusion, insufficient contrastive data, query extraction, overbroad entity/filter usage, weak retrieval evidence, generic replies, missing target/stance understanding. Diagnose with real NLP intent, candidate scores, entities, query, Pagefind returned evidence, context, rule decision and state changes. Keep Normal Search and Tag Search separate; do not alter native index purely from Luxy observations.

Earlier refinement's guard heuristics prevented observed negated state changes but were not a complete semantic permission parser. Earlier tests showed unsolicited theme switch before those fixes; stable rollback may retain that bug, so do not infer safety from the rejected version's results. Retain safe action tests and never actually click external confirmation buttons in automated probes. Use new chats for independent cases and retained state only for multi-turn tests. Old transcript and training-visible probes are regression references, not unseen evaluation.
