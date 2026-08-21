// Every visible string on the site.
//
// The source of truth is docs/content/site-copy.md — the text the Comité
// approved. Keys follow the brief's own section names, so an editor can find a
// string by looking at the page it appears on.
//
// Armenian is a locale with no copy in it yet. The routes, the switcher and the
// fallback all exist; the words do not, because the Comité owes them (#9) and
// inventing Armenian on their behalf would be worse than admitting the gap. Add
// a key to `armenian` below and it is served immediately — see ./fallback.ts.
//
// A number of strings are NOT from the approved copy, because the site needs to
// say something the brief never had to write: the empty events list, the
// contact details and bureau portraits still to come, the note that the contact
// form is not yet wired, and — the largest group — everything the donation and
// booking surfaces have to say while no payment or ticketing account exists.
// The brief assumed a provider that would speak for itself; there is none yet,
// so the pages speak instead. They are marked "NOT APPROVED COPY" below, by
// block where a whole section is unapproved, and the Comité should be asked to
// approve or reword them before launch.
//
// Two of the committee's own approved sentences are carried here *short*, and
// the comment beside each says why: both ended with a promise about an email
// that nothing on this site sends.
//
// Two things are deliberately NOT here, and must not be added without the
// compliance work in PRD 7 (#7):
//   - that donations are tax-deductible in Switzerland;
//   - that a receipt is issued automatically.
// Both are unverified and both block launch.

/**
 * The three languages of the site, each written the way its own speakers write
 * it. `Հայերեն` is the Armenian endonym — a fact about the language, not copy
 * the Comité has to approve.
 */
export const languages = {
  fr: 'Français',
  en: 'English',
  hy: 'Հայերեն',
} as const;

export const defaultLang = 'fr' as const;

export type Lang = keyof typeof languages;

/**
 * The BCP 47 tag used to format dates and numbers in a language. Not the same
 * question as which language a page is written in: a page falling back to
 * French formats its dates in French, because that is what the reader is
 * reading. Callers pass the language actually served — see ./fallback.ts.
 */
export const formatLocale: Record<Lang, string> = {
  fr: 'fr-CH',
  en: 'en-CH',
  hy: 'hy-AM',
};

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
 * The four offices of the Bureau, in the hierarchical order the brief presents
 * them — not alphabetical. Ordering the About page and validating the content
 * both read this list.
 */
export const bureauRoles = [
  'president',
  'vice-president',
  'secretaire-general',
  'tresorier',
] as const;

export type BureauRole = (typeof bureauRoles)[number];

/** Footer-only pages. Not part of the navigation the brief specifies. */
export const legalRoutes = {
  legal: '/mentions-legales',
  privacy: '/confidentialite',
  accessibility: '/accessibilite',
} as const;

/**
 * Where a payment or a ticketing provider sends a visitor back to once the
 * transaction is over.
 *
 * Written down once so that the address typed into a provider's dashboard and
 * the page that answers it cannot drift apart — and so that whoever opens the
 * accounts has one line to copy rather than a route to reverse-engineer from
 * the file tree. Each exists in every language: a donor who was reading English
 * must not be thanked in French.
 *
 * Deliberately not in `routes` above. The plan du site the committee agreed to
 * is five pages; these are return addresses, not pages anyone navigates to, and
 * the header must go on offering exactly the five.
 */
