const listeners = new Map();

export function connectRiveScriptUi(id, listener) {
  listeners.set(id, listener);
  return () => {
    if (listeners.get(id) === listener) listeners.delete(id);
  };
}

export function deliverRiveScriptResponse(response) {
  listeners.get(response.conversation.id)?.(response);
}
