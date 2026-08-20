export const languages = {
  fr: 'Français',
  en: 'English',
} as const;

export const defaultLang = 'fr' as const;

export type Lang = keyof typeof languages;

export const ui = {
  fr: {
    'nav.home': 'Accueil',
    'nav.history': 'Notre histoire',
    'nav.mission': 'Mission',
    'nav.events': 'Événements',
    'nav.news': 'Actualités',
    'nav.donate': 'Faire un don',
    'nav.contact': 'Contact',

    'site.title': 'UGAB Suisse',
    'site.tagline': '120 ans au service du peuple arménien',

    'hero.title': "L'Union Générale Arménienne de Bienfaisance",
    'hero.subtitle': 'Section suisse — Préserver et transmettre la culture arménienne depuis 1906',
    'hero.cta_donate': 'Faire un don',
    'hero.cta_learn': 'Découvrir notre mission',

    'donate.title': 'Soutenez l’UGAB Suisse',
    'donate.lead':
      'Votre don finance nos actions culturelles, éducatives et humanitaires en Suisse et auprès du peuple arménien.',
    'donate.twint': 'Don par Twint, carte ou virement',
    'donate.qr_title': 'Virement bancaire (QR-facture)',
    'donate.tax':
      'Dons déductibles fiscalement en Suisse — un reçu vous est automatiquement envoyé.',

    'footer.rights': 'Tous droits réservés',
    'footer.legal': 'Mentions légales',
    'footer.privacy': 'Politique de confidentialité',

    'cookies.message':
      'Ce site utilise des cookies essentiels et, avec votre accord, des cookies de mesure d’audience anonymes.',
    'cookies.accept': 'Accepter',
    'cookies.reject': 'Refuser',
    'cookies.more': 'En savoir plus',
  },
  en: {
    'nav.home': 'Home',
    'nav.history': 'Our history',
    'nav.mission': 'Mission',
    'nav.events': 'Events',
    'nav.news': 'News',
    'nav.donate': 'Donate',
    'nav.contact': 'Contact',

    'site.title': 'AGBU Switzerland',
    'site.tagline': '120 years serving the Armenian people',

    'hero.title': 'Armenian General Benevolent Union',
    'hero.subtitle': 'Swiss section — Preserving and transmitting Armenian culture since 1906',
    'hero.cta_donate': 'Donate',
    'hero.cta_learn': 'Discover our mission',

    'donate.title': 'Support AGBU Switzerland',
    'donate.lead':
      'Your donation funds our cultural, educational and humanitarian work in Switzerland and for the Armenian people.',
    'donate.twint': 'Donate by Twint, card or bank transfer',
    'donate.qr_title': 'Bank transfer (QR-bill)',
    'donate.tax': 'Donations are tax-deductible in Switzerland — a receipt is sent automatically.',

    'footer.rights': 'All rights reserved',
    'footer.legal': 'Legal notice',
    'footer.privacy': 'Privacy policy',

    'cookies.message':
      'This site uses essential cookies and, with your consent, anonymous analytics cookies.',
    'cookies.accept': 'Accept',
    'cookies.reject': 'Decline',
    'cookies.more': 'Learn more',
  },
} as const;
