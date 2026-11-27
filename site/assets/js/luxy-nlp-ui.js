import { createNlpConversation } from "./adapter/search-adapters/ui-nlp.js";

export function initLuxyComposer(view) {
  const input = view.querySelector("[data-luxy-message-input]");
  const send = view.querySelector("[data-luxy-send]");
  const messages = view.querySelector("[data-luxy-messages]");
  const newChat = view.querySelector("[data-luxy-new-chat]");
  if (!input || !send || !messages) return;

  const newConversation = () => createNlpConversation({
    locale: document.documentElement.lang,
    page: { path: location.pathname, type: document.documentElement.dataset.cmsSeoType ?? null }
  });
  let conversation;

  async function submit() {
    const message = input.value;
    if (!message.trim() || send.disabled) return;
    const current = conversation ??= newConversation();
    send.disabled = true;
    try {
      await current.submit(message);
      if (current !== conversation) return;
      const row = document.createElement("div");
      row.className = "luxy-message luxy-message--user";
      const body = document.createElement("div");
      body.className = "luxy-message__body";
      const bubble = document.createElement("p");
      bubble.className = "luxy-message__bubble";
      bubble.textContent = message;
      body.append(bubble);
      row.append(body);
      messages.append(row);
      messages.scrollTop = messages.scrollHeight;
      if (input.value === message) input.value = "";
    } catch (error) {
      if (current === conversation) view.dispatchEvent(new CustomEvent("luxraj:luxy-nlp-error", { detail: error }));
    } finally {
      if (current === conversation) send.disabled = false;
    }
  }

  send.addEventListener("click", submit);
  input.addEventListener("keydown", event => {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      void submit();
    }
  });
  newChat?.addEventListener("click", () => {
    conversation = undefined;
    messages.replaceChildren();
    input.value = "";
    send.disabled = false;
    input.focus();
  });
}
