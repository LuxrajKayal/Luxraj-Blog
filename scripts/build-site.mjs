#!/usr/bin/env node
/**
 * Luxraj Blog static-site build.
 *
 * This builder stitches explicit shared-component markers into complete HTML.
 * It does not detect, replace, hide, or repair legacy inline components.
 * Populated source pages must already use the shared markers; invalid source
 * fails the build so duplicated markup cannot silently reach the public site.
 * Source partials are excluded from the public output.
 */
import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPOSITORY_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SITE_DIR = path.join(REPOSITORY_ROOT, 'site');
const PARTIAL_DIR = path.join(SITE_DIR, 'partials');
const OUTPUT_DIR = path.join(REPOSITORY_ROOT, '_site');

const PARTIALS = {
  TOPBAR: path.join(PARTIAL_DIR, 'topbar.html'),
  'MAIN-HEADER': path.join(PARTIAL_DIR, 'main-header.html'),
  FOOTER: path.join(PARTIAL_DIR, 'footer.html'),
  'ARTICLE-LAYOUT': path.join(PARTIAL_DIR, 'article-layout.html')
};
const NEWSLETTER_POPUP_PARTIAL = path.join(PARTIAL_DIR, 'newsletter-popup.html');
const STANDALONE_NEWSLETTER_PAGES = new Set([
  'newsletter-thank-you.html'
]);
const REQUIRED_MARKER_NAMES = ['TOPBAR', 'MAIN-HEADER', 'FOOTER'];
const MARKER_NAMES = Object.keys(PARTIALS);
const markerFor = name => '<!-- SHARED:' + name + ' -->';
const ARTICLE_SLOT_NAMES = ['HEADER', 'CONTENT'];

function extractArticleSlot(html, name, relativeFile) {
  const startMarker = '<!-- ARTICLE:' + name + ':START -->';
  const endMarker = '<!-- ARTICLE:' + name + ':END -->';
  const startCount = html.split(startMarker).length - 1;
  const endCount = html.split(endMarker).length - 1;

  if (startCount !== 1 || endCount !== 1) {
    throw new Error(
      relativeFile + ' must contain exactly one ' + startMarker +
      ' and one ' + endMarker + '.'
    );
  }

  const startIndex = html.indexOf(startMarker);
  const contentStart = startIndex + startMarker.length;
  const endIndex = html.indexOf(endMarker, contentStart);

  if (endIndex < contentStart) {
    throw new Error(relativeFile + ' has an incorrectly ordered ARTICLE:' + name + ' slot.');
  }

  const content = html.slice(contentStart, endIndex).trim();
  if (!content) {
    throw new Error(relativeFile + ' has an empty ARTICLE:' + name + ' slot.');
  }

  return {
    html: html.slice(0, startIndex) + html.slice(endIndex + endMarker.length),
    content
  };
}

function expandArticleLayout(sourceHtml, relativeFile, partialContents) {
  const marker = markerFor('ARTICLE-LAYOUT');
  const markerCount = sourceHtml.split(marker).length - 1;
  const hasArticleSlots = /<!-- ARTICLE:(?:HEADER|CONTENT):(?:START|END) -->/.test(sourceHtml);

  if (markerCount === 0) {
    if (hasArticleSlots) {
      throw new Error(relativeFile + ' has article content slots but no ' + marker + '.');
    }
    return sourceHtml;
  }

  if (markerCount !== 1) {
    throw new Error(relativeFile + ' must contain at most one ' + marker + '; found ' + markerCount + '.');
  }

  let html = sourceHtml;
  const slotContent = {};

  for (const name of ARTICLE_SLOT_NAMES) {
    const extracted = extractArticleSlot(html, name, relativeFile);
    html = extracted.html;
    slotContent[name] = extracted.content;
  }

  let layout = partialContents['ARTICLE-LAYOUT'];
  for (const [token, value] of [
    ['{{ARTICLE_HEADER}}', slotContent.HEADER],
    ['{{ARTICLE_CONTENT}}', slotContent.CONTENT]
  ]) {
    const tokenCount = layout.split(token).length - 1;
    if (tokenCount !== 1) {
      throw new Error('article-layout.html must contain exactly one ' + token + '; found ' + tokenCount + '.');
    }
    layout = layout.replace(token, value);
  }

  html = html.replace(marker, layout);

  if (/<!-- ARTICLE:(?:HEADER|CONTENT):(?:START|END) -->|{{ARTICLE_(?:HEADER|CONTENT)}}/.test(html)) {
    throw new Error(relativeFile + ' contains an unresolved article layout slot.');
  }

  return html;
}

