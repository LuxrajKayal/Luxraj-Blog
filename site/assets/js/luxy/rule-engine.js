const intents = new Set([
  "chat.greet", "chat.thanks", "chat.farewell", "chat.smalltalk", "assistant.identity", "assistant.help",
  "site.identity", "site.creator", "site.navigate", "site.contact", "site.theme", "site.language",
  "search.interface", "newsletter.info", "newsletter.subscribe", "newsletter.unsubscribe",
  "article.share", "article.copyLink", "article.author", "article.date", "article.calculate",
  "content.explain", "content.search", "content.category", "content.author", "content.date",
  "content.more", "content.refine",
  "chat.praise", "chat.tease", "chat.insult", "chat.profanity", "chat.criticism", "chat.frustration", "chat.apology", "chat.opinion", "chat.accusation", "chat.threat", "chat.disengage", "assistant.personality", "assistant.capabilities"
]);
const slots = new Set(["page", "language", "expression", "query", "author"]);

export function triggerFor(packet) {
  if (packet.schemaVersion !== 1) return "unknown";
  if (packet.status === "action_blocked") return "outcome action blocked";
  if (packet.status === "ambiguous") return "ambiguous";
  if (packet.status !== "recognized" || !intents.has(packet.intent)) return "unknown";
  return "intent " + packet.intent.replaceAll(".", " ").toLowerCase();
}

export function createRuleBot(Interpreter, source, functions) {
  const bot = new Interpreter({ utf8: true, errors: { replyNotMatched: "", replyNotFound: "", objectNotFound: "" } });
  const registered = new Map();
  // The upstream default JavaScript handler compiles inline objects with eval.
  // Only programmatically registered function references may enter this handler.
  bot.setHandler("javascript", {
    load(name, callback) {
      if (typeof callback !== "function" || !Object.hasOwn(functions, name)) {
        throw new Error("Only registered Luxy subroutine references are allowed");
      }
      registered.set(name, callback);
    },
    async call(rs, name, args, scope) {
      const callback = registered.get(name);
      if (!callback || args.some(Boolean) || !scope?.signal) return "";
      scope.signal.check();
      try {
        scope.outcome = await callback(scope);
      } catch {
        scope.signal.check();
        scope.outcome = { status: "error" };
      }
      scope.signal.check();
      return "";
    }
  });
  for (const [name, callback] of Object.entries(functions)) bot.setSubroutine(name, callback);
  if (/^\s*>\s*object\b/imu.test(source)) throw new Error("Inline RiveScript objects are disabled");
  if (!bot.stream(source, message => { throw new Error(message); })) throw new Error("Luxy rules failed to parse");
  bot.sortReplies();
  return bot;
}

export async function ruleReply(bot, scope) {
  const { packet, signal } = scope;
  const user = packet.conversation.id;
  const missing = packet.parameters?.missing?.find(slot => slots.has(slot)) ?? "none";
  await bot.setUservar(user, "missing", missing);
  await bot.setUservar(user, "hasrelated", scope.page || scope.state.search ? "yes" : "no");
  signal.check();
  const text = await bot.reply(user, triggerFor(packet), scope);
  signal.check();
  return text;
}

export async function outcomeReply(bot, user, outcome) {
  const status = /^[a-z_]+$/u.test(outcome.status) ? outcome.status : "unavailable";
  const text = await bot.reply(user, "outcome " + status.replaceAll("_", " "));
  const note = outcome.unavailable?.length ? await bot.reply(user, "notice unfiltered") : "";
  return [text, note].filter(Boolean).join(" ");
}
