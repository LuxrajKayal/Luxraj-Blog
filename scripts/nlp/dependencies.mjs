import { createRequire } from "node:module";

export const dependency = createRequire(new URL("../../search-dependencies/nlp/package.json", import.meta.url));
