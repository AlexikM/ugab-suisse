import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * What a search engine and a shared link see.
 *
 * Asserted against the build output rather than a running browser: this is all
 * static markup, so reading the output is a complete answer and costs
 * milliseconds instead of a browser launch.
 *
 * The promise being protected is the trilingual one. Three language versions of
 * a page that do not cross-reference each other are three competing pages, and
 * a search engine will pick one and bury the others — which for this committee
 * means the Armenian-speaking part of its own community never finds it.
 */

const DIST = 'dist';
const LOCALES = ['fr', 'en', 'hy'] as const;

function pages(dir = DIST, found: Array<{ route: string; html: string }> = []) {
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) pages(path, found);
    else if (entry === 'index.html') {
      const route = `/${path.slice(DIST.length + 1, -'index.html'.length)}`;
      found.push({ route, html: readFileSync(path, 'utf8') });
    }
  }
  return found;
}

const all = pages();

/** Redirect stubs are not pages; the legal pages are French-only by design. */
const localised = all.filter(
  ({ route, html }) =>
    !/<meta[^>]+http-equiv=["']?refresh/i.test(html) &&
    !route.startsWith('/admin') &&
    !/^\/(mentions-legales|confidentialite|accessibilite)\//.test(route),
);

describe('the build produces pages at all', () => {
  it('found index pages to assert against', () => {
    expect(all.length).toBeGreaterThan(5);
    expect(localised.length).toBeGreaterThan(5);
  });
});

describe('language alternates', () => {
  it.each(LOCALES)('every localised page declares an alternate for %s', (locale) => {
    const missing = localised
      .filter(({ html }) => !new RegExp(`hreflang=["']${locale}[^"']*["']`, 'i').test(html))
      .map(({ route }) => route);

    expect(missing, `these pages do not point at their ${locale} version`).toEqual([]);
  });

  it('every localised page declares x-default, so an unmatched visitor lands somewhere deliberate', () => {
    const missing = localised
      .filter(({ html }) => !/hreflang=["']x-default["']/i.test(html))
      .map(({ route }) => route);

    expect(missing).toEqual([]);
  });

  it('every localised page declares a canonical address', () => {
    const missing = localised
      .filter(({ html }) => !/rel=["']canonical["']/i.test(html))
      .map(({ route }) => route);

    expect(missing).toEqual([]);
  });
});

describe('link previews', () => {
  it('every localised page carries a title, description and image', () => {
    const incomplete = localised
      .filter(
        ({ html }) =>
          !/property=["']og:title["']/i.test(html) ||
          !/property=["']og:description["']/i.test(html) ||
          !/property=["']og:image["']/i.test(html),
      )
      .map(({ route }) => route);

    expect(incomplete, 'a link to these pages would preview as a bare URL').toEqual([]);
  });
});

describe('structured data', () => {
  it('identifies the organisation on every localised page', () => {
    const missing = localised
      .filter(({ html }) => !/"@type"\s*:\s*"NGO"/.test(html))
      .map(({ route }) => route);

    expect(missing).toEqual([]);
  });

  it('never asserts a tax status or a public-utility recognition', () => {
    // The committee has produced no cantonal decision. Structured data is read
    // by machines and repeated without context, so a claim here is worse than
    // one in prose.
    const claiming = all
      .filter(({ html }) => /nonprofitStatus|taxID|"?deductible/i.test(html))
      .map(({ route }) => route);

    expect(claiming).toEqual([]);
  });
});

describe('the sitemap', () => {
  const index = readFileSync(join(DIST, 'sitemap-index.xml'), 'utf8');
  const body = readdirSync(DIST)
    .filter((f) => /^sitemap-\d+\.xml$/.test(f))
    .map((f) => readFileSync(join(DIST, f), 'utf8'))
    .join('');

  it('exists and is referenced from the index', () => {
    expect(index).toMatch(/sitemap-0\.xml/);
    expect(body.length).toBeGreaterThan(0);
  });

  it('lists every localised page', () => {
    const missing = localised
      .filter(({ route }) => !body.includes(route))
      .map(({ route }) => route);
    expect(missing, 'these pages are built but invisible to a crawler').toEqual([]);
  });

  it('does not advertise redirect stubs', () => {
    // /histoire only contains a meta refresh. Offering it to a crawler wastes a
    // crawl and competes with the real page.
    expect(body).not.toMatch(/\/histoire\//);
  });
});
