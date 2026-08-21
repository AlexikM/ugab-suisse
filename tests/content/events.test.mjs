import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildWithContent, readPage, visibleText } from './helpers.mjs';

test('an event marked as demo content cannot be published', () => {
  const build = buildWithContent('demo-event');

  assert.notEqual(build.status, 0, 'the build should have failed but it succeeded');
  assert.match(build.output, /2099-demo-gala/, 'the failure should name the offending entry');
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

test('the text an editor typed into the entry is on the page', () => {
  const build = withEventFixtures();
  const text = visibleText(readPage(build.outDir, '/evenements/2099-complet'));

  // The Markdown body, as opposed to the fields around it. It reaches the page
  // through the content boundary's `body()` (#47), and a page that quietly
  // stopped rendering it would still pass every other assertion here.
  //
  // Either apostrophe: Markdown is rendered with smart quotes and the
  // frontmatter fields are not, which is a difference in the Markdown pipeline
  // and not something this test has an opinion about.
  assert.match(
    text,
    /Description de l[’']événement/,
    "the event page is not showing the entry's own text",
  );
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

test('an event has an address in every language, and the French one does not move', () => {
  const build = withEventFixtures();

  // Printed on invitations: this address must stay where it is.
  const french = visibleText(readPage(build.outDir, '/evenements/2099-complet'));
  assert.match(french, /Infos pratiques/, 'the French event page is not in French');

  const english = visibleText(readPage(build.outDir, '/en/evenements/2099-complet'));
  assert.match(
    english,
    /Practical information/,
    'an English visitor lands on an event page dressed in French',
  );
});

test('the home page shows what is coming up next', () => {
  const build = withEventFixtures();
  const home = visibleText(readPage(build.outDir, '/'));

  assert.match(home, /Événement au strict minimum/, 'the soonest event is not on the home page');
  assert.doesNotMatch(home, /Soirée déjà passée/, 'a past event is being announced as upcoming');
});

test('past events are listed with their photographs', () => {
  const build = withEventFixtures();
  const page = readPage(build.outDir, '/evenements');

  assert.match(
    visibleText(page),
    /Soirée déjà passée/,
    'the past event is missing from the listing',
  );
  assert.match(page, /exemple-soiree\.jpg/, 'the past event is listed without its photograph');
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
  assert.match(
    home,
    /Au service de l'Arménie/,
    'the home page should still render everything that does not depend on events',
  );
  assert.doesNotMatch(
    home,
    /Prochains événements/,
    'the home page should not announce an empty events section',
  );
});
