// Assertions about what a visitor reads. Run `npm run build` first.
//
// Copy fidelity is spot-checked, not exhaustively asserted: a test that
// restates every string in docs/content/site-copy.md fails on every legitimate
// wording change and trains people to ignore it. What is asserted here is
// identity-critical (who the organisation says it is) or launch-blocking (a
// claim we cannot stand behind).

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { allBuiltPages, isLegalPage, readBuiltPage, visibleText } from './helpers.mjs';

/**
 * The legal notice and the privacy policy are swept by
 * tests/compliance/legal-pages.test.mjs instead, in every language. See
 * `isLegalPage` in ./helpers.mjs for why the blunter sweeps below would misread
 * those two pages — they deny the claims these assertions look for, and a
 * substring cannot tell a denial from an assertion.
 */
const sitePages = () => allBuiltPages().filter((page) => !isLegalPage(page.route));

test('the site calls the organisation what the committee calls itself', () => {
  assert.match(
    visibleText(readBuiltPage('/')),
    /UGAB Comité Suisse/,
    'the committee is "UGAB Comité Suisse — Genève", not "UGAB Suisse"',
  );
  assert.match(visibleText(readBuiltPage('/en/')), /AGBU Swiss Committee/);

  for (const page of sitePages()) {
    assert.doesNotMatch(
      visibleText(page.html),
      /Section suisse/,
      `${page.route} still describes the committee as a "section"`,
    );
  }
});

test('the home page carries the approved hero and key figures', () => {
  const fr = visibleText(readBuiltPage('/'));

  assert.match(fr, /Au service de l'Arménie et de sa diaspora depuis 1906/);
  assert.match(fr, /1906/);
  assert.match(fr, /30\+/);
  assert.match(fr, /5 continents/);

  const en = visibleText(readBuiltPage('/en/'));
  assert.match(en, /Serving Armenia and its diaspora since 1906/);
});

test('the About page tells the founding story the committee wrote', () => {
  const fr = visibleText(readBuiltPage('/a-propos'));

  assert.match(fr, /Boghos Nubar/, 'the founder is not named');
  assert.match(fr, /15 avril 1906/, 'the founding date is not given');
  assert.match(fr, /Comité Suisse/);

  assert.match(visibleText(readBuiltPage('/en/a-propos')), /Boghos Nubar/);
});

test('the donation page makes the impact argument and shows the suggested amounts', () => {
  const fr = visibleText(readBuiltPage('/don'));

  assert.match(fr, /Chaque don change une vie/);
  assert.match(fr, /CHF 50/);
  assert.match(fr, /Un repas pour une famille déplacée/);

  const en = visibleText(readBuiltPage('/en/don'));
  assert.match(en, /Every donation changes a life/);
  assert.match(en, /A meal for a displaced family/);
});

test('a company representative finds the partnership offer on the donation page', () => {
  const fr = visibleText(readBuiltPage('/don'));

  assert.match(fr, /Devenez partenaire de nos événements de prestige/);
  for (const tier of ['Bronze', 'Argent', 'Or', 'Platine']) {
    assert.match(fr, new RegExp(tier), `the ${tier} tier is missing`);
  }
  assert.match(
    fr,
    /indicatifs/i,
    'the tier amounts are not confirmed by the Comité and the page must say so',
  );

  const en = visibleText(readBuiltPage('/en/don'));
  assert.match(en, /Become a partner of our prestigious events/);
  assert.match(en, /Indicative amounts/i);
});

test('nothing claims donations are tax-deductible or receipted automatically', () => {
  // Both halves are unverified and block launch. They are handled under PRD 7
  // (#7) and must not arrive by accident before then.
  for (const page of sitePages()) {
    const text = visibleText(page.html);
    assert.doesNotMatch(text, /déductible|deductib/i, `${page.route} claims tax deductibility`);
    assert.doesNotMatch(
      text,
      /reçu (fiscal|automatique)/i,
      `${page.route} promises an automatic receipt`,
    );
    assert.doesNotMatch(text, /automatic receipt/i, `${page.route} promises an automatic receipt`);
    assert.doesNotMatch(text, /utilité publique/i, `${page.route} claims public-utility status`);
  }
});

test('no invented statistic is published', () => {
  // Donor counts, amounts transferred, families supported and audience reach
  // were all made up to fill a layout.
  const invented = [/\b643\b/, /200\s?K/, /1'400/, /8\s?000/, /300\+/];

  for (const page of sitePages()) {
    const text = visibleText(page.html);
    for (const pattern of invented) {
      assert.doesNotMatch(text, pattern, `${page.route} publishes an invented figure`);
    }
  }
});

test('the message a visitor reads after writing to the committee is the approved one', () => {
  assert.match(
    visibleText(readBuiltPage('/contact')),
    /Message bien reçu\. Le Comité Suisse vous répond très vite\./,
  );
  assert.match(
    visibleText(readBuiltPage('/en/contact')),
    /Message received\. The Swiss Committee will reply shortly\./,
  );
});

test('a visitor can reach the committee from the contact page', () => {
  const html = readBuiltPage('/contact');

  assert.match(html, /href="mailto:[^"]+@[^"]+"/, 'the contact page offers no email address');
});

test('the site does not advertise a regional structure the brief does not describe', () => {
  const contact = visibleText(readBuiltPage('/contact'));

  assert.doesNotMatch(
    contact,
    /antenne/i,
    'the brief describes a single Geneva-based Comité Suisse, with no regional antennes',
  );
});
