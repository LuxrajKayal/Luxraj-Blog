# Luxraj Blog — File Map

**Project:** `blog.luxraj.com`  
**Status:** Updated to reflect the current repository structure. Any future structural change should be recorded here after it is implemented.  
**Hosting direction:** The public-site source lives in `site/`; GitHub Actions builds it into `_site/` and deploys that generated output. External database and media services are not required or configured for the current scope.

This map separates public-site source (`site/`), build tooling (`scripts/`), and planning materials (`documentation/`). The control panel/dashboard has been removed from the project. Every populated HTML page uses one explicit marker each for the canonical topbar, main header/search dialog, and footer under `site/partials/`. Article pages may additionally opt into `SHARED:ARTICLE-LAYOUT`, supplying separate HEADER and CONTENT slots; the build script assembles those article-specific slots into the shared full-width entry-header, two-column content frame and empty sidebar rail. The frame uses a centered 80rem maximum container, 1rem horizontal gutters, a 12-column 8/4 split and a 3rem gap. Breadcrumb navigation is a shared `.breadcrumbs` component styled in `site/assets/css/breadcrumbs.css`; section pages load it through `section-page.css`, while article pages load it directly. Eyebrow design is centralized in `site/assets/css/eyebrows.css`, using dedicated `--lux-eyebrow-*` brand tokens from `tokens.css`; the shared stylesheet is imported by `search.css`, which is loaded by populated pages. Eyebrow wording remains in each page/component, while component-specific spacing and layout remain in their owning stylesheets. Standard H1 typography for main-category, subcategory and article pages is centralized in `site/assets/css/shared-h1.css` and dedicated `--lux-h1-*` tokens; `search.css` imports this stylesheet for populated pages. The homepage hero intentionally retains its separate display-H1 rules in `hero.css`. The article author and sharing details are now implemented as a standalone reusable component: `author-bar.css` styles the horizontal bar, `author-bar.js` renders it from `author-library.js`, and `article-share.js` handles copy and sharing actions. Only the first shared-layout article is the pilot; other articles have not been migrated. Publication and modification dates remain article-specific. The pilot photograph at `site/assets/images/authors/luxraj-author-sample.webp` is temporary, and the `authors/luxraj-kayal/` profile route must be confirmed when the author page is created. At a 1,100px viewport this yields a 696px article column, 48px gap and 324px sidebar rail; below 1,024px the columns stack. Article text and data remain hand-authored in each article source file. The builder does not detect, hide, or replace legacy components; it fails if a populated page is missing required shell markers or still contains hardcoded shared shell markup.

---

## Repository Layout in GitHub

The repository separates public-site source, build tooling, and planning materials. `site/` contains authored HTML/CSS/JS and source-only partials; `scripts/build-site.mjs` produces `_site/`, which is the directory deployed to GitHub Pages. Source partials and planning documents are not published. The existing root `README.md` remains untouched.

The shared footer includes the Luxraj brand summary, author profile link, category navigation, article search trigger, copyright, and Back to Top. The author-page destination is a temporary `https://example.com` placeholder.

```text
Luxraj-Blog/
├── README.md                    # Existing file; unchanged
├── scripts/                      # Node.js static-site build tooling
│   └── build-site.mjs             # Expands shared component markers into _site/
├── documentation/               # Planning references for development only
│   ├── PLAN_INDEX.md
│   ├── Luxraj-Blog-FileMap.md
│   ├── Luxraj-Blog-Blueprint.md
│   ├── Luxraj-Blog-Step-by-Step-Build-Plan.md
│   ├── Article-Group-Pages.md
│   └── ... other planning documents
├── site/                        # Public website source and build input
│   ├── index.html                # The only file named index.html
│   ├── partials/                 # Source-only shared HTML components
│   │   ├── topbar.html            # Shared top information bar
│   │   ├── main-header.html       # Shared navigation header and search dialog
│   │   ├── footer.html            # Shared footer content and layout
│   │   └── article-layout.html    # Optional shared article frame with full-width header and empty sidebar rail
│   ├── categories/               # Category/subcategory pages and their articles
│   ├── pages/                    # Standalone utility/legal pages, when present
│   ├── content/                  # Public Markdown content consumed by page scripts
│   ├── assets/                   # Shared CSS, JavaScript and images
│   ├── sitemap.xml
│   └── 404.html
```

