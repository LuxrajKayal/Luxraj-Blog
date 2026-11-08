import { initTheme } from "./theme.js";
import { initNavigation } from "./navigation.js";
import { initSearch } from "./search.js";
import { initTagFetcher } from "./tag-fetcher.js";
import { initHeroShowcase } from "./hero-showcase.js";
import { initAuthorBar } from "./author-bar.js";
initTheme();
initNavigation();
initSearch();
initTagFetcher();
initHeroShowcase();
initAuthorBar();

// The loader is bootstrapped separately so a loader error cannot block the
// six existing site initializers above.
import("./lazy-loader/index.js").catch((error) => {
  console.error("[Luxraj Lazy Loader] Unable to initialize the universal lazy loader.", error);
});
