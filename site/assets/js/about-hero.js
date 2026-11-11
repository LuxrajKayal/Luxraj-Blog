/*
 * Luxraj Blog — About hero word rotation
 * Loaded only by site/pages/about.html.
 */

const rotatingWord = document.querySelector("[data-about-hero-word]");

if (rotatingWord && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const words = ["see.", "touch.", "verify."];
  let wordIndex = 0;

  window.setInterval(() => {
    wordIndex = (wordIndex + 1) % words.length;
    rotatingWord.classList.remove("is-changing");
    rotatingWord.textContent = words[wordIndex];

    // Restart the entrance animation for each new word.
    void rotatingWord.offsetWidth;
    rotatingWord.classList.add("is-changing");
  }, 2000);
}
