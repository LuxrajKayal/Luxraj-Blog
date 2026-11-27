import { createNlp } from "../search-dependencies/nlp/nlpjs.js";
import { entityInput } from "./entity-text.js";
import { bareTopic, prohibitedAction, unsafeMessage, shortSocialIntent } from "./request-policy.js";

export const locales = ["en", "ar", "es"];
const enumTypes = ["category", "subject", "author", "capability", "page", "theme", "channel", "language"];
const searchIntents = new Set([
  "content.search", "content.explain", "content.category", "content.author",
  "content.date", "content.more", "content.refine"
]);
const queryIntents = new Set(["content.search", "content.explain"]);
const followUps = new Set(["content.more", "content.refine"]);
const nativeUnknown = "None";
const isExplicitNegative = output => output.intent === nativeUnknown && output.explanation?.[0]?.stem === "##exact";
const explanation = output => output.nluAnswer?.explanation ?? output.explanation ?? [];
const hasEvidence = output => explanation(output).some(term => term.stem === "##exact") ||
  explanation(output).filter(term => term.token && term.weight >= 0.25).length >= 2;

export const resolveLocale = value => {
  const locale = value?.toLowerCase().split("-")[0];
  return locales.includes(locale) ? locale : undefined;
};

let detector;
export function detectLanguage(message) {
  if (!message.trim()) return undefined;
  detector ??= createNlp(locales);
  return resolveLocale(detector.guessLanguage(message));
}

export function restoreModel(data, locale = data?.locale) {
  if (data?.schemaVersion !== 1 || !locales.includes(locale) || data.locale !== locale ||
      !data.model?.nluManager?.domainManagers?.[locale]) {
    throw new Error("Luxy NLP model has an incompatible format or locale.");
  }
  const nlp = createNlp([locale]);
  nlp.fromJSON(data.model);
  return {
    locale,
    nlp,
    queryEnd: new RegExp(...data.queryEnd),
    genericQuery: new RegExp(...data.genericQuery)
  };
}

function replaceEntities(text, entities) {
  let offset = 0;
  let replaced = "";
  for (const entity of [...entities].sort((a, b) => a.start - b.start || b.end - a.end)) {
    if (entity.start < offset) continue;
    replaced += text.slice(offset, entity.start) + "@" + entity.entity;
    offset = entity.end + 1;
  }
  return replaced + text.slice(offset);
}

