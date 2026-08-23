import { existsSync } from 'node:fs';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** Repository root, from this file's location, so the tests work from any cwd. */
export const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

const DIST = path.join(repoRoot, 'dist');

/**
 * The site's own host. Anything else is a third party.
 *
 * Taken from the Astro config rather than hardcoded, so that the day hosting
 * moves from GitHub Pages to Infomaniak the audit follows without an edit — and
 * so it cannot silently pass because someone changed the config and forgot here.
 *
 * The config is **imported**, not read as text. It used to be scraped with a
 * regex expecting `site: 'https://…'`, which held only while the value was a
 * literal. The moment it became an expression — the deployment target is one
 * variable now, so that moving hosting is a variable and not a commit — the
 * regex matched nothing and every audit in this suite failed at once, saying
 * the config declared no site at all. Reading a module by pattern-matching its
 * source is a guess about how somebody will write it.
 */
async function siteHost() {
  const { default: config } = await import(
    pathToFileURL(path.join(repoRoot, 'astro.config.mjs')).href
  );
  if (!config?.site)
    throw new Error(
      'astro.config.mjs declares no `site`, so first-party cannot be told from third-party',
    );
  return new URL(config.site).host;
}

async function htmlFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await htmlFiles(full)));
    else if (entry.name.endsWith('.html')) found.push(full);
  }
  return found;
}

/** `dist/evenements/gala/index.html` → `/evenements/gala/` */
const routeOf = (file) => {
  const relative = path.relative(DIST, file).split(path.sep).join('/');
  return `/${relative.replace(/index\.html$/, '')}`;
};

/**
 * Every built page, its route and its HTML — plus the CSS and JS bundles, which
 * are where a font import or a beacon URL hides once the build has run.
 */
const isRedirectStub = (html) => /<meta[^>]+http-equiv=["']?refresh["']?/i.test(html);

export async function buildOutput() {
  if (!existsSync(DIST)) {
    throw new Error(
      'No build output at dist/. The compliance audit reads the built site, so run `npm run build` first.',
    );
  }

  const host = await siteHost();
  const files = await htmlFiles(DIST);
  const pages = await Promise.all(
    files.map(async (file) => ({ route: routeOf(file), file, html: await readFile(file, 'utf8') })),
  );
  pages.sort((a, b) => a.route.localeCompare(b.route));

  const privacyPage = pages.find((page) => page.route === '/confidentialite/');

  return {
    host,
    dist: DIST,
    pages,
    privacyPageHtml: privacyPage?.html ?? '',
    /** Pages a visitor can reach. `/admin/` is the editors' CMS shell, not part of the public site. */
    // A redirect stub is not a page anyone reads: it carries a meta refresh and
    // no chrome. Excluding them keeps footer/nav assertions honest — the old
    // /histoire route still resolves, it just has nothing to link from.
    visitorPages: pages.filter(
      (page) => !page.route.startsWith('/admin') && !isRedirectStub(page.html),
    ),
  };
}

/** Built stylesheets and scripts, so a `url()` added by the bundler is still seen. */
export async function buildAssets() {
  const assets = [];
  const walk = async (dir) => {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (/\.(css|js|mjs)$/.test(entry.name)) {
        assets.push({
          route: `/${path.relative(DIST, full).split(path.sep).join('/')}`,
          source: await readFile(full, 'utf8'),
        });
      }
    }
  };
  await walk(DIST);
  return assets;
}