## About page intro

The About page reuses the existing animated SVG at `site/assets/images/ui/luxraj-blog-loader.svg`. Its full-screen, theme-aware opening overlay is defined in `site/assets/css/about.css`, and `site/assets/js/about-intro.js` handles temporary scroll locking and releases the page after the CSS intro animation. The About hero uses the same page-only stylesheet for its fixed headline styling and rotating crimson final word; `site/assets/js/about-hero.js` cycles through “see”, “touch” and “verify” every two seconds with a fade-and-slide entrance, while respecting reduced-motion preferences. These assets are referenced only by `site/pages/about.html`; the homepage and other pages do not load them. The SVG source is reused unchanged and retains its own reduced-motion behavior.

## Contact page

The publication Contact page is implemented at `site/pages/contact.html`. It uses the shared topbar, main navigation header and footer. Its page-only stylesheet is `site/assets/css/contact.css`, and its page-only interactions are in `site/assets/js/contact.js`; neither Contact asset is loaded by the homepage. The page provides a recipient selector, an icon-bearing email-provider dropdown, a Proceed action, five detailed email contact cards with individual copy controls, and the official social links. The shared footer links to the Contact page, and the canonical page URL is included in `site/sitemap.xml`. The parent-brand address `official@luxraj.com` is intentionally not listed among publication contacts.

```text
site/pages/contact.html
site/assets/css/contact.css
site/assets/js/contact.js
documentation/Contact.md
```

## Editor's Desk

The Editor's Desk is the personal editorial column of Luxraj Kayal, Founder & Editor-in-Chief. It is implemented as an independent page module and is not part of the reusable article-author byline system. The page reads entries from one public Markdown file, sorts them by date (newest first), and updates the title, date, type, writing, image and image credit together during navigation. It uses a small built-in Markdown renderer; raw HTML in the content file is escaped.

The module uses the shared topbar, main-header and footer markers. Its page-specific CSS and JavaScript load only on the Editorial page. The static-site builder copies `site/content/editorial-notes.md` to the public output as a text asset without needing a build-script change. The shared footer links to the page and its canonical URL is listed in `site/sitemap.xml`. Sample Unsplash image references are demonstration material; replace them with approved editorial imagery before publication.

```text
site/pages/editorial.html
site/assets/css/editorial.css
site/assets/js/editorial.js
site/content/editorial-notes.md
site/assets/images/editorial/editorial-default.svg
documentation/Editorial-Desk.md
```

**Entry format:** Add new entries at the top of `editorial-notes.md`. Each entry uses ENTRY / END ENTRY markers, a date, type, title, image URL, alt text, image credit/source and Markdown body. The byline remains fixed in the page template. The accepted types are Daily, Weekly and Monthly. Blank or failed image URLs use the local fallback SVG.

## 1. Public Website — GitHub Pages

The active workflow builds `site/` into `_site/` and deploys only `_site/`. The homepage is the **only file named `index.html`** in the public website. Category and subcategory landing pages use descriptive, unique names ending in `-index.html`; articles use descriptive filenames in each subcategory's `articles/` directory. Do not add nested `index.html` files.

