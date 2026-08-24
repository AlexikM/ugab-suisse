// The ticketing surfaces. Builds the site against the event fixtures.
//
// PRD 6 rents ticketing: stock, payment, e-tickets and the door list belong to
// the provider, permanently. None of them are tested here — asserting them
// would test somebody else's software and break whenever they ship.
//
// What is tested is the part that is ours, and the first of these is the one
// most likely to embarrass the committee if it ever stops being true:
//
//   - a full room shows a sold-out state and no active booking control;
//   - ticket types and prices come from the fields the committee fills in;
//   - no page ever states a number of places — the provider owns the quota;
//   - an incomplete event renders — which is the normal case, not the exception;
//   - a past event shows its photographs rather than a dead booking link;
//   - the provider's return address resolves, in every language;
//   - the pages still work with third-party embeds blocked;
//   - the host the widget loads from is the one the privacy policy names.

import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

import astroConfig from '../../astro.config.mjs';
import { declaredHosts } from '../compliance/lib/declared.mjs';
import { collectReferences, hostsOf, KIND } from '../compliance/lib/scan.mjs';
import {
  allBuiltPages,
  buildWithContent,
  builtPageExists,
  readBuiltPage,
  readPage,
  repoRoot,
  visibleText,
  withEmbedsBlocked,
} from './helpers.mjs';

const siteHost = new URL(astroConfig.site).host;

/** One build of the fixtures, several questions asked of it. */
let fixtures;
function events() {
  if (!fixtures) {
    fixtures = buildWithContent('event-fields');
    assert.equal(fixtures.status, 0, `the build failed:\n${fixtures.output}`);
  }
  return fixtures;
}

const page = (slug, locale = '') =>
  readPage(events().outDir, `${locale}/evenements/${slug}`.replace(/^\/+/, '/'));

// ---------------------------------------------------------------------------
// A full room
// ---------------------------------------------------------------------------

/**
 * The assertion this file exists for.
 *
 * A statically generated page will happily show a working booking button until
 * somebody rebuilds it, however full the room is. The committee's answer is the
 * `soldOut` flag on the fiche, and its whole value is that setting it removes
 * every way to book — not most of them. Oversold seats at a seated dinner is
 * the failure that costs the committee an evening.
 */
test('a full room shows a sold-out state and offers no way to book, in every language', () => {
  for (const locale of ['', '/en', '/hy']) {
    const html = page('2099-complet', locale);
    const where = `${locale || '/fr'}/evenements/2099-complet`;

    assert.match(html, /data-booking="sold-out"/, `${where} does not declare the room full`);

    assert.doesNotMatch(
      html,
      /data-booking-control/,
      `${where} still renders an active booking control on a full room`,
    );
    assert.doesNotMatch(
      html,
      /<a\b[^>]*href="https:\/\/example\.invalid/i,
      `${where} still links to the ticket shop for a full room`,
    );
    // No widget either: with the flag set by hand there is nothing a booking
    // widget could usefully say next to the committee's own answer.
    assert.doesNotMatch(
      html,
      /data-provider-slot="ticketing"/,
      `${where} still mounts a booking widget on a full room`,
    );
  }

  const fr = visibleText(page('2099-complet'));
  assert.match(fr, /Complet/, 'a sold-out event must say so');
  assert.match(fr, /Toutes les places ont été attribuées/, 'it must say what sold out means');

  assert.match(visibleText(page('2099-complet', '/en')), /Sold out/);
  assert.match(visibleText(page('2099-complet', '/en')), /Every place has been taken/);
});

test('the listing says a room is full, and offers no booking control of its own', () => {
  const listing = readPage(events().outDir, '/evenements');

  assert.match(visibleText(listing), /Complet/, 'the listing must show that the room is full');
  assert.doesNotMatch(
    listing,
    /data-booking-control/,
    'the listing offers a booking control, which is a second place for the rule to drift',
  );
});

// ---------------------------------------------------------------------------
// Ticket types, prices, and the number of places we do not claim
// ---------------------------------------------------------------------------

