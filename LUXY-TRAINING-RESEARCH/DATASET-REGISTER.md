# Dataset register — 2026-11-27
Raw files are original synthetic candidate datasets, not approved inputs. Both parsed as 120 valid JSON objects, 22 fields per record, 30 contrast families, no exact duplicate messages within each file. Cross-provider near-duplicate/label audit remains pending.

| Provider | Raw file | Records | Status |
|---|---|---:|---|
| Gemini | datasets/gemini/luxy_en_group04_batch001_train.jsonl | 120 | Received, preliminary review |
| ChatGPT (user-reported; raw provider LUXY) | datasets/chatgpt/luxy_group04_batch001_en_train.jsonl | 120 | Received, preliminary review |
| Gemini corrected 001 + advanced 002 | Pending | 120 corrected + 600 requested | Not received |
| Claude | Pending | Unknown | User reported usage limit; awaiting files |

## Verified comparison
| Measure | Gemini | ChatGPT |
|---|---:|---:|
| Distinct intent labels | 27 | 13 |
| chat.criticism | 21 | 49 |
| chat.personal_insult | 19 | 18 |
| chat.opinion | 9 | 28 |
| chat.insult | 5 | 5 |
| chat.tease | 6 | 7 |
| chat.accusation | 8 | 3 |
| chat.frustration | 6 | 3 |
| chat.hostile_comparison | 2 | 1 |
| chat.affection | 1 | 1 |
| chat.profanity | 0 | 1 |
| Quoted | 9 | 29 |
| Negated | 4 | 12 |
| Hypothetical | 5 | 3 |
| Explicit context | 6 | 1 |

Note: prior chat reported 14 ChatGPT intents; re-count of exact labels yields 13. Current raw total 240 records before deduplication. Neither dataset is sufficient alone.

## Gemini review
Strong technical contrasts, diverse functional requests. Personal insult annotations inconsistently neutral_disengagement (Gareth Holloway, manager); align with owner's default playful boundary. Privacy question about logging IP/selling searches classified accusation; distinguish genuine inquiry and unverified allegation. Mixed commands and hypothetical insults require nuanced priority/stance. Context gaps, sparse neutrality/profanity/affection/praise, batch identifier absent from raw ID. Preserve source.
## ChatGPT review
Strong quotation, negation, technical criticism vs insult. Criticism/opinion dominate (77/120), context sparse, one hostile comparison. General writing/advice requests may be understandable but unsupported by Luxy's actual capabilities. Reported insults sometimes labeled criticism; review intent separately from expression. Factual concerns need careful review. Raw provider LUXY is not rewritten; batch missing in IDs. Preserve source.
## Next
Receive advanced Gemini and Claude deliverables, validate individual files, compare research and annotation quality, deduplicate by contrast family, agree labels and curated dataset with owner. Do not train now.
