# Luxraj Blog — Build and Planning Log

**Implementation status:** Initial shared navigation/search/theme implementation completed; broader homepage and editorial content build remains in progress.

Append-only after implementation begins. Record real milestones only; do not pre-fill future work as completed.

## Planning milestone — 2026-10-25
- Discussed excluding a separate backend/local Article Studio from the initial scope.
- Updated draft workflow to author individual HTML articles in VS Code, use proposed Git/GitHub checkpoints, and include SEO fundamentals from the beginning.
- Hosting/deployment, backend, and control-panel choices remain unresolved.
- No code, repository, or deployment changes were made.


## 2026-10-25 — Article-group page planning update

- Documented the homepage → group landing page → individual article hierarchy.
- Recorded six linkable sample articles per final group for development testing and a canonical article-template contract.
- Updated planning documents only; no repository or deployment changes occurred.

## 2026-10-25 — Initial repository skeleton

- Added a blank public-site skeleton under `site/`.
- Added root-level `documentation/` with the planning reference files.
- Added a separate blank `control-panel/` skeleton for the future application.
- Added six blank sample article files in each of the five currently listed article groups (30 sample files total).
- No website implementation code or article content was added. The existing root `README.md` was left unchanged.


## 2026-10-25 — Main header, category destinations, search and theme

- Implemented the single-row CNET-inspired navigation with the supplied transparent-symbol SVG and a bold uppercase crimson LUXRAJ wordmark that remains crimson across themes.
- Added direct parent links and separate click-operated dropdown controls for Tech, Reviews, How To, Hardware, Software and Buying Advice; hover does not open menus.
- Added dedicated parent and dropdown-category landing pages and linkable sample article HTML pages for all current menu categories.
- Implemented the search popup with text search, category filtering, a reading-time slider and sorting by date/category/article title.
- Implemented a persistent light/dark theme toggle and placed JavaScript in the existing `site/assets/js/` structure with `main.js` as the entry point.
- Added responsive navigation and updated the file map and navigation planning documents. The finalized copper topbar stylesheet and design tokens were not changed.


## 2026-10-27 — Control panel removed

- Deleted the complete `control-panel/` directory and its HTML/CSS/JavaScript placeholders.
- Updated `.github/workflows/pages.yml` to publish only `site/`; removed the `/dev/` assembly, control-panel existence check, and control-panel path trigger.
- Updated active architecture and feature planning documents to use manual source-file configuration instead of a control-panel workflow.
- No public-site source files were changed as part of this removal.


## 2026-10-27 — Category folder migration

- Reorganized seven main categories and 44 subcategories beneath `site/categories/`, using distinct descriptive landing-page filenames. `site/index.html` remains the only `index.html` page.
- Migrated 40 existing populated sample articles into their subcategory-specific `articles/` folders with descriptive filenames.
- Added Engineering's Electrical Engineering, Mechanical Engineering, Labs and Drone Technology topic pages, with five sample articles per topic.
- Updated article-index hrefs, the dynamic Engineering navigation, local links/assets and each page's `data-site-root`.
- Preserved old `sections/` and `articles/` URLs with compatibility redirects and regenerated the canonical sitemap with 112 URLs.
- Kept all CSS files unchanged.

## 2026-10-27 — Legacy redirect and template-placeholder cleanup

- Deleted 52 legacy landing-page redirect files from `site/sections/` and 46 legacy article redirect files from the top-level `site/articles/`.
- Removed the now-empty legacy folders; canonical category pages and articles remain under `site/categories/`.
- Intentionally deleted the empty `site/templates/article-template.html` placeholder. No shared article-template file currently exists.
- Kept the canonical sitemap unchanged at 112 URLs and preserved the existing CSS files.
- Updated `documentation/Luxraj-Blog-FileMap.md` to describe the actual repository structure.

## 2026-10-27 — Shared shell components and homepage-only build

- Added source-only partials for the topbar, main navigation header (including the search dialog), and footer under site/partials/.
- Added scripts/build-site.mjs to expand explicit shared-component markers into full HTML at build time, resolve local component links for the current page depth, exclude source partials from public output, and verify the built homepage shell.
- Migrated only site/index.html to shared markers. Category, subcategory, article, and other pages retain their existing markup until the owner approves each subsequent migration step.
- Kept the footer content blank and retained the existing dedicated CSS files.
- Updated the GitHub Pages workflow to run the build before deployment and updated the file map to describe the implemented source/build/output structure.


