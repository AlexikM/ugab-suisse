// @ts-check

import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

// https://astro.build/config
// Where the site is served from. Astro prefixes routes with it automatically,
// but not redirect destinations — those are written out below.
const base = '/ugab-suisse';

export default defineConfig({
  site: 'https://alexikm.github.io',
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
