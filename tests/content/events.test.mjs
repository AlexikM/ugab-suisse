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

/** One build, several questions asked of it. */
let eventFields;
function withEventFixtures() {
  if (!eventFields) {
    eventFields = buildWithContent('event-fields');
    assert.equal(eventFields.status, 0, `the build failed:\n${eventFields.output}`);
  }
  return eventFields;
}

test('an event the Comité has only half filled in still renders', () => {
  const build = withEventFixtures();
  const text = visibleText(readPage(build.outDir, '/evenements/2099-minimal'));

  assert.match(text, /Événement au strict minimum/);
  assert.match(text, /Genève/);
  assert.doesNotMatch(text, /undefined|NaN/, 'a missing optional field leaked into the page');
});

test('a visitor sees the programme and the prices before deciding to book', () => {
  const build = withEventFixtures();
  const text = visibleText(readPage(build.outDir, '/evenements/2099-complet'));

  assert.match(text, /Tenue de soirée souhaitée/, 'the dress code is part of the programme');
  assert.match(text, /ouverture par le Président/);
  assert.match(text, /CHF 150 \/ pers\./, 'the prices are not shown');
  assert.match(text, /200/, 'the number of places is not shown');
});

test('a full room stops taking bookings', () => {
  const build = withEventFixtures();
  const page = readPage(build.outDir, '/evenements/2099-complet');

  assert.match(visibleText(page), /Complet/, 'a sold-out event must say so');
  assert.doesNotMatch(
    page,
    /href="https:\/\/example\.invalid\/billets"/,
    'a sold-out event must not still offer the ticket link',
  );

  const listing = visibleText(readPage(build.outDir, '/evenements'));
  assert.match(listing, /Complet/, 'the events listing must show that the room is full');
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
