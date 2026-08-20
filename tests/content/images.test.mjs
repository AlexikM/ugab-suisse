// Photography. Run `npm run build` first.
//
// Every photograph on the site today is a placeholder — generic stock imagery,
// which the brief explicitly forbids. What is asserted here is not that the
// pictures are right, but that they go through the build: when the Comité's own
// photographs arrive (#9) they land in a pipeline that already sizes, hashes
// and lazy-loads them.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { readBuiltPage } from './helpers.mjs';

const PAGES_WITH_PHOTOGRAPHY = ['/', '/a-propos', '/evenements', '/don'];

/** Images the build produced, as opposed to files copied verbatim. */
function processedImages(html) {
  return [...html.matchAll(/<img[^>]*>/g)]
    .map((match) => match[0])
    .filter((tag) => tag.includes('_astro'));
}

test('no page serves a photograph straight out of the public directory', () => {
  for (const route of PAGES_WITH_PHOTOGRAPHY) {
    const html = readBuiltPage(route);

    assert.doesNotMatch(html, /src="[^"]*\/images\//, `${route} serves an unprocessed image`);
    assert.doesNotMatch(html, /url\(&#39;?[^)]*\/images\//, `${route} paints one as a CSS background`);
  }
});

test('a photograph is offered at more than one size, so a phone does not fetch a desktop image', () => {
  for (const route of PAGES_WITH_PHOTOGRAPHY) {
    const photographs = processedImages(readBuiltPage(route));

    assert.ok(photographs.length > 0, `${route} renders no processed photograph`);
    assert.ok(
      photographs.every((tag) => tag.includes('srcset')),
      `a photograph on ${route} offers no smaller variant to a small screen`,
    );
  }
});

test('a photograph reserves its space, so the page does not jump as it loads', () => {
  for (const route of PAGES_WITH_PHOTOGRAPHY) {
    for (const tag of processedImages(readBuiltPage(route))) {
      assert.match(tag, /\swidth=/, `an image on ${route} declares no width`);
      assert.match(tag, /\sheight=/, `an image on ${route} declares no height`);
      // An empty alt is the right answer for the decorative photographs behind
      // the page headings; no alt at all is read out as a filename.
      assert.match(tag, /\salt(=|[\s>/])/, `an image on ${route} has no alt attribute`);
    }
  }
});