function pageRootPrefix(html, relativeFile) {
  const bodyTag = html.match(/<body\b[^>]*>/i)?.[0] || '';
  const rootMatch = bodyTag.match(/\bdata-site-root\s*=\s*(["'])(.*?)\1/i);
  if (rootMatch) return rootMatch[2];

  const directory = path.posix.dirname(relativeFile.split(path.sep).join('/'));
  if (directory === '.') return '';
  return '../'.repeat(directory.split('/').filter(Boolean).length);
}

function countMatches(html, expression) {
  return Array.from(html.matchAll(expression)).length;
}

function assertMarkerCounts(html, relativeFile) {
  for (const name of MARKER_NAMES) {
    const marker = markerFor(name);
    const count = html.split(marker).length - 1;
    const required = REQUIRED_MARKER_NAMES.includes(name);
    if ((required && count !== 1) || (!required && count > 1)) {
      const expectation = required ? 'exactly one' : 'at most one';
      throw new Error(relativeFile + ' must contain ' + expectation + ' ' + marker + '; found ' + count + '.');
    }
  }
  let withoutKnownMarkers = html;
  for (const name of MARKER_NAMES) withoutKnownMarkers = withoutKnownMarkers.replaceAll(markerFor(name), '');
  if (/<!-- SHARED:|{{ROOT}}/.test(withoutKnownMarkers)) {
    throw new Error(relativeFile + ' contains an unknown shared marker or unresolved root token.');
  }
}

function assertNoLegacyShell(html, relativeFile) {
  const legacy = [
    ['hardcoded topbar', /<aside\b[^>]*class\s*=\s*(["'])[^"']*\btopbar\b[^"']*\1/i],
    ['hardcoded main header', /<header\b[^>]*class\s*=\s*(["'])[^"']*\bsite-header\b[^"']*\1/i],
    ['hardcoded search dialog', /<dialog\b[^>]*\bid\s*=\s*(["'])search-dialog\1/i],
    ['hardcoded shared footer', /<footer\b[^>]*class\s*=\s*(["'])[^"']*\bsite-footer\b[^"']*\1/i]
  ];
  for (const [name, expression] of legacy) {
    if (expression.test(html)) {
      throw new Error(relativeFile + ' still contains a ' + name + '. Remove it from the source and use the shared marker.');
    }
  }
}

function injectFooterStylesheet(html, rootPrefix, relativeFile) {
  if (/href\s*=\s*(["'])[^"']*assets\/css\/footer\.css\1/i.test(html)) return html;
  const headEnd = html.toLowerCase().lastIndexOf('</head>');
  if (headEnd < 0) {
    throw new Error(relativeFile + ' uses the shared footer but has no closing </head> tag.');
  }
  const link = '  <link rel="stylesheet" href="' + rootPrefix + 'assets/css/footer.css">\n';
  return html.slice(0, headEnd) + link + html.slice(headEnd);
}

function injectNewsletterPlaceholder(html, relativeFile) {
  if (/id\s*=\s*(['"])house-popup-backdrop\1/i.test(html)) {
    throw new Error(relativeFile + ' already contains the newsletter popup target.');
  }
  const bodyEnd = html.toLowerCase().lastIndexOf('</body>');
  if (bodyEnd < 0) {
    throw new Error(relativeFile + ' uses the newsletter trigger but has no closing </body> tag.');
  }
  const placeholder =
    '<div id="house-popup-backdrop" data-newsletter-placeholder hidden aria-hidden="true"></div>';
  return html.slice(0, bodyEnd) + '\n' + placeholder + '\n' + html.slice(bodyEnd);
}


/*
 * The root 404 document is self-contained. Copy it without shared-component
 * injection so it can render at malformed or deeply nested request URLs.
 */
function validateStandaloneNewsletterPage(html, relativeFile) {
  if (!/<html\b/i.test(html) || !/<body\b/i.test(html) || !html.toLowerCase().includes('</html>')) {
    throw new Error(relativeFile + ' must be a complete standalone HTML document.');
  }
  if (/<!-- SHARED:|{{ROOT}}/.test(html)) {
    throw new Error(relativeFile + ' must not contain shared-component markers or root tokens.');
  }
  if (/<link\b[^>]*\brel\s*=\s*(["'])[^"']*stylesheet[^"']*\1/i.test(html)) {
    throw new Error(relativeFile + ' must not include external site stylesheets.');
  }
  if (/<script\b[^>]*\bsrc\s*=/i.test(html)) {
    throw new Error(relativeFile + ' must keep its broadcaster JavaScript inline.');
  }
  if (!/<script\b[^>]*>[\s\S]*?<\/script>/i.test(html)) {
    throw new Error(relativeFile + ' must contain its inline broadcaster JavaScript.');
  }
  return html;
}

function validateStandalone404(html, relativeFile) {
  if (!/<html\b/i.test(html) || !/<body\b/i.test(html) || !html.toLowerCase().includes("</html>")) {
    throw new Error(relativeFile + ' must be a complete standalone HTML document.');
  }
  if (/<!-- SHARED:|{{ROOT}}/.test(html)) {
    throw new Error(relativeFile + ' must not contain shared-component markers or root tokens.');
  }
  if (/<link\b[^>]*\brel\s*=\s*(["'])[^"']*stylesheet[^"']*\1/i.test(html)) {
    throw new Error(relativeFile + ' must keep its CSS inline; external stylesheets are not allowed.');
  }
  if (/<script\b[^>]*\bsrc\s*=/i.test(html)) {
    throw new Error(relativeFile + ' must keep its JavaScript inline; external scripts are not allowed.');
  }
  if (!/<style\b[\s\S]*?<\/style>/i.test(html)) {
    throw new Error(relativeFile + ' must contain its standalone styles in an inline <style> block.');
  }
  if (!/<script\b[^>]*>[\s\S]*?<\/script>/i.test(html)) {
    throw new Error(relativeFile + ' must contain its standalone behavior in an inline <script> block.');
  }
  return html;
}

function expandSharedComponents(sourceHtml, relativeFile, partialContents) {
  const usesArticleLayout = sourceHtml.includes(markerFor('ARTICLE-LAYOUT'));
  let html = expandArticleLayout(sourceHtml, relativeFile, partialContents);

  assertMarkerCounts(html, relativeFile);
  assertNoLegacyShell(html, relativeFile);

  const rootPrefix = pageRootPrefix(sourceHtml, relativeFile);

  for (const name of MARKER_NAMES) {
    const marker = markerFor(name);
    const fragment = partialContents[name].replaceAll('{{ROOT}}', rootPrefix).trim();
    html = html.replace(marker, fragment);
  }

  if (/<!-- SHARED:|{{ROOT}}/.test(html)) {
    throw new Error(relativeFile + ' contains an unresolved shared marker or root token after assembly.');
  }
  html = injectFooterStylesheet(html, rootPrefix, relativeFile);
  html = injectNewsletterPlaceholder(html, relativeFile);
  validateBuiltPage(html, relativeFile, usesArticleLayout);
  return html;
}

function validateBuiltPage(html, relativeFile, usesArticleLayout = false) {
  const required = [
    ['topbar', /<aside\b[^>]*class\s*=\s*(["'])[^"']*\btopbar\b[^"']*\1/gi],
    ['main header', /<header\b[^>]*class\s*=\s*(["'])[^"']*\bsite-header\b[^"']*\1/gi],
    ['search dialog', /<dialog\b[^>]*\bid\s*=\s*(["'])search-dialog\1/gi],
    ['footer', /<footer\b[^>]*class\s*=\s*(["'])[^"']*\bsite-footer\b[^"']*\1/gi],
    ['newsletter popup placeholder', /<div\b[^>]*\bid\s*=\s*(['"])house-popup-backdrop\1[^>]*\bdata-newsletter-placeholder\b[^>]*>/gi]
  ];
  for (const [name, expression] of required) {
    const count = countMatches(html, expression);
    if (count !== 1) {
      throw new Error(relativeFile + ' must contain exactly one assembled ' + name + '; found ' + count + '.');
    }
  }

  if (usesArticleLayout) {
    const articleElements = [
      ['article entry header', /<header\b[^>]*class\s*=\s*(["'])[^"']*\barticle-entry-header\b[^"']*\1/gi],
      ['article layout grid', /<div\b[^>]*class\s*=\s*(["'])[^"']*\barticle-layout-grid\b[^"']*\1/gi],
      ['article sidebar rail', /<aside\b[^>]*class\s*=\s*(["'])[^"']*\barticle-sidebar-rail\b[^"']*\1/gi]
    ];

    for (const [name, expression] of articleElements) {
      const count = countMatches(html, expression);
      if (count !== 1) {
        throw new Error(relativeFile + ' must contain exactly one assembled ' + name + '; found ' + count + '.');
      }
    }
  }
}

async function walkAndBuild(sourceDirectory, relativeDirectory, partialContents, stats) {
  const entries = await readdir(sourceDirectory, { withFileTypes: true });

  for (const entry of entries) {
    const relativePath = relativeDirectory
      ? path.join(relativeDirectory, entry.name)
      : entry.name;
    const normalizedRelativePath = relativePath.split(path.sep).join('/');

    // Shared HTML fragments are inputs to assembly, not public pages.
    if (!relativeDirectory && entry.isDirectory() && entry.name === 'partials') continue;

    const sourcePath = path.join(sourceDirectory, entry.name);
    const outputPath = path.join(OUTPUT_DIR, relativePath);

    if (entry.isDirectory()) {
      await mkdir(outputPath, { recursive: true });
      await walkAndBuild(sourcePath, relativePath, partialContents, stats);
      continue;
    }

    await mkdir(path.dirname(outputPath), { recursive: true });
    if (!entry.isFile()) continue;

    if (!normalizedRelativePath.toLowerCase().endsWith('.html')) {
      await cp(sourcePath, outputPath);
      continue;
    }

    const sourceHtml = await readFile(sourcePath, 'utf8');

    // Empty placeholders are deliberately left empty until their own implementation.
    if (!sourceHtml.trim()) {
      await writeFile(outputPath, sourceHtml, 'utf8');
      stats.emptyPlaceholders += 1;
      continue;
    }

    if (!/<body\b/i.test(sourceHtml)) {
      throw new Error(normalizedRelativePath + ' is non-empty HTML but has no <body> element.');
    }

    // Newsletter callback pages are intentionally standalone: no site shell or popup injection.
    if (STANDALONE_NEWSLETTER_PAGES.has(normalizedRelativePath)) {
      const standaloneHtml = validateStandaloneNewsletterPage(sourceHtml, normalizedRelativePath);
      await writeFile(outputPath, standaloneHtml, 'utf8');
      stats.standalonePages += 1;
      continue;
    }

    // The root 404 page is self-contained and must not receive the shared site shell.
    if (normalizedRelativePath === '404.html') {
      const standaloneHtml = validateStandalone404(sourceHtml, normalizedRelativePath);
      await writeFile(outputPath, standaloneHtml, 'utf8');
      stats.standalonePages += 1;
      continue;
    }

    const builtHtml = expandSharedComponents(sourceHtml, normalizedRelativePath, partialContents);
    await writeFile(outputPath, builtHtml, 'utf8');
    stats.builtPages += 1;
  }
}

async function main() {
  await readFile(path.join(SITE_DIR, 'index.html'), 'utf8');

  const partialContents = {};
  for (const [name, partialPath] of Object.entries(PARTIALS)) {
    partialContents[name] = await readFile(partialPath, 'utf8');
  }

  const newsletterPopupHtml = await readFile(NEWSLETTER_POPUP_PARTIAL, 'utf8');

  await rm(OUTPUT_DIR, { recursive: true, force: true });
  await mkdir(OUTPUT_DIR, { recursive: true });

  // Publish the newsletter markup as a shared resource. Pages retain only a
  // lightweight trigger target; the full markup is fetched after a visitor clicks.
  const newsletterAssetPath = path.join(
    OUTPUT_DIR,
    'assets',
    'components',
    'newsletter-popup.html'
  );
  await mkdir(path.dirname(newsletterAssetPath), { recursive: true });
  await writeFile(newsletterAssetPath, newsletterPopupHtml, 'utf8');

  const stats = { builtPages: 0, emptyPlaceholders: 0, standalonePages: 0 };
  await walkAndBuild(SITE_DIR, '', partialContents, stats);
  await writeFile(path.join(OUTPUT_DIR, '.nojekyll'), '', 'utf8');

  console.log(
    'Built _site/: assembled and verified shared components on ' +
    stats.builtPages + ' populated HTML pages; copied ' +
    stats.standalonePages + ' standalone HTML pages; left ' +
    stats.emptyPlaceholders + ' empty HTML placeholders unchanged.'
  );
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
