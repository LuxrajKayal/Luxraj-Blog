# Luxy refinement — development candidate

Baseline 7630b4311d317edc37415cb9cdad80442ed224f5. This is an isolated first implementation candidate, not a release or a claim of validated accuracy.

## Changes
- Expanded native locale corpora and RiveScript response rules for praise, teasing, criticism, insults, profanity, opinion, accusations, threats, apologies and disengagement. No new callable functions.
- Conservative control authorization at the registered action boundary and explicit prohibited-action handling. Valid requests not covered by the current grammar safely abstain; expand using independent multilingual tests. The check is not a complete natural-language permission parser.
- Standalone single-token read-only lookup fallback; exact negative classifications and markup remain rejected. Preserve automatic article metadata training and the 80 supplemental title example cap.
- Non-article-only explanation results are labeled as mentions rather than direct explanations. This is a limited route heuristic, not semantic relevance validation. Measure time per retrieval turn.
- No changes to native Pagefind, Normal Search, Tag Search, dependency archives, website source HTML or deployment configuration.

## Release requirements
Run the entire existing build and browser suites plus new policy tests. Add independently authored multilingual end-to-end tests for the user's 80% positive, zero observed wrong-answer and zero unintended-action targets. Record failures separately from safe abstention, benchmark latency and model sizes, and verify search relevance using published articles. Expand session-aware response variation, emotion/target recognition, relevance and ambiguous/mixed-command evaluation before release. Do not publish from this branch. The police line is an explicit fictional joke; no reporting or authority contact is implemented.

## Follow-up refinement
Native conversational rules now separate direct insults from personal insults toward others, use temporary per-conversation abuse boundaries, and contain varied warm greetings and retrieval responses. Additional conservative checks cover quoted, contradictory and unrelated action requests. Arabic unsubscribe is not treated as prohibition. Explanation labeling requires a topical article-title match before calling excerpts potentially explanatory; other matches are presented with uncertainty. This is conservative and may abstain on relevant sources whose titles use synonyms. No broad statistical guarantee is asserted.
