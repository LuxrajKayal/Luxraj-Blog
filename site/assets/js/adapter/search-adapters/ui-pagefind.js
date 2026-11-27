// Communication only: expose the native Pagefind module unchanged.
let connection;
export function getPagefind() {
  if (!connection) {
    const bundle = new URL("../../search-dependencies/pagefind/", import.meta.url);
    const root = new URL("../../../../", import.meta.url);
    connection = import(new URL("pagefind.js", bundle).href)
      .then(async pagefind => {
        await pagefind.options({ bundlePath: bundle.pathname, baseUrl: root.pathname });
        await pagefind.init();
        return pagefind;
      })
      .catch(error => {
        connection = undefined;
        throw error;
      });
  }
  return connection;
}
