/**
 * Everything a search engine or a social network reads, generated from the same
 * content the page renders.
 *
 * The rule this module exists to keep: **nothing here is written by hand.** A
 * hand-maintained `hreflang` list, sitemap or Schema.org block is correct on the
 * day it is written and wrong on the day a page is added, and nobody notices
 * because none of it is visible. Every function below takes the route or the
 * content entry the page already has.
 *
 * It also invents nothing. The committee still owes its postal address, its
 * telephone number and its social accounts (#9), so the Organization block
 * carries the city and the country — which the approved copy states — and stops
 * there. A structured-data block is a machine-readable claim, and a wrong one is
 * worse than a missing one.
 */

import { formatLocale, type Lang, languages, localeRoute } from './i18n/ui';
import { useTranslations, withBase } from './i18n/utils';
import type { EditorialEvent } from './lib/content';

/** Astro serves `/a-propos/index.html`; the canonical URL says so. */
const withTrailingSlash = (path: string): string => (path.endsWith('/') ? path : `${path}/`);

/**
 * An absolute URL for a site path. `site` is `Astro.site`, which is configured
 * in astro.config.mjs and is what has to change when the domain does.
 */
export function absoluteUrl(path: string, site: URL | undefined): string {
  return new URL(withTrailingSlash(path), site ?? 'http://localhost:4321/').href;
}

/** The canonical address of one route in one language. */
export function canonicalUrl(route: string, lang: Lang, site: URL | undefined): string {
  return absoluteUrl(withBase(localeRoute(route, lang)), site);
}

export interface Alternate {
  /** The `hreflang` value. `x-default` is emitted separately. */
  hreflang: string;
  href: string;
}

/**
 * The same page in every language, for the `<link rel="alternate">` tags.
 *
 * Every language is listed on every page, including the ones falling back to
 * French: the Armenian address exists, is stable, and becomes Armenian when the
 * translation lands. Hiding it until then would mean re-announcing the site to
 * search engines afterwards.
 *
 * `x-default` points at French, which is what an unprefixed URL serves.
 */
export function languageAlternates(route: string, site: URL | undefined): Alternate[] {
  const perLanguage = (Object.keys(languages) as Lang[]).map((lang) => ({
    hreflang: lang,
    href: canonicalUrl(route, lang, site),
  }));
  return [...perLanguage, { hreflang: 'x-default', href: canonicalUrl(route, 'fr', site) }];
}

/**
 * The picture a link preview shows. One image for the whole site until the
 * Comité supplies its own photography (#9) — see
 * docs/content/placeholder-inventory.md.
 */
export function socialImage(site: URL | undefined): string {
  return new URL(withBase('/hero.jpg'), site ?? 'http://localhost:4321/').href;
}

/**
 * Who the site says it is. Rendered on every page so that any page shared or
 * indexed identifies the organisation, not just the home page.
 */
export function organizationSchema(lang: Lang, site: URL | undefined): Record<string, unknown> {
  // Through the shared translator, so structured data falls back exactly the
  // way the rendered page does instead of having a second opinion.
  const t = useTranslations(lang);
  return {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    name: 'Union Générale Arménienne de Bienfaisance — Comité Suisse',
    alternateName: t('site.title'),
    description: t('site.description'),
    url: absoluteUrl(withBase(localeRoute('/', lang)), site),
    logo: new URL(withBase('/logo.png'), site ?? 'http://localhost:4321/').href,
    // The approved footer copy — "Fondée en 1906" — is the committee's own
    // claim about itself. Nothing else about the organisation is asserted here
    // because nothing else has been confirmed.
    foundingDate: '1906',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Genève',
      addressCountry: 'CH',
    },
  };
}

/**
 * One event, as a search engine reads it. Built from the same object the page
 * renders — an `EditorialEvent` out of src/lib/content.ts — so a date changed in
 * the CMS changes the structured data with it, and the two can never describe
 * different evenings. Nothing in this module knows where content is stored.
 */
export function eventSchema(
  event: EditorialEvent,
  lang: Lang,
  site: URL | undefined,
): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.excerpt,
    inLanguage: formatLocale[lang],
    startDate: event.start.toISOString(),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    url: canonicalUrl(`/evenements/${event.id}`, lang, site),
    location: {
      '@type': 'Place',
      name: event.location,
      ...(event.address
        ? { address: { '@type': 'PostalAddress', streetAddress: event.address } }
        : {}),
    },
    organizer: {
      '@type': 'NGO',
      name: 'Union Générale Arménienne de Bienfaisance — Comité Suisse',
      url: absoluteUrl(withBase(localeRoute('/', lang)), site),
    },
  };

  if (event.end) schema.endDate = event.end.toISOString();
  if (event.cover) {
    schema.image = new URL(withBase(event.cover), site ?? 'http://localhost:4321/').href;
  }
  // Only what the entry actually says. `pricing` is free text — "CHF 150 /
  // pers." — so no price is asserted, only where to buy and whether any are
  // left. A wrong price in structured data is a promise to a stranger.
  if (event.ticketUrl) {
    schema.offers = {
      '@type': 'Offer',
      url: event.ticketUrl,
      availability: event.soldOut ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
    };
  }

  return schema;
}
