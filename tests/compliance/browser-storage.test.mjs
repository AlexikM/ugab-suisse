import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildOutput, buildAssets } from './lib/build-output.mjs';
import { storageWrites, CONSENT_DIALOGUE_MARKERS } from './lib/storage.mjs';

/**
 * The site's claim is that it sets nothing in your browser. That claim is worth
 * more than a consent banner, and it is only worth anything if something checks.
 *
 * Written as a static read of the build output rather than a browser run for the
 * same reason as the request audit: the site is static, so every line of script
 * that could touch storage is in the output, and reading it costs milliseconds
 * with no browser to install and nothing to flake. The browser pass on the
 * pre-launch checklist covers what the providers' own embeds do once they exist,
 * which is the part no static read can answer.
 */

const site = await buildOutput();
const assets = await buildAssets();

const sources = [
  ...site.pages.map((page) => ({ where: page.route, source: page.html })),
  ...assets.map((asset) => ({ where: asset.route, source: asset.source })),
];

const report = (writes) =>
  writes.map((write) => `  ${write.where}\n    ${write.api} — ${write.snippet}`).join('\n');

test('nothing on any page writes to cookies or browser storage', () => {
  const writes = sources.flatMap(({ where, source }) =>
    storageWrites(source).map((write) => ({ where, ...write })),
  );

  assert.deepEqual(
    writes.map((write) => `${write.where}: ${write.api}`),
    [],
    'The site stores something in the visitor’s browser. With no analytics and no login there is nothing that ' +
      'needs storing, and storing anything reintroduces a consent question the site does not otherwise have:\n\n' +
      report(writes),
  );
});

test('no consent dialogue is rendered, because there is nothing to consent to', () => {
  const withDialogue = site.visitorPages
    .filter((page) => CONSENT_DIALOGUE_MARKERS.some((marker) => marker.test(page.html)))
    .map((page) => page.route);

  assert.deepEqual(
    withDialogue,
    [],
    'A consent dialogue is on these pages. Either something now requires consent — in which case declare it in ' +
      '`nonEssentialStorage` in src/i18n/legal.ts so the privacy policy describes it too — or the dialogue is ' +
      'interrupting every visitor to ask about nothing.',
  );
});

test('the donation and ticketing pages are covered, since that is where storage will appear', () => {
  const covered = site.visitorPages.map((page) => page.route);
  for (const route of ['/don/', '/contact/']) {
    assert.ok(
      covered.includes(route),
      `${route} was not built, so the storage audit never looked at the page most likely to gain a third-party embed`,
    );
  }
});
