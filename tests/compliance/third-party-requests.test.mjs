import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildAssets, buildOutput } from './lib/build-output.mjs';
import { collectAssetReferences, collectReferences, hostsOf, KIND } from './lib/scan.mjs';
import { declaredHosts } from './lib/declared.mjs';
import { LAUNCH_BLOCKERS, blockedHosts, describeBlockers } from './lib/launch-blockers.mjs';

/**
 * The audit that makes the privacy policy checkable instead of aspirational.
 *
 * The privacy page publishes the list of hosts a visitor's browser contacts.
 * These tests compare that published list against what the built site actually
 * does, in both directions, so the disclosure cannot drift from the site — in
 * either direction, and without anyone having to remember.
 */

const site = await buildOutput();

const allReferences = [
  ...site.pages.flatMap((page) => collectReferences({ page: page.route, html: page.html, siteHost: site.host })),
  // Astro extracts scoped and Tailwind CSS into bundles, so a third-party
  // `@font-face` or `@import` never appears in any HTML file.
  ...(await buildAssets()).flatMap((asset) =>
    collectAssetReferences({ route: asset.route, source: asset.source, siteHost: site.host }),
  ),
];

const referencesOfKind = (kind) => allReferences.filter((reference) => reference.kind === kind);

const report = (references) =>
  references.map((r) => `  ${r.host}  (${r.page}, ${r.via})\n    ${r.url}`).join('\n');

test('the build output is present, so there is something to audit', () => {
  assert.ok(site.pages.length > 0, 'no built pages found — run `npm run build` first');
  assert.ok(
    site.pages.some((page) => page.route === '/confidentialite/'),
    'the privacy policy page was not built, so nothing declares what the site contacts',
  );
});

test('the privacy policy publishes the list of hosts the site contacts', () => {
  const declared = declaredHosts(site.privacyPageHtml);
  assert.ok(
    declared.active.length + declared.planned.length > 0 || declared.explicitlyNone,
    'the privacy page declares no hosts and does not say there are none — the audit has nothing to check against',
  );
});

/**
 * A host is disclosed if the policy names it at all — as an approved processor
 * (`active`) or as something the site contacts today that should not survive
 * launch (`pre-launch`). The two are different promises to a reader, but both
 * are honest, and both are checkable. Silence is what fails.
 */
const disclosedHosts = () => {
  const declared = declaredHosts(site.privacyPageHtml);
  return [...declared.active, ...declared.preLaunch];
};

test('every host the site contacts on its own is disclosed on the privacy page', () => {
  const contacted = hostsOf(allReferences, KIND.AUTOMATIC);
  const undeclared = contacted.filter((host) => !disclosedHosts().includes(host));

  assert.deepEqual(
    undeclared,
    [],
    `These hosts are contacted while the page loads but appear nowhere in the privacy policy.\n` +
      `Remove them from the site, or disclose them in src/i18n/legal.ts — as a processor if they belong there, ` +
      `as a pre-launch exception if they do not:\n\n` +
      report(referencesOfKind(KIND.AUTOMATIC).filter((r) => undeclared.includes(r.host))),
  );
});

test('every host that receives form data is disclosed on the privacy page', () => {
  const targets = hostsOf(allReferences, KIND.FORM_TARGET);
  const undeclared = targets.filter((host) => !disclosedHosts().includes(host));

  assert.deepEqual(
    undeclared,
    [],
    `A form posts personal data to a host the privacy policy does not name:\n\n` +
      report(referencesOfKind(KIND.FORM_TARGET).filter((r) => undeclared.includes(r.host))),
  );
});

test('every host a script would call is disclosed on the privacy page', () => {
  const called = hostsOf(allReferences, KIND.SCRIPT_LITERAL);
  const undeclared = called.filter((host) => !disclosedHosts().includes(host));

  assert.deepEqual(
    undeclared,
    [],
    `Script code on a page names a third-party host the privacy policy does not:\n\n` +
      report(referencesOfKind(KIND.SCRIPT_LITERAL).filter((r) => undeclared.includes(r.host))),
  );
});

test('the engineering record of what must go matches what the page admits to', () => {
  assert.deepEqual(
    declaredHosts(site.privacyPageHtml).preLaunch,
    blockedHosts(),
    'The privacy page and tests/compliance/lib/launch-blockers.mjs disagree about which third parties the site ' +
      'still contacts. One of them is lying to somebody. Fix both when a host is removed.',
  );
});

test('nothing is declared that the site never contacts', () => {
  const declared = declaredHosts(site.privacyPageHtml).active;
  const contacted = new Set([
    ...hostsOf(allReferences, KIND.AUTOMATIC),
    ...hostsOf(allReferences, KIND.FORM_TARGET),
    ...hostsOf(allReferences, KIND.SCRIPT_LITERAL),
  ]);
  const stale = declared.filter((host) => !contacted.has(host));

  assert.deepEqual(
    stale,
    [],
    'The privacy policy names hosts the site no longer contacts. An over-broad disclosure is still a wrong one — ' +
      'mark the processor as `planned`, or remove it from the register in src/i18n/legal.ts.',
  );
});

test('a processor disclosed as not yet connected really is not connected', () => {
  const declared = declaredHosts(site.privacyPageHtml).planned;
  const contacted = new Set([
    ...hostsOf(allReferences, KIND.AUTOMATIC),
    ...hostsOf(allReferences, KIND.FORM_TARGET),
    ...hostsOf(allReferences, KIND.SCRIPT_LITERAL),
  ]);
  const live = declared.filter((host) => contacted.has(host));

  assert.deepEqual(
    live,
    [],
    'These providers are integrated but the privacy policy still describes them as not connected yet. ' +
      'Flip their status to `active` in src/i18n/legal.ts.',
  );
});

test('a link a visitor may click is not treated as a processor', () => {
  const linked = hostsOf(allReferences, KIND.OUTBOUND_LINK);
  const declared = declaredHosts(site.privacyPageHtml).active;
  const overDisclosed = linked.filter(
    (host) => declared.includes(host) && !hostsOf(allReferences, KIND.AUTOMATIC).includes(host),
  );

  assert.deepEqual(
    overDisclosed,
    [],
    'A host that is only ever reached by clicking a link is listed as a processor. It receives nothing unless the ' +
      'visitor chooses to go there, so disclosing it as a data recipient is inaccurate.',
  );
});

/**
 * Marked `todo`: it is expected to fail today and must pass before launch.
 *
 * Every host below is introduced by a file owned by another workstream — the
 * site layout, the contact page, the event pages, the CMS shell — so this lane
 * cannot remove them without colliding with work in flight. Recording them here
 * keeps them visible and countable instead of letting an allowlist swallow them.
 * Delete the entry once the owning change lands; when the list empties, take the
 * `todo` off and this becomes an ordinary passing test.
 */
test('no third party remains that the committee never agreed to', { todo: 'see the pre-launch checklist' }, () => {
  assert.deepEqual(
    LAUNCH_BLOCKERS.map((blocker) => blocker.host),
    [],
    `Third parties still contacted without disclosure:\n\n${describeBlockers()}`,
  );
});
