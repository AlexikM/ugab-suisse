// The agreed sitemap, asserted against the built site. Run `npm run build` first.
//
// The sitemap below is the specification — it is the plan du site the committee
// approved, transcribed in docs/content/site-copy.md — so it is written out
// here rather than imported from the code it is checking.
//
// The locales, by contrast, are read from the project's own config, so that
// adding Armenian makes this test demand Armenian pages without anyone
// remembering to come back here.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import astroConfig from '../../astro.config.mjs';
import { builtPageExists, readBuiltPage, headerLinks } from './helpers.mjs';

const AGREED_SITEMAP = ['/', '/a-propos', '/evenements', '/don', '/contact'];

const base = (astroConfig.base ?? '').replace(/\/$/, '');
const locales = astroConfig.i18n?.locales ?? ['fr'];
const defaultLocale = astroConfig.i18n?.defaultLocale ?? 'fr';

function localised(route, locale) {
  if (locale === defaultLocale) return route;
  return route === '/' ? `/${locale}/` : `/${locale}${route}`;
}

/** Reduce a link back to the sitemap entry it points at, whatever the locale. */
function toSitemapEntry(href) {
  let path = href;
  if (base && path.startsWith(base)) path = path.slice(base.length);
  for (const locale of locales) {
    if (path === `/${locale}` || path === `/${locale}/`) return '/';
    if (path.startsWith(`/${locale}/`)) path = path.slice(locale.length + 1);
  }
  path = path.replace(/\/$/, '');
  return path === '' ? '/' : path;
}

for (const locale of locales) {
  test(`every page of the agreed sitemap is built in ${locale}`, () => {
    for (const route of AGREED_SITEMAP) {
      const path = localised(route, locale);
      assert.ok(builtPageExists(path), `no page was built at ${path}`);
    }
  });
}

test('the address the committee may already have published still resolves', () => {
  assert.ok(
    builtPageExists('/histoire'),
    'the old About address must not simply disappear',
  );
  const html = readBuiltPage('/histoire');
  assert.match(
    html,
    new RegExp(`url=${base}/a-propos`),
    `/histoire should send a visitor to ${base}/a-propos — a destination without the configured base lands nowhere`,
  );
});

test('the header offers exactly the agreed entries and nothing else', () => {
  const offered = new Set(
    headerLinks(readBuiltPage('/'))
      .filter((href) => !/^(https?:|mailto:|tel:|#)/.test(href))
      .map(toSitemapEntry),
  );

  assert.deepEqual(
    [...offered].sort(),
    [...AGREED_SITEMAP].sort(),
    'the header should offer the agreed sitemap, no more and no less',
  );
});

test('the legal notice and the privacy policy are reachable from every page', () => {
  for (const route of AGREED_SITEMAP) {
    const html = readBuiltPage(route);
    const footer = html.match(/<footer[\s\S]*<\/footer>/i);
    assert.ok(footer, `${route} has no footer`);
    assert.match(footer[0], /mentions-legales/, `${route} does not link to the legal notice`);
    assert.match(footer[0], /confidentialite/, `${route} does not link to the privacy policy`);
  }
});
