export const foldEntityText = text => text.normalize("NFD").replace(/\p{M}/gu, "");

export function entityInput(text) {
  const starts = [];
  const ends = [];
  let folded = "";
  // Native enum extraction measures token offsets before its own normalization.
  // Fold accents and Arabic combining marks first and map matches back to the input.
  for (const match of text.matchAll(/\P{M}\p{M}*|\p{M}+/gu)) {
    const part = foldEntityText(match[0]);
    for (let index = 0; index < part.length; index++) {
      starts.push(match.index);
      ends.push(match.index + match[0].length - 1);
    }
    folded += part;
  }
  return {
    text: folded,
    restore(entity) {
      const start = starts[entity.start];
      const end = ends[entity.end];
      return { ...entity, start, end, len: end - start + 1, utteranceText: text.slice(start, end + 1) };
    }
  };
}
