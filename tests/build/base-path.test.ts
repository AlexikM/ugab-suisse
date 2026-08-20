import { describe, expect, it } from 'vitest';
import {
  configuredBase,
  findBasePathViolations,
  readBuiltFiles,
  STALE_GITHUB_PAGES_PREFIX,
} from './base-path.js';

// The five commits that preceded this test all fixed the same defect: a URL
// written into the built output without going through the configured base.
// Both directions of that defect are asserted here.
//
//   missing-base — an internal URL that does not start with the configured
//                  base. This is the bug those five commits fixed.
//   stale-prefix — a literal /ugab-suisse left in the output when that is no
//                  longer the configured base. This is the bug that appears
//                  the day hosting moves off GitHub Pages and the base is
//                  removed. It is dormant until then, and needs no
//                  coordination to become live.

describe('findBasePathViolations', () => {
  const html = (body: string) => [{ path: 'index.html', contents: body }];

  it('reports an internal URL that omits the configured base', () => {
    const violations = findBasePathViolations(html('<img src="/images/hero.jpg">'), '/ugab-suisse');

    expect(violations).toEqual([
      { file: 'index.html', url: '/images/hero.jpg', reason: 'missing-base' },
    ]);
  });

  it('reports a CSS background that omits the configured base', () => {
    const violations = findBasePathViolations(
      html('<div style="background-image:url(/images/hero.jpg)"></div>'),
      '/ugab-suisse',
    );

    expect(violations).toContainEqual({
      file: 'index.html',
      url: '/images/hero.jpg',
      reason: 'missing-base',
    });
  });

  it('reports every URL of a srcset that omits the configured base', () => {
    const violations = findBasePathViolations(
      html('<img srcset="/a.jpg 1x, /ugab-suisse/b.jpg 2x">'),
      '/ugab-suisse',
    );

    expect(violations.map((violation) => violation.url)).toEqual(['/a.jpg']);
  });

  it('reports a stale GitHub Pages prefix once the base no longer is one', () => {
    const violations = findBasePathViolations(html('<a href="/ugab-suisse/don/">Don</a>'), '');

    expect(violations).toEqual([
      { file: 'index.html', url: '/ugab-suisse/don/', reason: 'stale-prefix' },
    ]);
  });

  it('finds a stale prefix outside of markup, such as in a script or stylesheet', () => {
    const violations = findBasePathViolations(
      [{ path: 'assets/site.js', contents: 'fetch("/ugab-suisse/api/events.json");' }],
      '',
    );

    expect(violations).toHaveLength(1);
    expect(violations[0]?.reason).toBe('stale-prefix');
  });

  it('accepts output that carries the configured base', () => {
    const violations = findBasePathViolations(
      html('<a href="/ugab-suisse/don/"><img src="/ugab-suisse/images/hero.jpg"></a>'),
      '/ugab-suisse',
    );

    expect(violations).toEqual([]);
  });

  it('accepts the base itself, with or without a trailing slash', () => {
    const violations = findBasePathViolations(
      html('<a href="/ugab-suisse">Accueil</a><a href="/ugab-suisse/">Accueil</a>'),
      '/ugab-suisse',
    );

    expect(violations).toEqual([]);
  });

  it('ignores URLs that are not internal paths', () => {
    const violations = findBasePathViolations(
      html(
        [
          '<a href="https://agbu.org">AGBU</a>',
          '<a href="//example.org/x">protocol relative</a>',
          '<a href="mailto:info@ugab.ch">mail</a>',
          '<a href="tel:+41221234567">tel</a>',
          '<a href="#contenu">skip link</a>',
          '<a href="evenements/">relative</a>',
          '<meta name="description" content="Une association arménienne">',
        ].join(''),
      ),
      '/ugab-suisse',
    );

    expect(violations).toEqual([]);
  });

  it('requires no base when none is configured', () => {
    const violations = findBasePathViolations(html('<img src="/images/hero.jpg">'), '');

    expect(violations).toEqual([]);
  });
});

describe('the built site', () => {
  it('carries the configured base on every internal URL', async () => {
    const files = await readBuiltFiles();
    const violations = findBasePathViolations(files, configuredBase());

    expect(
      violations.map((violation) => `${violation.file}: ${violation.url} (${violation.reason})`),
    ).toEqual([]);
  });

  it('is checked against the base declared in astro.config.mjs', () => {
    // Guards the guard: if this ever reads as undefined the suite above would
    // pass vacuously, which is how a regression test quietly stops working.
    expect(typeof configuredBase()).toBe('string');
    expect(STALE_GITHUB_PAGES_PREFIX).toBe('/ugab-suisse');
  });
});
