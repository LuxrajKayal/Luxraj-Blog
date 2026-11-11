/*
 * Luxraj Blog — About page intro lifecycle
 * Loaded only by site/pages/about.html.
 */

const intro = document.querySelector("[data-about-intro]");

if (intro) {
  const root = document.documentElement;
  const isAlreadyHidden = window.getComputedStyle(intro).visibility === "hidden";

  if (!isAlreadyHidden) {
    root.classList.add("about-intro-active");

    const releasePage = () => {
      root.classList.remove("about-intro-active");
    };

    intro.addEventListener("animationend", (event) => {
      if (event.target === intro && event.animationName === "about-intro-dismiss") {
        releasePage();
      }
    }, { once: true });

    // Fallback in case the animation event is not delivered by the browser.
    window.setTimeout(releasePage, 4200);
  }
}
