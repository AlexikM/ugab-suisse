import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildWithContent, readPage, visibleText } from './helpers.mjs';

test('an event marked as demo content cannot be published', () => {
  const build = buildWithContent('demo-event');

  assert.notEqual(build.status, 0, 'the build should have failed but it succeeded');
  assert.match(
    build.output,
    /2099-demo-gala/,
    'the failure should name the offending entry',
  );
});

test('the site still tells a visitor something when there are no events', () => {
  const build = buildWithContent('no-events');

  assert.equal(build.status, 0, `the build failed:\n${build.output}`);

  const events = visibleText(readPage(build.outDir, '/evenements'));
  assert.match(
    events,
    /aucun/i,
    'the events page should say that nothing is scheduled rather than showing an empty page',
  );

  const home = visibleText(readPage(build.outDir, '/'));
  assert.ok(home.length > 0, 'the home page should still render');
});
