// The donation surfaces. Run `npm run build` first.
//
// PRD 5 rents the payment flow: the provider owns the card handling, the
// recurring billing, the confirmation email and the donor record, permanently.
// None of that is ours to test, and asserting it from here would test somebody
// else's software while producing tests that break whenever they ship.
//
// What *is* ours, and what these assertions cover:
//
//   - the committee's argument and its suggested amounts reach the page;
//   - the choice a donor makes is presented, in both languages;
//   - nothing on the page can take money, because no account exists;
//   - the QR-bill is a real element and its IBAN is owed, not invented;
//   - the provider's return addresses resolve, in every language;
//   - the page still works when third-party embeds are blocked.

import assert from 'node:assert/strict';
import { test } from 'node:test';

import astroConfig from '../../astro.config.mjs';
import { collectReferences, hostsOf, KIND } from '../compliance/lib/scan.mjs';
import {
  allBuiltPages,
  builtPageExists,
  isLegalPage,
  readBuiltPage,
  visibleText,
  withEmbedsBlocked,
} from './helpers.mjs';

const siteHost = new URL(astroConfig.site).host;

const DONATION_PAGES = ['/don', '/en/don', '/hy/don'];

test('the committee’s suggested amounts reach the page with the impact of each', () => {
  const fr = visibleText(readBuiltPage('/don'));
  for (const amount of ['CHF 50', 'CHF 100', 'CHF 250', 'CHF 500', 'Libre']) {
    assert.match(fr, new RegExp(amount), `${amount} is missing from the donation page`);
  }
  assert.match(fr, /Un repas pour une famille déplacée/);
  assert.match(fr, /Matériel scolaire pour un enfant/);
  assert.match(fr, /Soutien mensuel à un programme culturel/);
  // The copy mixes straight and typographic apostrophes; the assertions accept
  // either rather than depending on which one a given string happens to carry.
  assert.match(fr, /Parrainage d['’]un jeune arménien/);
  assert.match(fr, /100 % affecté à la mission/);

  const en = visibleText(readBuiltPage('/en/don'));
  assert.match(en, /A meal for a displaced family/);
  assert.match(en, /School supplies for one child/);
  assert.match(en, /Monthly support for a cultural programme/);
  assert.match(en, /Sponsorship of one Armenian youth/);
  assert.match(en, /100% mission-dedicated/);
});

test('the amounts are a choice a donor can make, not a price list to read', () => {
  for (const route of DONATION_PAGES) {
    const html = readBuiltPage(route);
    for (const value of ['50', '100', '250', '500', 'free']) {
      assert.match(
        html,
        new RegExp(`data-donation-amount="${value}"`),
        `${route} offers no way to choose ${value}`,
      );
    }
    assert.match(html, /data-donation-amount-free/, `${route} offers no free amount field`);
  }
});

test('giving once and giving monthly are presented as a choice', () => {
  for (const route of DONATION_PAGES) {
    const html = readBuiltPage(route);
    assert.match(html, /data-donation-frequency="once"/, `${route} does not offer a one-off gift`);
    assert.match(
      html,
      /data-donation-frequency="monthly"/,
      `${route} does not offer a monthly gift`,
    );
  }

  assert.match(visibleText(readBuiltPage('/don')), /Une seule fois/);
  assert.match(visibleText(readBuiltPage('/don')), /Chaque mois/);
  assert.match(visibleText(readBuiltPage('/en/don')), /Every month/);
});

/**
 * The constraint the whole PRD rests on. No payment account exists, so the page
 * must not contain anything that looks like it could take money: no form, no
 * submit, no provider script, no key. A control that appeared to work and did
 * not would be worse than the empty layout this replaced.
 */
test('nothing on the donation page can take money, because no provider is connected', () => {
  for (const route of DONATION_PAGES) {
    const html = readBuiltPage(route);

    assert.doesNotMatch(html, /<form\b/i, `${route} carries a form and no handler exists`);
    assert.doesNotMatch(
      html,
      /type="submit"/i,
      `${route} offers a submit control with nothing behind it`,
    );
    assert.match(
      html,
      /data-provider-slot="payment"/,
      `${route} does not mark where the provider's form will go`,
    );
    assert.match(
      html,
      /data-provider-state="pending"/,
      `${route} does not declare that the payment provider is not connected`,
    );
  }
});

/**
 * The processor register in `src/i18n/legal.ts` lists both the payment and the
 * ticketing provider as `planned`, and the compliance audit fails if a `planned`
 * processor turns out to be contacted. This is the same claim asked of the
 * markup: no page may present a provider slot as connected while no account
 * exists. It caught a real case — an event carrying a ticket link the committee
 * pasted in by hand was reporting itself as having a provider behind it.
 */
test('no page claims a provider is connected while none is', () => {
  for (const page of allBuiltPages()) {
    assert.doesNotMatch(
      page.html,
      /data-provider-state="connected"/,
      `${page.route} presents a provider slot as connected. No payment or ticketing account ` +
        'exists (ADR-0001), and src/i18n/legal.ts still declares both as `planned`. Flip the ' +
        'register first, or the privacy policy and the page disagree.',
    );
  }
});

test('the slot waiting for the provider is not an empty box', () => {
  const fr = visibleText(readBuiltPage('/don'));

  // It says why it is empty...
  assert.match(fr, /prestataire de paiement suisse/);
  assert.match(fr, /rien n['’]est débité/);
  // ...and offers the two routes that do work today.
  assert.match(fr, /Donner par virement/, 'the transfer route is not offered');
  assert.match(readBuiltPage('/don'), /href="#virement"/);
  assert.match(readBuiltPage('/don'), /href="[^"]*\/contact\/?"/, 'no route to a human');
});

test('the Swiss QR-bill is on the page, in every language', () => {
  for (const route of DONATION_PAGES) {
    const html = readBuiltPage(route);
    assert.match(html, /data-qr-bill\b/, `${route} carries no QR-bill`);
  }

  const fr = visibleText(readBuiltPage('/don'));
  for (const field of ['Récépissé', 'Section paiement', 'Compte / Payable à', 'Point de dépôt']) {
    assert.match(fr, new RegExp(field), `the QR-bill is missing the "${field}" field`);
  }

  const en = visibleText(readBuiltPage('/en/don'));
  for (const field of ['Receipt', 'Payment part', 'Account / Payable to', 'Acceptance point']) {
    assert.match(en, new RegExp(field), `the English QR-bill is missing the "${field}" field`);
  }
});

/**
 * The single worst thing this page could do. A plausible-looking wrong IBAN
 * sends a stranger's money to a stranger, and nobody re-checks a field that
 * looks filled in — so the account is marked as owed by the committee (#9)
 * everywhere it appears, and no account number is published anywhere on the
 * site until one is confirmed in writing.
 */
test('no IBAN is invented, and the account is visibly marked as owed by the committee', () => {
  // CH + two check digits + 17 further characters. The one shape that matters.
  const SWISS_IBAN = /\bCH\s?\d{2}(?:\s?[0-9A-Z]){17}\b/;

  for (const page of allBuiltPages()) {
    assert.doesNotMatch(
      visibleText(page.html),
      SWISS_IBAN,
      `${page.route} publishes an IBAN. The committee has not supplied one (#9).`,
    );
  }

  for (const route of DONATION_PAGES) {
    const html = readBuiltPage(route);
    assert.match(
      html,
      /data-qr-bill-state="pending"/,
      `${route} presents the QR-bill as ready when there is no account behind it`,
    );
    assert.match(html, /data-qr-pending/, `${route} does not mark the account field as owed`);
  }

  assert.match(visibleText(readBuiltPage('/don')), /IBAN à fournir par le Comité/);
  assert.match(visibleText(readBuiltPage('/en/don')), /IBAN to be supplied by the Committee/);
});

test('the thank-you page is reachable directly, at its own address, in every language', () => {
  for (const route of ['/don/merci', '/en/don/merci', '/hy/don/merci']) {
    assert.ok(builtPageExists(route), `no thank-you page was built at ${route}`);
    assert.match(
      readBuiltPage(route),
      /data-thanks="donation"/,
      `${route} is not the donation confirmation`,
    );
  }
});

test('the thank-you page carries the committee’s own confirmation wording', () => {
  const fr = visibleText(readBuiltPage('/don/merci'));
  assert.match(fr, /Merci pour ce geste\. Votre don agit, dès aujourd['’]hui, pour l['’]Arménie\./);

  const en = visibleText(readBuiltPage('/en/don/merci'));
  assert.match(en, /Thank you for this gift\. Your donation is already at work for Armenia\./);

  // Armenian has no copy yet (#9) and falls back to French, as every other page
  // does. What must not happen is a donor being thanked in nothing at all.
  assert.match(visibleText(readBuiltPage('/hy/don/merci')), /Merci pour ce geste/);
});

test('somebody who lands on the thank-you page without giving is told the truth', () => {
  assert.match(visibleText(readBuiltPage('/don/merci')), /n['’]est pas encore activé/);
  assert.match(visibleText(readBuiltPage('/en/don/merci')), /not switched on yet/);
});

/**
 * The approved confirmation ends "Reçu envoyé par e-mail". It is not carried,
 * and must not arrive by another route: nothing sends a receipt today, and the
 * automatic-receipt promise is half of the launch-blocking claim in section A1
 * of the pre-launch checklist. The tax-deductibility half is asserted in
 * copy.test.mjs; this is the other half, stated as a promise about email.
 */
test('no page promises a donor a receipt by email', () => {
  // The two legal pages are excluded for the reason given by `isLegalPage`,
  // plus a narrower one of their own: "reçu" is also the past participle of
  // *recevoir*, and a privacy policy describing "un message reçu par e-mail"
  // would trip this without promising anybody anything.
  for (const page of allBuiltPages()) {
    if (isLegalPage(page.route)) continue;
    const text = visibleText(page.html);
    assert.doesNotMatch(
      text,
      /reçu[^.!?]{0,60}e-?mail/i,
      `${page.route} promises a receipt by email`,
    );
    assert.doesNotMatch(
      text,
      /receipt[^.!?]{0,60}e-?mail/i,
      `${page.route} promises a receipt by email`,
    );
  }
});

test('the donation page still gives a visitor something useful with embeds blocked', () => {
  for (const route of DONATION_PAGES) {
    const text = visibleText(withEmbedsBlocked(readBuiltPage(route)));

    // The argument the committee wrote.
    assert.match(text, /120 (ans|years)/, `${route} loses the impact argument`);
    // The route that costs the committee nothing.
    assert.match(text, /Récépissé|Receipt/, `${route} loses the QR-bill`);
    // And a way to reach a person.
    assert.match(
      withEmbedsBlocked(readBuiltPage(route)),
      /href="[^"]*\/contact\/?"/,
      `${route} loses its route to the committee`,
    );
  }
});

test('the donation page loads nothing from a payment host today', () => {
  for (const route of DONATION_PAGES.concat(['/don/merci'])) {
    const references = collectReferences({
      page: route,
      html: readBuiltPage(route),
      siteHost,
    });
    assert.deepEqual(
      hostsOf(references, KIND.AUTOMATIC),
      [],
      `${route} fetches from a third party. No payment account exists (ADR-0001), so nothing ` +
        'should be loaded from one — and when one does, it belongs in the processor register ' +
        'in src/i18n/legal.ts before it belongs on the page.',
    );
    assert.deepEqual(hostsOf(references, KIND.FORM_TARGET), [], `${route} posts to a third party`);
  }
});
