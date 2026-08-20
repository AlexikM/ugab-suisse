/**
 * Finds every host a built page would cause a browser to contact.
 *
 * This is the seam the privacy policy is checked against. The site is static, so
 * everything a visitor's browser fetches is written into the build output: there
 * is no server deciding at request time. That makes reading the output a complete
 * answer for this project, and a fast, dependency-free one — no browser to
 * install, no flake, runs in CI in milliseconds.
 *
 * It reads the output with regular expressions rather than a parser, to avoid
 * adding a dependency a volunteer maintainer would inherit. That trade has known
 * blind spots, listed here rather than discovered later:
 *
 * - A URL assembled at runtime from pieces (`'https://' + host`).
 *   `KIND.SCRIPT_LITERAL` catches a whole URL sitting in a script; nothing
 *   catches one built by concatenation.
 * - An attribute value containing a literal `>`.
 * - A comma inside a `srcset` URL truncates the URL reported in the failure
 *   message. The host is still correct, which is what the audit compares.
 * - What a third party's own embed loads once it is running. Only a browser sees
 *   that, which is why the pre-launch checklist repeats this audit in one.
 */

/**
 * Why a host gets contacted. The distinction is the whole point: a font
 * stylesheet is a request the site makes on the visitor's behalf without asking,
 * while a link to Instagram is a request the visitor makes by choosing to.
 * Only the first kind belongs in a processor disclosure.
 */
export const KIND = {
  /** Fetched while the page loads. Nobody consented to this. */
  AUTOMATIC: 'automatic',
  /** Receives whatever the visitor typed, but only once they submit. */
  FORM_TARGET: 'form-target',
  /** A whole URL sitting in script source. Contacted if that code runs. */
  SCRIPT_LITERAL: 'script-literal',
  /** Contacted only if the visitor clicks. Reported, never disclosed. */
  OUTBOUND_LINK: 'outbound-link',
};

/** rel values on <link> that make the browser open a connection or fetch. */
const FETCHING_REL = new Set([
  'stylesheet',
  'preconnect',
  'dns-prefetch',
  'preload',
  'prefetch',
  'modulepreload',
  'icon',
  'shortcut icon',
  'apple-touch-icon',
  'apple-touch-icon-precomposed',
  'mask-icon',
  'manifest',
]);

/** Elements whose named attribute is fetched as the page loads. */
const AUTOMATIC_ATTRIBUTES = [
  ['script', 'src'],
  ['img', 'src'],
  ['img', 'srcset'],
  ['source', 'src'],
  ['source', 'srcset'],
  ['iframe', 'src'],
  ['frame', 'src'],
  ['embed', 'src'],
  ['object', 'data'],
  ['video', 'src'],
  ['video', 'poster'],
  ['audio', 'src'],
  ['track', 'src'],
  ['input', 'src'],
  ['use', 'href'],
  ['image', 'href'],
];

const decodeEntities = (value) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'");

/**
 * Absolute, third-party and http(s) — or nothing. Relative URLs, the site's own
 * host, `mailto:`, `tel:` and `data:` are all first party or not requests at all.
 */
