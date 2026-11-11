/*
 * Luxraj Blog — About page intro lifecycle
 * Loaded only by site/pages/about.html.
 */

const intro = document.querySelector("[data-about-intro]");

if (intro) {
  const root = document.documentElement;
  const isAlreadyHidden = window.getComputedStyle(intro).visibility === "hidden";

  if (!isAlreadyHidden) {
    const slogan = intro.querySelector(".about-intro__slogan");

    if (slogan) {
      const fullText = slogan.textContent.trim();
      slogan.setAttribute("aria-label", fullText);

      // Show the complete slogan immediately for visitors who prefer reduced motion.
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        slogan.textContent = fullText;
      } else {
        const characters = Array.from(fullText);
        let characterIndex = 0;

        slogan.textContent = "";
        slogan.classList.add("is-typing");

        const typeNextCharacter = () => {
          if (characterIndex >= characters.length) {
            slogan.classList.remove("is-typing");
            return;
          }

          slogan.textContent += characters[characterIndex];
          characterIndex += 1;
          window.setTimeout(typeNextCharacter, 48);
        };

        // Let the loader appear first, then type the slogan beneath it.
        window.setTimeout(typeNextCharacter, 320);
      }
    }

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
