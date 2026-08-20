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

function images(html) {
  return [...html.matchAll(/<img[^>]*>/g)].map((match) => match[0]);
}

test('photographs are processed by the build, not served untouched from public/', () => {
  for (const route of PAGES_WITH_PHOTOGRAPHY) {
    const html = readBuiltPage(route);

    assert.doesNotMatch(
      html,
      /(src|url\()="?[^"')]*\/images\//,
      `${route} still serves an image straight out of the public directory`,
    );
  }
});

test('a photograph is offered at more than one size, so a phone does not fetch a desktop image', () => {
  const html = readBuiltPage('/');
  const photographs = images(html).filter((tag) => tag.includes('_astro'));

  assert.ok(photographs.length > 0, 'the home page renders no processed photograph');
  assert.ok(
    photographs.some((tag) => tag.includes('srcset')),
    'no photograph offers a smaller variant to a small screen',
  );
});

test('every photograph declares its dimensions and its alternative text', () => {
  // An empty alt is the right answer for the decorative photographs behind the
  // page headings — what must never happen is an image with no alt at all,
  // which a screen reader reads out as a filename.
  for (const route of PAGES_WITH_PHOTOGRAPHY) {
    for (const tag of images(readBuiltPage(route))) {
      assert.match(tag, /\salt(=|[\s>/])/, `an image on ${route} has no alt attribute`);
      assert.match(tag, /\swidth=/, `an image on ${route} declares no width, so the page will jump`);
      assert.match(tag, /\sheight=/, `an image on ${route} declares no height, so the page will jump`);
    }
  }
});
