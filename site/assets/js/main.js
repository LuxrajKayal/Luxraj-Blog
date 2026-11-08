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

// Load the universal loader independently from the normal site initializers.
// The delegated trigger remains active while its small bootstrap module loads.
let lazyLoaderPromise = null;

function getLazyLoader() {
  if (!lazyLoaderPromise) {
    lazyLoaderPromise = import("./lazy-loader/index.js")
      .then(({ lazyLoader }) => lazyLoader)
      .catch((error) => {
        lazyLoaderPromise = null;
        throw error;
      });
  }
  return lazyLoaderPromise;
}

document.addEventListener("click", (event) => {
  const eventTarget = event.target;
  const trigger = eventTarget instanceof Element
    ? eventTarget.closest("[data-lazy-profile], [data-newsletter-open]")
    : null;

  if (!trigger) return;

  const profileId = trigger.dataset.lazyProfile ||
    (trigger.hasAttribute("data-newsletter-open") ? "newsletter" : null);
  if (!profileId) return;

  event.preventDefault();
  getLazyLoader()
    .then((loader) => loader.activate(profileId, trigger, event))
    .catch((error) => {
      console.error('[Luxraj Lazy Loader] Failed to activate "' + profileId + '".', error);
    });
}, true);

// Start early so profile-specific conditions can register, while clicks are
// safely queued through the delegated handler above.
getLazyLoader().catch((error) => {
  console.error("[Luxraj Lazy Loader] Unable to initialize the universal lazy loader.", error);
});
