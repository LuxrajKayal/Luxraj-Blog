# Luxraj-Blog

## Repository roles and development / testing / production workflow

> [!WARNING]
> **Important instructions for AI assistants and contributors: do not confuse the original repository with the preview repository. They are two separate repositories, not a fork, and they do not synchronize automatically. Follow the workflow below. Do not change the production `main` branch during ordinary development or testing.**

### 1. Original repository — source of truth and production

- **Repository:** [`LuxrajKayal/Luxraj-Blog`](https://github.com/LuxrajKayal/Luxraj-Blog)
- **Local Git remote:** `origin`
- **Development branch:** `feature/luxy-rebuild`
- **Production branch:** `main`
- The local working folder is a clone of this original repository.
- All normal development, edits, and commits are made in the original local repository on `feature/luxy-rebuild`.
- Do not develop directly on the original repository's `main` branch. Keep `main` as the production branch.
- The existing production GitHub Pages workflow is in `.github/workflows/pages.yml`. It deploys from the original repository's `main` branch when its configured site/build paths change.

### 2. Preview repository — separate testing deployment

- **Repository:** [`LuxrajKayal/Luxraj-Blog-Preview`](https://github.com/LuxrajKayal/Luxraj-Blog-Preview)
- **Local Git remote:** `preview`
- **Preview repository branch:** `main`
- **Preview website:** [https://luxrajkayal.github.io/Luxraj-Blog-Preview/](https://luxrajkayal.github.io/Luxraj-Blog-Preview/)
- This is a separate repository, not a GitHub fork. Its `main` branch is a manually updated mirror of the original repository's `feature/luxy-rebuild` branch.
- The preview repository has its own GitHub Pages workflow and deploys its own `main` branch.
- The preview repository is for testing only. It is not the authoritative source of development and it is not the production repository.
- There is no automatic cross-repository synchronization and no cross-repository Actions token. The developer manually pushes the same local development branch to both remotes.

### 3. Local Git remote configuration

The existing local working folder must have these two remotes:

```text
origin   https://github.com/LuxrajKayal/Luxraj-Blog.git
preview  https://github.com/LuxrajKayal/Luxraj-Blog-Preview.git
```

Check them with:

```powershell
git remote -v
```

The local `feature/luxy-rebuild` branch must continue tracking `origin/feature/luxy-rebuild`. Do not change its upstream to `preview` and do not use `git push -u preview ...`.

### 4. Normal development and preview update procedure

Work in the existing local `Luxraj-Blog` folder. Do not create or switch to a separate local clone for the preview repository.

1. Confirm that the active branch is the development branch:

   ```powershell
   git switch feature/luxy-rebuild
   git status
   ```

2. Make and test changes locally. The site build command is:

   ```powershell
   node scripts/build-site.mjs
   ```

   To preview the generated `_site` directory locally:

   ```powershell
   py -m http.server 8000 --directory _site
   ```

   Open `http://localhost:8000` in a browser. Stop the local server with `Ctrl+C`.

3. After the changes are ready, commit them in the normal local repository:

   ```powershell
   git add .
   git commit -m "Describe the change"
   ```

4. Push the commit to the original development branch first:

   ```powershell
   git push origin feature/luxy-rebuild
   ```

5. Push that same local branch and commit to the preview repository's `main` branch:

   ```powershell
   git push preview feature/luxy-rebuild:main
   ```

   This explicit refspec means: take local `feature/luxy-rebuild` and update remote `preview` branch `main`. It does not push to the original production `main`.

6. Check the [Preview repository Actions](https://github.com/LuxrajKayal/Luxraj-Blog-Preview/actions). Its Pages workflow should build and deploy the preview website. Then test the preview URL above.

**Important:** Repeat steps 3–6 for each set of changes that should appear in the online preview. A local commit alone does not update either GitHub repository. Pushing only to `origin` does not update the preview. The separate preview push is required.

### 5. Final release to production

Do not merge the preview repository's `main` into production. The preview repository is only a deployment mirror.

When development and preview testing are complete:

1. Open a Pull Request in the original [`LuxrajKayal/Luxraj-Blog`](https://github.com/LuxrajKayal/Luxraj-Blog) repository.
2. Set **base** to `main` and **compare** to `feature/luxy-rebuild`.
3. Review the changed files and merge only after approval.
4. The original repository's existing Pages workflow then deploys the production site from its `main` branch when its configured deployment paths have changed.

### 6. Safety rules — do not guess

- The original `Luxraj-Blog` repository is the source of truth.
- `origin/feature/luxy-rebuild` is the canonical development branch.
- `preview/main` is only the manually refreshed testing copy.
- Original `origin/main` is production. Never push preview/testing work directly to it.
- Never assume that pushing to one remote updates the other. Always use both explicit push commands when publishing a preview.
- Do not use `git push --mirror` or change remotes/upstream configuration as a shortcut.
- Do not make repository, branch, workflow, or deployment changes beyond the user's explicit request.
- If the current branch, remote configuration, or Git status differs from the arrangement documented here, stop and inspect it before pushing. Do not guess.

---

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

## Update Priority 05 — NLP Training Scalability

**Status:** Deferred until sufficient real-world performance data is available.

The current supplementary intent training limit is 80 distinct article titles per language (English, Arabic and Spanish). Article-derived entity collection is not subject to this title-sample cap, and Pagefind indexing remains unaffected.

As the website grows, evaluate classification accuracy, training duration, model size and browser inference performance. Based on measured results, increase the limit, improve sample selection or remove the cap entirely. Retain the existing implementation until this review is warranted.
