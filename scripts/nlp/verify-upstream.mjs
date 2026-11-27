import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";

const dependencies = new URL("../../search-dependencies/nlp/", import.meta.url);
const publicLicense = new URL("../../site/assets/js/search-dependencies/nlp/THIRD-PARTY-LICENSES.txt", import.meta.url);
const lock = JSON.parse(await readFile(new URL("package-lock.json", dependencies), "utf8"));
const licenses = new Map();

for (const [path, { version, integrity }] of Object.entries(lock.packages)) {
  if (!path.startsWith("node_modules/@nlpjs/")) continue;
  const name = path.replace(/^node_modules\//u, "");
  const filename = "nlpjs-" + name.split("/")[1] + "-" + version + ".tgz";
  const bytes = await readFile(new URL("upstream/" + filename, dependencies));
  assert.equal("sha512-" + createHash("sha512").update(bytes).digest("base64"), integrity, filename);
  const license = (await readFile(new URL(path + "/LICENSE.md", dependencies), "utf8"))
    .replace(/\r\n/gu, "\n").trim();
  if (!licenses.has(license)) licenses.set(license, []);
  licenses.get(license).push(name + "@" + version);
}

const notice = ["NLP.js browser distribution", "https://github.com/axa-group/nlp.js", ...[...licenses].map(
  ([license, packages]) => packages.join("\n") + "\n\n" + license
)].join("\n\n") + "\n";

if (process.argv.includes("--write-license")) await writeFile(publicLicense, notice);
else assert.equal((await readFile(publicLicense, "utf8")).replace(/\r\n/gu, "\n"), notice);
