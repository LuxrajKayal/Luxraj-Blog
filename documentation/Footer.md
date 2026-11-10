# Luxraj Blog Footer

**Component:** Shared website footer  
**Source HTML:** \`site/partials/footer.html\`  
**Stylesheet:** \`site/assets/css/footer.css\`  
**Mobile behaviour:** \`site/assets/js/footer.js\`  
**Status:** Implemented shared navigation architecture

## 1. Component boundary and inclusion rules

The footer is a shared component. Standard populated website pages include it with exactly one source marker:

\`\`\`html
<!-- SHARED:FOOTER -->
\`\`\`

The build script replaces that marker with \`site/partials/footer.html\`, resolves the \`{{ROOT}}\` tokens for the page's directory depth, and inserts \`site/assets/css/footer.css\` when it is not already linked. The footer partial loads its own small module, \`site/assets/js/footer.js\`, for the mobile accordion.

Keep the existing shared-component rules:

- Populated standard pages use exactly one \`SHARED:FOOTER\` marker.
- Article-specific references may use their own \`<footer class="article-footer">\`; this does not replace or conflict with the shared website footer.
- \`site/404.html\` is self-contained and excluded from the shared site shell.
- \`site/newsletter-thank-you.html\` is a standalone confirmation page.
- \`site/unsubscribe.html\` is a standalone Brevo unsubscription page with its own footer.
- Empty HTML placeholders remain unchanged by the build process.

Do not modify the builder's inclusion or exclusion rules as part of ordinary footer content maintenance.

## 2. Layout

The footer has one brand block on the left and six navigation groups:

1. Explore
2. Discover
3. Luxraj
4. Connect
5. Resources
6. Legal & Business

Responsive layout:

- **Desktop:** brand block on the left; six navigation columns arranged horizontally to its right.
- **Tablet (up to 1,200px):** brand block above the navigation; navigation arranged in three columns and two rows.
- **Mobile (up to 720px):** brand block remains visible; six navigation groups become independently expandable accordion sections.
- When JavaScript is unavailable, footer links remain visible rather than being hidden behind inactive controls.
- The existing footer background, circuit motif, design tokens, theme colors and focus treatment remain in use.

## 3. Brand block

- Luxraj Blog emblem and wordmark.
- Publication label: BLOG.
- Tagline: Technology. Without the noise.
- Short publication description.
- Author and maintainer card for Luxraj Kayal.

The author card currently uses a placeholder destination and should be updated when the author profile page is ready.

## 4. Navigation groups and destinations

Internal links use \`{{ROOT}}\` so the build process can resolve them from the homepage, category pages, nested articles and standalone pages. The placeholder URLs below are intentional development destinations and must be replaced when their real pages or services are implemented.

### 01. Explore

| Label | Destination |
|---|---|
| Home | \`{{ROOT}}index.html\` |
| Tech News | \`{{ROOT}}categories/tech-news/tech-news-index.html\` |
| Engineering | \`{{ROOT}}categories/engineering/engineering-index.html\` |
| Reviews | \`{{ROOT}}categories/reviews/reviews-index.html\` |
| How To | \`{{ROOT}}categories/how-to/how-to-index.html\` |
| Hardware | \`{{ROOT}}categories/hardware/hardware-index.html\` |
| Software | \`{{ROOT}}categories/software/software-index.html\` |
| Buying Advice | \`{{ROOT}}categories/buying-advice/buying-advice-index.html\` |

### 02. Discover

| Label | Destination / behaviour |
|---|---|
| Search Articles | Existing \`data-search-open\` control; opens the shared search dialog |
| All Articles | \`https://example.com/articles\` |
| Latest Articles | \`https://example.com/latest\` |
| Archive | \`https://example.com/archive\` |
| Browse Tags | \`https://example.com/tags\` |
| Popular Articles | \`https://example.com/popular\` |

Browse Tags is reserved for a future general tag-discovery destination. It does not pretend that the current article-originated tag-search interaction is a standalone tags page.

### 03. Luxraj

| Label | Destination |
|---|---|
| About Luxraj Blog | \`{{ROOT}}pages/about.html\` |
| About Luxraj | \`https://example.com/about-luxraj\` |
| Main Luxraj Website | \`https://luxraj.com\` |
| Author Profile | \`https://example.com/author/luxraj-kayal\` |
| Editorial Policy | \`https://example.com/editorial-policy\` |
| Personal Portfolio | \`https://example.com/portfolio\` |

### 04. Connect

| Label | Destination / behaviour |
|---|---|
| Contact | \`https://example.com/contact\` |
| Editorial Enquiries | \`https://example.com/editorial-enquiries\` |
| Newsletter | Existing \`data-newsletter-open\` trigger; opens the shared Luxy/Brevo newsletter experience |

Social links are icon-only and use accessible names:

| Platform | Official destination |
|---|---|
| Facebook | \`https://www.facebook.com/LuxrajOfficial/\` |
| Instagram | \`https://www.instagram.com/Luxrajofficial/\` |
| X | \`https://x.com/Luxraj\` |
| YouTube | \`https://www.youtube.com/@LuxrajOfficial\` |
| GitHub | \`https://github.com/LuxrajKayal\` |

### 05. Resources

| Label | Destination |
|---|---|
| RSS Feed | \`https://example.com/feed.xml\` |
| Sitemap | \`{{ROOT}}sitemap.xml\` |
| Help Centre | \`https://example.com/help\` |
| Accessibility | \`https://example.com/accessibility\` |
| Reader Resources | \`https://example.com/resources\` |

### 06. Legal & Business

| Label | Destination |
|---|---|
| Privacy Policy | \`{{ROOT}}pages/privacy.html\` |
| Terms of Use | \`https://example.com/terms\` |
| Disclaimer | \`https://example.com/disclaimer\` |
| Advertising | \`https://example.com/advertising\` |
| Affiliate Disclosure | \`https://example.com/affiliate-disclosure\` |
| Copyright | \`https://example.com/copyright\` |

The advertising destination remains a placeholder; do not point it to the currently empty \`site/pages/advertising.html\` file.

## 5. Placeholder inventory

Placeholder links are marked in the HTML with \`data-footer-placeholder\`. Replace the \`example.com\` destination when its corresponding page or service is ready; keep the label and group position unless the information architecture is deliberately revised.

| Placeholder key | Current URL |
|---|---|
| \`author-profile\` | \`https://example.com/author/luxraj-kayal\` |
| \`all-articles\` | \`https://example.com/articles\` |
| \`latest-articles\` | \`https://example.com/latest\` |
| \`archive\` | \`https://example.com/archive\` |
| \`browse-tags\` | \`https://example.com/tags\` |
| \`popular-articles\` | \`https://example.com/popular\` |
| \`about-luxraj\` | \`https://example.com/about-luxraj\` |
| \`author-profile-link\` | \`https://example.com/author/luxraj-kayal\` |
| \`editorial-policy\` | \`https://example.com/editorial-policy\` |
| \`personal-portfolio\` | \`https://example.com/portfolio\` |
| \`contact\` | \`https://example.com/contact\` |
| \`editorial-enquiries\` | \`https://example.com/editorial-enquiries\` |
| \`rss-feed\` | \`https://example.com/feed.xml\` |
| \`help-centre\` | \`https://example.com/help\` |
| \`accessibility\` | \`https://example.com/accessibility\` |
| \`reader-resources\` | \`https://example.com/resources\` |
| \`terms-of-use\` | \`https://example.com/terms\` |
| \`disclaimer\` | \`https://example.com/disclaimer\` |
| \`advertising\` | \`https://example.com/advertising\` |
| \`affiliate-disclosure\` | \`https://example.com/affiliate-disclosure\` |
| \`copyright\` | \`https://example.com/copyright\` |

Some profile destinations appear in both the brand card and the Luxraj group for convenient access. Update both marked links together when the author page is published.

## 6. Footer behaviour and maintenance

- Search Articles reuses the existing search dialog. Do not create another search overlay.
- Newsletter reuses the existing lazy-loaded newsletter popup. Do not add a second Brevo form.
- Social profile links open their official destinations in a new tab.
- Back to Top retains the existing top-of-document anchor behaviour.
- The mobile accordion is independently expandable: readers may open more than one group.
- \`footer.js\` closes all link panels when entering the mobile layout and reveals them all when returning to desktop.
- Keep the HTML link groups visible by default. The JavaScript applies the mobile collapsed state, so a JavaScript failure does not strand readers without footer navigation.
- Update this document whenever a placeholder is replaced, a destination is added/removed, or the component architecture changes.

## 7. Change boundary

The shared footer should be maintained through its existing partial and stylesheet. Keep the build script's required marker validation and standalone-page exclusions intact. Do not duplicate the footer in individual page files.
