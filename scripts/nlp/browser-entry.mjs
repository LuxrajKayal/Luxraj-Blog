// Bundle the upstream web-compatible container and the three language plugins.
import { containerBootstrap } from "@nlpjs/core";
import { Nlp } from "@nlpjs/nlp";
import { LangAr } from "@nlpjs/lang-ar";
import { LangEn } from "@nlpjs/lang-en-min";
import { LangEs } from "@nlpjs/lang-es";
import { Language } from "@nlpjs/language-min";

const plugins = { en: LangEn, ar: LangAr, es: LangEs };

export function createNlp(locales) {
  const container = containerBootstrap();
  container.register("Language", Language, false);
  for (const locale of locales) container.use(plugins[locale]);
  return new Nlp({
    container,
    autoSave: false,
    autoLoad: false,
    languages: locales,
    nlu: { log: false, useNoneFeature: true },
    ner: { threshold: 1, considerOnlyIntentEntities: true }
  });
}
