import { readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

/**
 * Links inside the built site that lead nowhere.
 *
 * Separate from base-path.ts on purpose: that asks whether a URL carries the
 * configured prefix, this asks whether anything is actually there. A link can
 * be perfectly prefixed and still 404, which is the failure a visitor meets.
 *
 * The site is static, so this is answerable completely and offline: every page
 * a visitor can reach is a file in dist/, and every link is written into the
 * output at build time. There is no server deciding anything at request time.
 */

export interface BuiltFile {
  path: string;
  contents: string;
}

export interface DeadLink {
  /** The page carrying the link, relative to dist/. */
  file: string;
  /** The href exactly as written. */
  url: string;
}

const DIST = fileURLToPath(new URL('../../dist', import.meta.url));

/**
 * Attributes a browser follows to another page of this site. `src` is included
 * — a missing image or stylesheet is a dead link that happens to be silent.
 */
const LINK_ATTRIBUTES = /\b(?:href|src|action|poster)\s*=\s*["']([^"']*)["']/gi;

/** Anything that leaves the site, or never was a path. */
const NOT_A_LOCAL_PATH = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|$)/i;

/** Every file in dist/, as paths relative to it with forward slashes. */
export async function builtPaths(): Promise<Set<string>> {
  const entries = (await readdir(DIST, { recursive: true, withFileTypes: true })).filter((entry) =>
    entry.isFile(),
  );

  return new Set(
    entries.map((entry) => {
      const dir = entry.parentPath.slice(DIST.length).replace(/\\/g, '/').replace(/^\//, '');
      return dir === '' ? entry.name : `${dir}/${entry.name}`;
    }),
  );
}

/**
 * Where a link points, as a path inside dist/ — or null when it is not this
 * site's to answer for.
 *
 * A URL that does not start with the configured base is *not* reported here.
 * That is a real defect and base-path.ts already fails the build for it, by
 * name; reporting it twice, in two vocabularies, teaches people to read one
 * failure and skim the other.
 */
export function resolveLink(url: string, base: string): string | null {
  if (NOT_A_LOCAL_PATH.test(url)) return null;
  if (!url.startsWith('/')) return null;

  const path = url.split('#')[0].split('?')[0];
  if (base && !path.startsWith(`${base}/`) && path !== base) return null;

  const withoutBase = base ? path.slice(base.length) : path;
  return withoutBase.replace(/^\//, '');
}

/** True when something in the build answers this path, as a page or as a file. */
export function isServed(target: string, existing: Set<string>): boolean {
  if (target === '' || target.endsWith('/')) return existing.has(`${target}index.html`);
  // Astro writes `/don/index.html` and links to it as `/don` or `/don/`. Both
  // are served; a file at exactly that path is served too.
  return existing.has(target) || existing.has(`${target}/index.html`);
}

export function findDeadLinks(
  files: readonly BuiltFile[],
  base: string,
  existing: Set<string>,
): DeadLink[] {
  const dead: DeadLink[] = [];

  for (const file of files) {
    if (!file.path.endsWith('.html')) continue;

    for (const [, url] of file.contents.matchAll(LINK_ATTRIBUTES)) {
      const target = resolveLink(url, base);
      if (target === null) continue;
      if (!isServed(target, existing)) dead.push({ file: file.path, url });
    }
  }

  return dead;
}
