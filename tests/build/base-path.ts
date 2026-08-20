import { readdir, readFile } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import astroConfig from '../../astro.config.mjs';

/** The path prefix GitHub Pages needs, and Infomaniak will not (see PRD 1). */
export const STALE_GITHUB_PAGES_PREFIX = '/ugab-suisse';

export interface BuiltFile {
  /** Path relative to dist/, using forward slashes. */
  path: string;
  contents: string;
}

export interface UrlViolation {
  file: string;
  url: string;
  reason: 'missing-base' | 'stale-prefix';
}

const DIST = fileURLToPath(new URL('../../dist', import.meta.url));

/** Text formats that can carry a URL. Images and fonts cannot. */
const SCANNED_EXTENSIONS = ['.html', '.css', '.js', '.mjs', '.xml', '.txt', '.json', '.svg'];

/** Attributes whose value may be an internal path. */
const URL_ATTRIBUTES =
  /\b(href|src|srcset|imagesrcset|poster|action|data-src|data-href|content)\s*=\s*["']([^"']*)["']/gi;

/** url(...) in a stylesheet or a style attribute — how the hero backgrounds broke. */
const CSS_URLS = /url\(\s*['"]?(\/[^'")\s]+)/gi;

/**
 * The base as Astro will apply it: no trailing slash, and empty when the site
 * is served from the root. Read from the project config rather than hardcoded,
 * so that the assertions follow the configuration when hosting moves.
 */
export function configuredBase(): string {
  return normaliseBase(astroConfig.base);
}

function normaliseBase(base: string | undefined): string {
  if (!base || base === '/') return '';
  const withLeadingSlash = base.startsWith('/') ? base : `/${base}`;
  return withLeadingSlash.endsWith('/') ? withLeadingSlash.slice(0, -1) : withLeadingSlash;
}

export async function readBuiltFiles(): Promise<BuiltFile[]> {
  let entries: string[];
  try {
    entries = (await readdir(DIST, { recursive: true })) as string[];
  } catch {
    throw new Error(
      'dist/ was not found. These assertions run against the built site: run `npm run build` first.',
    );
  }

  const files: BuiltFile[] = [];
  for (const entry of entries) {
    if (!SCANNED_EXTENSIONS.some((extension) => entry.endsWith(extension))) continue;
    const absolute = join(DIST, entry);
    files.push({
      path: relative(DIST, absolute).split(sep).join('/'),
      contents: await readFile(absolute, 'utf8'),
    });
  }

  if (files.length === 0) {
    throw new Error('dist/ holds no HTML. The build produced nothing to assert against.');
  }

  return files;
}

export function findBasePathViolations(files: BuiltFile[], base: string): UrlViolation[] {
  const violations: UrlViolation[] = [];

  for (const file of files) {
    for (const url of internalUrls(file)) {
      if (base && !carriesBase(url, base)) {
        violations.push({ file: file.path, url, reason: 'missing-base' });
      }
    }

    // Dormant while the site is served from the GitHub Pages prefix; the
    // moment the base changes, every leftover occurrence fails the build.
    if (base !== STALE_GITHUB_PAGES_PREFIX) {
      for (const url of file.contents.match(stalePrefixPattern()) ?? []) {
        violations.push({ file: file.path, url, reason: 'stale-prefix' });
      }
    }
  }

  return violations;
}

function stalePrefixPattern(): RegExp {
  return new RegExp(`${STALE_GITHUB_PAGES_PREFIX}[^\\s"'\`)>\\\\]*`, 'g');
}

function carriesBase(url: string, base: string): boolean {
  return url === base || url.startsWith(`${base}/`);
}

/** Every site-internal path this file asks a browser to fetch or link to. */
function internalUrls(file: BuiltFile): string[] {
  const urls: string[] = [];

  if (file.path.endsWith('.html') || file.path.endsWith('.svg')) {
    for (const [, attribute = '', value = ''] of file.contents.matchAll(URL_ATTRIBUTES)) {
      for (const candidate of splitAttributeValue(attribute, value)) {
        if (isInternalPath(candidate)) urls.push(candidate);
      }
    }
  }

  for (const [, url = ''] of file.contents.matchAll(CSS_URLS)) {
    if (isInternalPath(url)) urls.push(url);
  }

  return urls;
}

function splitAttributeValue(attribute: string, value: string): string[] {
  if (!/srcset/i.test(attribute)) return [value];
  return value
    .split(',')
    .map((candidate) => candidate.trim().split(/\s+/)[0] ?? '')
    .filter(Boolean);
}

/**
 * An absolute path on this site. External URLs, protocol-relative URLs,
 * anchors, mail and telephone links, and relative paths are somebody else's
 * problem: the base cannot apply to them.
 */
function isInternalPath(value: string): boolean {
  return value.startsWith('/') && !value.startsWith('//');
}
