# Dataset specification
Raw research format UTF-8 JSONL, one complete JSON object per line. Preserve source files, use provider/language/batch/category/record and family IDs; do not mix raw and curated datasets. IDs must be unique across providers and batches. Do not silently change provenance. Fields in initial 22-field schema:

id, provider, locale, group, family_id, split, message, intent, subject, target_type, target, sentiment, expression_type, negated, hypothetical, quoted, requested_action, authorization, response_strategy, retrieval, context, annotation_note.

Use null for nonapplicable scalar values; arrays for context and proposed secondary_intents. Boolean negated/hypothetical/quoted/retrieval. Authorization: none, permitted, prohibited, uncertain. Response strategy: friendly_reply, playful_defensive_reply, neutral_disengagement, constructive_reply, serious_reply, clarify, retrieve, site_information, execute_authorized_control, offer_confirmation, unsupported_reply.

## Existing labels (27 + ambiguity + None)
chat.greet, chat.thanks, chat.farewell, chat.smalltalk, assistant.identity, assistant.help, site.identity, site.creator, site.navigate, site.contact, site.theme, site.language, search.interface, newsletter.info, newsletter.subscribe, newsletter.unsubscribe, article.share, article.copyLink, article.author, article.date, article.calculate, content.explain, content.search, content.category, content.author, content.date, content.more, content.refine, request.ambiguous, None.

## Proposed new labels — not yet implemented
chat.praise, chat.affection, chat.tease, chat.insult, chat.personal_insult, chat.profanity, chat.criticism, chat.frustration, chat.apology, chat.opinion, chat.accusation, chat.hostile_comparison, chat.threat, chat.disengage, assistant.personality, assistant.capabilities.

Advanced schema proposals: secondary_intents (array), severity (none/mild/moderate/severe), stance (asserted/questioned/reported/hypothetical/rejected/unclear), directed_at (assistant/self/person/group/institution/work/object/none), ambiguity_level (low/medium/high), context_required (boolean), expected_decision, forbidden_behaviors (array), expected_response_example. These are research annotations; native NLP.js does not automatically train all fields. Only curated utterances/intent/entity examples should become native training input; other fields inform decision policy and evaluation.

## Annotation policy
Intent != capability != relevance != authorization. A valid search for an absent topic is not an unknown intent. Unknown unsupported external actions map to None; clarify actual ambiguity. Read-only retrieval vs state-changing controls must be distinguished. Never authorize quoted, hypothetical, negated, conflicting, uncertain or unsupported actions. No actual subscription submission, arbitrary JS, private data, external transactions, emails or repository modifications. Use fictional examples for serious allegations and no private personal data. No invented article availability.
Proposed mixed-intent priorities: serious safety, forbidden action, respectful boundary, valid factual/technical request, criticism/emotion, social. Do not suppress a valid independent request unnecessarily.
## Quality and split
Audit JSON syntax, unique IDs, normalized and near-duplicate messages, label conflicts, class balance, entity diversity, language naturalness, false authorization, context dependencies and prohibited behavior. Keep contrast families together; split by family and preferably unseen entity names and templates. Validation used for tuning; held-out test only once after freeze. External generators may share biases; independently authored human tests matter. Multi-turn examples must include actual prior context or mark missing context. Do not assume annotations are accurate. Store review logs and curated copies separately.
