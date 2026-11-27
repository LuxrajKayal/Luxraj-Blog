import { siteRoot } from "../adapter/search-adapters/rivescript-pagefind.js";

let knowledge;
export function loadKnowledge() {
  knowledge ??= fetch(new URL("knowledge.json", import.meta.url), { cache: "no-cache" })
    .then(response => {
      if (!response.ok) throw new Error("Luxy site information unavailable");
      return response.json();
    }).catch(error => {
      knowledge = undefined;
      throw error;
    });
  return knowledge;
}

export function safeSiteUrl(href, root = siteRoot) {
  if (typeof href !== "string" || !href.trim()) return null;
  try {
    const url = new URL(href, root);
    if (!["http:", "https:"].includes(url.protocol) || url.origin !== root.origin ||
        !url.pathname.startsWith(root.pathname) || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

export const keyOf = value => String(value).normalize("NFD").replace(/\p{M}/gu, "").toLowerCase().trim();
