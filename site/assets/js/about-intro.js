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
      const sentenceEnd = fullText.indexOf(".");
      const firstLine = sentenceEnd >= 0 ? fullText.slice(0, sentenceEnd + 1) : fullText;
      const secondLine = sentenceEnd >= 0 ? fullText.slice(sentenceEnd + 1).trim() : "";

      const primaryText = document.createElement("span");
      const accentText = document.createElement("span");
      const lineBreak = document.createElement("br");

      accentText.className = "about-intro__slogan-accent";
      slogan.setAttribute("aria-label", fullText);
      slogan.replaceChildren(primaryText, lineBreak, accentText);

      // Show the complete, homepage-matched slogan without typing for reduced-motion users.
      const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        primaryText.textContent = firstLine;
        accentText.textContent = secondLine;
      } else {
        const typingSequence = [
          ...Array.from(firstLine, character => ({ target: primaryText, character })),
          ...Array.from(secondLine, character => ({ target: accentText, character }))
        ];
        let characterIndex = 0;

        slogan.classList.add("is-typing");

        const typeNextCharacter = () => {
          if (characterIndex >= typingSequence.length) {
            slogan.classList.remove("is-typing");
            return;
          }

          const next = typingSequence[characterIndex];
          next.target.textContent += next.character;
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
