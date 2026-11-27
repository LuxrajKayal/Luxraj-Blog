import { deliverRiveScriptResponse } from "../adapter/search-adapters/rivescript-ui.js";
import { loadLibrary } from "./library.js";
import { createRuleBot, ruleReply, outcomeReply } from "./rule-engine.js";
import { actions } from "./site-actions.js";
import { loadKnowledge, safeSiteUrl } from "./site-data.js";
import { siteRoot } from "../adapter/search-adapters/rivescript-pagefind.js";

const allowed = ["en", "ar", "es"];
const rules = new Map();
function loadRules(locale) {
  if (!rules.has(locale)) {
    rules.set(locale, fetch(new URL("rules/" + locale + ".rive", import.meta.url), { cache: "no-cache" })
      .then(response => {
        if (!response.ok) throw new Error("Luxy language rules unavailable");
        return response.text();
      }).catch(error => {
        rules.delete(locale);
        throw error;
      }));
  }
  return rules.get(locale);
}

export function createRiveScriptConversation() {
  let bot;
  let queue = Promise.resolve();
  const state = { search: null, seen: new Set() };
  const sequence = task => {
    const operation = queue.then(task);
    queue = operation.catch(() => {});
    return operation;
  };

  async function packetResponse(packet, outcome, text) {
    const user = packet.conversation.id;
    const label = outcome?.interaction ? await bot.reply(user, "label " + outcome.status.replaceAll("_", " ")) : "";
    const dates = [];
    for (const [key, value] of Object.entries(outcome?.dates ?? {})) {
      dates.push((await bot.reply(user, "label " + key)) + " " + value);
    }
    const items = outcome?.items ?? [];
    return {
      conversation: packet.conversation, locale: packet.locale, text, items,
      details: [...(outcome?.details ?? []), ...dates],
      status: outcome?.status ?? "reply",
      more: Boolean(outcome?.more),
      retrievalMs: outcome?.elapsedMs,
      interaction: outcome?.interaction ? {
        label,
        // Invoke immediately on the button's gesture. Only format its result
        // in the native session queue after the capability has settled.
        async run(active, button, event) {
          active.check();
          let next;
          try { next = await outcome.interaction(active, button, event); }
          catch (error) {
            active.check();
            next = { status: "error" };
          }
          return sequence(async () => {
            active.check();
            const response = await packetResponse(packet, next, await outcomeReply(bot, user, next));
            active.check();
            deliverRiveScriptResponse(response);
          });
        }
      } : null
    };
  }

  return {
    receive(packet, signal) {
      return sequence(async () => {
        signal.check();
        const locale = allowed.includes(packet.locale) ? packet.locale : "en";
        const [Interpreter, source, knowledge] = await Promise.all([loadLibrary(), loadRules(locale), loadKnowledge()]);
        signal.check();
        bot ??= createRuleBot(Interpreter, source, actions);
        const region = knowledge.locales[locale];
        const url = safeSiteUrl(location.href);
        let route;
        try { route = url && decodeURI(url.pathname.slice(siteRoot.pathname.length)); }
        catch { route = null; }
        const article = route && region.articles[route];
        const scope = { packet, signal, knowledge, region, state, page: article ? { ...article, route } : null };
        let text;
        try {
          text = await ruleReply(bot, scope);
          if (scope.outcome) text = [text, await outcomeReply(bot, packet.conversation.id, scope.outcome)]
            .filter(Boolean).join(" ");
        } catch (error) {
          signal.check();
          scope.outcome = { status: "error" };
          text = await outcomeReply(bot, packet.conversation.id, scope.outcome);
        }
        const response = await packetResponse(packet, scope.outcome, text);
        signal.check();
        deliverRiveScriptResponse(response);
      });
    }
  };
}