function cleanQuery(engine, candidate, typedEntities) {
  if (!candidate) return undefined;
  const source = candidate.utteranceText;
  const punctuation = /^[¿¡"'“«\s]+|[.?!؟،,"'”»\s]+$/gu;
  const query = source.replace(punctuation, "").replace(engine.queryEnd, "").replace(punctuation, "");
  if (!query || engine.genericQuery.test(query)) return undefined;
  const leading = source.indexOf(query);
  if (leading < 0) return undefined;
  const start = candidate.start + leading;
  const end = start + query.length - 1;
  if (typedEntities.some(entity => ["author", "date", "email"].includes(entity.entity) &&
    entity.start <= start && entity.end >= end)) return undefined;
  return { ...candidate, start, end, len: query.length, sourceText: query, utteranceText: query };
}

const entityValue = entity => entity?.option ?? entity?.utteranceText;
const entityValues = (entities, type) => [...new Set(entities.filter(entity => entity.entity === type).map(entityValue))];

function contextualEntity(type, value) {
  return { entity: type, option: value, type: "context" };
}

async function classify(engine, utterance, entities, query, spellCheck) {
  const classifyText = text => engine.nlp.nluManager.process({
    locale: engine.locale,
    utterance: text.trim().replace(/^[¿¡]+|[.?!؟]+$/gu, "").trim(),
    settings: { useNoneFeature: true, returnExplanation: true, spellCheck }
  });
  const original = await classifyText(utterance);
  if (isExplicitNegative(original)) return { output: original, input: utterance };
  const typed = replaceEntities(utterance, entities);
  const possible = [{ output: original, input: utterance }];
  if (typed !== utterance) possible.push({ output: await classifyText(typed), input: typed });
  if (query) {
    const queryTemplate = replaceEntities(utterance, [
      query,
      ...entities.filter(entity => entity.end < query.start || entity.start > query.end)
    ]);
    if (queryTemplate !== typed) possible.push({ output: await classifyText(queryTemplate), input: queryTemplate });
  }
  const strength = candidate => candidate.output.intent === nativeUnknown || !hasEvidence(candidate.output)
    ? 0 : candidate.output.score;
  return possible.reduce((best, candidate) => strength(candidate) > strength(best) ? candidate : best);
}

function buildSearch(intent, entities, subject, previousSearch) {
  if (!searchIntents.has(intent)) return null;
  const inherited = followUps.has(intent) ? previousSearch : undefined;
  const filter = (type, key) => {
    const values = entityValues(entities.filter(entity => !(type === "category" && subject &&
      queryIntents.has(intent) && (entity.option ?? entity.utteranceText)?.toLowerCase() === subject.toLowerCase())), type);
    return values.length ? values : inherited?.[key] ?? [];
  };
  return {
    query: subject ?? "",
    categories: filter("category", "categories"),
    authors: filter("author", "authors"),
    dates: filter("date", "dates"),
    followUp: followUps.has(intent),
    browse: !subject && intent === "content.search"
  };
}

export async function interpret(engine, message, context = {}, { diagnostics = false, spellCheck = false } = {}) {
  const utterance = message;
  const input = { locale: engine.locale, utterance };
  const folded = entityInput(utterance);
  const [{ entities: named }, { entities: structured }, { entities: queries }] = await Promise.all([
    // NLP.js v4 mutates the supplied priority list during overlap resolution.
    engine.nlp.ner.process({ ...input, utterance: folded.text }, [...enumTypes]),
    engine.nlp.ner.process(input, ["date", "email", "expression", "authorName"]),
    engine.nlp.ner.process(input, ["query"])
  ]);
  const entities = [...named.map(folded.restore), ...structured.filter(entity => entity.entity !== "authorName")];
  for (const entity of structured.filter(item => item.entity === "authorName")) {
    if (entities.some(known => known.entity === "author" && known.start <= entity.end && known.end >= entity.start)) continue;
    // A generic reference to another author is resolved from conversation context.
    if (/^(?:a particular|a specific|the same|this|another|مؤلف|كاتب|نفس|un autor|el mismo|este)(?![\p{L}\p{N}])/iu.test(entity.utteranceText)) continue;
    const text = entity.utteranceText.replace(/[.]+$/u, "");
    entities.push({ ...entity, entity: "author", sourceText: text, utteranceText: text,
      len: text.length, end: entity.start + text.length - 1 });
  }
  const query = queries.map(candidate => cleanQuery(engine, candidate, entities)).find(Boolean);
  const { output, input: classifiedText } = await classify(engine, utterance, entities, query, spellCheck);
  const top = output.classifications[0];
  const runnerUp = output.classifications[1];
  const close = runnerUp && runnerUp.intent !== nativeUnknown && top.score - runnerUp.score < 0.08;
  const weak = output.intent === nativeUnknown || !hasEvidence(output) || top.score < 0.55 ||
    (runnerUp?.intent === nativeUnknown && runnerUp.score > 0.3 && top.score - runnerUp.score < 0.38);
  let status = output.intent === "request.ambiguous" || (!weak && close) ? "ambiguous" : weak ? "unknown" : "recognized";
  let intent = status === "recognized" ? output.intent : nativeUnknown;
  const previous = context.locale === engine.locale ? context : {};
  const knownSubject = entityValue(entities.find(entity => entity.entity === "subject"));
  let subject = queryIntents.has(intent) ? query?.utteranceText ?? knownSubject : undefined;
  if (followUps.has(intent)) subject = previous.search?.query || undefined;
  if (subject) {
    entities.push(queryIntents.has(intent) && query
      ? query
      : contextualEntity("query", subject));
  }

  // A pending slot only resumes with a matching entity or a short topic reply.
  // An independently recognized request gets its own intent and parameters.
  const bareSubject = entities.some(entity => entity.entity === "subject" && !utterance.slice(0, entity.start).trim() &&
    /^[.?!؟\s]*$/u.test(utterance.slice(entity.end + 1)));
  if (previous.slotFill && !isExplicitNegative(output) &&
      (status === "unknown" || (bareSubject && previous.slotFill.currentSlot === "query"))) {
    const slot = previous.slotFill.currentSlot;
    const text = utterance.trim();
    const shortTopic = slot === "query" && /^[\p{L}\p{N}][\p{L}\p{N}\s+#./-]{0,79}$/u.test(text)
      && text.split(/\s+/u).length <= 4 && !engine.genericQuery.test(text);
    if (entities.some(entity => entity.entity === slot) || shortTopic || bareSubject) {
      intent = previous.slotFill.intent;
      status = "recognized";
      subject = slot === "query" ? query?.utteranceText ?? knownSubject ?? text : undefined;
      if (subject && !entities.some(entity => entity.entity === "query")) {
        entities.push(contextualEntity("query", subject));
      }
    }
  }

  // Explicitly prohibited control requests override classifier and pending slots.
  if (unsafeMessage(utterance)) {
    status = "unknown"; intent = nativeUnknown; subject = undefined;
  } else if (prohibitedAction(engine.locale, utterance) && (intent.startsWith("site.") ||
      intent.startsWith("newsletter.") || intent.startsWith("article.") || intent === "search.interface" ||
      status !== "recognized")) {
    status = "action_blocked"; intent = nativeUnknown; subject = undefined;
  } else if (!isExplicitNegative(output) && status !== "recognized" && shortSocialIntent(engine.locale, utterance)) {
    status = "recognized"; intent = shortSocialIntent(engine.locale, utterance); subject = undefined;
  } else if (!isExplicitNegative(output) && status !== "recognized" && !previous.slotFill) {
    const topic = bareSubject ? knownSubject : bareTopic(utterance);
    if (topic) {
      status = "recognized"; intent = "content.search"; subject = topic;
      entities.push(contextualEntity("query", topic));
    }
  }
  const nativeResult = { intent, utterance, localeIso2: engine.locale, entities };
  const slotContext = intent === previous.slotFill?.intent && output.intent !== intent
    ? { slotFill: structuredClone(previous.slotFill) }
    : {};
  const required = Object.keys(engine.nlp.slotManager.getMandatorySlots(intent));
  engine.nlp.slotManager.process(nativeResult, slotContext);
  const missing = required.filter(name => !nativeResult.entities.some(entity => entity.entity === name));
  const search = buildSearch(intent, nativeResult.entities, subject, previous.search);
  const nextContext = {
    locale: engine.locale,
    previousIntent: intent === nativeUnknown ? previous.previousIntent ?? null : intent,
    search: search || previous.search || null,
    slotFill: status === "action_blocked" || unsafeMessage(utterance) ? null : nativeResult.slotFill ?? (intent === nativeUnknown ? previous.slotFill : null) ?? null
  };
  return {
    locale: output.localeIso2 ?? engine.locale,
    language: output.language ?? engine.locale,
    intent,
    status,
    classification: {
      intent: output.intent,
      score: top.score,
      alternatives: output.classifications,
      ...(diagnostics ? {
        input: classifiedText,
        explanation: explanation(output)
      } : {})
    },
    entities: nativeResult.entities,
    subject: subject ?? null,
    search,
    parameters: { required, missing },
    context: nextContext
  };
}
