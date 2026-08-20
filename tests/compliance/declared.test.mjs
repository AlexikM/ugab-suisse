import { test } from 'node:test';
import assert from 'node:assert/strict';

import { declaredHosts } from './lib/declared.mjs';
import { collectReferences, hostsOf, KIND } from './lib/scan.mjs';

/**
 * The audit is only worth having if it fails when it should. These cases run the
 * comparison the real audit runs, against pages small enough to reason about, and
 * assert that each kind of drift is caught.
 */

const policyDeclaring = (entries) =>
  `<h2>Ce que votre navigateur contacte</h2><ul>${entries
    .map(([host, status]) => `<li data-host="${host}" data-host-status="${status}"><code>${host}</code></li>`)
    .join('')}</ul>`;

const undeclaredHosts = (pageHtml, policyHtml) => {
  const contacted = hostsOf(
    collectReferences({ page: '/', html: pageHtml, siteHost: 'ugab-suisse.ch' }),
    KIND.AUTOMATIC,
  );
  const declared = declaredHosts(policyHtml).active;
  return contacted.filter((host) => !declared.includes(host));
};

test('a host the policy names is read back as declared', () => {
  const declared = declaredHosts(policyDeclaring([['challenges.cloudflare.com', 'active']]));
  assert.deepEqual(declared.active, ['challenges.cloudflare.com']);
  assert.deepEqual(declared.planned, []);
});

test('a host disclosed ahead of integration is kept separate from a live one', () => {
  const declared = declaredHosts(
    policyDeclaring([
      ['challenges.cloudflare.com', 'planned'],
      ['pay.example.ch', 'active'],
    ]),
  );
  assert.deepEqual(declared.active, ['pay.example.ch']);
  assert.deepEqual(declared.planned, ['challenges.cloudflare.com']);
});

test('a policy claiming it contacts nothing says so in a way the audit can read', () => {
  assert.equal(declaredHosts('<p data-hosts-none>Aucun.</p>').explicitlyNone, true);
  assert.equal(declaredHosts('<p>Aucun.</p>').explicitlyNone, false);
});

test('adding an undisclosed font stylesheet is caught', () => {
  const found = undeclaredHosts(
    '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter">',
    policyDeclaring([]),
  );
  assert.deepEqual(found, ['fonts.googleapis.com']);
});

test('adding an undisclosed embed is caught', () => {
  const found = undeclaredHosts(
    '<iframe src="https://www.youtube.com/embed/abc"></iframe>',
    policyDeclaring([['pay.example.ch', 'active']]),
  );
  assert.deepEqual(found, ['www.youtube.com']);
});

test('a host disclosed only as not-yet-connected does not count as disclosed', () => {
  const found = undeclaredHosts(
    '<script src="https://pay.example.ch/widget.js"></script>',
    policyDeclaring([['pay.example.ch', 'planned']]),
  );
  assert.deepEqual(
    found,
    ['pay.example.ch'],
    'the provider is live but the policy still describes it as not connected yet',
  );
});

test('a declared host that nothing contacts is caught as a stale disclosure', () => {
  const declared = declaredHosts(policyDeclaring([['gone.example.net', 'active']])).active;
  const contacted = hostsOf(collectReferences({ page: '/', html: '<p>rien</p>', siteHost: 'ugab-suisse.ch' }), KIND.AUTOMATIC);
  assert.deepEqual(declared.filter((host) => !contacted.includes(host)), ['gone.example.net']);
});

test('a disclosure with no hosts and no explicit "none" is not mistaken for a clean site', () => {
  const declared = declaredHosts('<h2>Ce que votre navigateur contacte</h2>');
  assert.deepEqual(declared.active, []);
  assert.equal(declared.explicitlyNone, false);
});
