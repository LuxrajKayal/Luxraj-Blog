/**
 * Newsletter lazy-loading profile.
 *
 * The newsletter HTML, stylesheet and feature module load only after a visitor
 * activates a global [data-newsletter-open] trigger.
 */

let newsletterStylesheetPromise = null;
let newsletterAudioContext = null;

function ensureNewsletterStylesheet(stylesheetUrl) {
  const selector = 'link[data-luxraj-lazy-style="newsletter"]';
  let link = document.querySelector(selector);

  if (link && (link.dataset.loaded === "true" || link.sheet)) {
    link.dataset.loaded = "true";
    return Promise.resolve();
  }
  if (newsletterStylesheetPromise) return newsletterStylesheetPromise;

  if (!link) {
    link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = stylesheetUrl;
    link.dataset.luxrajLazyStyle = "newsletter";
  }

  newsletterStylesheetPromise = new Promise((resolve, reject) => {
    link.addEventListener("load", () => {
      link.dataset.loaded = "true";
      resolve();
    }, { once: true });
    link.addEventListener("error", () => {
      reject(new Error("The newsletter stylesheet could not be loaded."));
    }, { once: true });
    if (!link.isConnected) document.head.appendChild(link);
  }).catch((error) => {
    link.remove();
    throw error;
  }).finally(() => {
    newsletterStylesheetPromise = null;
  });

  return newsletterStylesheetPromise;
}

export const newsletterProfile = {
  id: "newsletter",
  onTrigger() {
    // Resume audio during the click gesture, before network requests begin.
    if (newsletterAudioContext) return;
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return;

    try {
      newsletterAudioContext = new AudioContextConstructor();
      const resumePromise = newsletterAudioContext.resume();
      if (resumePromise && typeof resumePromise.catch === "function") {
        resumePromise.catch(() => {});
      }
    } catch (error) {
      // Audio is optional; newsletter loading must continue if unavailable.
    }
  },

  async load() {
    // Resolve the site root from this module so nested pages work correctly.
    const siteRoot = new URL("../../../../", import.meta.url);
    const popupUrl = new URL("assets/components/newsletter-popup.html", siteRoot);
    const stylesheetUrl = new URL("assets/css/newsletter.css", siteRoot);

    const response = await fetch(popupUrl, { credentials: "same-origin" });
    if (!response.ok) {
      throw new Error("Newsletter markup request failed with HTTP " + response.status + ".");
    }

    const markup = (await response.text()).replaceAll("{{ROOT}}", siteRoot.href);
    const template = document.createElement("template");
    template.innerHTML = markup;

    const newsletterRoot = template.content.querySelector("#luxraj-newsletter");
    const placeholder = document.querySelector(
      '#house-popup-backdrop[data-newsletter-placeholder]'
    );

    if (!newsletterRoot) {
      throw new Error("The newsletter markup is missing its expected root element.");
    }
    if (!placeholder) {
      throw new Error("The newsletter loading placeholder is missing from this page.");
    }
    if (document.getElementById("luxraj-newsletter")) {
      throw new Error("The newsletter markup is already present on this page.");
    }

    const [{ initNewsletterPopup }] = await Promise.all([
      import("../../newsletter.js"),
      ensureNewsletterStylesheet(stylesheetUrl.href)
    ]);

    // Replace the tiny global placeholder with the actual newsletter markup.
    placeholder.replaceWith(newsletterRoot);

    try {
      const controller = initNewsletterPopup({ audioContext: newsletterAudioContext });
      if (!controller || typeof controller.open !== "function") {
        throw new Error("The newsletter module did not return its controller.");
      }
      return controller;
    } catch (error) {
      // Restore the global trigger target if initialization fails, allowing retry.
      const retryPlaceholder = document.createElement("div");
      retryPlaceholder.id = "house-popup-backdrop";
      retryPlaceholder.dataset.newsletterPlaceholder = "";
      retryPlaceholder.hidden = true;
      retryPlaceholder.setAttribute("aria-hidden", "true");
      newsletterRoot.replaceWith(retryPlaceholder);
      throw error;
    }
  },

  activate({ instance, trigger }) {
    instance.open(trigger);
  }
};
