import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, writeFile } from "node:fs/promises";
import { dependency } from "./dependencies.mjs";

const { build } = dependency("esbuild");
const entry = fileURLToPath(new URL("browser-entry.mjs", import.meta.url));
export const bundlePath = fileURLToPath(new URL(
  "../../site/assets/js/search-dependencies/nlp/nlpjs.js", import.meta.url
));

export async function browserBundle() {
  const { outputFiles } = await build({
    entryPoints: [entry],
    nodePaths: [fileURLToPath(new URL("../../search-dependencies/nlp/node_modules", import.meta.url))],
    platform: "browser",
    format: "esm",
    target: "es2022",
    bundle: true,
    minify: true,
    legalComments: "none",
    banner: { js: "// NLP.js v4 browser distribution. See THIRD-PARTY-LICENSES.txt." },
    write: false
  });
  return outputFiles[0].contents;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await mkdir(path.dirname(bundlePath), { recursive: true });
  await writeFile(bundlePath, await browserBundle());
}
