let receiver;

export function connectNlpReceiver(handler) {
  if (typeof handler !== "function") throw new TypeError("Expected a Luxy NLP receiver.");
  receiver = handler;
  return () => {
    if (receiver === handler) receiver = undefined;
  };
}

export async function forwardNlpResult(result) {
  await receiver?.(structuredClone(result));
  return result;
}
