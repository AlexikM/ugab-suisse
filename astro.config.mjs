// @ts-check

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
    // Armenian is not here yet: the Comité has not delivered the translations.
    // Adding 'hy' should be the only change needed to make every page exist in
    // Armenian — see src/pages/[...lang]/.
    locales: ['fr', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  // The About page used to live at /histoire and the Comité may already have
  // published that address. It redirects rather than disappearing.
  redirects: {
    '/histoire': { status: 301, destination: `${base}/a-propos` },
    '/en/histoire': { status: 301, destination: `${base}/en/a-propos` },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
