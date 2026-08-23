import { describe, expect, it } from 'vitest';

import { configuredBase, readBuiltFiles } from './base-path.js';
import { builtPaths, findDeadLinks, isServed, resolveLink } from './internal-links.js';

/**
 * No link inside the built site leads nowhere.
 *
 * `base-path.test.ts` next door asks whether a URL carries the configured
 * prefix. This asks the other half of the question — whether anything is there
 * — because a perfectly prefixed link can still 404, and 404 is what the
 * visitor meets.
 *
 * It is worth having on this project in particular. Three of the defects
 * already recorded here were links that led nowhere: the CMS sign-in button
 * pointing at an authentication broker that did not exist, a contact form
 * posting to a service with a placeholder key, and a legal-page language
 * switcher offering an address that was never built. Each looked right in the
 * markup and each wasted somebody's time.
 */

describe('resolveLink', () => {
  it('resolves a page link under the configured base', () => {
    expect(resolveLink('/ugab-suisse/don/', '/ugab-suisse')).toBe('don/');
  });

  it('leaves the site alone when a link does', () => {
    for (const external of [
      'https://example.invalid/x',
      '//example.invalid/x',
      'mailto:contact@example.invalid',
      'tel:+41000000000',
      '#contenu',
      'data:image/svg+xml,<svg/>',
    ]) {
      expect(resolveLink(external, '/ugab-suisse'), external).toBeNull();
    }
  });

  it('drops a fragment and a query before looking anything up', () => {
    expect(resolveLink('/ugab-suisse/contact/?message=envoye#contenu', '/ugab-suisse')).toBe(
      'contact/',
    );
  });

  it('says nothing about a URL that omits the base, which is base-path.ts’s to report', () => {
    expect(resolveLink('/don/', '/ugab-suisse')).toBeNull();
  });
});

describe('isServed', () => {
  const built = new Set(['index.html', 'don/index.html', 'fonts/lato-400-latin.woff2']);

  it('serves a directory link from its index', () => {
    expect(isServed('don/', built)).toBe(true);
    expect(isServed('', built)).toBe(true);
  });

  it('serves the same page linked without its trailing slash', () => {
    expect(isServed('don', built)).toBe(true);
  });

  it('serves a file that is genuinely a file', () => {
    expect(isServed('fonts/lato-400-latin.woff2', built)).toBe(true);
  });

  it('does not invent a page for an address nothing was built at', () => {
    expect(isServed('dons/', built)).toBe(false);
    expect(isServed('fonts/inter-armenian.woff2', built)).toBe(false);
  });
});

describe('findDeadLinks', () => {
  const built = new Set(['index.html', 'don/index.html']);
  const page = (body: string) => [{ path: 'index.html', contents: body }];

  it('reports a link to a page that was never built', () => {
    expect(findDeadLinks(page('<a href="/dons/">Don</a>'), '', built)).toEqual([
      { file: 'index.html', url: '/dons/' },
    ]);
  });

  it('reports a missing image as readily as a missing page', () => {
    expect(findDeadLinks(page('<img src="/logo.png">'), '', built)).toEqual([
      { file: 'index.html', url: '/logo.png' },
    ]);
  });

  it('says nothing about links that resolve', () => {
    expect(
      findDeadLinks(page('<a href="/don/">Don</a><a href="/">Accueil</a>'), '', built),
    ).toEqual([]);
  });

  it('reads pages, not the stylesheets and scripts beside them', () => {
    // A URL inside a bundle is base-path.ts's business. Here it would produce
    // findings about module graph internals that no visitor ever follows.
    const bundle = [{ path: 'assets/site.js', contents: 'fetch("/dons/")' }];

    expect(findDeadLinks(bundle, '', built)).toEqual([]);
  });
});

describe('the site as built', () => {
  it('has no link that leads nowhere', async () => {
    const dead = findDeadLinks(await readBuiltFiles(), configuredBase(), await builtPaths());

    const summary = dead.map(({ file, url }) => `${file} → ${url}`).sort();

    expect(
      summary,
      `these links are written into the build and answer nothing:\n  ${summary.join('\n  ')}`,
    ).toEqual([]);
  });
});
