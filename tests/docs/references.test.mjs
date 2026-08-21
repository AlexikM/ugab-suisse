/**
 * A document may not be referenced before it is written.
 *
 * Four files under `docs/editorial/` were pointed at from `public/admin/`,
 * `src/lib/content.ts` and each other, and none of them existed. Nothing
 * failed, because nothing looks. Those references read exactly like the ones
 * that resolve, which is what makes this worth a test rather than a habit: the
 * reader who follows one and finds nothing concludes the documentation is
 * unreliable, and stops following the rest.
 *
 * Scope, deliberately narrow:
 *
 * - Only paths under `docs/`, and only inside files this repository tracks.
 *   Relative markdown links between documents are resolved against the file
 *   they are written in.
 * - `.agents/`, the vendored CMS bundle and binary files are not ours to police.
 * - A path inside a code span still counts: written plainly or in backticks, it
 *   is the same promise to a reader.
 *
 * It does not check anchors, external URLs or images — those fail visibly, and a
 * link checker that needs the network is a link checker that gets disabled.
 */

import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, lstatSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

import { repoRoot } from '../content/helpers.mjs';

/** Everything git tracks, minus what is not ours to police. */
function trackedFiles() {
  const listed = execFileSync('git', ['ls-files', '-z'], { cwd: repoRoot, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean);

  return listed.filter((file) => {
    if (file.startsWith('.agents/')) return false;
    if (/^public\/admin\/sveltia-cms-[\d.]+\.js$/.test(file)) return false;
    if (/\.(png|jpe?g|webp|avif|gif|svg|ico|woff2?|pdf|zip|txt)$/i.test(file)) return false;
    // Symlinked skill directories are tracked as links, not as text.
    return lstatSync(path.join(repoRoot, file)).isFile();
  });
}

/**
 * Every document `text` points at, as repository-relative paths: absolute
 * `docs/…` mentions from anywhere, and relative markdown links from a document
 * that is itself under `docs/`.
 *
 * Pure, so the self-check below can feed it a string. A regex that silently
 * stops matching is the failure mode of a test like this one.
 */
function referencesIn(file, text) {
  const found = new Set();

  for (const [, , target] of text.matchAll(/(^|[\s("'`[])(docs\/[A-Za-z0-9_./-]*\.md)/gm)) {
    found.add(target.replace(/[.,;:]+$/, ''));
  }

  if (file.startsWith('docs/') && file.endsWith('.md')) {
    const dir = path.dirname(file);
    for (const [, target] of text.matchAll(/\]\(([^)#\s]+\.md)(?:#[^)\s]*)?\)/g)) {
      if (/^[a-z]+:/i.test(target) || target.startsWith('/')) continue;
      found.add(path.normalize(path.join(dir, target)));
    }
  }

  return [...found];
}

test('every document this repository points at exists', () => {
  const dangling = [];

  for (const file of trackedFiles()) {
    const text = readFileSync(path.join(repoRoot, file), 'utf8');
    for (const target of referencesIn(file, text)) {
      const full = path.join(repoRoot, target);
      if (!existsSync(full) || !statSync(full).isFile()) {
        dangling.push(`${file} → ${target}`);
      }
    }
  }

  dangling.sort();
  assert.deepEqual(
    dangling,
    [],
    `these references point at documents that do not exist:\n  ${dangling.join('\n  ')}\n` +
      'Write the document, or stop pointing at it. A reference that goes nowhere\n' +
      'teaches the next reader that the documentation cannot be trusted.',
  );
});

/**
 * The extractor, on strings rather than on the repository — a regex that quietly
 * stops matching is the failure mode of a check like this one.
 *
 * Every path written below points at a document that exists, and has to: this
 * file is part of the corpus the check above reads, so an invented path here
 * would be reported as a dangling reference by the very test that wrote it.
 * That is the correct behaviour and not worth an exemption; it just means the
 * fixtures are real.
 */
test('the check reads what it claims to read', () => {
  assert.deepEqual(
    referencesIn('src/lib/content.ts', ' * announcement. See docs/editorial/publication.md.'),
    ['docs/editorial/publication.md'],
    'a plain mention in a source comment is not being seen',
  );

  assert.deepEqual(
    referencesIn(
      'docs/editorial/README.md',
      'the guides are in [ici](../comite/publier-un-evenement.md).',
    ),
    ['docs/comite/publier-un-evenement.md'],
    'a relative link between documents is not being resolved',
  );

  assert.deepEqual(
    referencesIn('docs/README.md', 'see [the spec](https://example.invalid/elsewhere.md)'),
    [],
    'an external URL is being treated as a file in this repository',
  );
});