## 2026-10-27 — Source-level shared shell migration

- Migrated all 112 populated HTML pages under `site/` to one explicit marker each for the canonical topbar, main header/search dialog, and footer.
- Removed the duplicated inline topbar, main header, and search dialog from category, subcategory, and article source files; replaced any existing shared footer shell where present, and added the shared footer marker to each populated page.
- Preserved page-specific content, metadata, URLs, CSS references, and JavaScript; five empty HTML placeholders were left unchanged.
- Reworked `scripts/build-site.mjs` into a marker-only assembler. It rejects populated pages with missing/duplicate markers or leftover hardcoded shared shell markup instead of automatically replacing legacy source markup.
- Updated the file map to describe the source-level shared-component structure and strict build behavior.

## 2026-10-27 — Initial shared footer content

- Replaced the empty footer partial with a brand summary, round author avatar/profile link, seven main-category links, the existing article-search trigger, a link to the public source repository, copyright, and Back to Top.
- Kept the author-page destination at the requested temporary `https://example.com` URL; the avatar uses the repository owner's public GitHub profile image.
- Implemented responsive footer columns and theme-aware text masks so the circuit pattern does not show through the footer's text.
- Left optional RSS/Atom/JSON feeds, recent-posts module, status page, newsletter, social-link list, and unfinished policy destinations out of this implementation.

## 2026-10-27 — Dark theme first-visit default

- Changed the theme initializer fallback to dark mode when no valid preference is saved; saved `light` or `dark` values continue to take priority.
- Kept the existing localStorage key and theme-toggle persistence behavior unchanged.
- Updated the design-token documentation to reflect the dark first-visit default.

## 2026-10-27 — Remove source-code link from footer

- Removed the “Source Code on GitHub” item from the shared footer Quick Links section.
- Kept the existing Search Articles action and all other footer content unchanged.
- Updated the FileMap footer description to match the current content.

## 2026-10-27 — Sticky main header

- Changed the shared main header from normal relative positioning to `position: sticky; top: 0`, so it scrolls up beneath the topbar and remains pinned at the viewport top once it reaches that edge.
- Kept the existing header height, colors, navigation, dropdown, search, and theme styling unchanged.

## 2026-10-27 — Prepare five tagged hero-image samples

- Added one local WebP sample image to each of five Tech News articles: AI on the edge, phone hardware, computer processors, display refresh rates/HDR, and gaming PC upgrades.
- Marked each chosen article-body image with `data-hero-image` and added accessible alt text and a short illustrative caption.
- Added responsive featured-image styling to `section-page.css` and documented the image-marker convention in the FileMap.
- Prepared source articles for the future curated hero showcase; no hero carousel or image-fetching logic was added in this step.

## 2026-10-28 — Curated homepage hero showcase

- Replaced the homepage's decorative LO visual with a curated article slide that retrieves each configured article's h1 and explicitly marked `img[data-hero-image]` from same-origin article HTML.
- Configured five manually maintained article URLs in `site/assets/js/hero-showcase.js`; changing that list controls which articles appear, up to five.
- Added five-second automatic rotation, previous/next controls, slide indicators, pause/play, pause-on-hover, tab-visibility handling, and reduced-motion support.
- Added responsive showcase styling in `hero.css` and initialized it from `main.js`; image and headline links each point to the exact configured article URL.
- Kept the rest of the homepage content and all article sources unchanged.

## 2026-10-28 — Compact hero showcase layout

- Moved the curated article headline onto the bottom of the image with a dark gradient, single-line ellipsis truncation, and a small open-article icon.
- Moved previous/next arrows to the left and right sides of the image; removed the duplicate featured-article label, separate Read article link, dots, and bottom control bar.
- Kept the top Editor's Picks label and slide counter, the five-second rotation interval, exact article links, and pause-on-hover/focus and hidden-tab handling.

## 2026-10-28 — Add hero-section editing guide

