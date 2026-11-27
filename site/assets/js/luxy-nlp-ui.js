import { createNlpConversation } from "./adapter/search-adapters/ui-nlp.js";
import { connectNlpReceiver } from "./adapter/search-adapters/nlp-rivescript.js";
import { connectRiveScriptUi } from "./adapter/search-adapters/rivescript-ui.js";
import { safeSiteUrl } from "./luxy/site-data.js";

const copy = {
  en: { loading: "Luxy is working…", error: "I couldn’t finish that request. Try again.", retry: "Try again",
    more: "More results", followUp: "Show me more articles like these" },
  ar: { loading: "لوكسي يعالج طلبك…", error: "تعذّر إكمال الطلب. حاول مرة أخرى.", retry: "إعادة المحاولة",
    more: "نتائج أخرى", followUp: "أرني المزيد من المقالات المشابهة" },
  es: { loading: "Luxy está trabajando…", error: "No pude terminar la solicitud. Inténtalo de nuevo.", retry: "Reintentar",
    more: "Más resultados", followUp: "Dame más artículos como esos" }
};

function element(name, className, text) {
  const node = document.createElement(name);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function button(label, click) {
  const node = element("button", "luxy-history-item", label);
  node.type = "button";
  node.addEventListener("click", click);
  return node;
}

function message(role, text, locale) {
  const row = element("div", "luxy-message luxy-message--" + role);
  row.dir = role === "user" ? "auto" : locale === "ar" ? "rtl" : "ltr";
  if (role === "assistant") row.lang = locale;
  const body = element("div", "luxy-message__body");
  const bubble = element("div", "luxy-message__bubble");
  bubble.append(element("p", "", text));
  body.append(bubble);
  row.append(body);
  return { row, bubble };
}

export function initLuxyComposer(view) {
  const input = view.querySelector("[data-luxy-message-input]");
  const send = view.querySelector("[data-luxy-send]");
  const messages = view.querySelector("[data-luxy-messages]");
  const newChat = view.querySelector("[data-luxy-new-chat]");
  const history = view.querySelector("[data-luxy-history-list]");
  if (!input || !send || !messages || !history) return;

  const locale = (document.documentElement.lang || "en").toLowerCase().split("-")[0];
  const labels = copy[locale] ?? copy.en;
  const page = { path: location.pathname, type: document.documentElement.dataset.cmsSeoType ?? null };
  let active;

  function taskFor(chat) {
    const controller = new AbortController();
    const guard = { check() {
      controller.signal.throwIfAborted();
      if (active !== chat) throw new DOMException("Conversation changed", "AbortError");
    } };
    return { controller, guard };
  }

  function select(chat) {
    if (active === chat) return;
    active?.job?.controller.abort();
    active?.action?.controller.abort();
    if (active) {
      active.job = null;
      active.action = null;
      active.historyButton?.removeAttribute("aria-current");
    }
    active = chat;
    chat?.historyButton?.setAttribute("aria-current", "true");
    if (chat) messages.replaceChildren(...chat.rows);
    else messages.replaceChildren();
    messages.scrollTop = messages.scrollHeight;
    send.disabled = false;
    input.value = "";
  }

  function add(chat, node) {
    chat.rows.push(node);
    if (chat === active) {
      messages.append(node);
      messages.scrollTop = messages.scrollHeight;
    }
  }

  function showResponse(chat, response) {
    const { row, bubble } = message("assistant", response.text, response.locale);
    row.dataset.luxyReply = "";
    for (const detail of response.details) bubble.append(element("p", "", detail));
    if (response.items.length) {
      const list = element("ul", "luxy-response-sources");
      for (const item of response.items) {
        const url = safeSiteUrl(item.url);
        if (!url) continue;
        const li = element("li");
        const anchor = element("a", "", item.title);
        anchor.href = url.href;
        li.append(anchor);
        if (item.excerpt) li.append(element("p", "", item.excerpt));
        list.append(li);
      }
      if (list.childElementCount) bubble.append(list);
    }
    if (response.more) bubble.append(button(labels.more, () => {
      if (chat === active) void submit(labels.followUp);
    }));
    if (response.interaction) bubble.append(button(response.interaction.label, async event => {
      if (chat !== active || chat.action || chat.job || !event.isTrusted) return;
      const control = event.currentTarget;
      const task = chat.action = taskFor(chat);
      control.disabled = true;
      try {
        await response.interaction.run(task.guard, control, event);
      } catch {
        // A switched conversation has no active interaction to display.
      } finally {
        control.disabled = false;
        if (chat.action === task) chat.action = null;
      }
    }));
    add(chat, row);
  }

  function createChat(title) {
    const id = crypto.randomUUID();
    const chat = { dialogue: createNlpConversation({ id, locale, page }), rows: [], job: null, action: null };
    connectNlpReceiver(async packet => {
      const job = chat.job;
      if (!job) return;
      job.guard.check();
      const { createRiveScriptConversation } = await import("./luxy/runtime.js");
      job.guard.check();
      chat.rules ??= createRiveScriptConversation();
      await chat.rules.receive(packet, job.guard);
    }, id);
    connectRiveScriptUi(id, response => {
      if (chat === active) showResponse(chat, response);
    });
    chat.historyButton = button("", () => {
      select(chat);
      const toggle = view.querySelector("#luxy-sidebar-toggle");
      if (toggle) toggle.checked = false;
    });
    chat.historyButton.append(element("span", "luxy-history-item__title", title.trim()));
    history.prepend(chat.historyButton);
    select(chat);
    return chat;
  }

  async function submit(text = input.value, retry = false) {
    if (!text.trim() || send.disabled || active?.action) return;
    const chat = active ?? createChat(text);
    const task = chat.job = taskFor(chat);
    send.disabled = true;
    if (!retry) {
      add(chat, message("user", text, locale).row);
      if (input.value === text) input.value = "";
    }
    const loading = element("p", "luxy-loading", labels.loading);
    loading.setAttribute("role", "status");
    messages.append(loading);
    try {
      await chat.dialogue.submit(text, { signal: task.controller.signal });
    } catch {
      if (chat === active && chat.job === task) {
        const { row, bubble } = message("assistant", labels.error, locale);
        bubble.append(button(labels.retry, () => {
          if (chat !== active || send.disabled) return;
          chat.rows.splice(chat.rows.indexOf(row), 1);
          row.remove();
          void submit(text, true);
        }));
        add(chat, row);
      }
    } finally {
      loading.remove();
      if (chat.job === task) {
        chat.job = null;
        if (chat === active) send.disabled = false;
      }
    }
  }

  send.addEventListener("click", () => void submit());
  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      void submit();
    }
  });
  newChat?.addEventListener("click", () => {
    select(undefined);
    input.focus();
  });
}
