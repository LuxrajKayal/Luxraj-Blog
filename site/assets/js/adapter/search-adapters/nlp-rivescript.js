let receiver;
const conversations = new Map();

export function connectNlpReceiver(handler, id) {
  if (typeof handler !== "function") throw new TypeError("Expected a Luxy NLP receiver.");
  if (id !== undefined) {
    conversations.set(id, handler);
    return () => {
      if (conversations.get(id) === handler) conversations.delete(id);
    };
  }
  receiver = handler;
  return () => {
    if (receiver === handler) receiver = undefined;
  };
}

export async function forwardNlpResult(result) {
  await (receiver ?? conversations.get(result.conversation.id))?.(structuredClone(result));
  return result;
}
