import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';

import { repoRoot } from './lib/build-output.mjs';
import { LAUNCH_BLOCKERS } from './lib/launch-blockers.mjs';

/**
 * The checklist is the half of this work that no test can do: a written
 * confirmation from the committee, a test donation, a keyboard pass. It is
 * useless if it drifts from what the audit found, so the one thing worth
 * automating is that the two agree.
 */

const checklist = await readFile(path.join(repoRoot, 'docs/pre-launch-checklist.md'), 'utf8');

test('every third party the audit still finds is written into the checklist', () => {
  const missing = LAUNCH_BLOCKERS.map((blocker) => blocker.host).filter(
    (host) => !checklist.includes(host),
  );

  assert.deepEqual(
    missing,
    [],
    'The request audit records these as blocking launch, but the checklist does not mention them, so nobody ' +
      'running the checklist would know to look. Keep the two in step.',
  );
});

test('the checklist gates the tax-deductibility claim and says what happens without confirmation', () => {
  assert.match(checklist, /d[ée]ductib/i, 'the tax claim is not on the checklist at all');
  assert.match(
    checklist,
    /utilité publique/i,
    'the checklist does not say what confirmation is required — the cantonal decision is the thing to ask for',
  );
  assert.match(
    checklist,
    /attestation/i,
    'the checklist does not cover how attestations are actually issued, which is the second half of the claim',
  );
});

test('the checklist requires the audits to be re-run once the providers are configured', () => {
  assert.match(
    checklist,
    /re-?run/i,
    'the providers land late and are exactly what adds hosts and storage; the checklist must say to look again',
  );
});

test('the checklist covers what to do when a rights request or a breach arrives', () => {
  assert.match(checklist, /rights request/i, 'no route for a visitor exercising their rights');
  assert.match(
    checklist,
    /breach/i,
    'no route for a data breach, which is the worst time to be improvising',
  );
});

test('every checklist item has an owner', () => {
  const items = checklist.split('\n').filter((line) => /^\s*-\s*\[[ x]\]/.test(line));
  assert.ok(items.length > 0, 'the checklist has no checkable items');

  const ownerless = items.filter((item) => !/\*\*[^*]+\*\*/.test(item));
  assert.deepEqual(
    ownerless,
    [],
    'These items name nobody, so they belong to everybody and get done by nobody. Prefix each with a bold owner.',
  );
});
