/**
 * The message form the Comité approved the labels for, and cannot yet send.
 *
 * The prototype's contact form posted to `api.web3forms.com` with the access
 * key still set to `YOUR_ACCESS_KEY`: a form that took what somebody wrote and
 * dropped it, while telling them it had been sent. Removing it is recorded as
 * done in `../../docs/pre-launch-checklist.md`, and the mail handler that would
 * replace it waits on hosting.
 *
 * So the form can be looked at without being usable. `UGAB_PREVIEW_FORMS=1`
 * draws it on both pages that need one; every build that is not asked for it
 * has no form at all. Both halves are asserted, because only the pair is the
 * promise: a preview that leaks into a normal build is the defect this
 * replaced.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildWithContent, readBuiltPage, readPage } from './helpers.mjs';

/** The four fields, unprefixed. `MessageForm` prefixes them per page. */
const FIELDS = ['name', 'email', 'topic', 'message'];

/** The same form in both places it is needed. */
const PAGES = [
  { route: '/contact', prefix: 'contact' },
  { route: '/don', prefix: 'sponsor' },
];

/** Source comments survive the build, and they discuss the form at length. */
const withoutComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');

let preview;
/** One build for every question about the preview. */
function previewBuild() {
  preview ??= buildWithContent('no-events', { UGAB_PREVIEW_FORMS: '1' });
  assert.equal(preview.status, 0, `the build failed:\n${preview.output}`);
  return preview;
}

test('a normal build offers no form at all', () => {
  for (const { route, prefix } of PAGES) {
    const html = readBuiltPage(route);

    assert.doesNotMatch(html, /data-preview-form/, `${route} ships a form that cannot send`);
    for (const field of FIELDS) {
      assert.doesNotMatch(html, new RegExp(`id="${prefix}-${field}"`), `${route} ships ${field}`);
    }
  }

  // The address is what a visitor is given instead of the contact form, so its
  // absence would leave them with no way to write at all.
  assert.match(readBuiltPage('/contact'), /mailto:/, 'no form and no address either');
});

test('the preview build draws the form on both pages', () => {
  for (const { route, prefix } of PAGES) {
    const html = readPage(previewBuild().outDir, route);

    assert.match(html, /data-preview-form/, `${route} drew no form`);
    for (const field of FIELDS) {
      assert.match(html, new RegExp(`id="${prefix}-${field}"`), `${route} is missing ${field}`);
    }
  }
});

/**
 * The fields work; only the send button does not. Disabled in the markup rather
 * than by script, so it is inert before anything runs and stays inert with
 * scripting off.
 */
test('the fields work and the send button does not', () => {
  for (const { route } of PAGES) {
    const html = readPage(previewBuild().outDir, route);
    const submit = /<button[^>]*type="submit"[^>]*>/i.exec(html)?.[0];

    assert.ok(submit, `${route} has no send button`);
    assert.match(submit, /\bdisabled\b/, `the send button on ${route} is not disabled`);
    assert.doesNotMatch(html, /<input[^>]*\bdisabled\b/i, `a field on ${route} is disabled`);
    assert.doesNotMatch(
      html,
      /<textarea[^>]*\bdisabled\b/i,
      `the message box on ${route} is disabled`,
    );
  }
});

/**
 * Nowhere for a submission to go — not a third party, which ADR-0001 rules out,
 * and not a handler that does not exist yet. An attribute invented now is one
 * somebody would later trust.
 */
/**
 * `src/styles/global.css` puts a 3px ring on everything a keyboard can reach.
 * A field that sets `outline-none` deletes it for itself, and the deletion is
 * invisible in review: the page looks right, and only a keyboard finds out.
 * These fields did exactly that, and stood beside the donation amount, which
 * lights up correctly — the same form, two behaviours.
 *
 * Asserted as the absence of an opt-out rather than the presence of a ring,
 * because the ring is not written here: inheriting it is the whole point.
 */
test('no field opts out of the focus ring the site puts on everything', () => {
  for (const { route } of PAGES) {
    const html = readPage(previewBuild().outDir, route);

    for (const control of html.match(/<(?:input|textarea|button)\b[^>]*>/gi) ?? []) {
      assert.doesNotMatch(
        control,
        /outline-none/,
        `a control on ${route} removes its own focus ring:\n  ${control}`,
      );
    }
  }
});

test('the preview form has nowhere to post to', () => {
  for (const { route } of PAGES) {
    const html = readPage(previewBuild().outDir, route);

    assert.doesNotMatch(html, /<form[^>]*\baction=/i, `${route} declares somewhere to post to`);
    assert.doesNotMatch(html, /<form[^>]*\bmethod=/i, `${route} declares a method`);
  }
});

/**
 * Both notices go under the control, not above the form: that is where somebody
 * reads them — at the moment they reach for the button, not before they have
 * decided to write anything. `contact.astro` has carried a comment since PRD 7
 * saying the privacy note belongs there once a form exists; this asserts the
 * comment came true rather than being repeated.
 */
test('both notices sit under the send button, where they are read', () => {
  for (const { route } of PAGES) {
    // Read without comments: the pages explain this very move in one, above it.
    const html = withoutComments(readPage(previewBuild().outDir, route));
    const submit = html.search(/<button[^>]*type="submit"/i);
    const sendsNothing = html.search(/data-preview-notice/);
    const whereItGoes = html.search(/Infomaniak/);

    assert.ok(submit !== -1, `${route} has no send button`);
    assert.ok(sendsNothing > submit, `${route} warns it sends nothing above the button`);
    assert.ok(whereItGoes > submit, `${route} says where a message goes above the button`);
  }
});
