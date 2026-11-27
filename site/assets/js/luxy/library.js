const bundle = new URL("../search-dependencies/rivescript/rivescript.js", import.meta.url);
let pending;
let attempts = 0;

export function loadLibrary() {
  if (!pending) {
    const url = new URL(bundle);
    if (attempts) url.searchParams.set("retry", String(attempts));
    attempts++;
    pending = import(url.href).then(({ default: Interpreter }) => Interpreter).catch(error => {
      pending = undefined;
      throw error;
    });
  }
  return pending;
}
