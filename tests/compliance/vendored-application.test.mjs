/**
 * The editing tool is served from this repository, at one exact version. This
 * asserts that the file beside `public/admin/index.html` is still the file that
 * page says it is.
 *
 * `index.html` has claimed for a while that "a test checks that the file beside
 * this page is still the file recorded here". No such test existed. A comment
 * promising a check nobody wrote is worse than no comment: it is read as an
 * assurance and it is not one.
 *
 * What this can and cannot establish. Nobody is going to read 1.9 MB of
 * minified JavaScript, here or anywhere. What is establishable is narrower than
 * it sounds, so it is worth writing exactly: the bundle and the record agree
 * with each other, and neither has moved since somebody wrote the record. The
 * version, the source and the digest are written in the shell; the file is
 * hashed and compared. Swapping the bundle without updating the record fails,
 * and updating the record without the bundle fails.
 *
 * What it does not establish is that these are the bytes the registry publishes
 * under that version. Both halves of the comparison live in this repository, so
 * a bundle that was already wrong when it was vendored is wrong here and agrees
 * with itself perfectly. Only fetching the tarball would answer that, and it
 * would make this suite need a network to run — which `npm run check` does not,
 * deliberately, and which a volunteer running it in three years would thank
 * nobody for. That check happens once, by hand, at the moment of vendoring; the
 * `source` line in the shell is the URL to repeat it from, and the procedure is
 * in `../../docs/editorial/back-office-maintenance.md`.
 *
 * This paragraph used to claim the stronger thing — that the bytes are the ones
 * published under that version. Saying a test checks more than it does is the
 * exact failure this file was written to correct: `index.html` promised a check
 * that did not exist. The shell's own wording has been accurate throughout. It
 * was the test that overstated itself.
 *
 * Why this sits with the compliance suite: `unpkg.com` at an open version range
 * is what this replaced, and it is a launch blocker in
 * `../../docs/pre-launch-checklist.md` (A3). The whole procedure for updating
 * it is in `../../docs/editorial/back-office-maintenance.md`.
 */

import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const ADMIN = path.join(process.cwd(), 'public', 'admin');
const shell = readFileSync(path.join(ADMIN, 'index.html'), 'utf8');

/** One `name : value` line out of the provenance block in the shell. */
function recorded(field) {
  const match = shell.match(new RegExp(`^\\s*${field}\\s*:\\s*(\\S+)`, 'm'));
  assert.ok(
    match,
    `public/admin/index.html no longer records "${field}". The record is what makes the file identifiable; see docs/editorial/back-office-maintenance.md.`,
  );
  return match[1];
}

const loaded = () => {
  const match = shell.match(/<script\s+src="\.\/([^"]+)"/);
  assert.ok(match, 'public/admin/index.html loads no local script');
  return match[1];
};

test('the shell loads the version it records', () => {
  const pkg = recorded('package');
  const version = pkg.slice(pkg.lastIndexOf('@') + 1);

  assert.equal(
    loaded(),
    `sveltia-cms-${version}.js`,
    'the back-office loads one version and documents another',
  );
});

test('the application beside the shell is the file the shell describes', () => {
  const file = path.join(ADMIN, loaded());
  assert.ok(existsSync(file), `${loaded()} is recorded but not present`);

  const digest = createHash('sha256').update(readFileSync(file)).digest('hex');

  assert.equal(
    digest,
    recorded('sha256'),
    `${loaded()} is not the file public/admin/index.html says it is.\n` +
      'Either the bundle was replaced without updating the record, or the record\n' +
      'was updated without the bundle. docs/editorial/back-office-maintenance.md\n' +
      'has the procedure for doing both together.',
  );
});

test('the licence travels with the copy', () => {
  // MIT: the notice has to be included with the software. It is served beside
  // the bundle rather than kept in a document, so it goes wherever the file
  // goes — including into `dist/`, which is what is actually distributed.
  const licence = path.join(ADMIN, `${loaded().replace(/\.js$/, '')}.LICENSE.txt`);

  assert.ok(
    existsSync(licence),
    `${path.basename(licence)} is missing. The bundle is MIT-licensed and the notice has to travel with it.`,
  );

  const text = readFileSync(licence, 'utf8');
  assert.match(text, /MIT License/, 'the licence file does not carry the licence');
  assert.match(text, /Copyright \(c\)/, 'the licence file carries no copyright notice');
});

test('nothing in the back-office is fetched from a CDN', () => {
  // The defect this whole arrangement exists to close: the shell used to load
  // the application from unpkg.com at `^3.5.0` — whatever a public CDN chose to
  // serve, for a tool that can write to this repository.
  //
  // The application still reaches unpkg while it runs, which no static read of
  // the shell can see; that is a launch blocker with an owner, recorded in
  // tests/compliance/lib/launch-blockers.mjs. This is only about what the shell
  // itself loads.
  const absolute = [...shell.matchAll(/\ssrc="(https?:)?\/\/[^"]*"/g)].map((m) => m[0].trim());

  assert.deepEqual(absolute, [], 'the back-office shell loads something from another host');
});
