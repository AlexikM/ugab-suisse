/**
 * The contact form the Comité approved the labels for, and cannot yet send.
 *
 * The prototype's form posted to `api.web3forms.com` with the access key still
 * set to `YOUR_ACCESS_KEY`: a form that took what somebody wrote and dropped it,
 * while telling them it had been sent. Removing it is recorded as done in
 * `../../docs/pre-launch-checklist.md`, and the mail handler that would replace
 * it waits on hosting.
 *
 * So the form can be looked at without being reachable. `UGAB_PREVIEW_FORMS=1`
 * draws it for a design review; every build that is not asked for it has no
 * form at all. Both halves are asserted, because only the pair is the promise:
 * a preview that leaks into a normal build is the defect this replaced.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildWithContent, readBuiltPage, readPage } from './helpers.mjs';

/** The four fields, which is what a contact form is here. A bare `<button>` is
 *  not one: the header carries the mobile menu toggle on every page. */
const FIELDS = ['contact-name', 'contact-email', 'contact-topic', 'contact-message'];

/** Source comments survive the build, and they discuss the form at length. */
const withoutComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');

let preview;
/** One build for every question about the preview. */
function previewBuild() {
  preview ??= buildWithContent('no-events', { UGAB_PREVIEW_FORMS: '1' });
  assert.equal(preview.status, 0, `the build failed:\n${preview.output}`);
  return preview;
}

test('a normal build offers no contact form at all', () => {
  const html = readBuiltPage('/contact');

  assert.doesNotMatch(html, /<form\b/i, 'the contact page ships a form that cannot send');
  for (const field of FIELDS) {
    assert.doesNotMatch(html, new RegExp(`id="${field}"`), `the contact page ships ${field}`);
  }
  // The address is what a visitor is given instead, so its absence would leave
  // them with no way to write at all.
  assert.match(html, /mailto:/, 'the contact page offers neither a form nor an address');
});

test('the preview build draws the form', () => {
  const html = readPage(previewBuild().outDir, '/contact');

  assert.match(html, /<form\b/i, 'the preview build drew no form');
  for (const field of FIELDS) {
    assert.match(html, new RegExp(`id="${field}"`), `the form is missing ${field}`);
  }
});

/**
 * Inert in the two ways that matter. A disabled fieldset cannot be typed into,
 * and no `action` means there is nowhere for a submission to go — neither a
 * third party, which is what ADR-0001 rules out, nor a handler that does not
 * exist yet.
 */
test('the preview form cannot be typed into or sent anywhere', () => {
  const html = readPage(previewBuild().outDir, '/contact');

  assert.match(html, /<fieldset[^>]*\bdisabled\b/i, 'the preview form is not disabled');
  assert.doesNotMatch(
    html,
    /<form[^>]*\baction=/i,
    'the preview form declares somewhere to post to',
  );
  assert.doesNotMatch(html, /<form[^>]*\bmethod=/i, 'the preview form declares a method');
});

/**
 * `contact.astro` has carried a comment since PRD 7 saying that when a form
 * replaces the mailto, the note about what happens to a message moves under the
 * send button — the moment a visitor can still decide. This asserts the comment
 * came true rather than being repeated.
 */
test('the preview form says what happens to a message, under the send button', () => {
  // Read without comments: the page explains this very move in one, and it
  // sits above the button, so a naive search finds the explanation not the note.
  const html = withoutComments(readPage(previewBuild().outDir, '/contact'));
  const submit = html.search(/<button[^>]*type="submit"/i);
  const notice = html.search(/Infomaniak/);

  assert.ok(submit !== -1, 'the preview form has no send button');
  assert.ok(notice !== -1, 'the preview form does not say where a message goes');
  assert.ok(notice > submit, 'the note about the message sits above the button that sends it');
});
