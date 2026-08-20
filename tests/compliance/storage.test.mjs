import { test } from 'node:test';
import assert from 'node:assert/strict';

import { storageWrites, CONSENT_DIALOGUE_MARKERS } from './lib/storage.mjs';

const apis = (source) => storageWrites(source).map((write) => write.api);
const looksLikeDialogue = (html) => CONSENT_DIALOGUE_MARKERS.some((marker) => marker.test(html));

test('setting a cookie is caught', () => {
  assert.deepEqual(apis('document.cookie = "consent=yes; path=/"'), ['document.cookie']);
});

test('every storage API a tracker would reach for is caught', () => {
  assert.deepEqual(apis('localStorage.setItem("k", 1)'), ['localStorage.setItem']);
  assert.deepEqual(apis('sessionStorage.setItem("k", 1)'), ['sessionStorage.setItem']);
  assert.deepEqual(apis('indexedDB.open("visits")'), ['indexedDB.open']);
  assert.deepEqual(apis('navigator.serviceWorker.register("/sw.js")'), ['serviceWorker.register']);
});

test('bracket assignment is a write, however it is spelled', () => {
  assert.deepEqual(apis('localStorage["ugab-consent"] = "accepted"'), ['localStorage.setItem']);
});

test('reading storage is not storing anything', () => {
  assert.deepEqual(apis('const seen = localStorage.getItem("k"); if (window.localStorage) {}'), []);
});

test('comparing is not assigning', () => {
  assert.deepEqual(
    apis('if (document.cookie === "") {} if (localStorage["k"] == "x") {} if (a!=document.cookie) {}'),
    [],
    'an audit that cries wolf on a comparison is an audit nobody reads',
  );
});

test('removing and clearing are reported under their own names', () => {
  assert.deepEqual(apis('localStorage.removeItem("k")'), ['localStorage.removeItem']);
  assert.deepEqual(apis('localStorage.clear()'), ['localStorage.clear']);
});

test('asking how much storage is available is not using any', () => {
  assert.deepEqual(apis('navigator.storage.estimate().then(r => r.quota)'), []);
  assert.deepEqual(apis('navigator.storage.persist()'), ['navigator.storage.persist']);
});

test('a minified build is still readable to the audit', () => {
  assert.deepEqual(apis('!function(){localStorage.setItem("a","b")}();'), ['localStorage.setItem']);
});

test('a consent dialogue is recognised by its role and its words, not its styling', () => {
  assert.equal(
    looksLikeDialogue('<div role="dialog" aria-label="Consentement cookies"><p>…</p></div>'),
    true,
  );
  assert.equal(looksLikeDialogue('<div class="banner"><button>Refuser</button></div>'), true);
  assert.equal(looksLikeDialogue('<div class="cookie-banner-v2 xyz"><button>Accept all</button></div>'), true);
});

test('an ordinary page is not mistaken for a consent dialogue', () => {
  assert.equal(
    looksLikeDialogue('<h2>Cookies et mesure d’audience</h2><p>Ce site ne dépose aucun cookie.</p>'),
    false,
    'the privacy policy talks about cookies at length and must not trip the check',
  );
  assert.equal(looksLikeDialogue('<button>Faire un don</button>'), false);
});