export const returnRoutes = {
  /** After a donation — `/don/merci`, `/en/don/merci`, `/hy/don/merci`. */
  donation: `${routes.donate}/merci`,
  /** After a booking — `/evenements/merci` and its locales. */
  booking: `${routes.events}/merci`,
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
 * PLACEHOLDER — the Comité owes its official contact details (#9). Written
 * once so that replacing it is one edit. See docs/content/placeholder-inventory.md.
 */
export const contactEmail = 'contact@ugab.ch';

/**
 * The association's own account: what the QR-bill on the donation page is drawn
 * against, and how a donor gives without the Comité losing a payment fee.
 *
 * `null` means the Comité has not supplied it (#9). It renders as a visible
 * "à fournir" placeholder rather than a plausible invention, for the same reason
 * `src/i18n/legal.ts` refuses to guess the postal address — except worse: a
 * wrong IBAN on a donation page sends a stranger's money to a stranger.
 *
 * **Nothing here may be guessed.** Fill these in when the Comité supplies the
 * account and the QR-bill becomes payable on its own, with no other change.
 */
export const bankAccount = {
  iban: null as string | null,
  /** The institution holding the account, as it should be printed. */
  bank: null as string | null,
  /** A Swiss QR-bill carries CHF or EUR, and this account will be in francs. */
  currency: 'CHF',
  /**
   * What a donor writes in the payment reference.
   *
   * A plain word on purpose, not a structured QR reference (QRR): a structured
   * reference is issued by the bank against the account, and there is no account
   * yet. The treasurer reconciles on the wording until there is one.
   */
  reference: 'DON',
} as const;

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

/**
 * The route a URL path points at, with the deployment base and the language
 * prefix stripped off: `/ugab-suisse/en/a-propos` becomes `/a-propos`. Used to
 * point the language selector at the same page in another language.
 */
export function routeFromPath(pathname: string, base = ''): string {
  let path = pathname;
  const prefix = base.replace(/\/$/, '');
  if (prefix && path.startsWith(prefix)) path = path.slice(prefix.length);
  for (const code of Object.keys(languages)) {
    if (path === `/${code}` || path.startsWith(`/${code}/`)) {
      path = path.slice(code.length + 1) || '/';
    }
  }
  return path.replace(/\/$/, '') || '/';
}

/**
 * One built page per language, for `getStaticPaths`. Adding a language to
 * `languages` above gives every page an address in it — no new files.
 */
export function languagePaths() {
  return (Object.keys(languages) as Lang[]).map((lang) => ({
    params: { lang: lang === defaultLang ? undefined : lang },
    props: { lang },
  }));
}

// --- Structured content -----------------------------------------------------
// Lists and tables the pages render. Kept out of `ui` because they are not
// single strings; kept here because they are still copy the Comité approved.

/**
 * A value the Comité has written in some languages but not necessarily all.
 * French is required — it is what everything else falls back to.
 */
export type Localised<T> = { fr: T } & Partial<Record<Lang, T>>;

/**
 * The version of a list or table in one language, or the French one when that
 * language has none. Pages call this rather than indexing by language, so that
 * an Armenian page renders French content instead of nothing.
 */
export function inLang<T>(record: Localised<T>, lang: Lang): T {
  return record[lang] ?? record[defaultLang];
}

/** Accueil — chiffres clés. */
export const keyFigures: Localised<ReadonlyArray<{ value: string; label: string }>> = {
  fr: [
    { value: '1906', label: 'Fondée au Caire' },
    { value: '30+', label: 'pays' },
    { value: '5', label: 'continents' },
    { value: 'Genève', label: 'siège du Comité Suisse' },
  ],
  en: [
    { value: '1906', label: 'Founded in Cairo' },
    { value: '30+', label: 'countries' },
    { value: '5', label: 'continents' },
    { value: 'Geneva', label: 'home of the Swiss Committee' },
  ],
} as const;

/** À propos — mission et valeurs. */
export const values: Localised<ReadonlyArray<string>> = {
  fr: ['Solidarité', 'Identité', 'Excellence', 'Humanisme', 'Engagement'],
  en: ['Solidarity', 'Identity', 'Excellence', 'Humanism', 'Commitment'],
} as const;

/** À propos — axes d'action. */
export const actionAreas: Localised<ReadonlyArray<{ title: string; body: string }>> = {
  fr: [
    {
      title: 'Humanitaire',
      body: "aide alimentaire et médicale aux familles vulnérables, soutien aux populations déplacées, réponse aux situations d'urgence.",
    },
    {
      title: 'Éducation',
      body: 'écoles arméniennes, bourses d’études, programmes de leadership pour la jeunesse.',
    },
    {
      title: 'Culture',
      body: 'préservation de la langue, du patrimoine et des arts arméniens à travers le monde.',
    },
    {
      title: 'Santé',
      body: 'soutien aux infrastructures médicales et aux programmes de santé publique en Arménie.',
    },
  ],
  en: [
    {
      title: 'Humanitarian',
      body: 'food and medical aid for vulnerable families, support for displaced populations, emergency response.',
    },
    {
      title: 'Education',
      body: 'Armenian schools, scholarships, youth leadership programmes.',
    },
    {
      title: 'Culture',
      body: 'preserving the Armenian language, heritage and arts worldwide.',
    },
    {
      title: 'Health',
      body: 'supporting medical infrastructure and public health programmes in Armenia.',
    },
  ],
} as const;

/**
 * Don — montants suggérés.
 *
 * `value` is the same figure as `amount`, in francs, for the machine: it is what
 * a payment provider is configured with and what the QR-bill's amount field
 * reads. `null` is the free amount, which has no figure by definition. The
 * displayed strings stay exactly as the committee approved them — the number is
 * carried alongside rather than parsed back out of the label, because
 * `"CHF 1'200"` is not something to re-derive with a regular expression.
 */
export const suggestedAmounts: Localised<
  ReadonlyArray<{ value: number | null; amount: string; impact: string }>
> = {
  fr: [
    { value: 50, amount: 'CHF 50', impact: 'Un repas pour une famille déplacée' },
    { value: 100, amount: 'CHF 100', impact: 'Matériel scolaire pour un enfant' },
    { value: 250, amount: 'CHF 250', impact: 'Soutien mensuel à un programme culturel' },
    { value: 500, amount: 'CHF 500', impact: 'Parrainage d’un jeune arménien' },
    { value: null, amount: 'Libre', impact: 'Votre choix — 100 % affecté à la mission' },
  ],
  en: [
    { value: 50, amount: 'CHF 50', impact: 'A meal for a displaced family' },
    { value: 100, amount: 'CHF 100', impact: 'School supplies for one child' },
    { value: 250, amount: 'CHF 250', impact: 'Monthly support for a cultural programme' },
    { value: 500, amount: 'CHF 500', impact: 'Sponsorship of one Armenian youth' },
    { value: null, amount: 'Libre', impact: 'Your choice — 100% mission-dedicated' },
  ],
} as const;

/**
 * Don unique ou mensuel — the second choice the brief asks a donor to make.
 *
 * A list rather than two loose strings because it is also the configuration a
 * payment provider gets set up with: whoever opens the account reads this to
 * know which recurrence options to switch on.
 */
export const donationFrequencies = [
  { id: 'once', label: 'donate.frequency_once' },
  { id: 'monthly', label: 'donate.frequency_monthly' },
] as const;

export type DonationFrequency = (typeof donationFrequencies)[number]['id'];

/**
 * Sponsoring — packages de partenariat.
 * The amounts are marked indicative in the brief and are NOT confirmed. The
 * page says so, visibly, until the Comité confirms them (#9).
 */
export const sponsorshipTiers: Localised<
  ReadonlyArray<{ name: string; amount: string; benefits: string }>
> = {
  fr: [
    {
      name: 'Bronze',
      amount: "CHF 2'000",
      benefits: 'Logo sur supports · 2 invitations · Mention site internet',
    },
    {
      name: 'Argent',
      amount: "CHF 5'000",
      benefits: 'Logo premium · 4 invitations · Table dédiée · Mention officielle en soirée',
    },
    {
      name: 'Or',
      amount: "CHF 10'000",
      benefits: 'Logo exclusif · 6 invitations · Table VIP · Prise de parole · Dossier presse',
    },
    {
      name: 'Platine',
      amount: 'Sur mesure',
      benefits: 'Partenariat annuel sur-mesure · Co-branding · Accès personnalisé',
    },
  ],
  en: [
    {
      name: 'Bronze',
      amount: "CHF 2'000",
      benefits: 'Logo on materials · 2 invitations · Mention on the website',
    },
    {
      name: 'Silver',
      amount: "CHF 5'000",
      benefits:
        'Premium logo · 4 invitations · Dedicated table · Official mention during the evening',
    },
    {
      name: 'Gold',
      amount: "CHF 10'000",
      benefits: 'Exclusive logo · 6 invitations · VIP table · Speaking slot · Press kit',
    },
    {
      name: 'Platinum',
      amount: 'Bespoke',
      benefits: 'Bespoke annual partnership · Co-branding · Tailored access',
    },
  ],
} as const;

export const ui = {
  fr: {
    'nav.label': 'Navigation principale',
    // NOT APPROVED COPY — see the header of this file.
    'nav.skip': 'Aller au contenu',
    'nav.menu': 'Ouvrir le menu',
    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.events': 'Événements',
    'nav.donate_page': 'Faire un don & Sponsoring',
    'nav.donate': 'Faire un don',
    'nav.contact': 'Contact',

    'site.title': 'UGAB Comité Suisse',
    'site.short': 'Comité Suisse',
    'site.tagline': 'Genève',
    'site.description':
      "L'UGAB Comité Suisse soutient l'Arménie et sa diaspora depuis Genève. Fondée en 1906.",

    // --- Accueil ---
    'home.hero_title': "Au service de l'Arménie et de sa diaspora depuis 1906.",
    'home.hero_lead':
      "La plus grande organisation humanitaire et culturelle de la diaspora arménienne. Depuis Genève, le Comité Suisse agit pour l'Arménie, sa communauté et son identité millénaire.",
    'home.cta_donate': 'Faire un don',
    'home.cta_events': 'Découvrir nos événements',
    'home.figures_title': 'Chiffres clés',
    'home.mission_title': 'Notre mission',
    'home.mission_body':
      "Depuis plus d'un siècle, l'UGAB unit et soutient les Arméniens du monde entier — par l'action humanitaire, l'éducation, la culture et la santé. Une mission portée aujourd'hui par des comités actifs sur cinq continents, avec la même exigence qu'à sa fondation en 1906.",
    'home.events_title': 'Prochains événements',
    'home.events_all': 'Voir tous les événements',
    'home.donate_teaser': "Un don, un geste concret pour l'Arménie et les siens.",
    'home.sponsor_teaser':
      'Associez votre entreprise à une cause qui unit une communauté mondiale — et gagnez en visibilité auprès des décideurs genevois.',
    'home.sponsor_cta': 'Devenir partenaire',

    // --- À propos ---
    'about.title': 'À propos',
    'about.intro':
      "Depuis 1906, l'UGAB écrit l'histoire de la diaspora arménienne — de sa fondation au Caire à son rayonnement actuel dans plus de 30 pays. Découvrez notre histoire, notre mission, et l'action du Comité Suisse à Genève.",
    'about.history_title': "Histoire de l'UGAB",
    'about.history_p1':
      "Le 15 avril 1906, à l'initiative de Boghos Nubar — diplomate et philanthrope arménien, fils de l'ancien Premier ministre d'Égypte Nubar Pacha — un groupe de personnalités arméniennes fonde l'UGAB au Caire. Leur ambition : bâtir une organisation capable de soutenir un peuple dispersé sur plusieurs continents.",
    'about.history_p2':
      "Après le génocide arménien de 1915, l'UGAB devient l'un des principaux artisans de la reconstruction : écoles, cliniques et foyers culturels voient le jour partout où les Arméniens trouvent refuge. Le siège s'installe à New York durant la Seconde Guerre mondiale, consolidant son rayonnement à l'échelle mondiale.",
    'about.history_p3':
      "Plus de 120 ans après sa fondation, l'UGAB est aujourd'hui la plus grande organisation non gouvernementale arménienne au monde — présente dans plus de 30 pays, sur 5 continents, avec plus de 100 000 membres actifs. Une continuité rare, qui fait de chaque don la suite d'une histoire commencée il y a plus d'un siècle.",
    'about.mission_title': 'Mission et valeurs',
    'about.mission_body':
      "Soutenir l'Arménie et les Arméniens du monde entier — par l'action humanitaire, l'éducation, la préservation culturelle et le développement social. Une mission inchangée depuis 1906, portée aujourd'hui par des comités actifs sur cinq continents, dont celui de Genève.",
    'about.committee_title': 'Le Comité Suisse',
    'about.committee_p1':
      "Le Comité Suisse de l'UGAB représente, depuis Genève, l'un des maillons de ce réseau mondial. Sa position est unique : au cœur d'une ville qui abrite le siège européen des Nations Unies, le CICR et des centaines d'organisations internationales, le Comité évolue naturellement dans un environnement de diplomatie, de philanthropie et d'exigence.",
    'about.committee_p2':
      "Chaque année, ses galas, concerts et conférences réunissent la communauté arménienne de Suisse et ses partenaires autour d'une cause commune — et contribuent directement aux programmes de l'UGAB à travers le monde.",
    'about.actions_title': "Axes d'action",
    'about.bureau_title': 'Bureau du Comité',
    'bureau.president': 'Président(e)',
    'bureau.vice-president': 'Vice-Président(e)',
    'bureau.secretaire-general': 'Secrétaire Général(e)',
    'bureau.tresorier': 'Trésorier(ère)',
    // NOT APPROVED COPY — see the header of this file.
    'about.bureau_pending':
      'Photographies et biographies des membres du Bureau à fournir par le Comité.',

    // --- Événements ---
    'events.title': 'Événements',
    'events.intro':
      "Toute l'année, le Comité Suisse célèbre la culture arménienne à travers des événements de prestige. Galas, concerts, conférences : réservez vos places en ligne.",
    'events.upcoming_title': 'À venir',
    // NOT APPROVED COPY — see the header of this file.
    'events.empty': "Aucun événement n'est programmé pour le moment. Revenez bientôt.",
    'events.past_title': 'Événements passés',
    'events.past_intro': 'Revivez nos événements passés en images.',
    'events.more': 'En savoir plus',

    // --- Fiche événement ---
    'event.upcoming': 'Événement à venir',
    'event.past': 'Événement passé',
    'event.date': 'Date',
    'event.venue': 'Lieu',
    'event.programme': 'Programme',
    'event.pricing': 'Tarifs',
    'event.capacity': 'Nombre de places',
    'event.places': 'places',
    'event.sold_out': 'Complet',
    'event.book': 'Réserver',
    'event.finished': 'Événement terminé',
    'event.ask': 'Nous contacter',
    'event.gallery': 'En images',
    'event.practical': 'Infos pratiques',
    'event.directions': 'Itinéraire',
    // NOT APPROVED COPY — see the header of this file.
    'event.directions_new_tab': 'Ouvre OpenStreetMap dans un nouvel onglet',
    'event.all': 'Tous les événements',

    // --- Billetterie (PRD 6) ---
    // NOT APPROVED COPY — the whole block, except 'event.thanks_title', which is
    // the first sentence of the committee's approved booking confirmation. The
    // brief never had to write any of this: it assumed a booking engine that
    // would speak for itself. See the header of this file.
    'event.tickets_title': 'Billetterie',
    'event.ticket_types': 'Types de billets',
    'event.large_booking':
      'Pour une table ou une réservation d’entreprise, écrivez-nous : ces places se réservent directement auprès du Comité.',
    // NOT APPROVED COPY — see the header of this file. Says out loud what the
    // brief asks for: one room capacity shared by every ticket type.
    'event.capacity_note': 'Places disponibles pour l’ensemble des tarifs.',
    // NOT APPROVED COPY — the brief asks for an automatic « Complet ». A static
    // page cannot know a provider's remaining stock, so this state is set by the
    // Comité on the fiche. See ADR-0001 and PRD 6.
    'event.sold_out_detail':
      'Toutes les places ont été attribuées. Les réservations sont closes pour cet événement.',
    'event.sold_out_contact': 'Une place peut se libérer : écrivez-nous.',
    // NOT APPROVED COPY — see the header of this file.
    'event.booking_pending':
      'La billetterie en ligne sera ouverte dès l’ouverture du compte auprès du prestataire. D’ici là, écrivez-nous pour réserver.',
    'event.booking_external':
      'La réservation et le paiement se font chez le prestataire de billetterie du Comité.',
    'event.availability_note':
      'Le nombre de places restantes n’est pas affiché sur cette page : seule la billetterie le connaît.',
    // Message de confirmation — Achat de billet. Le texte approuvé nomme la date
    // et le lieu ; une page statique ne peut pas les connaître, c’est le message
    // du prestataire qui les porte.
    'event.thanks_title': 'Réservation confirmée',
    // NOT APPROVED COPY — see the header of this file.
    'event.thanks_body': 'Rendez-vous au jour, à l’heure et au lieu indiqués sur votre billet.',
    // NOT APPROVED COPY — see the header of this file.
    'event.thanks_pending':
      'La billetterie en ligne n’est pas encore ouverte. Cette page est l’adresse à laquelle le prestataire renverra les acheteurs une fois le compte du Comité ouvert : c’est lui qui enverra le billet, la date et le lieu.',

    // --- Faire un don ---
    'donate.title': "Soutenez l'UGAB — Agissez pour l'Arménie",
    'donate.lead': 'Chaque don change une vie.',
    'donate.impact_p1':
      "L'Arménie et sa diaspora font face à des défis considérables : instabilité régionale, déplacements de populations, risque d'érosion d'une identité culturelle millénaire. Depuis plus de 120 ans, l'UGAB agit en première ligne — avec la continuité et le sérieux d'une institution qui a traversé un siècle d'histoire.",
    'donate.impact_p2':
      "Chaque don au Comité Suisse rejoint un réseau actif dans plus de 30 pays et finance des actions concrètes : aide aux familles déplacées, soutien aux écoles arméniennes, programmes culturels pour la jeunesse, reconstruction de communautés fragilisées. Aucune somme n'est trop modeste — chaque franc est intégralement affecté à la mission, où qu'il soit versé dans le monde.",
    'donate.amounts_title': 'Montants suggérés',
    // The brief's line ends with "Reçu automatique par e-mail" — deliberately
    // not carried. See PRD 7 (#7).
    'donate.terms': 'Don unique ou mensuel · Paiement 100 % sécurisé.',
    // NOT APPROVED COPY — see the header of this file.
    'donate.provider_pending':
      'Le module de don en ligne sera intégré dès l’ouverture du compte auprès du prestataire de paiement suisse.',

    // --- Don en ligne (PRD 5) ---
    // NOT APPROVED COPY — the whole block. See the header of this file.
    'donate.give_title': 'Faire un don',
    'donate.frequency_title': 'Fréquence du don',
    'donate.frequency_once': 'Une seule fois',
    'donate.frequency_monthly': 'Chaque mois',
    // NOT APPROVED COPY — see the header of this file.
    'donate.amount_free': 'Montant libre (CHF)',
    'donate.form_title': 'Formulaire de don en ligne',
    // NOT APPROVED COPY — see the header of this file. Nothing processes the
    // choice above yet, and a page that let someone believe otherwise would be
    // worse than one offering no choice at all.
    'donate.provider_pending_detail':
      'Votre choix n’est donc pas encore transmis : rien n’est débité et rien n’est enregistré. Deux façons de donner fonctionnent dès aujourd’hui.',

    // --- Virement et QR-facture ---
    // NOT APPROVED COPY — the whole block, except the QR-facture field names
    // further down, which are fixed by the Swiss Payment Standards rather than
    // chosen by anyone. See the header of this file.
    'donate.transfer_title': 'Don par virement bancaire',
    // NOT APPROVED COPY — see the header of this file.
    'donate.transfer_lead':
      'Le virement évite les frais du prestataire de paiement. C’est la voie à privilégier pour les montants importants.',
    'donate.transfer_cta': 'Donner par virement',
    // NOT APPROVED COPY — see the header of this file. A statement about how
    // Swiss banking works, not a promise the Comité has to keep.
    'donate.standing_order':
      'Pour un don mensuel par virement, votre banque met en place un ordre permanent.',
    // NOT APPROVED COPY — see the header of this file.
    'donate.bank_pending':
      'Coordonnées bancaires à fournir par le Comité. Aucun IBAN n’est publié tant qu’il n’a pas été confirmé par écrit.',
    'donate.iban_pending': 'IBAN à fournir par le Comité',
    'donate.qr_pending':
      'Le code QR sera généré dès que le Comité aura communiqué l’IBAN de l’association.',

    // QR-facture — the field names are fixed by the Swiss Payment Standards, not
    // chosen. A donor's banking app expects to read exactly these words.
    'donate.qr_title': 'QR-facture',
    'donate.qr_receipt': 'Récépissé',
    'donate.qr_payment_part': 'Section paiement',
    'donate.qr_account': 'Compte / Payable à',
    'donate.qr_payable_by': 'Payable par (nom/adresse)',
    'donate.qr_currency': 'Monnaie',
    'donate.qr_amount': 'Montant',
    'donate.qr_reference': 'Informations supplémentaires',
    'donate.qr_acceptance': 'Point de dépôt',

    // --- Merci (adresse de retour du prestataire) ---
    // 'donate.thanks_body' is the committee's approved wording; 'thanks_title'
    // and 'thanks_pending' are NOT APPROVED COPY. See the header of this file.
    // Message de confirmation — Don. Le texte approuvé se termine par « Reçu
    // envoyé par e-mail » : non repris, pour la même raison que 'donate.terms'.
    // Voir PRD 7 (#7) et la section A1 de docs/pre-launch-checklist.md.
    'donate.thanks_title': 'Merci',
    'donate.thanks_body': 'Merci pour ce geste. Votre don agit, dès aujourd’hui, pour l’Arménie.',
    // NOT APPROVED COPY — see the header of this file.
    'donate.thanks_pending':
      'Le don en ligne n’est pas encore activé. Cette page est l’adresse à laquelle le prestataire de paiement renverra les donateurs une fois le compte du Comité ouvert : c’est lui qui enverra la confirmation du paiement.',

    // --- Sponsoring ---
    'sponsor.title': 'Devenez partenaire de nos événements de prestige',
    'sponsor.p1':
      "Depuis 1906, l'UGAB est associée à l'élite intellectuelle, culturelle et philanthropique arménienne à travers le monde — de Paris à New York, de Beyrouth à Erevan. À Genève, cette réputation prend une résonance particulière : celle d'une ville où se croisent chaque jour diplomates, dirigeants d'organisations internationales et grandes familles philanthropiques.",
    'sponsor.p2':
      "Chaque année, les galas, concerts et soirées du Comité Suisse réunissent ce même public dans les lieux les plus prestigieux de la ville. En devenant partenaire, votre entreprise n'associe pas seulement son image à une cause noble et à une institution centenaire : elle gagne un accès direct à un réseau rare, et une visibilité durable, construite sur 120 ans de crédibilité internationale.",
    'sponsor.packages_title': 'Packages de partenariat',
    'sponsor.package_column': 'Package',
    'sponsor.amount_column': 'Apport',
    'sponsor.benefits_column': 'Contreparties',
    'sponsor.packages_note': 'Montants indicatifs — à valider par le Comité avant publication.',
    'sponsor.cta': 'Discuter d’un partenariat',

    // --- Contact ---
    'contact.title': 'Contactez le Comité Suisse.',
    'contact.lead':
      'Une question, un projet de partenariat ? Écrivez-nous — nous revenons vers vous rapidement.',
    'contact.organisation': 'Union Générale Arménienne de Bienfaisance — Comité Suisse, Genève',
    'contact.details_title': 'Coordonnées',
    // NOT APPROVED COPY — see the header of this file.
    'contact.pending':
      'Case postale, téléphone et comptes de réseaux sociaux : coordonnées officielles à fournir par le Comité.',
    'contact.form_title': 'Envoyer un message',
    'contact.form_name': 'Prénom & nom',
    'contact.form_email': 'E-mail',
    'contact.form_topic': 'Sujet',
    'contact.form_message': 'Message',
    'contact.form_submit': 'Envoyer le message',
    'contact.confirmation': 'Message bien reçu. Le Comité Suisse vous répond très vite.',
    // NOT APPROVED COPY — see the header of this file.
    'contact.form_pending':
      'Le formulaire sera activé à la mise en ligne du site. D’ici là, écrivez-nous directement par e-mail.',
    // NOT APPROVED COPY — see the header of this file. Said before the message
    // is sent rather than only in the policy: telling someone afterwards what
    // became of what they wrote is not telling them.
    'contact.before_sending':
      'Votre message arrive dans la boîte du Comité, hébergée en Suisse chez Infomaniak, et ne sert qu’à vous répondre. Nous le conservons jusqu’à douze mois après notre réponse, puis nous le supprimons.',
    'contact.before_sending_more': 'Le détail, et vos droits :',

    // --- Repli linguistique ---
    // NOT APPROVED COPY — see the header of this file. Shown only on a page a
    // visitor asked for in one language and that exists in another.
    'fallback.notice':
      "Cette page n'est pas encore traduite en arménien. Vous lisez la version française.",
    'fallback.switch': 'Continuer en français',
    'fallback.label': 'Langue de cette page',

    'footer.description':
      "L'UGAB Comité Suisse soutient l'Arménie et sa diaspora depuis Genève. Fondée en 1906.",
    'footer.copyright':
      'Union Générale Arménienne de Bienfaisance — Comité Suisse, Genève. Tous droits réservés.',
    'footer.legal': 'Mentions légales',
    'footer.privacy': 'Politique de confidentialité',
    'footer.accessibility': "Déclaration d'accessibilité",
  },
  en: {
    'nav.label': 'Main navigation',
    // NOT APPROVED COPY — see the header of this file.
    'nav.skip': 'Skip to content',
    'nav.menu': 'Open the menu',
    'nav.home': 'Home',
    'nav.about': 'About',
    'nav.events': 'Events',
    'nav.donate_page': 'Donate & Sponsorship',
    'nav.donate': 'Donate',
    'nav.contact': 'Contact',

    'site.title': 'AGBU Swiss Committee',
    'site.short': 'Swiss Committee',
    'site.tagline': 'Geneva',
    'site.description':
      'The AGBU Swiss Committee supports Armenia and its diaspora from Geneva. Founded in 1906.',

    // --- Home ---
    'home.hero_title': 'Serving Armenia and its diaspora since 1906.',
    'home.hero_lead':
      "The world's largest Armenian humanitarian and cultural organisation. From Geneva, the Swiss Committee acts for Armenia, its people and its living heritage.",
    'home.cta_donate': 'Donate',
    'home.cta_events': 'Discover our events',
    'home.figures_title': 'Key figures',
    'home.mission_title': 'Our mission',
    'home.mission_body':
      'For over a century, the AGBU has united and supported Armenians worldwide — through humanitarian action, education, culture and health. A mission carried today by active committees on five continents, with the same rigour as at its founding in 1906.',
    'home.events_title': 'Upcoming events',
    'home.events_all': 'See all events',
    'home.donate_teaser': 'A gift that acts, for Armenia and its people.',
    'home.sponsor_teaser':
      "Align your company with a cause that unites a global community — and gain visibility among Geneva's decision-makers.",
    'home.sponsor_cta': 'Become a partner',

    // --- About ---
    'about.title': 'About',
    'about.intro':
      'Since 1906, the AGBU has shaped the story of the Armenian diaspora — from its founding in Cairo to its reach today across more than 30 countries. Discover our history, our mission, and the work of the Swiss Committee in Geneva.',
    'about.history_title': 'History of the AGBU',
    'about.history_p1':
      'On 15 April 1906, at the initiative of Boghos Nubar — Armenian diplomat and philanthropist, son of former Egyptian Prime Minister Nubar Pasha — a group of prominent Armenians founded the AGBU in Cairo. Their ambition: to build an organisation capable of supporting a people scattered across continents.',
    'about.history_p2':
      'After the 1915 Armenian Genocide, the AGBU became one of the main architects of reconstruction: schools, clinics and cultural centres rose wherever Armenians found refuge. Its headquarters moved to New York during the Second World War, cementing its worldwide reach.',
    'about.history_p3':
      "More than 120 years after its founding, the AGBU is today the world's largest Armenian non-governmental organisation — present in more than 30 countries across 5 continents, with over 100,000 active members. A rare continuity, which makes every donation part of a story that began more than a century ago.",
    'about.mission_title': 'Mission and values',
    'about.mission_body':
      "Supporting Armenia and Armenians worldwide — through humanitarian action, education, cultural preservation and social development. A mission unchanged since 1906, carried today by active committees on five continents, including Geneva's.",
    'about.committee_title': 'The Swiss Committee',
    'about.committee_p1':
      "The AGBU Swiss Committee represents, from Geneva, one link in this global network. Its position is unique: at the heart of a city that hosts the United Nations' European headquarters, the ICRC and hundreds of international organisations, the Committee operates naturally within a world of diplomacy, philanthropy and high standards.",
    'about.committee_p2':
      'Each year, its galas, concerts and conferences bring together the Armenian community of Switzerland and its partners around a shared cause — and contribute directly to AGBU programmes worldwide.',
    'about.actions_title': 'Areas of action',
    'about.bureau_title': 'The Committee bureau',
    'bureau.president': 'President',
    'bureau.vice-president': 'Vice-President',
    'bureau.secretaire-general': 'Secretary General',
    'bureau.tresorier': 'Treasurer',
    // NOT APPROVED COPY — see the header of this file.
    'about.bureau_pending':
      'Portraits and biographies of the bureau members are still to be supplied by the Committee.',

    // --- Events ---
    'events.title': 'Events',
    'events.intro':
      'Throughout the year, the Swiss Committee celebrates Armenian culture through prestigious events. Galas, concerts, conferences: book your tickets online.',
    'events.upcoming_title': 'Coming up',
    // NOT APPROVED COPY — see the header of this file.
    'events.empty': 'No event is scheduled at the moment. Please come back soon.',
    'events.past_title': 'Past events',
    'events.past_intro': 'Relive our past events in pictures.',
    'events.more': 'Find out more',

    // --- Event page ---
    'event.upcoming': 'Upcoming event',
    'event.past': 'Past event',
    'event.date': 'Date',
    'event.venue': 'Venue',
    'event.programme': 'Programme',
    'event.pricing': 'Tickets',
    'event.capacity': 'Places',
    'event.places': 'places',
    'event.sold_out': 'Sold out',
    'event.book': 'Book',
    'event.finished': 'This event has taken place',
    'event.ask': 'Contact us',
    'event.gallery': 'In pictures',
    'event.practical': 'Practical information',
    'event.directions': 'Directions',
    // NOT APPROVED COPY — see the header of this file.
    'event.directions_new_tab': 'Opens OpenStreetMap in a new tab',
    'event.all': 'All events',

    // --- Booking (PRD 6) ---
    // NOT APPROVED COPY — the whole block, except 'event.thanks_title'. See the
    // header of this file, and the French table above.
    'event.tickets_title': 'Booking',
    'event.ticket_types': 'Ticket types',
    'event.large_booking':
      'For a table or a company booking, write to us: those places are reserved directly with the Committee.',
    // NOT APPROVED COPY — see the header of this file.
    'event.capacity_note': 'Places available across all ticket types together.',
    // NOT APPROVED COPY — see the header of this file.
    'event.sold_out_detail': 'Every place has been taken. Booking is closed for this event.',
    'event.sold_out_contact': 'A place may free up: write to us.',
    // NOT APPROVED COPY — see the header of this file.
    'event.booking_pending':
      'Online booking will open as soon as the account with the ticketing provider is open. Until then, write to us to reserve a place.',
    'event.booking_external':
      'Booking and payment take place with the Committee’s ticketing provider.',
    'event.availability_note':
      'The number of places left is not shown on this page: only the ticketing system knows it.',
    'event.thanks_title': 'Booking confirmed',
    // NOT APPROVED COPY — see the header of this file.
    'event.thanks_body': 'See you on the day, at the time and place shown on your ticket.',
    // NOT APPROVED COPY — see the header of this file.
    'event.thanks_pending':
      'Online booking is not open yet. This page is the address the ticketing provider will return buyers to once the Committee’s account is open: it is the provider that sends the ticket, the date and the venue.',

    // --- Donate ---
    'donate.title': 'Support the AGBU — Act for Armenia',
    'donate.lead': 'Every donation changes a life.',
    'donate.impact_p1':
      'Armenia and its diaspora face considerable challenges: regional instability, population displacement, and the risk of erosion of a millennia-old cultural identity. For more than 120 years, the AGBU has stood on the front line — with the continuity and rigour of an institution that has weathered a century of history.',
    'donate.impact_p2':
      'Every donation to the Swiss Committee joins a network active in more than 30 countries and funds concrete action: support for displaced families, Armenian schools, cultural programmes for young people, and the rebuilding of fragile communities. No amount is too small — every franc is fully dedicated to the mission, wherever in the world it is spent.',
    'donate.amounts_title': 'Suggested amounts',
    'donate.terms': 'One-time or monthly · 100% secure payment.',
    // NOT APPROVED COPY — see the header of this file.
    'donate.provider_pending':
      'The online donation form will be embedded as soon as the account with the Swiss payment provider is open.',

    // --- Online giving (PRD 5) ---
    // NOT APPROVED COPY — the whole block. See the header of this file.
    'donate.give_title': 'Make a donation',
    'donate.frequency_title': 'How often',
    'donate.frequency_once': 'Once',
    'donate.frequency_monthly': 'Every month',
    // NOT APPROVED COPY — see the header of this file.
    'donate.amount_free': 'Free amount (CHF)',
    'donate.form_title': 'Online donation form',
    // NOT APPROVED COPY — see the header of this file.
    'donate.provider_pending_detail':
      'Your choice is therefore not sent anywhere yet: nothing is charged and nothing is stored. Two ways of giving already work today.',

    // --- Bank transfer and QR-bill ---
    // NOT APPROVED COPY — the whole block, except the QR-bill field names, which
    // the Swiss Payment Standards fix. See the header of this file.
    'donate.transfer_title': 'Donation by bank transfer',
    // NOT APPROVED COPY — see the header of this file.
    'donate.transfer_lead':
      'A bank transfer avoids the payment provider’s fees. It is the route to prefer for larger amounts.',
    'donate.transfer_cta': 'Give by bank transfer',
    // NOT APPROVED COPY — see the header of this file.
    'donate.standing_order':
      'For a monthly gift by transfer, your bank will set up a standing order.',
    // NOT APPROVED COPY — see the header of this file.
    'donate.bank_pending':
      'Bank details to be supplied by the Committee. No IBAN is published until it has been confirmed in writing.',
    'donate.iban_pending': 'IBAN to be supplied by the Committee',
    'donate.qr_pending':
      'The QR code will be generated as soon as the Committee supplies the association’s IBAN.',

    // The QR-bill field names are fixed by the Swiss Payment Standards.
    'donate.qr_title': 'Swiss QR-bill',
    'donate.qr_receipt': 'Receipt',
    'donate.qr_payment_part': 'Payment part',
    'donate.qr_account': 'Account / Payable to',
    'donate.qr_payable_by': 'Payable by (name/address)',
    'donate.qr_currency': 'Currency',
    'donate.qr_amount': 'Amount',
    'donate.qr_reference': 'Additional information',
    'donate.qr_acceptance': 'Acceptance point',

    // --- Thank you (the provider's return address) ---
    // 'donate.thanks_body' is the committee's approved wording; the other two
    // are NOT APPROVED COPY. See the header of this file.
    // The approved wording ends with "Receipt sent by email": not carried, for
    // the same reason as 'donate.terms'. See PRD 7 (#7).
    'donate.thanks_title': 'Thank you',
    'donate.thanks_body': 'Thank you for this gift. Your donation is already at work for Armenia.',
    // NOT APPROVED COPY — see the header of this file.
    'donate.thanks_pending':
      'Online giving is not switched on yet. This page is the address the payment provider will return donors to once the Committee’s account is open: it is the provider that sends the payment confirmation.',

    // --- Sponsorship ---
    'sponsor.title': 'Become a partner of our prestigious events',
    'sponsor.p1':
      'Since 1906, the AGBU has been associated with Armenian intellectual, cultural and philanthropic elites around the world — from Paris to New York, Beirut to Yerevan. In Geneva, this reputation carries particular weight: a city where diplomats, heads of international organisations and leading philanthropic families cross paths every day.',
    'sponsor.p2':
      "Each year, the Swiss Committee's galas, concerts and evenings bring together this same audience in the city's most prestigious venues. By becoming a partner, your company does more than associate its image with a noble cause and a century-old institution: it gains direct access to a rare network, and lasting visibility built on 120 years of international credibility.",
    'sponsor.packages_title': 'Partnership packages',
    'sponsor.package_column': 'Package',
    'sponsor.amount_column': 'Contribution',
    'sponsor.benefits_column': 'What it includes',
    'sponsor.packages_note':
      'Indicative amounts — to be confirmed by the Committee before publication.',
    'sponsor.cta': 'Discuss a partnership',

    // --- Contact ---
    'contact.title': 'Contact the Swiss Committee.',
    'contact.lead': "A question, a partnership idea? Write to us — we'll get back to you quickly.",
    'contact.organisation': 'Armenian General Benevolent Union — Swiss Committee, Geneva',
    'contact.details_title': 'Contact details',
    // NOT APPROVED COPY — see the header of this file.
    'contact.pending':
      'Postal box, telephone and social media accounts: official details still to be supplied by the Committee.',
    'contact.form_title': 'Send a message',
    'contact.form_name': 'First and last name',
    'contact.form_email': 'Email',
    'contact.form_topic': 'Subject',
    'contact.form_message': 'Message',
    'contact.form_submit': 'Send the message',
    'contact.confirmation': 'Message received. The Swiss Committee will reply shortly.',
    // NOT APPROVED COPY — see the header of this file.
    'contact.before_sending':
      'Your message arrives in the Committee mailbox, hosted in Switzerland by Infomaniak, and is used only to reply to you. We keep it for up to twelve months after we reply, then delete it.',
    'contact.before_sending_more': 'The detail, and your rights:',
    // NOT APPROVED COPY — see the header of this file.
    'contact.form_pending':
      'The form will be switched on when the site goes live. Until then, please write to us by email.',

    // --- Language fallback ---
    // NOT APPROVED COPY — see the header of this file.
    'fallback.notice':
      'This page has not been translated into Armenian yet. You are reading the French version.',
    'fallback.switch': 'Continue in French',
    'fallback.label': 'Language of this page',

    'footer.description':
      'The AGBU Swiss Committee supports Armenia and its diaspora from Geneva. Founded in 1906.',
    'footer.copyright':
      'Armenian General Benevolent Union — Swiss Committee, Geneva. All rights reserved.',
    'footer.legal': 'Legal notice',
    'footer.privacy': 'Privacy policy',
    'footer.accessibility': 'Accessibility statement',
  },
} as const;

/** Every key the site can ask for. French is the complete set by definition. */
export type UiKey = keyof (typeof ui)[typeof defaultLang];

/**
 * Armenian.
 *
 * Empty on purpose. The Comité owes the translations (#9), and nobody on this
 * side of the project is in a position to write Armenian on their behalf: an
 * invented translation is worse than an admitted gap, because nobody checks a
 * field that looks filled in.
 *
 * This is the only file a translator has to touch. Paste a key from the French
 * table above with its Armenian text and it is served immediately. When every
 * key a page uses is present, that page stops announcing a fallback and becomes
 * Armenian — no developer, no restructuring. See ./fallback.ts for how a page
 * decides which it is.
 */
export const armenian: Partial<Record<UiKey, string>> = {};

/** The three tables, by language. What `useTranslations` reads. */
export const translations: Record<Lang, Partial<Record<UiKey, string>>> = {
  fr: ui.fr,
  en: ui.en,
  hy: armenian,
};
