// Assertions about what a visitor reads. Run `npm run build` first.
//
// Copy fidelity is spot-checked, not exhaustively asserted: a test that
// restates every string in docs/content/site-copy.md fails on every legitimate
// wording change and trains people to ignore it. What is asserted here is
// identity-critical (who the organisation says it is) or launch-blocking (a
// claim we cannot stand behind).

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { readBuiltPage, visibleText } from './helpers.mjs';

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