```text
site/
├── index.html
├── categories/
│   ├── tech-news/tech-news-index.html
│   │   ├── ai/tech-ai-index.html
│   │   ├── phones/tech-phones-index.html
│   │   └── ... remaining Tech News subcategories
│   ├── engineering/engineering-index.html
│   │   ├── electrical/electrical-engineering-index.html
│   │   ├── mechanical/mechanical-engineering-index.html
│   │   ├── labs/engineering-labs-index.html
│   │   └── drone-technology/drone-technology-index.html
│   ├── reviews/reviews-index.html
│   ├── how-to/how-to-index.html
│   ├── hardware/hardware-index.html
│   ├── software/software-index.html
│   └── buying-advice/buying-advice-index.html
├── pages/                        # Standalone utility/legal pages, when present
├── assets/
│   ├── css/                      # Shared stylesheets, including shared-h1.css, eyebrows.css, breadcrumbs.css, tokens.css, article-layout.css and reusable author-bar.css
│   ├── images/
│   └── js/                       # Shared scripts, including author-bar.js, author-library.js and article-share.js
├── sitemap.xml                   # Canonical URLs only
└── 404.html
```

There are seven main categories and 44 subcategories, including Drone Technology under Engineering. Every subcategory stores its articles in its own `articles/` folder beneath `site/categories/`. Category and subcategory landing pages use unique, descriptive filenames ending in `-index.html`; `site/index.html` is the only file named `index.html`. Each page's `data-site-root` is set for its directory depth so navigation, search and shared assets work from nested paths.

The legacy redirect pages and their top-level folders, `site/sections/` and `site/articles/`, have been removed. The empty `site/templates/article-template.html` placeholder was intentionally removed as well. No universal article-content template is mandated. The optional `site/partials/article-layout.html` provides only the shared page frame; each opted-in article supplies its own HEADER and CONTENT slots. The first implementation test is `a-pre-flight-inspection-checklist-for-small-drones.html`; the other articles have not been migrated. The canonical sitemap lists 112 URLs: one homepage, 51 category/subcategory landing pages and 60 sample articles.

The existing CSS files were not changed as part of this cleanup.
## 2. Initial Authoring and Publishing Workflow — VS Code, Git and GitHub

No separate Article Studio or backend article-writing tool will be built for the initial release. The owner will create and edit each article directly as an HTML file in Visual Studio Code. Articles may use custom HTML structure and article-specific CSS/JavaScript when justified; a shared starter file is optional and must not force all articles into the same layout. For an article image selected for the planned hero showcase, add the `data-hero-image` attribute to that image element; the homepage hero in `hero-showcase.js` reads only that marked image and the article's first h1. Maintain the manually curated list of up to five same-origin article URLs in `site/assets/js/hero-showcase.js`; it rotates every five seconds, places previous/next arrow controls over the image, overlays a one-line truncated headline with a small open icon, pauses while hovered or focused and when the tab is hidden, and disables automatic rotation for reduced-motion users. It has no duplicate featured-article label or separate bottom control bar. Prefer local WebP assets with paths that resolve from the article page.

```text
Local project folder
└── site/
    ├── index.html             # Homepage; the only index.html
    ├── categories/
    │   └── <main-category>/
    │       ├── *-index.html   # Main category landing page
    │       └── <subcategory>/
    │           ├── *-index.html
    │           └── articles/*.html
    ├── pages/                 # Standalone pages, when present
    ├── assets/                # Shared CSS, JavaScript, images and UI assets
    ├── sitemap.xml
    └── 404.html

Git repository
└── GitHub remote              # Version history and backup/collaboration
```

**Working cycle:**
1. Create or edit one scoped fragment in VS Code.
2. Run `node scripts/build-site.mjs` and preview the generated `_site/` output locally in a browser.
3. Check responsive behaviour, links, browser-console errors and basic accessibility.
4. Check SEO basics for each article: unique title and description, meaningful headings, descriptive URL/slug, canonical URL when appropriate, image alt text, and social-preview metadata.
5. Run relevant Lighthouse/PageSpeed checks at suitable milestones rather than after every tiny text edit.
6. Commit the tested change in Git and push it to GitHub. Do not label a known-broken change as a good checkpoint.
7. Push tested changes to GitHub; the Pages workflow builds and deploys `_site/`. Verify the live URL and update sitemap/listings as needed.

