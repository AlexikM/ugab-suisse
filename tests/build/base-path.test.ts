import { describe, expect, it } from 'vitest';
import { configuredBase, findBasePathViolations, readBuiltFiles } from './base-path.js';

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

  it('finds a stale prefix in an absolute GitHub Pages URL', () => {
    const violations = findBasePathViolations(
      html('<link rel="canonical" href="https://alexikm.github.io/ugab-suisse/don/">'),
      '',
    );

    expect(violations.map((violation) => violation.reason)).toEqual(['stale-prefix']);
  });

  it('finds a stale prefix that has been percent-encoded into a share link', () => {
    const violations = findBasePathViolations(
      html('<a href="https://www.linkedin.com/share?url=https%3A%2F%2Fx.io%2Fugab-suisse%2Fdon">'),
      '',
    );

    expect(violations.map((violation) => violation.reason)).toEqual(['stale-prefix']);
  });

  it('does not mistake the repository URL for a stale prefix', () => {
    // github.com/AlexikM/ugab-suisse is the repository, not a path on this
    // site, and stays correct forever. Failing a build over it would teach
    // people to disable this check.
    const violations = findBasePathViolations(
      html('<a href="https://github.com/AlexikM/ugab-suisse">Code source</a>'),
      '',
    );

    expect(violations).toEqual([]);
  });

  it('reports a hero background whose quotes the compiler escaped', () => {
    // Astro escapes the quotes of a url() inside a double-quoted attribute.
    const violations = findBasePathViolations(
      html('<div style="background-image:url(&#34;/images/hero.jpg&#34;)"></div>'),
      '/ugab-suisse',
    );

    expect(violations.map((violation) => violation.url)).toEqual(['/images/hero.jpg']);
  });

  it('reports a meta refresh that omits the configured base', () => {
    const violations = findBasePathViolations(
      html('<meta http-equiv="refresh" content="0;url=/en/">'),
      '/ugab-suisse',
    );

    expect(violations.map((violation) => violation.url)).toEqual(['/en/']);
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

  it('has internal URLs for the assertion above to have looked at', async () => {
    // Guards the guard. If the scan ever stopped finding URLs — a change in
    // how Astro emits them, a mistake in the extractor — the assertion above
    // would pass on an empty list and quietly stop protecting anything.
    // Against a base the site is not served from, every internal URL is a
    // violation, so a non-empty result proves the scan is seeing them.
    const violations = findBasePathViolations(await readBuiltFiles(), '/not-the-configured-base');

    expect(violations.length).toBeGreaterThan(0);
  });
});
