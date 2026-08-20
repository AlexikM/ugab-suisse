// The Bureau du Comité section of the About page.
//
// The Comité has delivered neither portraits nor biographies (#9), so the point
// of these tests is that the section publishes anyway: an officer with nothing
// but a role and a name must still appear, without a broken image.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildWithContent, readPage, visibleText } from './helpers.mjs';

let build;
function bureauBuild() {
  if (!build) {
    build = buildWithContent('bureau');
    assert.equal(build.status, 0, `the build failed:\n${build.output}`);
  }
  return build;
}

test('the About page presents the officers in the order the brief lists them', () => {
  const text = visibleText(readPage(bureauBuild().outDir, '/a-propos'));

  const president = text.indexOf('Président');
  const secretaire = text.indexOf('Secrétaire');
  const tresorier = text.indexOf('Trésorier');

  assert.ok(president >= 0, 'the Président is not on the page');
  assert.ok(secretaire > president, 'the Secrétaire Général should follow the Président');
  assert.ok(tresorier > secretaire, 'the Trésorier should come last');

  assert.match(text, /président de test/i, 'the officer’s name is missing');
});

test('an officer with no portrait and no biography still appears', () => {
  const page = readPage(bureauBuild().outDir, '/a-propos');
  const text = visibleText(page);

  assert.match(text, /trésorière de test/i, 'the officer without a portrait was dropped');
  assert.doesNotMatch(page, /<img[^>]+src=""/, 'a missing portrait rendered as a broken image');
  assert.doesNotMatch(text, /undefined/, 'a missing field leaked into the page');
});

test('a biography is read in the language of the page, falling back rather than breaking', () => {
  const fr = visibleText(readPage(bureauBuild().outDir, '/a-propos'));
  const en = visibleText(readPage(bureauBuild().outDir, '/en/a-propos'));

  assert.match(fr, /Quatre lignes de biographie en français/);
  assert.match(en, /Four lines of biography in English/);

  // The secrétaire has only a French biography: English falls back to it rather
  // than showing an empty card.
  assert.match(en, /Biographie disponible en français seulement/);
});

test('the section says what the committee still owes', () => {
  const text = visibleText(readPage(bureauBuild().outDir, '/a-propos'));

  assert.match(text, /Bureau du Comité/);
});
