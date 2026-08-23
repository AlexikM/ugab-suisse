import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

/**
 * Where the site is served from is one variable, and both halves follow it.
 *
 * This used to be two constants in `astro.config.mjs` — an origin naming GitHub
 * Pages and the `/ugab-suisse` prefix a project Pages site is served from — so
 * moving hosting meant editing that file. `publish.yml` refuses to publish a
 * build that still carries the prefix, which made the last step of PRD 1 a
 * commit written under pressure on the day of the first deploy.
 *
 * The config is read in a child process per case, because it is a module and a
 * module is evaluated once: importing it twice in one process would give the
 * same answer twice and prove nothing.
 */

const CONFIG = fileURLToPath(new URL('../../astro.config.mjs', import.meta.url));

function resolvedFor(siteUrl: string | undefined) {
  const env = { ...process.env };
  if (siteUrl === undefined) delete env.SITE_URL;
  else env.SITE_URL = siteUrl;

  const output = execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `const c = (await import(${JSON.stringify(CONFIG)})).default;
       process.stdout.write(JSON.stringify({ site: c.site, base: c.base }));`,
    ],
    { env, encoding: 'utf8' },
  );
  return JSON.parse(output) as { site: string; base: string };
}

describe('the deployment target', () => {
  it('is unchanged when nothing sets it', () => {
    // An unconfigured build must still be the build this repository has always
    // produced: a project site on GitHub Pages, served from a subdirectory.
    expect(resolvedFor(undefined)).toEqual({
      site: 'https://alexikm.github.io',
      base: '/ugab-suisse',
    });
  });

  it('drops the prefix for a domain served from its root', () => {
    expect(resolvedFor('https://ugab-suisse.org')).toEqual({
      site: 'https://ugab-suisse.org',
      base: '',
    });
  });

  it('tolerates the trailing slash somebody will paste', () => {
    // The value is typed into a GitHub variable by a person, once, under time
    // pressure. A trailing slash must not become a base of '/'.
    expect(resolvedFor('https://preview.ugab-suisse.org/')).toEqual({
      site: 'https://preview.ugab-suisse.org',
      base: '',
    });
  });

  it('keeps a prefix when the URL genuinely carries one', () => {
    expect(resolvedFor('https://example.org/ugab/')).toEqual({
      site: 'https://example.org',
      base: '/ugab',
    });
  });
});
