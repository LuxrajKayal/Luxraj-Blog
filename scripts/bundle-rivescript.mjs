import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dependency } from "./nlp/dependencies.mjs";

const { build } = dependency("esbuild");
export const archive = fileURLToPath(new URL("../search-dependencies/rivescript/rivescript-2.2.1.tgz", import.meta.url));
export const distribution = new URL("../site/assets/js/search-dependencies/rivescript/rivescript.js", import.meta.url);
const pinned = "ea+8qS0pbOYdH4Q9yoyPiCsfbqQ6zQl77F3pa4JijnQCWEcI1F9sS/mFlo3Ihs0Yxkuee32sYEX2Zi7S1Y1gqg==";

export async function workingBundle() {
  assert.equal(createHash("sha512").update(await readFile(archive)).digest("base64"), pinned, "RiveScript npm archive integrity");
  const temporary = await mkdtemp(path.join(os.tmpdir(), "luxraj-rivescript-"));
  try {
    const extraction = spawnSync("tar", ["-xzf", archive, "-C", temporary, "package/src"]);
    assert.equal(extraction.status, 0, String(extraction.stderr));
    const { outputFiles } = await build({
      stdin: {
        contents: "import RiveScript from './rivescript.js'; export default RiveScript;",
        resolveDir: path.join(temporary, "package/src")
      },
      bundle: true, platform: "browser", format: "esm", target: "es2022", minify: true, write: false,
      define: { "process.browser": "true" },
      banner: { js: "// RiveScript.js 2.2.1, MIT. See LICENSE. Compiled from the verified release archive." },
      plugins: [{
        name: "rivescript-browser",
        setup(api) {
          api.onResolve({ filter: /^(\.\/lang\/javascript|fs|fs-readdir-recursive)$/ }, ({ path }) => ({
            path, namespace: "browser-only"
          }));
          api.onLoad({ filter: /.*/, namespace: "browser-only" }, ({ path }) => ({
            // The runtime installs its function-reference handler explicitly.
            // Browser rules use fetch and stream instead of the Node file loaders.
            contents: path === "./lang/javascript"
              ? 'module.exports = class { load() { throw new Error("Inline objects are disabled"); } };'
              : 'module.exports = () => { throw new Error("Node file loading is unavailable"); };'
          }));
        }
      }]
    });
    return Buffer.from(outputFiles[0].contents);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  await writeFile(distribution, await workingBundle());
}
