/**
 * Registers current feature profiles with the universal lazy-loader core.
 * Future features can add their profiles here without modifying the core.
 */

import { createLazyLoader } from "./core.js";
import { newsletterProfile } from "./profiles/newsletter.js";

const lazyLoader = createLazyLoader();
lazyLoader.register(newsletterProfile);
lazyLoader.start();

export { lazyLoader };