- Added `Edit-Guide/hero-section-link -edit.md` with instructions for editing the manual `FEATURED_ARTICLE_URLS` list in `site/assets/js/hero-showcase.js`.
- Documented the site-root-relative URL format, the article `h1` and `img[data-hero-image]` requirements, the five-article limit, rotation order, and publish/verification workflow.
- Documented the new `Edit-Guide/` folder in the FileMap; no website runtime files were changed.

## 2026-10-28 — Add topbar-links editing guide

- Added `Edit-Guide/topbar-links -edit.md` with the source file, exact markup patterns, and steps for updating the logo/home link, slogan, newsletter destination, social profiles, email address, and About link.
- Documented the `{{ROOT}}` path token, the shared partial/build workflow, and the distinction between content edits in `topbar.html` and visual changes in `topbar.css`.
- Kept the FileMap and all public-site runtime files unchanged.

## 2026-10-30 — Remove redundant homepage sections

- Removed the “Browse by Interest / Explore the topics” category-card section from `site/index.html`.
- Removed the hardcoded “Latest Sample Stories / Fresh perspectives” article-card section and the temporary development-preview notice from the homepage; the linked sample article files remain intact.
- Removed the homepage's now-unused `section-page.css` stylesheet reference and obsolete homepage-only category-grid, spacing and development-notice CSS, including their responsive rules.
- Preserved the homepage hero and Editor's Picks carousel, shared topbar/header/footer, article files, shared article-card styling used by category pages, and the FileMap.

## 2026-10-30 — Add Technical Pioneer homepage placeholder

- Added a blank “Technical Pioneer born today” section immediately below the homepage hero.
- Created a dedicated `technical-pioneer.css` stylesheet for the section title and empty bordered panel, matching the homepage hero's surface, border, radius and width conventions.
- Kept the section content empty; no person data, image, quotation, article link, fetch logic or JavaScript was added.
- Left the existing hero, shared header/footer, FileMap and article files unchanged.

## 2026-10-30 — Keep Technical Pioneer placeholder blank

- Removed the visible section heading from the homepage; the section now contains only its empty bordered panel.
- Removed the heading-specific CSS. Kept the section's accessible label, position, panel dimensions, border, radius, and dedicated stylesheet.
- No data, image, quotation, article card, fetching logic or JavaScript was added.

## 2026-10-30 — Add SEO heading to Technical Pioneer section

- Added the eyebrow “On This Day in Science & Engineering”, the H2 “Famous Scientists, Engineers & Inventors Born Today”, and a concise supporting description above the existing empty panel.
- Kept the content panel blank; no person data, portrait, quotation, article details, external fetch, or JavaScript was added.
- Kept all section typography and layout in the dedicated `technical-pioneer.css` file. The FileMap and unrelated homepage components were not changed.

## 2026-10-30 — Refine Technical Pioneer description

- Replaced the Technical Pioneer section's introductory description with concise wording focused on a relevant theory, principle or original passage paired with a related Luxraj article.
- Preserved the heading, empty content panel, section layout, dedicated stylesheet and all other homepage content.
- No daily data, images, quotations, article content or fetching behavior was added.

## 2026-10-30 — Widen Technical Pioneer description

- Removed the 900px intro-container and 75ch description width caps so the supporting description can use the available homepage content width on desktop.
- Kept natural text wrapping for smaller viewports; did not force `white-space: nowrap` or change typography, spacing, heading, or panel dimensions.

## 2026-11-02 — First shared article-layout implementation

