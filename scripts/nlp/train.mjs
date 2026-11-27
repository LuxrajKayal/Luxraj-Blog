import { readFile } from "node:fs/promises";
import { createNlp } from "../../site/assets/js/search-dependencies/nlp/nlpjs.js";
import { foldEntityText } from "../../site/assets/js/nlp/entity-text.js";
import { grammar, email, expression, negatives, ambiguous } from "./corpora/entities.mjs";

export const locales = Object.keys(grammar);
const required = {
  "site.navigate": ["page"],
  "site.language": ["language"],
  "article.calculate": ["expression"],
  "content.explain": ["query"],
  "content.author": ["author"],
  "content.more": ["query"],
  "content.refine": ["query"]
};
const readCorpus = async locale => JSON.parse(await readFile(new URL("corpora/" + locale + ".json", import.meta.url), "utf8"));
export const readCorpora = () => Promise.all(locales.map(readCorpus));

export async function trainLocale(locale, corpus, knowledge) {
  const nlp = createNlp([locale]);
  const language = grammar[locale];
  const documents = Object.entries({
    ...corpus,
    "request.ambiguous": ambiguous[locale],
    None: negatives[locale]
  });
  const supplemental = knowledge.samples.map(subject => language.generated + subject);
  for (const [intent, utterances] of [...documents, ["content.search", supplemental]]) {
    for (const utterance of new Set(utterances)) nlp.nluManager.add(locale, utterance, intent);
  }
  nlp.nluManager.add(locale, "@subject", "content.search");
  nlp.nluManager.add(locale, "@category", "content.category");
  for (const [type, options] of Object.entries(language.enums)) {
    for (const [option, synonyms] of Object.entries(options)) {
      nlp.addNerRuleOptionTexts(locale, type, option, synonyms.map(foldEntityText));
    }
  }
  for (const [type, options] of Object.entries(knowledge.entities)) {
    for (const [option, synonyms] of options) {
      nlp.addNerRuleOptionTexts(locale, type, option, synonyms.map(foldEntityText));
    }
  }
  // Open queries are extracted in their own native NER pass so they can
  // contain a known subject without hiding independent category/date entities.
  for (const query of language.query) nlp.addNerRegexRule(locale, "query", query);
  nlp.addNerRegexRule(locale, "date", language.date);
  nlp.addNerRegexRule(locale, "email", email);
  nlp.addNerRegexRule(locale, "expression", expression);
  nlp.addNerRegexRule(locale, "authorName", language.author);
  for (const [intent, slots] of Object.entries(required)) {
    for (const slot of slots) nlp.slotManager.addSlot(intent, slot, true);
  }
  await nlp.train();
  const model = nlp.toJSON();
  // The inference engine needs the trained features and stem dictionary.
  // Single-language models do not need the original training utterances.
  model.nluManager.domainManagers[locale].sentences = [];
  model.nluManager.extraSentences = [];
  return {
    schemaVersion: 1,
    locale,
    queryEnd: [language.queryEnd.source, language.queryEnd.flags],
    genericQuery: [language.genericQuery.source, language.genericQuery.flags],
    model
  };
}