**Initial tool shortlist:**
- Visual Studio Code — editing individual HTML/CSS/JS files.
- Git — local version history and checkpoints.
- GitHub — remote repository and change history.
- Browser Developer Tools — console, network, device/responsive testing.
- Google Lighthouse / PageSpeed Insights — performance, accessibility, SEO and best-practice audits.
- Google Search Console — indexing, search performance and sitemap monitoring after the domain is ready.
- Bing Webmaster Tools — optional additional search-engine monitoring.
- Google Trends — optional topic research; not a technical requirement.

These tools are recommendations, not an instruction to sign up for every service immediately. No SEO tool can guarantee indexing or ranking.

---

## 3. Optional External Services

The current website uses static HTML, CSS, JavaScript and local article metadata. A database or control panel is not required for the current scope. Large media storage (for example, Cloudflare R2) may be evaluated separately if needed; no external backend or media service is assumed to be configured.

## 4. Publishing Flow

```text
VS Code article authoring
        │
        ├── Create/edit and preview custom article HTML
        ├── Validate article ID, metadata, links and media references
        └── Prepare article for publication
                    │
                    ▼
          GitHub Pages workflow (builds `site/` into `_site/` and deploys `_site/`)
                    │
                    ├── Article has a stable public URL
                    └── Sitemap/public article listing is updated

Manual source edits in VS Code ─► Git/GitHub ─► approved site deployment

Large media ─────────────────► Cloudflare R2
```

The GitHub Pages workflow runs `node scripts/build-site.mjs` before deployment. Every populated HTML source page must contain exactly one marker for TOPBAR, MAIN-HEADER, and FOOTER. Article pages that opt into the shared frame also contain one `SHARED:ARTICLE-LAYOUT` marker and one pair each of `ARTICLE:HEADER` and `ARTICLE:CONTENT` slot markers. The builder inserts the source slots into the shared frame at build time, validates the assembled article header/grid/sidebar rail, and leaves pages that do not opt in unchanged. It also fails on missing required shell markers or leftover hardcoded shared components. Empty HTML placeholders remain untouched.

---

## 5. File and Naming Rules

1. **One article, one HTML file** under `site/categories/<main-category>/<subcategory>/articles/`, with custom article-specific styling or scripting when needed.
2. Each main category and subcategory has its own uniquely named landing page under `site/categories/`. Do not add nested files named `index.html`.
3. Keep article files in the `articles/` folder of their matching subcategory. Update article listings, the article metadata index and sitemap when canonical content is deliberately added, moved or removed.
4. No shared article-template file is currently present. Create one only as a separate, deliberate task; do not assume the removed empty placeholder is available.
5. Use stable lowercase filenames with hyphens; avoid spaces and frequent URL changes.
6. Keep article IDs distinct from media IDs. IDs support management and references; they are not secrets or access controls.
7. Keep large media in R2 and store references/metadata where appropriate.
8. Keep public website source, local drafts and secrets separated. Never put credentials or private keys in public files.
9. Add shared CSS/JS files only when there is a real need for shared behavior; do not create empty files just to match this map.
10. Preserve the existing file map and architecture decisions as the project evolves. Update this document when the actual structure changes.
11. Do not treat optional files or proposed component names as final until explicitly approved.

---

## 6. Decisions Still Open

- Whether to retain descriptive `.html` filenames for article URLs or adopt clean directory URLs in a future, explicitly planned change.
- How homepage selections, metadata and settings should be represented in static source files.
- Further automation for article listings and sitemap updates.
- Whether search is generated at build time, uses a client-side index, or uses another method.
- Final CSS/JavaScript module boundaries after the first working skeleton.
- Whether the optional `manifest.webmanifest`, contact page, analytics and self-hosted fonts are needed.

**Guiding principle:** start with the smallest working structure, keep article URLs stable, and add files when the corresponding feature is implemented.

## Repository boundary reminder

- Keep all planning files under the repository-root `documentation/` directory, outside `site/`.
- Keep public HTML, CSS, JavaScript, and public-site asset placeholders under `site/`.
- Do not include the root `documentation/` directory in the public website's deployment output.
- The existing root `README.md` is not modified as part of the skeleton.
