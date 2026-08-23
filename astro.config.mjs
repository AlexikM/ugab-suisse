// @ts-check

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
/**
 * Where the site is served from — one variable, read from the deployment.
 *
 * It used to be two constants written here: an origin that said GitHub Pages
 * and a `/ugab-suisse` prefix that is the path a project Pages site sits at.
 * Moving hosting meant editing this file, and `publish.yml` refuses to publish
 * a build that still carries the prefix — so the last step of PRD 1 was a
 * commit, made under pressure, on the day of the first deploy.
 *
 * It is one value now, and the prefix follows it rather than being a second
 * thing to remember:
 *
 *     https://alexikm.github.io/ugab-suisse   →  origin + base '/ugab-suisse'
 *     https://ugab-suisse.org                 →  origin + base ''
 *
 * `publish.yml` already passes this URL to the step that checks the result;
 * it now reaches the build that produces it. The default is exactly what this
 * file said before, so an unconfigured build is unchanged.
 *
 * Nothing else reads it. `withBase()` and `tests/build/base-path.ts` both take
 * the base from this config, so they follow it without being told.
 */
const deployedAt = new URL(process.env.SITE_URL || 'https://alexikm.github.io/ugab-suisse');

// Astro prefixes routes with the base automatically, but not redirect
// destinations — those are written out below.
const base = deployedAt.pathname.replace(/\/+$/, '');

export default defineConfig({
  site: deployedAt.origin,
  base,
  i18n: {
    defaultLocale: 'fr',
    // French is unprefixed; English and Armenian carry their code. Every page
    // in src/pages/[...lang]/ exists in all three from one implementation — the
    // Armenian ones serve French until the Comité delivers the translations
    // (#9), and say so. See src/i18n/fallback.ts.
    locales: ['fr', 'en', 'hy'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  // The About page used to live at /histoire and the Comité may already have
  // published that address. It redirects rather than disappearing.
  redirects: {
    '/histoire': { status: 301, destination: `${base}/a-propos` },
    '/en/histoire': { status: 301, destination: `${base}/en/a-propos` },
    '/hy/histoire': { status: 301, destination: `${base}/hy/a-propos` },
  },
  integrations: [
    // The sitemap is generated from the routes the build produces, so it cannot
    // drift from the site. Every page appears once per language, each entry
    // cross-referencing the other two, which is the same promise the `hreflang`
    // tags in the page head make — written by a machine in both places rather
    // than maintained by hand in either.
    sitemap({
      i18n: {
        defaultLocale: 'fr',
        locales: { fr: 'fr-CH', en: 'en', hy: 'hy' },
      },
      // Redirect stubs are not pages; listing /histoire would offer a search
      // engine an address whose only content is a meta refresh.
      filter: (page) => !/\/histoire\/?$/.test(page),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