- Added the optional source-only `site/partials/article-layout.html` frame and extended `scripts/build-site.mjs` to assemble article-specific HEADER and CONTENT slots at build time. Pages that do not use the optional marker continue through the existing shell build unchanged.
- Applied the frame only to `site/categories/engineering/drone-technology/articles/a-pre-flight-inspection-checklist-for-small-drones.html` as the approved first test article.
- Kept the breadcrumb, title, description, author/date row and share/copy controls in the full-width entry header. The featured image, article body and references occupy the left column. The right sidebar rail is empty; no ad slots, ad elements or ad data were added.
- Added `site/assets/css/article-layout.css` for the shared frame geometry and `site/assets/js/article-share.js` for the header's share/copy controls. Existing article CSS files and other article HTML files were not changed.
- At a 1,100px viewport, the 80rem maximum container with 1rem side gutters and a 12-column 8/4 grid with 3rem gaps produces a 696px article column, 48px gap and 324px sidebar rail. The two columns stack below 1,024px.
- Updated the FileMap. GitHub Actions run [#125](https://github.com/LuxrajKayal/Luxraj-Blog/actions/runs/41497622839) completed successfully, including the public-site build and GitHub Pages deployment.


## 2026-11-03 — Unify page-title typography

- Added universal page-title tokens for desktop/mobile size, display weight and tight display letter spacing, preserving the established landing-page H1 appearance.
- Updated the global H1 rule in `base.css` to use those tokens.
- Removed duplicate H1 typography overrides from `section-page.css`, `responsive.css` and `article-layout.css`; component-specific spacing and the article introduction's responsive sizing remain.
- Added `base.css` to the approved pre-flight test article so its entry H1 uses the same universal H1 rule as landing pages. Removed the now-unused Source Serif 4 font request from that test page.
- Other article pages were not migrated or modified. The change is limited to the shared H1 foundation and the existing approved test article.


## 2026-11-03 — Allow article introduction to use full header width

- Removed the `max-width: var(--content-width-reading)` constraint from `.article-introduction` in `site/assets/css/article-layout.css`.
- Preserved its existing font, font size, weight, text color, line height and top spacing. The description now uses the available article-entry header width and wraps naturally.
- Did not change the global `--content-width-reading` token or any other article layout rules.


## 2026-11-03 — Unify breadcrumb component styling

- Moved the existing landing-page `.breadcrumbs` rules into the dedicated `site/assets/css/breadcrumbs.css` stylesheet without changing their normal or hover colors, spacing, or typography.
- Made `section-page.css` import the shared breadcrumb stylesheet so existing landing pages retain their appearance.
- Changed the approved article-layout test page to use the same `.breadcrumbs` class and standard separator markup, and loaded `breadcrumbs.css` directly.
- Removed the duplicate `.article-breadcrumb` rules from `article-layout.css`. The article and landing pages now share one breadcrumb selector and one visual implementation.
- Updated the FileMap. No other article pages or breadcrumb content were migrated.


## 2026-11-03 — Centralize eyebrow design

- Added dedicated `--lux-eyebrow-*` brand tokens for the eyebrow red, font family, size, weight, letter spacing, line height and uppercase transformation. Values match the existing category landing-page eyebrow treatment and remain consistent across light and dark themes.
- Added `site/assets/css/eyebrows.css` as the single shared typography and colour implementation for page, article, story-card, hero-showcase, search-result, author-card and Technical Pioneer eyebrow selectors.
- Imported the shared stylesheet from `search.css`, which is already loaded by the populated site pages.
- Removed duplicate eyebrow typography and colour rules from `layout.css`, `article-layout.css`, `section-page.css`, `hero.css`, `search.css` and `article-page.css`.
- Preserved component-specific spacing and layout rules. Eyebrow wording remains authored in each HTML page or component; no page copy was changed.


## 2026-11-03 — Increase centralized eyebrow text size

- Increased `--lux-eyebrow-font-size` in `site/assets/css/tokens.css` from `0.72rem` (approximately 11.5px) to `0.875rem` (14px) to improve visibility across all centralized eyebrow components.
- Left eyebrow colour, font family, weight, letter spacing, line height, text transformation, component spacing and page content unchanged.


## 2026-11-03 — Centralize standard H1 typography

- Added dedicated `--lux-h1-*` brand tokens for font family, responsive size, weight, line height, letter spacing, text color and text wrapping. The values preserve the existing standard category/subcategory H1 appearance.
- Added `site/assets/css/h1.css` as the single standard H1 typography implementation and imported it through `search.css`, which is already loaded by populated pages including article pages that do not load `base.css`.
- Removed the standard H1 typography rule from `base.css`; its shared heading defaults now apply to H2–H6, while H1 typography is owned by `h1.css`.
- Kept the homepage hero H1 typography unchanged in `hero.css`. Its more-specific component rule continues to override the standard H1 style intentionally.
- Preserved component-specific H1 margins and layout rules in `section-page.css` and `article-layout.css`. No HTML content or heading text was changed.

- Corrected the H1 token-section comment labels; no token values or rendered styles changed.


## 2026-11-03 — Rename shared H1 stylesheet

- Renamed `site/assets/css/h1.css` to `site/assets/css/shared-h1.css` to distinguish the shared standard H1 system from the homepage hero's independent H1 styling.
- Updated the import in `search.css` and the stylesheet references in the FileMap.
- Kept the stylesheet contents, H1 tokens, selectors, typography, responsive behavior and homepage hero styling unchanged.

## 2026-11-03 — Implement reusable author details bar pilot

- Added the standalone, reusable `site/assets/css/author-bar.css` component stylesheet. Author-bar styling is not placed in `article-page.css` and is not tied to one page layout.
- Added `site/assets/js/author-bar.js` to render the single horizontal author and sharing bar using the article's author ID and article-specific publication/modification dates.
- Extended `site/assets/js/author-library.js` with a temporary Luxraj Kayal sample record containing the author name, handle, author-page route and sample photograph.
- Updated `main.js` to initialize the new author bar. The old author-card module and stylesheet were not repurposed as the new bar.
- Updated `article-share.js` for the bar's Copy Link and Instagram device-share/copy-fallback controls while retaining support for the older article-share attributes. Facebook and X use their share links.
- Replaced the previous metadata/share row only in `a-pre-flight-inspection-checklist-for-small-drones.html`, loaded `author-bar.css`, and kept its existing SEO author metadata unchanged.
- The sample portrait is a temporary crop from the approved author-bar design reference. The author profile route is provisional until the author page exists.
- Other articles were not migrated. The new component is a pilot and should be visually reviewed before wider rollout.

## 2026-11-03 — Refine author bar as open editorial byline

- Reworked the author bar to follow the approved editorial byline reference: small circular author avatar; author name and handle on one line; published and updated dates on the line below; sharing controls aligned to the right.
- Removed the enclosing panel treatment from `author-bar.css`: no outer background, rounded container, border on all four sides or card shadow. The bar is defined by thin top and bottom rules.
- Changed the sharing area to a compact SHARE label followed by circular X, Facebook, Instagram and copy-link controls.
- Kept the bar standalone in `author-bar.css` and the renderer in `author-bar.js`. Only the existing pilot article uses this component; other articles remain unchanged.

## 2026-11-03 — Set author name to Lux Red and refine copy-link icon

- Changed `.author-bar__name` to use the shared `--brand-crimson` Lux Red token.
- Replaced the copy-link icon path with a clearer linked-chain outline and explicitly applied an unfilled SVG stroke using `currentColor`.
- Styled the copy-link control with the semantic surface, text, border and action tokens so its contrast and hover state adapt to light and dark themes.
- Left the byline layout, author handle, other social icons and article integration unchanged.

## 2026-11-03 — Repair clipboard fallback and unify share-control theme styling

- Updated the Copy Link handler to fall back to the legacy selection-copy attempt when the Clipboard API is present but rejects its write request, rather than only falling back when the API is absent.
- Added a final manual-copy prompt when automatic clipboard methods are blocked. The CMS does not report a manual prompt as an automatic copy.
- Added visible temporary feedback to the copy control for copied, manual-copy and failed states, while retaining the screen-reader status message.
- Extended the author bar's semantic, theme-aware border, surface, text and hover styling consistently across X, Facebook, Instagram and Copy Link controls.
- Kept X and Facebook as direct share-page links; Instagram continues to use the device share interface with a copy/manual fallback.

## 2026-11-05 — Rename FileMap for Luxraj Blog

- Renamed the active FileMap to `documentation/Luxraj-Blog-FileMap.md` and updated its title, project-domain reference, and repository-root folder name.
- Updated the FileMap reference in `PLAN_INDEX.md`, `UPDATE-NOTES-ARTICLE-GROUPS.md`, and this Build Log so each active reference resolves to the renamed file.
- Updated the related Technical Pioneer article-brand wording and refreshed the historical GitHub Actions run URL to the renamed repository path.
- Preserved standalone `Lux` design-token identifiers and the `Restore/` historical snapshot.


## 2026-11-05 — Rename Lux Omni project identity to Luxraj

- Updated active project documentation, editing guides, planning references, site metadata, category headings, shared components, CSS/JavaScript comments, and the article-page metadata from Lux Omni to Luxraj.
- Renamed the active planning-document filenames and the CMS planning guide to use Luxraj naming, then updated active links and FileMap references to the new filenames.
- Updated the public blog domain references to `blog.luxraj.com` and the main-site references to `luxraj.com`; refreshed the sitemap URLs and GitHub Pages project-path references for the renamed `Luxraj-Blog` repository.
- Renamed the active brand and UI image assets to Luxraj filenames and updated the source references to those assets.
- Renamed the tag-selection custom event from `luxomni:tag-select` to `luxraj:tag-select` in both its dispatcher and listener, and renamed the theme preference key to `luxraj-blog-theme`.
- Updated the article social-handle placeholder to `{{LUXRAJ_X_HANDLE}}`.
- Removed the old Facebook profile link because its replacement Luxraj profile URL has not been supplied; no replacement account URL was guessed.
- Left standalone `Lux` identifiers and all content under `Restore/` untouched.
- The GitHub Pages build and deployment workflow completed successfully for the final site-code commit `dbc575641a71f226b46e8678b379ba7394b5e36f`.


## 2026-11-06 — Finish the topbar brand identity

- Applied the existing publication motto, “Technology. Without the noise.”, to the shared topbar so the message now matches the homepage title and footer tagline.
- Removed generic social-platform homepage links and placeholder newsletter, email, and About destinations from the topbar. The only external link retained is the confirmed Luxraj GitHub profile.
- Preserved the shared topbar partial, build-safe `{{ROOT}}` homepage link, visual styling, and mobile horizontal layout.
- Updated the topbar editing guide to describe the actual component and require confirmed destinations before adding links.


## 2026-11-06 — Verify topbar build and deployment

- GitHub Actions completed the site build, artifact upload, and GitHub Pages deployment successfully for the topbar source change in commit `7cb58da06a36c1da571c124c804f7bc9135d26ca`.

## 2026-11-18 — Diagnose and resolve the Luxy mascot white backdrop

### Symptom

- The Luxy Assistant search dialog displayed an unwanted white rectangular area behind the mascot while the surrounding interface was in dark mode.
- The visible rectangle remained after the mascot SVG source was changed from the 80-mode master asset to the separate `Luxy-icon-small.svg` asset.
- The issue was isolated to the mascot's external SVG embedding context; the final fix did not change the mascot artwork, the dialog surface, or the global theme palette.

### Investigation and unsuccessful hypotheses

1. **Reviewed the theme tokens and dialog surfaces.** `site/assets/css/tokens.css` sets the dark theme's `color-scheme: dark`, `--color-page: #171717`, `--color-surface: #262626`, and `--color-surface-raised: #303030`. `site/assets/css/search.css` uses the raised-surface token for the dialog. The utility row itself has no background declaration.
2. **Reviewed the mascot wrapper and object styles.** In `site/assets/css/luxy-assistant.css`, `.luxy-mascot` has `background: transparent`; `.luxy-mascot__svg` (the HTML `object` element) has transparent background declarations, including `background-color: transparent !important`. No explicit white surface was found on these selectors.
3. **Inspected the master SVG.** Its root SVG already declares a transparent background style. The file contains `pagecolor="#ffffff"` inside Inkscape's `sodipodi:namedview` metadata, which initially looked suspicious. The artwork also contains intentional white and cream fills, but no full-canvas white background shape was identified.
4. **Isolated the external object.** A temporary test removed the embedded SVG while retaining the `.luxy-mascot` wrapper. The markup was then changed to use the existing small mascot SVG so the source asset could be compared while keeping the same object element and CSS class.
5. **Compared the alternate SVG.** The user confirmed that the white rectangle remained with `Luxy-icon-small.svg`. This showed that the symptom was not exclusive to the master SVG artwork.
6. **Tested the Inkscape-metadata theory.** In a reversible test, `Luxy-icon-small.svg` was changed from `pagecolor="#ffffff"` to `pagecolor="transparent"`, and an explicit transparent background style was added to its root SVG. The user confirmed that the white rectangle still remained. This ruled out that metadata change as the effective fix for this issue.
7. **Reverted the unsuccessful tests.** The original master SVG reference and original SVG source were restored. The metadata test and alternate-asset changes were also reverted before the final CSS experiment.

### Relevant browser and standards research

- A close community reproduction was found in the Stack Overflow discussion [Why does `color-scheme: dark` cause `<object>`s to have white backgrounds in Chrome?](https://stackoverflow.com/questions/70352898/why-does-color-scheme-dark-cause-objects-to-have-white-backgrounds-in-chrom). The reported workaround was to set `color-scheme: light` on the embedded object.
- A related browser report is recorded in [Mozilla Bugzilla issue 1979337](https://bugzilla.mozilla.org/show_bug.cgi?id=1979337), concerning dark color schemes and white backgrounds on embedded document elements.
- The behavior is also relevant to the [CSS Color Adjustment Module Level 1](https://www.w3.org/TR/css-color-adjust-1/), which describes how color-scheme affects document and canvas rendering in embedded contexts.
- These reports supplied a strong hypothesis, but the repository's own preview test was required to confirm it for Luxy.

### Confirmed fix

- Added one declaration to the existing base `.luxy-mascot__svg` rule in `site/assets/css/luxy-assistant.css`:

      color-scheme: light;

- This is applied to the HTML `object` element through its existing `.luxy-mascot__svg` class. It gives the embedded SVG its own light color-scheme context while the surrounding Luxraj page and dialog remain in dark mode.
- No change was made to the global `:root[data-theme="dark"]` setting, the theme tokens, the dialog surface, the mascot SVG source, the markup, dimensions, grid placement, or responsive rules.
- After the CSS-only test was deployed to the preview site, the user confirmed that the white rectangle disappeared. This is the successful, user-verified resolution.

### Test and deployment record

| Stage | Primary development commit | Preview commit | Result |
|---|---|---|---|
| Empty-wrapper isolation setup | `f542c1e` | `53b5f43` | Temporary test setup; wrapper retained |
| Alternate small SVG test | `37d34ca` | `e141045` | White rectangle remained |
| Restore original mascot markup | `d6127cd` | `18d4260` | Original master SVG reference restored |
| SVG metadata transparency experiment | `f0eff4d` | `cf4b002` | White rectangle remained |
| Revert metadata and alternate-SVG tests | `533733d` | `f911eaf` | Original SVG and markup restored |
| Final color-scheme fix | `c7c7650` | `249de81` | User confirmed white rectangle disappeared |

- The final CSS fix changed only `site/assets/css/luxy-assistant.css` on the development and preview branches.
- The final development and preview repository trees were verified identical at `c53b0bffe81575b2a9ecdf0a610b0e3496e593f0`.
- Preview GitHub Actions deployment run [#44154705678](https://github.com/LuxrajKayal/Luxraj-Blog-Preview/actions/runs/44154705678) completed successfully.
- The production `Luxraj-Blog` `main` branch was not used for the implementation or visual test. This log entry is being added to production `main` separately as documentation only, by explicit owner approval.

### Lessons and future reference

- A transparent background on the HTML `object` and its wrapper does not, by itself, guarantee that the embedded SVG document's canvas will be transparent in every color-scheme context.
- When an external SVG embedded with `<object>` shows a white rectangle in a dark interface, inspect the embedding element's `color-scheme` as well as the SVG source, metadata, and parent backgrounds.
- Changing SVG artwork or editor metadata should not be the first response when the same symptom appears with multiple SVG files. Compare the common embedding path and theme context first.
- Keep the global theme unchanged when only one embedded asset needs a different color-scheme context. The local `.luxy-mascot__svg { color-scheme: light; }` override solved this case without changing the rest of the interface.
- Preserve each isolation test and rollback point. The alternate SVG and metadata experiments were useful for narrowing the cause, even though neither was the fix.

- **Final status:** Resolved and visually confirmed by the project owner on the preview deployment. No production site code was changed as part of this documentation update.