test('ticket types and prices come from the fiche, split into the types they name', () => {
  // The brief's own fiche événement: one gala, three ticket types, one room.
  const html = page('2099-tarifs-sans-billetterie');
  const types = [...html.matchAll(/data-ticket-type\b/g)];
  assert.ok(types.length >= 3, `three ticket types were written, ${types.length} were rendered`);

  const text = visibleText(html);
  assert.match(text, /CHF 150 \/ pers\./);
  assert.match(text, /CHF 250 \/ couple/);
  assert.match(text, /CHF 1'200 \/ table VIP/, 'the VIP table is not offered as its own ticket');
});

test('a price list the committee wrote as one line is not mangled into fragments', () => {
  // Two types here, not three: whatever the committee typed comes back whole.
  const text = visibleText(page('2099-complet'));
  assert.match(text, /CHF 150 \/ pers\./);
  assert.match(text, /CHF 250 \/ couple/);
});

/**
 * The regression test for a field that was removed, and the reason it is
 * written against every built page rather than against a component.
 *
 * `capacity` used to render as « Nombre de places — places disponibles pour
 * l'ensemble des tarifs »: a number the site asserted and nothing verified.
 * The provider owns the quota now, so ours would be a second truth that drifts
 * the first time ten seats are added to a room — quietly, on the page a visitor
 * reads before deciding to come.
 *
 * A number of places is exactly the kind of detail that reappears in a later
 * template because it looks helpful. So this is phrased as a prohibition over
 * the whole build, and it is the assertion that has to fail before anyone can
 * put one back.
 *
 * Both builds are swept, and the fixture one is the half that matters. Real
 * events are excluded from the repository — the only fiches committed are the
 * committee's, and it has not delivered any (#9) — so on a clean checkout the
 * live build contains no event page at all and a prohibition read only from
 * `dist/` would pass by having nothing to look at. The fixtures always carry an
 * event, and one of them still carries `capacity:` in its frontmatter on
 * purpose.
 */
test('no built page tells a visitor how many places there are', () => {
  // A number immediately before the word, in either language. « Toutes les
  // places ont été attribuées » carries no figure and is not a claim about
  // stock; « 180 places » is.
  const claim = /\d[\d'\u2019\u00a0 ]*places\b/i;

  const fixturePages = [
    '2099-complet',
    '2099-tarifs-sans-billetterie',
    '2099-minimal',
    '2020-passe',
  ]
    .flatMap((slug) => ['', '/en', '/hy'].map((locale) => ({ slug, locale })))
    .map(({ slug, locale }) => ({
      route: `[fixture] ${locale || ''}/evenements/${slug}`,
      html: page(slug, locale),
    }));

  const claiming = [...allBuiltPages(), ...fixturePages]
    .map((page) => ({ route: page.route, text: visibleText(page.html) }))
    .filter((page) => claim.test(page.text))
    .map((page) => `  ${page.route}  →  ${page.text.match(claim)[0].trim()}`);

  assert.deepEqual(
    claiming,
    [],
    'These pages state a number of places:\n\n' +
      `${claiming.join('\n')}\n\n` +
      'The ticketing provider owns the quota (PRD 6). A number here is a second truth that ' +
      'drifts the first time the room changes, and nothing on this site can verify it. Say ' +
      'nothing about how many places exist, and let the booking widget report what is left.',
  );
});

/**
 * The other half of the removal, and the half that protects an editor rather
 * than a visitor.
 *
 * `capacity` was a real field for months, so fiches in git still carry it —
 * `2099-tarifs-sans-billetterie` does, on purpose, and must keep doing so. The
 * site refuses to build over several things an editor can get wrong (a reversed
 * date, a deleted photograph, an invented event) and each refusal was chosen
 * because publishing the mistake was worse. A field nobody reads any more is
 * not in that category: failing there would take the whole site off the air
 * over frontmatter that changes nothing.
 */
test('a fiche still carrying the removed capacity field builds, and says nothing about it', () => {
  const html = page('2099-tarifs-sans-billetterie');
  const text = visibleText(html);

  // Not a bare `200`: the price list on this fiche contains « CHF 1'200 / table
  // VIP », and matching that would fail on the committee's prices rather than
  // on the removed field.
  assert.doesNotMatch(
    text,
    /\d[\d'\u2019\u00a0 ]*places\b/i,
    'the removed field is rendered again',
  );
  assert.match(text, /CHF 150 \/ pers\./, 'the rest of the fiche stopped rendering');
});

// ---------------------------------------------------------------------------
// The booking widget
// ---------------------------------------------------------------------------

/**
 * The answer to the problem PRD 6 opens with: a statically generated page has no
 * knowledge of live stock, and will show a working booking button until somebody
 * rebuilds it, however sold out the event is.
 *
 * Embedding the provider's own widget resolves that, because availability is
 * then reported by the system that owns it. It is the only mechanism by which a
 * page with no server can be accurate about a room.
 */
test('an event carrying a shop identifier mounts the provider’s booking widget', () => {
  const html = page('2099-billetterie-integree');

  assert.match(html, /data-booking="open"/, 'an event with a shop is not taking bookings');
  assert.match(html, /data-provider-slot="ticketing"/, 'no slot for the widget to mount into');
  assert.match(
    html,
    /data-provider-state="connected"/,
    'the slot still reports itself as waiting for a provider that is in fact mounted',
  );
  assert.match(
    html,
    /gala-de-test-1234/,
    'the shop identifier from the fiche does not reach the embed, so the widget would open ' +
      'somebody else’s till — or none',
  );
});

/**
 * Both fields on one fiche is not a mistake to refuse — it is what happens when
 * a committee that has been pasting links for a year creates its first till and
 * fills in the new field without clearing the old one. The page has to answer,
 * and it must not answer twice: two buttons for one action is a worse page than
 * either button alone.
 *
 * The widget wins, because it is the one that can report live availability,
 * which is the entire reason PRD 6 embeds anything. Removing the identifier is
 * how a committee chooses the plain link — which is the choice the two separate
 * fields exist to give them.
 */
test('a fiche carrying both a shop and a link offers the widget, once', () => {
  const html = page('2099-billetterie-double');

  assert.match(html, /data-ticketing-embed="concert-de-test-5678"/, 'the widget is not mounted');
  assert.doesNotMatch(
    html,
    /href="https:\/\/example\.invalid\/lien-double"/,
    'the page offers the old link beside the widget — two ways to do one thing',
  );

  const controls = [...html.matchAll(/data-booking-control/g)];
  assert.equal(
    controls.length,
    1,
    `one way to book was expected, ${controls.length} were rendered`,
  );
});

// ---------------------------------------------------------------------------
// Incomplete events — the normal case
// ---------------------------------------------------------------------------

test('an event with prices but no ticketing link renders, and offers a route to a human', () => {
  const html = page('2099-tarifs-sans-billetterie');
  const text = visibleText(html);

  assert.match(text, /CHF 150 \/ pers\./, 'the prices the committee published are missing');
  assert.match(html, /data-booking="unavailable"/);
  assert.doesNotMatch(
    html,
    /data-booking-control/,
    'there is nowhere to book, so nothing to click',
  );
  assert.match(
    html,
    /data-provider-slot="ticketing"/,
    'the slot the booking widget will mount into is not marked',
  );
  assert.match(html, /data-provider-state="pending"/);
  assert.match(html, /href="[^"]*\/contact\/?"/, 'no way to ask the committee for a place');
  assert.doesNotMatch(text, /undefined|NaN/);
});

test('an event with a ticketing link but no price list renders and takes bookings', () => {
  const html = page('2099-billetterie-sans-tarifs');

  assert.match(html, /data-booking="open"/);
  assert.match(html, /data-booking-control/, 'an open event should offer a way to book');
  assert.match(html, /href="https:\/\/example\.invalid\/concert"/);
  assert.doesNotMatch(html, /data-ticket-types/, 'no prices were written, so none should appear');
  assert.doesNotMatch(visibleText(html), /undefined|NaN/);

  // A ticket link the committee pasted onto the fiche is not a ticketing
  // provider. The slot is where a booking widget will mount; nothing has
  // mounted in it, whatever else the page can offer.
  assert.doesNotMatch(
    html,
    /data-provider-state="connected"/,
    'a committee-supplied ticket link is being reported as a connected provider',
  );
});

test('a table or a company booking is pointed at the committee, not at a card', () => {
  // PRD 6: "Large amounts go by invoice. VIP tables and sponsorship packages
  // are handled by invoice and bank transfer, not card." On a four-figure table
  // the card fee is material, and a corporate buyer wants an invoice anyway.
  const html = page('2099-tarifs-sans-billetterie');

  assert.match(visibleText(html), /table ou une réservation d['’]entreprise/);
  assert.match(html, /href="[^"]*\/contact\/?"/);

  assert.match(
    visibleText(page('2099-tarifs-sans-billetterie', '/en')),
    /table or a company booking/,
  );
});

test('a page taking bookings does not pretend to know how many places are left', () => {
  // A prebuilt page cannot know a provider's remaining stock. Saying so is the
  // honest answer, and it is what the embedded widget will replace.
  assert.match(
    visibleText(page('2099-billetterie-sans-tarifs')),
    /n['’]est pas affiché sur cette page/,
  );
  assert.match(visibleText(page('2099-billetterie-sans-tarifs', '/en')), /not shown on this page/);
});

test('an event with only a date and a venue still renders', () => {
  const html = page('2099-minimal');
  const text = visibleText(html);

  assert.match(text, /Événement au strict minimum/);
  assert.match(text, /Genève/);
  assert.match(html, /data-booking="unavailable"/);
  assert.doesNotMatch(text, /undefined|NaN/, 'a missing optional field leaked into the page');
  assert.doesNotMatch(html, /src="undefined"/, 'a missing photograph became a broken image');
});

// ---------------------------------------------------------------------------
// Past events
// ---------------------------------------------------------------------------

test('a past event shows its photographs and no booking control', () => {
  const html = page('2020-passe');

  assert.match(html, /data-booking="past"/);
  assert.doesNotMatch(html, /data-booking-control/, 'a past event must not take bookings');
  assert.doesNotMatch(
    html,
    /data-provider-slot="ticketing"/,
    'a past event has nothing for a booking widget to do',
  );

  const text = visibleText(html);
  assert.match(text, /En images/, 'the archive page shows no gallery');
  assert.match(html, /hero\.jpg/, 'the photograph the committee supplied is not shown');
});

// ---------------------------------------------------------------------------
// The provider's return address
// ---------------------------------------------------------------------------

test('the booking confirmation page is reachable directly, in every language', () => {
  for (const route of ['/evenements/merci', '/en/evenements/merci', '/hy/evenements/merci']) {
    assert.ok(builtPageExists(route), `no booking confirmation was built at ${route}`);
    assert.match(readBuiltPage(route), /data-thanks="booking"/, `${route} is not the confirmation`);
  }

  assert.match(visibleText(readBuiltPage('/evenements/merci')), /Réservation confirmée/);
  assert.match(visibleText(readBuiltPage('/en/evenements/merci')), /Booking confirmed/);
  assert.match(visibleText(readBuiltPage('/hy/evenements/merci')), /Réservation confirmée/);
});

test('no event may claim the address the booking confirmation uses', () => {
  // `/evenements/merci` is a static route in the same directory as the event
  // slug route, so an event called `merci` would be silently unreachable.
  const dir = path.join(repoRoot, 'src', 'content', 'events');
  const slugs = readdirSync(dir)
    .filter((file) => file.endsWith('.md'))
    .map((file) => file.replace(/\.md$/, ''));

  assert.ok(
    !slugs.includes('merci'),
    'an event slug "merci" collides with the booking confirmation page — rename the entry',
  );
});

// ---------------------------------------------------------------------------
// Degradation
// ---------------------------------------------------------------------------

test('an event page still shows the event and a contact route with embeds blocked', () => {
  for (const slug of [
    '2099-complet',
    '2099-tarifs-sans-billetterie',
    '2099-minimal',
    '2099-billetterie-integree',
  ]) {
    const blocked = withEmbedsBlocked(page(slug));
    const text = visibleText(blocked);

    assert.match(text, /Genève|Salle de test/, `${slug} loses its venue`);
    assert.match(text, /2099/, `${slug} loses its date`);
    assert.match(blocked, /href="[^"]*\/contact\/?"/, `${slug} loses its route to the committee`);
  }

  assert.match(
    visibleText(withEmbedsBlocked(page('2099-complet'))),
    /CHF 150 \/ pers\./,
    'a blocked embed must not take the price list with it',
  );
});

/**
 * The degradation that now removes something real.
 *
 * Until the widget existed, blocking embeds on an event page took nothing away —
 * worth asserting, and asserted, but not yet a test of anything. The booking
 * panel is an iframe, so this is the first time the helper strips the thing the
 * visitor came for.
 *
 * An ad blocker, a corporate proxy and a provider having a bad afternoon all
 * produce the same page, and none of them are rare. What must survive is not the
 * booking — that is gone, honestly — but a visitor's ability to find out that
 * the evening exists and that a human will answer.
 */
test('a blocked booking panel leaves the visitor a way through, not an empty box', () => {
  const blocked = withEmbedsBlocked(page('2099-billetterie-integree'));
  const text = visibleText(blocked);

  assert.doesNotMatch(
    blocked,
    /<iframe/i,
    'the helper did not block the panel, so this proves nothing',
  );

  assert.match(text, /CHF 150 \/ pers\./, 'the price list went with the blocked frame');
  assert.match(
    text,
    /bloqueur de publicité|réseau d['’]entreprise/,
    'nothing tells the visitor why the booking panel is missing, so the page reads as broken',
  );
  assert.match(blocked, /href="[^"]*\/contact\/?"/, 'no route to a human once the panel is gone');
});

/**
 * The coupling that breaks silently, and the reason it is asserted from the
 * built page rather than from the register.
 *
 * `src/i18n/legal.ts` names the ticketing host, and `TicketingEmbed.astro`
 * builds the booking panel's address. Those are two independent literals that
 * happen to agree today. PRD 6 keeps a fallback provider and designs the embed
 * so that switching to it costs one line — which means the day somebody takes
 * that option, the widget starts contacting Eventfrog while the privacy policy
 * still tells the reader it is Infomaniak. Every existing audit passes: the page
 * declares a host, the site contacts a host, and nobody compares the two for
 * *this* pair.
 *
 * The register is not imported here for the same reason `declared.mjs` does not
 * import it — reading the source would prove the data matches the data. This
 * reads what a visitor is shown on the privacy page, in the same build, and
 * compares it against what the page they are booking from actually loads.
 */
test('the host the booking widget contacts is one the privacy policy names', () => {
  const html = page('2099-billetterie-integree');
  const contacted = hostsOf(
    collectReferences({ page: '2099-billetterie-integree', html, siteHost }),
    KIND.AUTOMATIC,
  );

  assert.ok(
    contacted.length > 0,
    'the booking widget contacts nothing, so either the embed stopped mounting or the scanner ' +
      'stopped seeing it — either way this test is no longer proving anything',
  );

  const privacy = readPage(events().outDir, '/confidentialite');
  const declared = declaredHosts(privacy);
  const named = new Set([...declared.active, ...declared.planned, ...declared.preLaunch]);

  const undeclared = contacted.filter((host) => !named.has(host));

  assert.deepEqual(
    undeclared,
    [],
    `The booking widget loads from ${undeclared.join(', ')}, which the privacy policy does not ` +
      'name anywhere.\n\nThe likely cause is a change of ticketing provider: the address in ' +
      'src/components/TicketingEmbed.astro moved and the processor register in src/i18n/legal.ts ' +
      'did not follow. Both have to move together — the register is what the visitor is shown, ' +
      'and the embed is what their browser actually does.',
  );
});

/**
 * The complement, and the assertion the plain-link path exists to keep true.
 *
 * A ticket link the committee pasted onto a fiche is a link. It is followed
 * because a visitor chose to follow it, and nothing about the announcement page
 * reaches the provider before that — no frame, no script, no beacon. That is the
 * difference the two fields are there to give the Comité, and it is worth an
 * assertion rather than a promise, because "it is only a link" is exactly the
 * sentence somebody says while adding a tracking pixel beside it.
 */
test('an event sold through a plain link contacts nobody until the visitor clicks', () => {
  for (const slug of [
    '2099-billetterie-sans-tarifs',
    '2099-tarifs-sans-billetterie',
    '2099-minimal',
  ]) {
    const references = collectReferences({ page: slug, html: page(slug), siteHost });

    assert.deepEqual(
      hostsOf(references, KIND.AUTOMATIC),
      [],
      `${slug} fetches from a third party while the page loads, and it carries no shop ` +
        'identifier — so whatever is doing it is not the booking widget.',
    );
  }
});

/**
 * The published site, as opposed to the fixtures.
 *
 * No committee fiche carries a shop identifier yet, and until one does the
 * ticketing processor is honestly disclosed as `planned` — a promise about a
 * host the browser does not yet contact. The moment an events officer pastes an
 * identifier onto a real announcement, that stops being true, and it stops being
 * true through an ordinary editorial action taken by somebody who has never
 * heard of a processor register.
 *
 * That case is already caught: tests/compliance/third-party-requests.test.mjs fails
 * on a `planned` processor whose host turns up in the build, with a message
 * naming the file and the change. This test is the narrower, earlier one — it
 * says the situation has not arisen yet, so the disclosure the site publishes
 * today is accurate today.
 */
test('no published event page contacts a ticketing host yet', () => {
  const eventPages = allBuiltPages().filter((built) => /\/evenements\/[^/]+\/?$/.test(built.route));

  for (const built of eventPages) {
    const automatic = hostsOf(
      collectReferences({ page: built.route, html: built.html, siteHost }),
      KIND.AUTOMATIC,
    );

    assert.deepEqual(
      automatic,
      [],
      `${built.route} loads from a third party while the page opens. If that is a booking ` +
        'widget, the ticketing processor in src/i18n/legal.ts has to move from `planned` to ' +
        '`active` in the same change — the privacy policy currently tells the reader that ' +
        'nothing is contacted.',
    );
  }
});
