/**
 * Nothing may be referenced before it exists — documents or source files.
 *
 * Four files under `docs/editorial/` were pointed at from `public/admin/`,
 * `src/lib/content.ts` and each other, and none of them existed. Then the same
 * sweep, run by hand, found `src/styles/global.css` naming two tests that had
 * never been written — and one of them was the only thing standing between the
 * palette and a contrast failure. Nothing failed either time, because nothing
 * looked. Those references read exactly like the ones that resolve, which is
 * what makes this a test rather than a habit: the reader who follows one and
 * finds nothing concludes the documentation is unreliable, and stops following
 * the rest.
 *
 * Two kinds of reference, because they need different rules:
 *
 * - **Documents.** Any `docs/….md` mentioned anywhere, plus relative markdown
 *   links between documents, resolved against the file they are written in.
 * - **Source files.** Any `src/`, `tests/`, `public/` or `.github/` path
 *   carrying a file extension. The extension is what makes it decidable: a path
 *   without one is an import specifier or a directory, and `src/i18n/ui` is not
 *   a broken reference to anything.
 *
 * Exclusions, each for a stated reason rather than to make the suite pass:
 *
 * - `.agents/`, the vendored CMS bundle and binary files are not ours to police.
 * - `docs/gap-analysis-prototype-vs-brief.md` is a dated snapshot of the
 *   prototype at tag `prototype-2026-08-20`. Its paths were accurate then and
 *   describe a tree that has deliberately changed since; correcting them would
 *   destroy the record.
 * - `./x.js` next to an `x.ts` is how TypeScript writes an import of its
 *   neighbour. The file it names is the one that exists.
 *
 * A path inside a code span still counts: written plainly or in backticks, it is
 * the same promise to a reader. Anchors, external URLs and images are not
 * checked — those fail visibly, and a link checker that needs the network is a
 * link checker that gets disabled.
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
    // A dated snapshot of the prototype at tag `prototype-2026-08-20`. Its
    // paths were accurate then and name a tree that has deliberately changed.
    if (file === 'docs/gap-analysis-prototype-vs-brief.md') return false;
    if (/^public\/admin\/sveltia-cms-[\d.]+\.js$/.test(file)) return false;
    if (/\.(png|jpe?g|webp|avif|gif|svg|ico|woff2?|pdf|zip|txt)$/i.test(file)) return false;
    // Symlinked skill directories are tracked as links, not as text.
    return lstatSync(path.join(repoRoot, file)).isFile();
  });
}

/** File extensions a reference has to carry to be read as naming a file. */
const SOURCE = '\\.(?:ts|mts|js|mjs|cjs|astro|css|yml|yaml|html|json|md)';

/**
 * Everything `text` points at, as repository-relative paths: `docs/….md`
 * mentions from anywhere, source paths carrying a file extension, and relative
 * markdown links from a document that is itself under `docs/`.
 *
 * Pure, so the self-check below can feed it a string. A regex that silently
 * stops matching is the failure mode of a check like this one.
 */
function referencesIn(file, text) {
  const found = new Set();
  const clean = (target) => target.replace(/[.,;:]+$/, '');

  for (const [, , target] of text.matchAll(/(^|[\s("'`[])(docs\/[A-Za-z0-9_./-]*\.md)/gm)) {
    found.add(clean(target));
  }

  const sources = new RegExp(
    `(^|[\\s("'\`[])((?:src|tests|public|\\.github)/[A-Za-z0-9_.\\[\\]/-]*${SOURCE})\\b`,
    'gm',
  );
  for (const [, , target] of text.matchAll(sources)) {
    // A glob names a shape, not a file: `sveltia-cms-*.js` is a pattern the
    // audits match against, and `**/*.test.mjs` is a runner's argument.
    if (target.includes('*')) continue;
    found.add(clean(target));
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

/** True when something on disk answers this reference. */
function exists(target) {
  const full = path.join(repoRoot, target);
  if (existsSync(full) && statSync(full).isFile()) return true;
  // `import { x } from './y.js'` beside a `y.ts` is how TypeScript spells an
  // import of its neighbour; the file it names is the one on disk.
  const asTypeScript = full.replace(/\.js$/, '.ts');
  return asTypeScript !== full && existsSync(asTypeScript) && statSync(asTypeScript).isFile();
}

test('everything this repository points at exists', () => {
  const dangling = [];

  for (const file of trackedFiles()) {
    const text = readFileSync(path.join(repoRoot, file), 'utf8');
    for (const target of referencesIn(file, text)) {
      if (!exists(target)) dangling.push(`${file} → ${target}`);
    }
  }

  dangling.sort();
  assert.deepEqual(
    dangling,
    [],
    `these references point at documents that do not exist:\n  ${dangling.join('\n  ')}\n` +
      'Write the file, or stop pointing at it. A reference that goes nowhere\n' +
      'teaches the next reader that nothing here can be trusted — and when what\n' +
      'is named is a test, it reads as an assurance that nobody is holding.',
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

  assert.deepEqual(
    referencesIn('src/styles/global.css', ' * asserted in tests/build/contrast.test.ts. WCAG'),
    ['tests/build/contrast.test.ts'],
    'a source file named in a comment is not being seen — this is the exact shape of the two ' +
      'phantom tests global.css claimed for a fortnight',
  );

  assert.deepEqual(
    referencesIn('src/lib/content.ts', "import { defaultLang } from '../i18n/ui';"),
    [],
    'an import specifier without an extension is being read as a file reference',
  );

  assert.deepEqual(
    referencesIn('tests/compliance/lib/vendored.mjs', 'matches public/admin/sveltia-cms-*.js only'),
    [],
    'a glob is being read as a file that must exist',
  );
});
