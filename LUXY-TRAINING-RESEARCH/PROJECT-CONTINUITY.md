# Project continuity — start here
Updated 2026-11-27. Repository: LuxrajKayal/Luxraj-Blog, main. Live test site: https://luxrajkayal.github.io/Luxraj-Blog/.

## Current position
The original Codex integration is deployed. Our first personality refinement was rejected by the owner after the 335-message browser test and reverted. Stable reference 7630b4311d317edc37415cb9cdad80442ed224f5; restoration commit d230c9fc6864f6c2e35678a13b96429918851eec. Subsequent documentation-only commits do not alter the runtime baseline.

We are in T02: collecting AI-generated research and labeled examples. Do not train, modify logic, deploy, or restart completed research. User wants to personally guide intelligence and personality refinement with ChatGPT. GREEN authorizes only the explicitly scoped action, not general future writes.

## Received / pending
- Gemini Group 04, English, batch 001: 120 records, original saved under datasets/gemini/.
- ChatGPT Group 04, English, batch 001: 120 records, original saved under datasets/chatgpt/. Raw provider field is LUXY; provenance is user-reported ChatGPT. Do not silently alter it.
- Gemini advanced follow-up prompt requested corrected 120 + 600 supplemental records, research report, correction log, quality report. Not yet received.
- Claude: user reported usage limit and expected resumption in about three hours; user said Claude researched more. No Claude files received. Do not invent results or assume an exact reset time.
- Original browser report Luxy-Conversation-Test-Report.json (335 turns) was uploaded in prior chat; findings recorded in PREVIOUS-FAILURES.md. Raw report is not stored in this folder; request it if detailed regrading is needed.
- Original console test was English and run from Reviews category page; not an independent multilingual or article-page test.

## Next action
Review forthcoming Gemini and Claude files as received; compare research sources and annotations; preserve originals; identify gaps and contradictory labels. Agree a labeling policy, deduplicate across providers and create a reviewed master dataset only after approval. Keep a separate unseen evaluation set. The next model training experiment is not approved yet. Revisit the proposed design with the owner before changing the stable model.

## Paste into a new chat
Continue Luxy model-training research in LuxrajKayal/Luxraj-Blog. Read LUXY-TRAINING-RESEARCH/README.md and PROJECT-CONTINUITY.md first, followed by the linked documents. Continue from the recorded stage, preserve approved decisions, distinguish proposals from decisions, and do not restart completed research. Strictly read-only unless I provide the exact uppercase word GREEN for the specific action.
