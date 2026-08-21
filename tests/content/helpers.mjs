// Helpers for the content tests.
//
// Run them with:  npm run build && node --test tests/content/*.test.mjs
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
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
} from 'node:fs';
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

/** Every page in the build, as `{ route, html }`. */
export function allBuiltPages() {
  if (!existsSync(distDir)) {
    throw new Error('dist/ is missing — run `npm run build` before the tests.');
  }
  const pages = [];
  const walk = (dir, route) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full, `${route}/${entry.name}`);
      else if (entry.name === 'index.html') {
        pages.push({ route: route === '' ? '/' : route, html: readFileSync(full, 'utf8') });
      }
    }
  };
  walk(distDir, '');
  return pages;
}

const lockDir = path.join(tmpdir(), 'ugab-astro-build.lock');
const STALE_LOCK_MS = 5 * 60 * 1000;

function sleepSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

/**
 * Two `astro build` runs in the same project stamp on each other's staging
 * directory, so builds are taken one at a time — whichever runner is executing
 * these files, and however many of them it starts at once.
 */
function withBuildLock(run) {
  const deadline = Date.now() + STALE_LOCK_MS;
  for (;;) {
    try {
      mkdirSync(lockDir);
      break;
    } catch {
      const age = existsSync(lockDir) ? Date.now() - statSync(lockDir).mtimeMs : Infinity;
      if (age > STALE_LOCK_MS) rmSync(lockDir, { recursive: true, force: true });
      else if (Date.now() > deadline) throw new Error('Timed out waiting for another test build.');
      else sleepSync(200);
    }
  }
  try {
    return run();
  } finally {
    rmSync(lockDir, { recursive: true, force: true });
  }
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
  const result = withBuildLock(() => {
    const build = spawnSync('npx', ['astro', 'build', '--force', '--outDir', outDir], {
      cwd: repoRoot,
      encoding: 'utf8',
      env: { ...process.env, UGAB_CONTENT_DIR: contentDir },
    });
    // The content store is shared with normal builds. Drop it while the lock is
    // still held, so fixture entries can never turn up in someone's
    // `npm run build` afterwards.
    rmSync(path.join(repoRoot, 'node_modules', '.astro', 'data-store.json'), { force: true });
    return build;
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

/**
 * The page as a browser would render it with every third-party embed blocked.
 *
 * This is the seam PRD 5 and PRD 6 both ask to be tested against: a donation
 * page that is blank when a script is blocked is worse than one with no form,
 * and an event page that is blank without third-party scripts is worse than one
 * with no booking button. A browser extension, a corporate proxy or a provider
 * having a bad afternoon all produce the same result, and none of them are rare.
 *
 * Today nothing is stripped, because no provider is connected — which is worth
 * asserting separately, and is. The value of the helper is that the assertion
 * keeps its meaning on the day an embed does arrive: the page will still have to
 * carry the argument, the QR-bill, the prices and a route to a human without it.
 *
 * Deliberately blunter than a browser: any absolutely-addressed script or
 * stylesheet goes, not only the cross-origin ones. Over-blocking can only make
 * the assertion harder to pass.
 */
export function withEmbedsBlocked(html) {
  return html
    .replace(/<iframe\b[\s\S]*?<\/iframe>/gi, '')
    .replace(/<iframe\b[^>]*\/?>/gi, '')
    .replace(/<object\b[\s\S]*?<\/object>/gi, '')
    .replace(/<embed\b[^>]*\/?>/gi, '')
    .replace(/<script\b[^>]*\bsrc\s*=\s*["']https?:\/\/[\s\S]*?<\/script>/gi, '')
    .replace(/<link\b[^>]*\bhref\s*=\s*["']https?:\/\/[^>]*>/gi, '');
}

/** Every href inside the page header — what the site offers a visitor. */
export function headerLinks(html) {
  const header = html.match(/<header[\s\S]*?<\/header>/i);
  if (!header) throw new Error('The page has no header.');
  return [...header[0].matchAll(/href="([^"]*)"/g)].map((m) => m[1]);
}
