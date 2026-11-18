/**
 * Source Page ID placeholder rule.
 * Owns the complete Page ID meta element; CMS-assigned values are preserved.
 */

const PAGE_ID_META_NAME = 'luxraj:page-id';
export const PAGE_ID_PLACEHOLDER = '{{PAGE_ID}}';
function readHtmlAttribute(tag, attributeName) {
  const patterns = {
    name: /(?:^|\s)name\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+))/i,
    content: /(?:^|\s)content\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>]+))/i
  };
  const expression = patterns[attributeName];
  if (!expression) throw new Error('Unsupported HTML attribute: ' + attributeName);
  const match = expression.exec(tag);
  return match ? (match[1] ?? match[2] ?? match[3]) : null;
}

/*
 * Give every populated source page one stable identity slot. Placeholder values
 * may repeat until Luxraj assigns permanent IDs; permanent IDs must be unique.
 */
export function ensurePageIdPlaceholder(html, relativeFile) {
  const headOpenings = Array.from(html.matchAll(/<head\b[^>]*>/gi));
  const headClosings = Array.from(html.matchAll(/<\/head\s*>/gi));

  if (headOpenings.length !== 1 || headClosings.length !== 1) {
    throw new Error(relativeFile + ' must contain exactly one complete <head> element for page-ID metadata.');
  }

  const headContentStart = headOpenings[0].index + headOpenings[0][0].length;
  const headContentEnd = headClosings[0].index;
  if (headContentEnd < headContentStart) {
    throw new Error(relativeFile + ' has an incorrectly ordered <head> element.');
  }

  const pageIdMetas = Array.from(html.matchAll(/<meta\b[^>]*>/gi))
    .filter(match => (readHtmlAttribute(match[0], 'name') || '').toLowerCase() === PAGE_ID_META_NAME);

  if (pageIdMetas.length > 1) {
    throw new Error(
      relativeFile + ' must contain at most one ' + PAGE_ID_META_NAME +
      ' meta tag; found ' + pageIdMetas.length + '.'
    );
  }

  if (pageIdMetas.length === 1) {
    const existing = pageIdMetas[0];
    const existingEnd = existing.index + existing[0].length;

    if (existing.index < headContentStart || existingEnd > headContentEnd) {
      throw new Error(relativeFile + ' has its ' + PAGE_ID_META_NAME + ' meta tag outside the <head> element.');
    }

    const content = readHtmlAttribute(existing[0], 'content');
    if (content === null || !content.trim()) {
      throw new Error(relativeFile + ' has a ' + PAGE_ID_META_NAME + ' meta tag without a non-empty content value.');
    }

    return { html, pageId: content.trim(), injected: false };
  }

  const newline = html.includes('\r\n') ? '\r\n' : '\n';
  const meta = '  <meta name="' + PAGE_ID_META_NAME + '" content="' + PAGE_ID_PLACEHOLDER + '">' + newline;
  const separator = html.slice(0, headContentEnd).endsWith('\n') ? '' : newline;

  return {
    html: html.slice(0, headContentEnd) + separator + meta + html.slice(headContentEnd),
    pageId: PAGE_ID_PLACEHOLDER,
    injected: true
  };
}

