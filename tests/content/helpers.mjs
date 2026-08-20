// Helpers for the content tests.
//
// Run them with:  node --test tests/content/
//
// Two seams are used here, and only these two:
//
//   1. `dist/` — the built site. Assertions about what a visitor is offered
//      read the built HTML, because that is the highest seam a static site
//      has. Run `npm run build` first.
//   2. A build run against a fixture content directory, via the
//      `UGAB_CONTENT_DIR` environment variable that `src/content.config.ts`
//      reads. This lets a test build a site containing a deliberately broken
//      or deliberately minimal event without ever writing into `src/content`.

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
export const fixturesDir = path.join(repoRoot, 'tests', 'content', 'fixtures');

const distDir = path.join(repoRoot, 'dist');

/** Read a page from the build in `dist/`. */
export function readBuiltPage(routePath) {
  if (!existsSync(distDir)) {
    throw new Error('dist/ is missing — run `npm run build` before the tests.');
  }
  return readPage(distDir, routePath);
}

/** Read a page from an arbitrary build output directory. */
export function readPage(outDir, routePath) {
  const clean = routePath.replace(/^\/+|\/+$/g, '');
  const file = clean === '' ? 'index.html' : path.join(clean, 'index.html');
  const full = path.join(outDir, file);
  if (!existsSync(full)) {
    throw new Error(`No page was built at ${routePath} (looked for ${file}).`);
  }
  return readFileSync(full, 'utf8');
}

export function builtPageExists(routePath) {
  const clean = routePath.replace(/^\/+|\/+$/g, '');
  const file = clean === '' ? 'index.html' : path.join(clean, 'index.html');
  return existsSync(path.join(distDir, file));
}

/**
 * Build the site against a fixture content directory.
 * Returns the exit status, the combined output, and where it built to.
 */
export function buildWithContent(fixtureName) {
  const outDir = mkdtempSync(path.join(tmpdir(), 'ugab-build-'));
  const contentDir = path.join(fixturesDir, fixtureName);
  if (!existsSync(contentDir)) {
    throw new Error(`No content fixture named ${fixtureName}.`);
  }
  const result = spawnSync('npx', ['astro', 'build', '--force', '--outDir', outDir], {
    cwd: repoRoot,
    encoding: 'utf8',
    env: { ...process.env, UGAB_CONTENT_DIR: contentDir },
  });
  return {
    status: result.status,
    output: `${result.stdout ?? ''}\n${result.stderr ?? ''}`,
    outDir,
  };
}

/** Strip tags so assertions can be made about text a visitor reads. */
export function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&laquo;|&raquo;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Every href inside the page header — what the site offers a visitor. */
export function headerLinks(html) {
  const header = html.match(/<header[\s\S]*?<\/header>/i);
  if (!header) throw new Error('The page has no header.');
  return [...header[0].matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
}
