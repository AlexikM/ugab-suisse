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

const decoded = (text) =>
  text.replace(/&#x?[0-9a-f]+;|&[a-z]+;/gi, (entity) => ENTITIES[entity.toLowerCase()] ?? entity);

export function textOf(html) {
  return decoded(
    html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
}

/** Attributes that carry words rather than configuration. */
const COPY_ATTRIBUTE =
  /\b(?:content|alt|title|aria-label|placeholder)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;

const LD_JSON = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;

/** Every string inside a JSON-LD block, whatever shape the block is. */
function stringsIn(json) {
  const found = [];
  const walk = (value) => {
    if (typeof value === 'string') found.push(value);
    else if (Array.isArray(value)) for (const item of value) walk(item);
    else if (value && typeof value === 'object')
      for (const item of Object.values(value)) walk(item);
  };
  try {
    walk(JSON.parse(json));
  } catch {
    // Unparseable JSON-LD is still published. Hand back the raw text rather
    // than nothing: a sweep that skips what it cannot read reports success over
    // the part it skipped.
    return [json];
  }
  return found;
}

/**
 * The copy a page publishes without rendering it.
 *
 * `textOf` strips tags, and with them everything a page says inside one: the
 * meta description a search engine quotes under the title, the `alt` a screen
 * reader announces, the JSON-LD a rich result is built from — `textOf` drops
 * `<script>` wholesale, so that last one is doubly invisible. All three are
 * published. None of them is prose, so none of them reaches a sweep built on
 * `textOf`.
 *
 * One string per field rather than one joined blob, because a denial in one
 * field has no business excusing a claim in another.
 */
export function metadataTextOf(html) {
  const fields = [];
  for (const [, doubleQuoted, singleQuoted] of html.matchAll(COPY_ATTRIBUTE)) {
    fields.push(doubleQuoted ?? singleQuoted ?? '');
  }
  for (const [, json] of html.matchAll(LD_JSON)) fields.push(...stringsIn(json));
  return fields.map((field) => decoded(field).replace(/\s+/g, ' ').trim()).filter(Boolean);
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
