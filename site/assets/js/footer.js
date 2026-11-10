/**
 * Luxraj Blog shared footer accordion.
 *
 * Link groups remain visible by default for no-JavaScript and desktop use.
 * On mobile, the toggles become available and each group can expand independently.
 */
const footer = document.querySelector("[data-site-footer]");

if (footer) {
  const toggles = Array.from(footer.querySelectorAll("[data-footer-toggle]"));
  const mobileLayout = window.matchMedia("(max-width: 720px)");

  function applyResponsiveMode() {
    const isMobile = mobileLayout.matches;

    toggles.forEach(toggle => {
      const panelId = toggle.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;

      if (!panel) return;

      toggle.hidden = !isMobile;
      toggle.setAttribute("aria-expanded", String(!isMobile));
      panel.hidden = isMobile;
    });
  }

  toggles.forEach(toggle => {
    toggle.addEventListener("click", () => {
      if (!mobileLayout.matches) return;

      const panelId = toggle.getAttribute("aria-controls");
      const panel = panelId ? document.getElementById(panelId) : null;

      if (!panel) return;

      const isExpanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isExpanded));
      panel.hidden = isExpanded;
    });
  });

  applyResponsiveMode();

  if (typeof mobileLayout.addEventListener === "function") {
    mobileLayout.addEventListener("change", applyResponsiveMode);
  } else {
    mobileLayout.addListener(applyResponsiveMode);
  }
}
