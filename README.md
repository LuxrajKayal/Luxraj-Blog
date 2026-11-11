# Luxraj-Blog
test before add pagefind
this is test commit from windows pc

## CSS cleanup — pending review

The following stylesheets need a focused review before any cleanup:

- `site/assets/css/section-page.css` — contains category/subcategory page styles and legacy article styles.
- `site/assets/css/article-page.css` — contains the article author-card and article-layout pilot styles.
- `site/assets/css/base.css` — provides global, site-wide styling.
- `site/assets/css/layout.css` — provides shared page-shell and common layout styles.
- `site/assets/css/responsive.css` — contains responsive rules used by multiple website features, including the header, navigation, search, homepage, and category pages.

Review selector usage and dependencies before changing these files. Preserve styles required by active website features, and remove only rules confirmed to be unnecessary or obsolete. Propose the exact changes for review and obtain approval before editing.

No CSS cleanup has been performed yet.

## Brevo newsletter confirmation redirect — development URL

> [!CAUTION]
> **Brevo currently uses the GitHub Pages development confirmation URL: `https://luxrajkayal.github.io/Luxraj-Blog/?newsletter=success`. After the custom domain is connected to GitHub Pages, replace it with the production URL: `https://luxraj.com/?newsletter=success`.**

## Planned newsletter anti-spam enhancement — Luxy's decoy honeypot

> [!IMPORTANT]
> **Planned for a later implementation — not active yet.**
>
> Add a separate Luxy decoy checkbox honeypot alongside Brevo's existing `email_address_check` honeypot. It should be visually hidden from ordinary visitors but remain discoverable in the form markup by automated form fillers.
>
> - The decoy must not use the actual HTML `required` attribute or interfere with real visitors, keyboard navigation, or assistive technology.
> - Trigger the Luxy trap only when the decoy is filled and the form is submitted. Do not trigger it just because a crawler or browser reads or renders the page.
> - When triggered, cancel the submission before it reaches Brevo and send the suspected bot into Luxy's playful repeating interaction instead of returning a real subscription result.
> - Keep Brevo's existing server-side honeypot unchanged as an independent protection layer.
> - Ensure Googlebot and other legitimate crawlers can crawl and render the website normally; validate the behavior before release.
>
> This is a future enhancement only. No decoy field or trap behavior has been implemented.