const thirdPartyUrl = (rawValue, siteHost) => {
  const value = decodeEntities(rawValue).trim();
  if (!value) return null;
  const absolute = value.startsWith('//') ? `https:${value}` : value;
  if (!/^https?:\/\//i.test(absolute)) return null;
  let parsed;
  try {
    parsed = new URL(absolute);
  } catch {
    return null;
  }
  if (parsed.host === siteHost) return null;
  // Report the URL as written, not as normalised: a failure message is easier to
  // act on when it quotes something you can grep the source for.
  return { host: parsed.host, url: absolute };
};

/** `a.jpg 1x, b.jpg 2x` — the descriptors are not URLs, and neither is anything
 * after a comma that fails to parse as one. */
const srcsetUrls = (value) =>
  decodeEntities(value)
    .split(',')
    .map((candidate) => candidate.trim().split(/\s+/)[0])
    .filter(Boolean);

/**
 * `(?<![-:\w])` keeps `src` from matching `data-src` or `xlink:src`. A lazy-load
 * attribute is not a request the browser makes, and recording one would push a
 * host into the published processor list that the site never actually contacts —
 * an over-disclosure is as wrong as an omission.
 */
const attributeMatcher = (tag, attribute) =>
  new RegExp(`<${tag}\\b[^>]*?(?<![-:\\w])${attribute}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'gi');

const push = (into, { host, url }, { page, kind, via }) => {
  into.push({ host, kind, page, url, via });
};

/**
 * @param {{page: string, html: string, siteHost: string}} input
 * @returns {Array<{host: string, kind: string, page: string, url: string, via: string}>}
 */
export function collectReferences({ page, html, siteHost }) {
  const found = [];
  const record = (rawValue, kind, via) => {
    const hit = thirdPartyUrl(rawValue, siteHost);
    if (hit) push(found, hit, { page, kind, via });
  };

  for (const [tag, attribute] of AUTOMATIC_ATTRIBUTES) {
    for (const match of html.matchAll(attributeMatcher(tag, attribute))) {
      const value = match[2] ?? match[3] ?? '';
      const via = `${tag}[${attribute}]`;
      if (attribute === 'srcset') {
        for (const candidate of srcsetUrls(value)) record(candidate, KIND.AUTOMATIC, via);
      } else {
        record(value, KIND.AUTOMATIC, via);
      }
    }
  }

  // <link> only fetches for some rel values; canonical and alternate do not.
  for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
    const tag = match[0];
    const rel = /\brel\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(tag);
    const href = /\bhref\s*=\s*("([^"]*)"|'([^']*)')/i.exec(tag);
    if (!rel || !href) continue;
    const relValue = (rel[2] ?? rel[3] ?? rel[4] ?? '').toLowerCase().trim();
    const fetches = relValue.split(/\s+/).some((token) => FETCHING_REL.has(token)) || FETCHING_REL.has(relValue);
    if (!fetches) continue;
    record(href[2] ?? href[3] ?? '', KIND.AUTOMATIC, `link[rel=${relValue}]`);
  }

  for (const match of html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) {
    for (const reference of cssReferences(match[1])) {
      record(reference, KIND.AUTOMATIC, 'style');
    }
  }

  // Inline `style=""` attributes. The home page sets its hero background this
  // way, so a background image on a third-party host would otherwise be invisible
  // to the audit while being fetched on every visit.
  for (const match of html.matchAll(/\bstyle\s*=\s*("([^"]*)"|'([^']*)')/gi)) {
    for (const reference of cssReferences(decodeEntities(match[2] ?? match[3] ?? ''))) {
      record(reference, KIND.AUTOMATIC, 'style attribute');
    }
  }

  for (const match of html.matchAll(attributeMatcher('form', 'action'))) {
    record(match[2] ?? match[3] ?? '', KIND.FORM_TARGET, 'form[action]');
  }

  for (const match of html.matchAll(/<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi)) {
    for (const reference of scriptReferences(match[1])) {
      record(reference, KIND.SCRIPT_LITERAL, 'inline script');
    }
  }

  for (const match of html.matchAll(attributeMatcher('a', 'href'))) {
    record(match[2] ?? match[3] ?? '', KIND.OUTBOUND_LINK, 'a[href]');
  }

  return found;
}

/** `url(...)` and `@import "..."` in a stylesheet. */
export function cssReferences(css) {
  const references = [];
  for (const match of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s]*))\s*\)/gi)) {
    references.push(match[1] ?? match[2] ?? match[3] ?? '');
  }
  for (const match of css.matchAll(/@import\s+(?:url\()?\s*(?:"([^"]*)"|'([^']*)')/gi)) {
    references.push(match[1] ?? match[2] ?? '');
  }
  return references.filter(Boolean);
}

/** Whole http(s) URLs written literally in script source. */
export function scriptReferences(source) {
  return [...source.matchAll(/["'`](https?:\/\/[^"'`\s]+)["'`]/gi)].map((match) => match[1]);
}

/**
 * The same question, asked of a built stylesheet or script bundle rather than a
 * page. Astro extracts scoped and Tailwind CSS into `dist/_astro/*.css`, so a
 * third-party `@font-face` or `@import` lands there and never appears in any
 * HTML file.
 */
export function collectAssetReferences({ route, source, siteHost }) {
  const isStylesheet = route.endsWith('.css');
  const references = isStylesheet ? cssReferences(source) : scriptReferences(source);
  const kind = isStylesheet ? KIND.AUTOMATIC : KIND.SCRIPT_LITERAL;
  const via = isStylesheet ? 'bundled stylesheet' : 'bundled script';

  const found = [];
  for (const reference of references) {
    const hit = thirdPartyUrl(reference, siteHost);
    if (hit) push(found, hit, { page: route, kind, via });
  }
  return found;
}

/** Sorted, de-duplicated hosts of one kind. Sorted so failures read the same twice. */
export function hostsOf(references, kind) {
  return [...new Set(references.filter((reference) => reference.kind === kind).map((r) => r.host))].sort();
}
