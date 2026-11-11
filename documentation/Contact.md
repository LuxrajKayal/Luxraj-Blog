# Luxraj Blog: Contact Page

## Status
Implemented in the shared-site architecture. The Contact page uses the standard topbar, main navigation header and footer.

## Public contact channels

| Display identity | Address | Purpose |
|---|---|---|
| Luxraj Blog | `blog@luxraj.com` | General and editorial inquiries |
| Luxraj Blog Support | `support.blog@luxraj.com` | Website and technical assistance |
| Luxraj Partnerships | `partnerships@luxraj.com` | Advertising, sponsorships and collaborations |
| Luxraj Newsletter | `newsletter@luxraj.com` | Newsletter replies and subscription questions |
| Owner correspondence | `iamluxy@luxraj.com` | Direct owner correspondence and selected formal/legal matters |

The parent-brand address `official@luxraj.com` is intentionally not shown on the publication's Contact page.

## Page structure
1. Shared topbar and main navigation header.
2. Breadcrumb and page introduction.
3. Write to us composer with recipient and provider selectors and a Proceed action.
4. Detailed contact directory, including a direct `mailto:` link and Copy control for every address.
5. Official Facebook, Instagram, X, YouTube and GitHub links.
6. Shared footer.

## Email composer
- Recipient selector uses the five public contact channels and supplies a suggested department-specific subject.
- Provider selector offers Gmail, Outlook, Yahoo Mail and the visitor's default email application.
- The provider dropdown is custom and keyboard accessible so compact provider icons can appear beside provider names.
- Gmail compose URL uses the `view=cm`, `fs=1`, `to` and `su` query parameters.
- Outlook compose uses Microsoft's documented Outlook Web deeplink pattern with `to` and `subject`.
- Yahoo Mail uses its web compose endpoint with `to` and `subj`.
- The default option uses `mailto:`; this may open a desktop/mobile mail application rather than a browser tab.
- Provider URLs are public webmail compose links and may change independently of Luxraj Blog. A sign-in may be required. The site does not send messages or access visitor mail accounts.

## JavaScript and performance
- `site/assets/js/contact.js` is loaded only by `site/pages/contact.html`.
- It handles provider selection, keyboard interactions, compose URL construction, and email-address copying.
- The Clipboard API is preferred in secure contexts, with a legacy copy fallback.
- The homepage does not load `contact.js` or `contact.css`.

## Stylesheet
- `site/assets/css/contact.css` is linked only from the Contact page.
- It uses existing semantic theme, typography, spacing, radius and focus tokens.
- Shared header and footer styles are supplied by the site's existing page architecture and build process.

## Navigation and indexing
- The shared footer links to `pages/contact.html`.
- `site/sitemap.xml` includes the canonical Contact page URL.
