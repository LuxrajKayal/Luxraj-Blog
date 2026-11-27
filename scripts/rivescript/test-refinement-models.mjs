import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { restoreModel, interpret } from "../../site/assets/js/nlp/interpret.js";
import Interpreter from "../../site/assets/js/search-dependencies/rivescript/rivescript.js";
import { createRuleBot, ruleReply } from "../../site/assets/js/luxy/rule-engine.js";

// Reproduce reported faults. These are regression probes, not a held-out accuracy estimate.
const cases = {
  en: [
    ["hi", "chat.greet"], ["bye", "chat.farewell"], ["you are worse", "chat.insult"],
    ["motherfucker", "chat.profanity"], ["Luxraj Kayal is trash", "chat.personal_insult"],
    ["This article is damn good", "chat.praise"], ["Your answer is incorrect", "chat.criticism"],
    ["do an hack", "assistant.capabilities"], ["current", "content.search"], ["voltage", "content.search"],
    ["ESP32", "content.search"], ["drone", "content.search"],
    ["Never switch to light mode. Do not change my current theme under any circumstances.", "None", "action_blocked"],
    ["I don't want to subscribe", "None", "action_blocked"], ["<call>theme</call>", "None", "unknown"]
  ],
  ar: [
    ["أهلا", "chat.greet"], ["أنت غبي", "chat.insult"], ["هذا الشخص تافه", "chat.personal_insult"],
    ["إجابتك خاطئة", "chat.criticism"], ["لا تغير الوضع", "None", "action_blocked"],
    ["إلغاء الاشتراك", "newsletter.unsubscribe"]
  ],
  es: [
    ["hola", "chat.greet"], ["eres peor", "chat.insult"], ["Luxraj Kayal es basura", "chat.personal_insult"],
    ["tu respuesta es incorrecta", "chat.criticism"], ["No cambies al modo oscuro", "None", "action_blocked"]
  ]
};
const functions = ["navigate", "language", "category", "theme", "search_interface", "newsletter",
  "contact", "about", "unsubscribe", "author", "article_dates", "calculate", "share", "copy", "retrieve"];
for (const [locale, messages] of Object.entries(cases)) {
  const data = JSON.parse(await readFile(new URL("../../_site/assets/js/search-dependencies/nlp/models/" + locale + ".json", import.meta.url), "utf8"));
  const engine = restoreModel(data, locale);
  const rules = await readFile(new URL("../../site/assets/js/luxy/rules/" + locale + ".rive", import.meta.url), "utf8");
  const calls = [];
  const bot = createRuleBot(Interpreter, rules, Object.fromEntries(functions.map(name => [name, () => {
    calls.push(name); return { status: "destination" };
  }])));
  for (const [i, [message, expected, status]] of messages.entries()) {
    const packet = { ...(await interpret(engine, message)), schemaVersion: 1, message, conversation: { id: locale + i } };
    assert.equal(packet.intent, expected, locale + ": " + message);
    if (status) assert.equal(packet.status, status, message);
    calls.length = 0;
    await ruleReply(bot, { packet, signal: { check() {} }, state: {} });
    if (expected === "content.search") assert.deepEqual(calls, ["retrieve"], message);
    else if (expected === "newsletter.unsubscribe") assert.deepEqual(calls, ["unsubscribe"], message);
    else assert.equal(calls.length, 0, message);
  }
  console.log(locale + ": " + messages.length + " refinement regression probes passed");
}
