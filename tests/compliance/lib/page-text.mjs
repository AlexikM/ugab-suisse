/**
 * Reduces a built page to what a visitor would read.
 *
 * The compliance tests assert on claims — "this page says donations are
 * deductible" — not on markup. Stripping the tags first means the assertions
 * survive any amount of restyling and restructuring, and only fail when the
 * words change.
 */

const ENTITIES = {
  '&nbsp;': ' ',
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&#x27;': "'",
  '&eacute;': 'é',
  '&egrave;': 'è',
  '&agrave;': 'à',
  '&ccedil;': 'ç',
};

export function textOf(html) {
  return html
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x?[0-9a-f]+;|&[a-z]+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? entity)
    .replace(/\s+/g, ' ')
    .trim();
}

/** The raw HTML of the page footer, for asserting which links a visitor can reach. */
export function footerOf(html) {
  const match = /<footer\b[^>]*>([\s\S]*?)<\/footer>/i.exec(html);
  return match ? match[1] : '';
}

/**
 * The page's own content, without the shared header and footer.
 *
 * A claim in the site chrome belongs to whoever owns the layout; a claim in
 * `<main>` belongs to the page. Assertions about what a legal page says need the
 * second, or they fail on someone else's copy and pass on their own.
 */
export function mainOf(html) {
  const match = /<main\b[^>]*>([\s\S]*?)<\/main>/i.exec(html);
  return match ? match[1] : html;
}
