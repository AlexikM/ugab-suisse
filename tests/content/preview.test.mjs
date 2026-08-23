/**
 * What a preview must not do.
 *
 * The site can be published before it is finished — GitHub Pages needs no
 * domain, no hosting account and no credentials, so the committee can be shown
 * the real thing while `docs/infrastructure-setup.md` is still on its first
 * item. The cost of that is a **public** address carrying the committee's
 * details and, deliberately, announcements they have not published yet.
 *
 * Not indexed is the only protection a preview has, and it is two mechanisms
 * driven by one flag. Both are asserted here, and so is the flag actually
 * working — a guard that cannot distinguish the two states is not a guard.
 *
 * `src/layouts/Layout.astro` claimed for a long time that "robots.txt disallows
 * everything" while no such file existed anywhere in the repository. That is
 * the defect this file exists to stop coming back.
 */

import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';
import { buildWithContent, readBuiltPage, repoRoot } from './helpers.mjs';

const robotsOf = (outDir) => readFileSync(path.join(outDir, 'robots.txt'), 'utf8');

test('a build nobody asked to index disallows every crawler', () => {
  const dist = path.join(repoRoot, 'dist');
  assert.ok(existsSync(path.join(dist, 'robots.txt')), 'the build produced no robots.txt');
  assert.match(robotsOf(dist), /^User-agent: \*\nDisallow: \/$/m, 'crawling is not disallowed');
});

test('every page of it also asks not to be indexed', () => {
  for (const route of ['/', '/evenements', '/don', '/contact', '/en/', '/hy/']) {
    assert.match(
      readBuiltPage(route),
      /name="robots" content="noindex/,
      `${route} does not ask to stay out of the index`,
    );
  }
});

/**
 * The other direction, which is the half that makes the first half meaningful:
 * a real launch must be able to be indexed, or the flag is decoration.
 */
test('a build asked to index says so in both places', () => {
  const build = buildWithContent('no-events', { PUBLIC_SITE_INDEXABLE: 'true' });
  assert.equal(build.status, 0, `the build failed:\n${build.output}`);

  const robots = robotsOf(build.outDir);
  assert.match(robots, /Allow: \//, 'a launch build still disallows crawling');
  assert.doesNotMatch(robots, /Disallow: \//, 'a launch build still disallows crawling');
  assert.match(robots, /^Sitemap: https:\/\/\S+\/sitemap-index\.xml$/m, 'no sitemap is offered');

  assert.doesNotMatch(
    readFileSync(path.join(build.outDir, 'index.html'), 'utf8'),
    /name="robots" content="noindex/,
    'a launch build still asks not to be indexed',
  );
});

/**
 * The demonstration back-office is handed to people who have no account and
 * should not need one. It must reach the committee's own configuration — the
 * French labels, the field order — rather than a second copy of it, and it must
 * never carry a backend that can write to the repository.
 */
test('the demonstration back-office writes nowhere and duplicates nothing', () => {
  const shell = readFileSync(path.join(repoRoot, 'public', 'admin', 'demo', 'index.html'), 'utf8');

  assert.match(shell, /name="test-repo"|name: 'test-repo'|'test-repo'/, 'no demonstration backend');
  assert.match(shell, /rel="cms-config-url"[^>]*|href="\.\.\/config\.yml"/, 'no configuration');
  assert.match(shell, /href="\.\.\/config\.yml"/, 'the demo does not read the real configuration');
  assert.doesNotMatch(shell, /name:\s*github|"github"/, 'the demo can reach the repository');
  assert.match(shell, /noindex/, 'the demo invites indexing');
});

/**
 * The demonstration back-office is for a preview and must not survive a public
 * release. It cannot write anywhere — the backend cannot reach the repository —
 * but an official-looking editor for the association, found by guessing a path,
 * is not something a visitor should meet, and "it does nothing" is not what it
 * looks like.
 *
 * The build cannot decide this: `public/` is copied verbatim, so the file is in
 * every build by construction. The publish removes it from an indexable
 * release, driven by the same flag as everything else here. Asserted as the
 * pairing it is — the shell exists to be published on a preview, and the
 * publish is what takes it out of a launch.
 */
test('the demonstration back-office is published, and removed from a public release', () => {
  const shell = path.join(repoRoot, 'public', 'admin', 'demo', 'index.html');
  assert.ok(existsSync(shell), 'the demonstration back-office is gone');
  assert.ok(
    existsSync(path.join(repoRoot, 'dist', 'admin', 'demo', 'index.html')),
    'a build does not carry the demonstration back-office',
  );

  // The only thing that takes it out again, so its absence is a real finding.
  const publish = readFileSync(path.join(repoRoot, '.github', 'workflows', 'publish.yml'), 'utf8');
  const step = /- name: Take the demonstration back-office[\s\S]*?(?=\n {6}- name: )/.exec(
    publish,
  )?.[0];

  assert.ok(step, 'nothing removes the demonstration back-office from a release');
  assert.match(step, /if:\s*\$\{\{\s*inputs\.indexable\s*\}\}/, 'it is not gated on indexable');
  assert.match(step, /rm -rf dist\/admin\/demo/, 'the step does not remove it');
});
