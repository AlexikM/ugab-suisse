export const languages = {
  fr: 'Français',
  en: 'English',
} as const;

export const defaultLang = 'fr' as const;

export type Lang = keyof typeof languages;

/**
 * The plan du site the committee agreed to. Five pages, no more: the header,
 * the footer and the route-coverage test all read this list, so a page cannot
 * appear in the navigation without existing, or exist without being reachable.
 */
export const routes = {
  home: '/',
  about: '/a-propos',
  events: '/evenements',
  donate: '/don',
  contact: '/contact',
} as const;

/**
 * PLACEHOLDER — the Comité owes its official contact details (#9). This is the
 * address the prototype used; it is written once so that replacing it is one
 * edit. See docs/content/placeholder-inventory.md.
 */
export const contactEmail = 'contact@ugab.ch';

/** Footer-only pages. Not part of the navigation the brief specifies. */
export const legalRoutes = {
  legal: '/mentions-legales',
  privacy: '/confidentialite',
} as const;

/** The header entries, in the order the brief lists them. */
export const primaryNav = [
  { path: routes.home, key: 'nav.home' },
  { path: routes.about, key: 'nav.about' },
  { path: routes.events, key: 'nav.events' },
  { path: routes.donate, key: 'nav.donate_page' },
  { path: routes.contact, key: 'nav.contact' },
] as const;

/**
 * A route as it is addressed in a given language: `/evenements` becomes
 * `/en/evenements`. The default language carries no prefix. Combine with
 * `withBase` from ./utils to get a URL you can put in an href.
 */
export function localeRoute(path: string, lang: Lang): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === defaultLang) return clean;
  return clean === '/' ? `/${lang}/` : `/${lang}${clean}`;
}

export const ui = {
  fr: {
    'nav.label': 'Navigation principale',
    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.events': 'Événements',
    'nav.donate_page': 'Faire un don & Sponsoring',
    'nav.donate': 'Faire un don',
    'nav.contact': 'Contact',

    'site.title': 'UGAB Comité Suisse',
    'site.tagline': 'Genève',

    'hero.title': "L'Union Générale Arménienne de Bienfaisance",
    'hero.subtitle': 'Section suisse — Préserver et transmettre la culture arménienne depuis 1906',
    'hero.cta_donate': 'Faire un don',
    'hero.cta_learn': 'Découvrir notre mission',

    'donate.title': 'Soutenez l’UGAB Suisse',
    'donate.lead': 'Votre don finance nos actions culturelles, éducatives et humanitaires en Suisse et auprès du peuple arménien.',
    'donate.twint': 'Don par Twint, carte ou virement',
    'donate.qr_title': 'Virement bancaire (QR-facture)',

    'contact.organisation': 'Union Générale Arménienne de Bienfaisance — Comité Suisse, Genève',

    'footer.description': "L'UGAB Comité Suisse soutient l'Arménie et sa diaspora depuis Genève. Fondée en 1906.",
    'footer.copyright': 'Union Générale Arménienne de Bienfaisance — Comité Suisse, Genève. Tous droits réservés.',
    'footer.rights': 'Tous droits réservés',
    'footer.legal': 'Mentions légales',
    'footer.privacy': 'Politique de confidentialité',

    'cookies.message': 'Ce site utilise des cookies essentiels et, avec votre accord, des cookies de mesure d’audience anonymes.',
    'cookies.accept': 'Accepter',
    'cookies.reject': 'Refuser',
    'cookies.more': 'En savoir plus',
  },
  en: {
    'nav.label': 'Main navigation',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.events': 'Events',
    'nav.donate_page': 'Donate & Sponsorship',
    'nav.donate': 'Donate',
    'nav.contact': 'Contact',

    'site.title': 'AGBU Swiss Committee',
    'site.tagline': 'Geneva',

    'hero.title': 'Armenian General Benevolent Union',
    'hero.subtitle': 'Swiss section — Preserving and transmitting Armenian culture since 1906',
    'hero.cta_donate': 'Donate',
    'hero.cta_learn': 'Discover our mission',

    'donate.title': 'Support AGBU Switzerland',
    'donate.lead': 'Your donation funds our cultural, educational and humanitarian work in Switzerland and for the Armenian people.',
    'donate.twint': 'Donate by Twint, card or bank transfer',
    'donate.qr_title': 'Bank transfer (QR-bill)',

    'contact.organisation': 'Armenian General Benevolent Union — Swiss Committee, Geneva',

    'footer.description': 'The AGBU Swiss Committee supports Armenia and its diaspora from Geneva. Founded in 1906.',
    'footer.copyright': 'Armenian General Benevolent Union — Swiss Committee, Geneva. All rights reserved.',
    'footer.rights': 'All rights reserved',
    'footer.legal': 'Legal notice',
    'footer.privacy': 'Privacy policy',

    'cookies.message': 'This site uses essential cookies and, with your consent, anonymous analytics cookies.',
    'cookies.accept': 'Accept',
    'cookies.reject': 'Decline',
    'cookies.more': 'Learn more',
  },
} as const;
