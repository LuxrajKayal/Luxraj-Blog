# The Editor's Desk

**Page:** `site/pages/editorial.html`  
**Content library:** `site/content/editorial-notes.md`  
**Status:** Demonstration implementation with sample content.

## Purpose

The Editor's Desk is the personal editorial column of Luxraj Kayal, Founder & Editor-in-Chief. It is separate from the article-author byline system. Other author sections can be designed independently later.

The page reads one public Markdown file, sorts entries by date (newest first), and updates the date, type, title, writing, image and image credit together when readers navigate. It has no backend and uses a small built-in Markdown renderer. Raw HTML is escaped rather than rendered.

## Adding an entry

Open `site/content/editorial-notes.md` in VS Code. Copy this block and place it at the top, above older entries:

```md
<!-- ENTRY -->
id: "editorial-YYYY-MM-DD"
date: "YYYY-MM-DD"
type: "Daily"
title: "Your short editorial headline."
image: "https://example.com/your-image.jpg"
image_alt: "A concise description of the image."
image_credit: "Photographer name"
image_source: "https://source-page.example/"
<!-- BODY -->
Write the note here in Markdown.

A second paragraph can follow. **Bold** and *italic* text are supported.

- List item one
- List item two
<!-- END ENTRY -->
```

Required fields are `date`, `type`, `title` and the body. Accepted types are `Daily`, `Weekly` and `Monthly`. Use a unique ID, ISO dates (`YYYY-MM-DD`) and keep the source newest-first. The script also sorts by date as a safety measure.

The author byline is fixed in the page template. Do not add an author or designation field to the Markdown entries.

## Images

Each entry may have its own image URL. Describe the actual image in `image_alt`, and retain photographer/source credit in `image_credit` and `image_source`.

If an image URL is blank or fails to load, the page uses `site/assets/images/editorial/editorial-default.svg`.

The current image references are from Unsplash. The Unsplash License permits free personal and commercial use, but does not automatically clear separate rights in trademarks, identifiable people or third-party artwork shown in an image. Check the source page and current terms before using production imagery. Attribution is not generally required by the license, but it is included here as a courtesy. One sample server-rack photo asks for a specific credit to Domaintechnik; that credit is included in its entry.

- [Unsplash License](https://unsplash.com/license)
- [Unsplash guidance on brands and identifiable people](https://help.unsplash.com/en/articles/2646379-what-if-there-s-a-brand-or-identifiable-person-depicted-in-an-image-that-i-download)

## Supported Markdown and operation

Supported formatting: paragraphs, level 2–4 headings, bold, italic, inline code, links, block quotes and ordered/unordered lists. No external Markdown package is used.

The browser fetches the public file from `site/content/`. The static-site build copies it to the deployed output. Newer/Older navigation updates the full entry without reloading the page. The module's CSS and JavaScript load only on the Editorial page.

Test through a local HTTP server or the deployed website. Opening the HTML with a `file://` URL can prevent browser fetch requests from working.

The current 11 entries and image references are sample material for layout and interaction testing. Replace them before treating the column as published editorial content.
