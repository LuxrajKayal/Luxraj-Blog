import { forwardNlpResult } from "./nlp-rivescript.js";

const modelBase = new URL("../../search-dependencies/nlp/models/", import.meta.url);
const models = new Map();
const engine = () => import("../../nlp/interpret.js");

export function loadNlpModel(locale) {
  if (!["en", "ar", "es"].includes(locale)) throw new RangeError("Unsupported Luxy model locale.");
  if (!models.has(locale)) {
    const request = Promise.all([engine(), fetch(new URL(locale + ".json", modelBase), { cache: "no-cache" })])
      .then(async ([{ restoreModel }, response]) => {
        if (!response.ok) throw new Error("Luxy NLP model returned HTTP " + response.status);
        return restoreModel(await response.json(), locale);
      }).catch(error => {
        models.delete(locale);
        throw error;
      });
    models.set(locale, request);
  }
  return models.get(locale);
}

export function createNlpConversation({ locale, id = crypto.randomUUID(), page = null } = {}) {
  let context = {};
  let pending = Promise.resolve();
  let turn = 0;

  return {
    submit(message, { diagnostics = false, spellCheck = false, signal } = {}) {
      if (typeof message !== "string" || !message.trim()) {
        return Promise.reject(new TypeError("Expected a nonempty Luxy message."));
      }
      const request = pending.then(async () => {
        signal?.throwIfAborted();
        const { detectLanguage, interpret, resolveLocale } = await engine();
        const language = resolveLocale(locale) ?? context.locale ?? detectLanguage(message) ?? "en";
        const model = await loadNlpModel(language);
        const result = await interpret(model, message, context, { diagnostics, spellCheck });
        signal?.throwIfAborted();
        const delivered = await forwardNlpResult({
          schemaVersion: 1,
          message,
          conversation: { id, turn: turn + 1 },
          page: structuredClone(page),
          ...structuredClone(result)
        });
        signal?.throwIfAborted();
        context = result.context;
        turn++;
        return delivered;
      });
      pending = request.catch(() => {});
      return request;
    }
  };
}
