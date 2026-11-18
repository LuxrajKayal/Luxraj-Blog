/**
 * Permanent HTML element/attribute rules.
 * Owns the SEO eligibility attribute and preserves existing attribute values.
 */

const SEO_ELIGIBILITY_ATTRIBUTE = 'data-luxraj-seo';
// Error and newsletter utility pages are not eligible for ordinary SEO editing.
const SEO_EXCLUDED_FILE_NAMES = new Set([
  '404.html',
  'newsletter-thank-you.html',
  'unsubscribe.html'
]);

/*
 * Permanently mark complete source HTML pages as eligible for the local SEO CMS.
 * Keep existing attributes (including an explicit "false") untouched.
 */
export function ensureSeoEligibilityMarker(html, relativeFile) {
  // Newsletter utility and error pages are excluded even when fully formed.
  const fileName = relativeFile.replace(/\\/g, '/').split('/').pop().toLowerCase();
  if (SEO_EXCLUDED_FILE_NAMES.has(fileName)) {
    return { html, injected: false };
  }

  const htmlOpenings = Array.from(html.matchAll(/<html\b(?:[^>"']|"[^"]*"|'[^']*')*>/gi));
  if (htmlOpenings.length !== 1 || !/<body\b[^>]*>/i.test(html)) {
    throw new Error(relativeFile + ' must be a complete HTML document to receive the SEO eligibility marker.');
  }

  const opening = htmlOpenings[0];
  if (/(?:\s)data-luxraj-seo(?=\s|=|>)/i.test(opening[0])) {
    return { html, injected: false };
  }

  const updatedTag = opening[0].replace(/\s*>$/, ' ' + SEO_ELIGIBILITY_ATTRIBUTE + '="true">');
  return {
    html: html.slice(0, opening.index) + updatedTag + html.slice(opening.index + opening[0].length),
    injected: true
  };
}

