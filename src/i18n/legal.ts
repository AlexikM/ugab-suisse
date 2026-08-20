/**
 * Copy and data for the three legal pages: privacy policy, legal notices,
 * accessibility statement.
 *
 * Kept out of `ui.ts` on purpose. These strings are long, they are edited by a
 * different person for a different reason (a processor changes, an address is
 * confirmed), and one of them — the processor register — is not copy at all but
 * a machine-readable claim about the system that `tests/compliance/` checks
 * against the built site.
 *
 * The rule this module exists to enforce: **the policy describes what the system
 * does.** Add a third-party host to the site and it must appear here, or the
 * third-party request audit fails. Remove one and it must leave here, or the
 * audit fails the other way. The disclosure cannot quietly go stale.
 */

export type LegalLang = 'fr' | 'en';

export const legalDefaultLang: LegalLang = 'fr';

/** Falls back to French rather than throwing: a legal page must always render. */
export function legalLang(lang: string): LegalLang {
  return lang === 'en' ? 'en' : legalDefaultLang;
}

// ---------------------------------------------------------------------------
// Facts the committee still owes
// ---------------------------------------------------------------------------

/**
 * `null` means "not confirmed by the committee yet" — see issue #9. It renders
 * as a visible placeholder rather than a plausible invention, because a wrong
 * address in a privacy policy is worse than an obviously missing one: nobody
 * checks a field that looks filled in.
 *
 * The prototype had invented `contact@ugab.ch` and a Cloudflare host. Both were
 * wrong. Hence `null`.
 */
export const committee = {
  legalName: 'Union Générale Arménienne de Bienfaisance — Comité Suisse',
  shortName: 'UGAB Comité Suisse',
  city: 'Genève, Suisse',
  /** Legal form is established by the statutes; the article reference is not a claim about tax status. */
  legalForm: 'association',
  postalAddress: null as string | null,
  email: null as string | null,
  phone: null as string | null,
  /** Federal register / IDE number, if the association is registered at all. */
  registrationNumber: null as string | null,
} as const;

export const pendingLabel: Record<LegalLang, string> = {
  fr: 'à fournir par le Comité',
  en: 'to be supplied by the Committee',
};

/** Days the committee commits to for answering a rights request. */
export const rightsResponseDays = 30;

// ---------------------------------------------------------------------------
// The processor register
// ---------------------------------------------------------------------------

/**
 * `active` — integrated today, so its hosts must appear in the build output.
 * `planned` — disclosed ahead of integration, so its hosts must NOT appear yet.
 *
 * Flipping a processor to `active` without wiring it, or wiring it without
 * flipping, both fail the audit. That is the point.
 */
export type ProcessorStatus = 'active' | 'planned';

export interface Processor {
  id: string;
  name: Record<LegalLang, string>;
  /** Where the processing happens, in words a donor understands. */
  country: Record<LegalLang, string>;
  status: ProcessorStatus;
  /** Hostnames the visitor's browser contacts. Empty when the work is server-side only. */
  hosts: string[];
  purpose: Record<LegalLang, string>;
  receives: Record<LegalLang, string>;
  /** Their retention, not ours. Disclosed, not duplicated. */
  retention: Record<LegalLang, string>;
}

export const processors: Processor[] = [
  {
    id: 'infomaniak',
    name: { fr: 'Infomaniak Network SA', en: 'Infomaniak Network SA' },
    country: { fr: 'Suisse (Genève)', en: 'Switzerland (Geneva)' },
    status: 'planned',
    // The browser talks to this site's own domain, which Infomaniak serves.
    // No separate hostname, so nothing for the request audit to find.
    hosts: [],
    purpose: {
      fr: "Héberge ce site et la messagerie du Comité. Toutes les pages que vous consultez sont servies depuis leurs serveurs, et tout message que vous nous envoyez transite par leur messagerie.",
      en: 'Hosts this site and the Committee mailboxes. Every page you read is served from their machines, and any message you send us passes through their mail service.',
    },
    receives: {
      fr: "Votre adresse IP, la page demandée, la date et votre navigateur (journaux techniques du serveur), ainsi que le contenu et l'adresse d'expédition des messages qui nous parviennent.",
      en: 'Your IP address, the page requested, the date and your browser (server logs), plus the contents and sender address of any message that reaches us.',
    },
    retention: {
      fr: 'Journaux techniques conservés quelques mois par Infomaniak, selon leurs propres règles.',
      en: 'Server logs kept for a few months by Infomaniak, under their own rules.',
    },
  },
  {
    id: 'payment',
    name: {
      fr: 'Prestataire de paiement suisse (RaiseNow SA ou Payrexx AG — non encore arrêté)',
      en: 'Swiss payment provider (RaiseNow SA or Payrexx AG — not yet fixed)',
    },
    country: { fr: 'Suisse', en: 'Switzerland' },
    status: 'planned',
    hosts: [],
    purpose: {
      fr: "Encaisse les dons. Le formulaire de don est le leur, pas le nôtre : votre paiement ne passe jamais par nos serveurs.",
      en: 'Collects donations. The donation form is theirs, not ours: your payment never passes through our servers.',
    },
    receives: {
      fr: "Votre nom, votre adresse e-mail, le montant, le moyen de paiement et, selon le moyen choisi, votre adresse postale. Nous ne voyons jamais votre numéro de carte.",
      en: 'Your name, email address, the amount, the payment method and, depending on the method, your postal address. We never see your card number.',
    },
    retention: {
      fr: "Conservation imposée par le droit comptable suisse, en principe dix ans. Le Comité conserve de son côté les justificatifs nécessaires à sa comptabilité.",
      en: 'Retention imposed by Swiss accounting law, in principle ten years. The Committee separately keeps the records its own accounts require.',
    },
  },
  {
    id: 'ticketing',
    name: { fr: 'Prestataire de billetterie (Billetweb — non encore arrêté)', en: 'Ticketing provider (Billetweb — not yet fixed)' },
    country: { fr: 'France (Union européenne)', en: 'France (European Union)' },
    status: 'planned',
    hosts: [],
    purpose: {
      fr: "Vend et émet les billets de nos événements, et gère la liste d'entrée le soir même.",
      en: 'Sells and issues tickets for our events, and holds the door list on the night.',
    },
    receives: {
      fr: "Votre nom, votre adresse e-mail, l'événement réservé et le nombre de places.",
      en: 'Your name, email address, the event booked and the number of places.',
    },
    retention: {
      fr: "Selon les règles du prestataire. Le Comité demande la suppression des listes de participants après l'événement et sa clôture comptable.",
      en: 'Under the provider’s own rules. The Committee asks for attendee lists to be deleted once the event and its accounts are closed.',
    },
  },
  {
    id: 'turnstile',
    name: { fr: 'Cloudflare, Inc. (service anti-spam « Turnstile »)', en: 'Cloudflare, Inc. (“Turnstile” anti-spam service)' },
    country: { fr: 'États-Unis, avec traitement réparti mondialement', en: 'United States, with processing distributed worldwide' },
    status: 'planned',
    hosts: ['challenges.cloudflare.com'],
    purpose: {
      fr: "Distingue une personne d'un robot au moment de l'envoi du formulaire de contact, sans vous poser d'énigme et sans vous suivre d'un site à l'autre.",
      en: 'Tells a person from a bot when the contact form is submitted, without setting you a puzzle and without following you between sites.',
    },
    receives: {
      fr: "Votre adresse IP et des signaux techniques sur votre navigateur, au moment de l'envoi.",
      en: 'Your IP address and technical signals about your browser, at the moment you submit.',
    },
    retention: {
      fr: 'Quelques minutes pour la validation, puis les données techniques sont écartées.',
      en: 'A few minutes for validation, after which the technical data is discarded.',
    },
  },
];

/** Hosts the audit expects to find in the build output today. */
export const activeHosts = (): string[] =>
  [...new Set(processors.filter((p) => p.status === 'active').flatMap((p) => p.hosts))].sort();

/** Hosts disclosed ahead of integration, which must NOT be contacted yet. */
export const plannedHosts = (): string[] =>
  [...new Set(processors.filter((p) => p.status === 'planned').flatMap((p) => p.hosts))].sort();

export const hasPlannedProcessors = (): boolean => processors.some((p) => p.status === 'planned');

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

/**
 * Anything the site stores in the visitor's browser that is not strictly needed
 * to serve the page. Empty, and the emptiness is enforced by
 * `tests/compliance/browser-storage.test.mjs`.
 *
 * It is a list rather than a boolean because the day someone adds an entry, the
 * consent notice reappears on its own (see `CookieBanner.astro`) instead of
 * relying on a maintainer remembering that it should.
 */
export const nonEssentialStorage: Array<{
  id: string;
  name: Record<LegalLang, string>;
  purpose: Record<LegalLang, string>;
}> = [];

/**
 * There is no analytics on this site. Recorded here rather than in a commit
 * message because it is a decision the next maintainer will be tempted to undo.
 *
 * Cookieless analytics remains open — Umami or Plausible, self-hosted or Swiss.
 * An advertising-network product is not: it would buy a consent banner, a
 * transfer disclosure and a consent record, in exchange for numbers nobody on a
 * volunteer committee is going to act on.
 */
export const analytics = { kind: 'none' } as const;

// ---------------------------------------------------------------------------
// Page copy
// ---------------------------------------------------------------------------

export interface Section {
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
}

export interface LegalPage {
  eyebrow: string;
  title: string;
  lead: string;
  sections: Section[];
}

/** The date the wording below was last reviewed. Rendered on every legal page. */
export const lastReviewed = '2026-08-21';

export const preLaunchNotice: Record<LegalLang, { heading: string; body: string }> = {
  fr: {
    heading: 'Version de pré-lancement',
    body: "Ce site n'est pas encore ouvert au public. L'hébergeur suisse, le prestataire de paiement, la billetterie et le service anti-spam décrits ci-dessous sont ceux qui seront en place à l'ouverture ; ils ne sont pas encore tous raccordés. Cette page sera revue et cette mention retirée avant le lancement.",
  },
  en: {
    heading: 'Pre-launch version',
    body: 'This site is not yet open to the public. The Swiss host, the payment provider, the ticketing provider and the anti-spam service described below are the ones that will be in place at launch; they are not all connected yet. This page will be reviewed and this notice removed before launch.',
  },
};

const privacyFr: LegalPage = {
  eyebrow: 'Données personnelles',
  title: 'Politique de confidentialité',
  lead: "Ce que nous savons de vous, qui d'autre le voit, combien de temps nous le gardons, et comment nous demander de l'effacer.",
  sections: [
    {
      heading: 'En bref',
      bullets: [
        "Nous ne collectons que ce que vous nous donnez : un message, un don, une réservation.",
        "Nous ne vendons, ne louons et n'échangeons vos données avec personne. Jamais.",
        "Quelques prestataires les traitent pour notre compte — l'hébergeur, la banque en ligne qui encaisse les dons, la billetterie, l'anti-spam. Ils sont tous nommés ci-dessous.",
        "Ce site ne dépose aucun cookie, ne mesure pas votre audience et n'héberge aucun traceur publicitaire.",
      ],
    },
    {
      heading: 'Une précision sur une phrase que vous avez peut-être lue ailleurs',
      paragraphs: [
        "Une version antérieure de ce texte annonçait que vos données ne sont « jamais partagées avec des tiers ». L'intention était juste — nous ne monnayons rien — mais la formulation ne l'était pas. Un site qui encaisse des dons s'appuie forcément sur un hébergeur et sur un établissement de paiement, et ceux-là voient nécessairement une partie de vos données.",
        "La phrase exacte est donc : nous ne cédons vos données à personne pour son propre usage, et les seuls tiers qui y accèdent sont des prestataires qui travaillent sur nos instructions, pour la finalité indiquée, et rien d'autre.",
      ],
    },
    {
      heading: 'Qui est responsable de vos données',
      paragraphs: [
        "Le Comité Suisse de l'Union Générale Arménienne de Bienfaisance, association de droit suisse ayant son siège à Genève, décide de ce qui est collecté et pourquoi. C'est à lui que vous écrivez pour toute question ou toute demande concernant vos données.",
      ],
    },
    {
      heading: 'Ce que nous collectons, et à quel moment',
      bullets: [
        "Formulaire de contact — votre nom, votre adresse e-mail, l'objet et votre message. Vous les saisissez ; rien n'est deviné.",
        "Don — votre nom, votre adresse e-mail et le montant. Le paiement lui-même se déroule chez notre prestataire : nous ne voyons ni votre numéro de carte, ni vos identifiants bancaires.",
        "Réservation de billets — votre nom, votre adresse e-mail, l'événement et le nombre de places.",
        "Simple consultation — l'hébergeur enregistre, comme tout serveur web, votre adresse IP, la page demandée et l'heure. Nous ne consultons ces journaux qu'en cas d'incident technique.",
      ],
    },
    {
      heading: 'Pourquoi nous avons le droit de les traiter',
      paragraphs: [
        "Pour répondre à un message, exécuter un don ou émettre un billet, le traitement découle de votre propre demande : c'est vous qui engagez la démarche. Pour la sécurité du site et la tenue de notre comptabilité, il découle de nos obligations légales et de notre intérêt à faire fonctionner une association correctement. Nous ne nous appuyons sur votre consentement pour rien, parce que nous ne faisons rien qui en exigerait un.",
      ],
    },
    {
      heading: 'Ce que nous ne faisons pas',
      bullets: [
        'Aucune vente, location ou échange de vos données.',
        'Aucune publicité, aucun profilage, aucun ciblage.',
        "Aucun réseau publicitaire, aucun pixel de suivi, aucune mesure d'audience.",
        "Aucune newsletter : vous ne serez pas inscrit à une liste parce que vous avez donné.",
        'Aucune décision automatisée vous concernant.',
      ],
    },
    {
      heading: 'Combien de temps nous conservons ce que nous détenons',
      bullets: [
        'Message de contact — jusqu’à douze mois après notre réponse, puis supprimé.',
        'Demande de partenariat ou de sponsoring — jusqu’à trois ans, le temps du cycle de la relation.',
        "Justificatifs de dons et de billetterie — dix ans, durée imposée par le droit comptable suisse. Nous n'avons pas la faculté de les effacer plus tôt.",
        "Journaux techniques du serveur — quelques mois, selon les règles de l'hébergeur.",
      ],
    },
    {
      heading: 'Vos droits',
      paragraphs: [
        "La loi fédérale suisse sur la protection des données (nLPD) et, si vous résidez dans l'Union européenne, le règlement général sur la protection des données (RGPD) vous donnent le droit de savoir ce que nous détenons sur vous, de le faire corriger, de le faire effacer, de vous opposer à un traitement et d'en obtenir une copie exploitable.",
        `Écrivez-nous et nous répondons dans les ${rightsResponseDays} jours. Si nous ne pouvons pas faire droit à votre demande — un justificatif comptable, par exemple, ne peut pas être détruit avant le délai légal — nous vous le disons et nous vous expliquons pourquoi.`,
        "Si notre réponse ne vous satisfait pas : en Suisse, le Préposé fédéral à la protection des données et à la transparence (PFPDT) ; dans l'Union européenne, l'autorité de contrôle de votre pays de résidence.",
      ],
    },
    {
      heading: 'Transferts hors de Suisse',
      paragraphs: [
        "Le site et la messagerie sont hébergés en Suisse, et les dons sont encaissés par un établissement suisse. La billetterie est établie dans l'Union européenne, dont le niveau de protection est reconnu comme adéquat. Le service anti-spam est fourni par une société américaine et traite votre adresse IP quelques instants au moment de l'envoi d'un formulaire ; ce transfert est encadré par les clauses contractuelles types.",
      ],
    },
    {
      heading: 'Cookies et mesure d’audience',
      paragraphs: [
        "Ce site ne dépose aucun cookie et n'écrit rien dans la mémoire de votre navigateur. Il n'y a pas d'outil de statistiques : nous ne comptons pas nos visiteurs. C'est pourquoi vous ne voyez aucune bannière de consentement — il n'y a rien à consentir.",
        "Si le Comité décidait un jour de compter ses visiteurs, ce serait avec un outil sans cookie et sans identifiant partagé entre sites, et cette page le dirait avant que ce soit le cas.",
      ],
    },
    {
      heading: 'En cas de fuite de données',
      paragraphs: [
        "Si des données vous concernant étaient exposées et que cela présentait un risque pour vous, le Comité en informerait le PFPDT et, lorsque le risque est élevé, vous en informerait directement — en vous disant ce qui s'est passé, ce qui est concerné et ce que nous faisons.",
      ],
    },
    {
      heading: 'Photographies',
      paragraphs: [
        "Nous publions des photographies de nos événements. Les personnes reconnaissables n'y figurent qu'avec leur accord. Si vous vous reconnaissez sur une image et souhaitez qu'elle soit retirée, écrivez-nous : nous la retirons, sans avoir à en discuter.",
      ],
    },
    {
      heading: 'Modifications',
      paragraphs: [
        "Cette page change quand le site change — nouveau prestataire, nouvelle fonctionnalité. La date de dernière révision figure en bas de page, et la liste des prestataires ci-dessus est vérifiée automatiquement à chaque mise en ligne contre ce que le site fait réellement.",
      ],
    },
  ],
};

const privacyEn: LegalPage = {
  eyebrow: 'Personal data',
  title: 'Privacy policy',
  lead: 'What we know about you, who else sees it, how long we keep it, and how to ask us to erase it.',
  sections: [
    {
      heading: 'In short',
      bullets: [
        'We collect only what you give us: a message, a donation, a booking.',
        'We do not sell, rent or trade your data with anyone. Ever.',
        'A few providers process it on our behalf — the host, the payment institution that collects donations, the ticketing service, the anti-spam service. All of them are named below.',
        'This site sets no cookies, measures no audience and hosts no advertising tracker.',
      ],
    },
    {
      heading: 'A correction to a sentence you may have read elsewhere',
      paragraphs: [
        'An earlier version of this text said your data is “never shared with third parties”. The intent was right — we monetise nothing — but the wording was not. A site that collects donations necessarily relies on a host and on a payment institution, and those necessarily see part of your data.',
        'So the accurate sentence is this: we hand your data to nobody for their own purposes, and the only third parties with access are providers acting on our instructions, for the stated purpose, and nothing else.',
      ],
    },
    {
      heading: 'Who is responsible for your data',
      paragraphs: [
        'The Swiss Committee of the Armenian General Benevolent Union, an association under Swiss law seated in Geneva, decides what is collected and why. Write to it with any question or request about your data.',
      ],
    },
    {
      heading: 'What we collect, and when',
      bullets: [
        'Contact form — your name, email address, subject and message. You type them; nothing is inferred.',
        'Donation — your name, email address and the amount. The payment itself happens at our provider: we never see your card number or your banking credentials.',
        'Ticket booking — your name, email address, the event and the number of places.',
        'Simply reading the site — the host records, as every web server does, your IP address, the page requested and the time. We look at those logs only when something breaks.',
      ],
    },
    {
      heading: 'Why we are allowed to process it',
      paragraphs: [
        'To answer a message, carry out a donation or issue a ticket, the processing follows from your own request: you started it. For site security and for keeping our accounts, it follows from our legal obligations and from our interest in running an association properly. We rely on your consent for nothing, because we do nothing that would require it.',
      ],
    },
    {
      heading: 'What we do not do',
      bullets: [
        'No selling, renting or trading of your data.',
        'No advertising, no profiling, no targeting.',
        'No ad networks, no tracking pixels, no analytics.',
        'No newsletter: you will not be added to a list because you gave.',
        'No automated decisions about you.',
      ],
    },
    {
      heading: 'How long we keep what we hold',
      bullets: [
        'Contact message — up to twelve months after we reply, then deleted.',
        'Partnership or sponsorship enquiry — up to three years, the length of the relationship cycle.',
        'Donation and ticketing records — ten years, imposed by Swiss accounting law. We are not free to erase them sooner.',
        'Server logs — a few months, under the host’s rules.',
      ],
    },
    {
      heading: 'Your rights',
      paragraphs: [
        'The Swiss Federal Act on Data Protection (nFADP) and, if you live in the European Union, the General Data Protection Regulation (GDPR) give you the right to know what we hold about you, to have it corrected, to have it erased, to object to a processing operation and to obtain a usable copy of it.',
        `Write to us and we answer within ${rightsResponseDays} days. If we cannot grant your request — an accounting record, for instance, cannot be destroyed before its legal term — we say so and explain why.`,
        'If our answer does not satisfy you: in Switzerland, the Federal Data Protection and Information Commissioner (FDPIC); in the European Union, the supervisory authority of your country of residence.',
      ],
    },
    {
      heading: 'Transfers outside Switzerland',
      paragraphs: [
        'The site and the mailboxes are hosted in Switzerland, and donations are collected by a Swiss institution. The ticketing provider is established in the European Union, whose level of protection is recognised as adequate. The anti-spam service is provided by a United States company and processes your IP address for a few moments when a form is submitted; that transfer is covered by standard contractual clauses.',
      ],
    },
    {
      heading: 'Cookies and analytics',
      paragraphs: [
        'This site sets no cookies and writes nothing into your browser’s storage. There is no analytics tool: we do not count our visitors. That is why you see no consent banner — there is nothing to consent to.',
        'If the Committee ever decided to count visitors, it would be with a tool that uses no cookies and no cross-site identifier, and this page would say so before it happened.',
      ],
    },
    {
      heading: 'If data ever leaks',
      paragraphs: [
        'If data about you were exposed and that posed a risk to you, the Committee would notify the FDPIC and, where the risk is high, notify you directly — telling you what happened, what is affected and what we are doing about it.',
      ],
    },
    {
      heading: 'Photographs',
      paragraphs: [
        'We publish photographs of our events. Identifiable people appear only with their agreement. If you recognise yourself in a picture and would like it taken down, write to us: we take it down, no argument required.',
      ],
    },
    {
      heading: 'Changes',
      paragraphs: [
        'This page changes when the site changes — a new provider, a new feature. The date of last review is at the foot of the page, and the provider list above is checked automatically on every deployment against what the site actually does.',
      ],
    },
  ],
};

const legalNoticeFr: LegalPage = {
  eyebrow: 'Informations légales',
  title: 'Mentions légales',
  lead: "Qui édite ce site, qui l'héberge, et à qui appartient ce que vous y lisez.",
  sections: [
    {
      heading: 'Éditeur du site',
      paragraphs: [
        "Union Générale Arménienne de Bienfaisance — Comité Suisse, association au sens des articles 60 et suivants du Code civil suisse, ayant son siège à Genève.",
      ],
    },
    {
      heading: 'Statut fiscal',
      paragraphs: [
        "Le Comité ne fait à ce jour aucune déclaration publique quant à une reconnaissance d'utilité publique ou à la déductibilité fiscale des dons. Une telle mention ne figurera sur ce site que sur présentation de la décision cantonale correspondante. Voir la question posée au Comité dans la liste de vérification avant lancement.",
      ],
    },
    {
      heading: 'Hébergement',
      paragraphs: [
        "Le site et la messagerie sont hébergés par Infomaniak Network SA, à Genève, sur des serveurs situés en Suisse.",
      ],
    },
    {
      heading: 'Propriété du contenu',
      paragraphs: [
        "Les textes, photographies, logos et documents publiés sur ce site appartiennent au Comité Suisse de l'UGAB ou à leurs auteurs respectifs. Vous pouvez citer et partager librement nos pages en nous créditant ; toute reprise intégrale ou tout usage commercial demande notre accord écrit, que nous donnons volontiers quand on nous le demande.",
      ],
    },
    {
      heading: 'Photographies de personnes',
      paragraphs: [
        "Les personnes reconnaissables sur les photographies publiées ici y figurent avec leur accord. Si ce n'est pas votre cas, écrivez-nous et l'image est retirée.",
      ],
    },
    {
      heading: 'Liens vers d’autres sites',
      paragraphs: [
        "Ce site renvoie vers des sites que nous ne contrôlons pas — l'UGAB internationale, des lieux d'événements, nos réseaux sociaux. Leur contenu et leurs pratiques en matière de données ne relèvent pas de nous. Aucun de ces sites n'est contacté par votre navigateur tant que vous ne cliquez pas.",
      ],
    },
    {
      heading: 'Signaler une erreur',
      paragraphs: [
        "Une date fausse, un nom mal orthographié, un lien mort ? Écrivez-nous. Ce site est tenu par des bénévoles et les corrections sont bienvenues.",
      ],
    },
  ],
};

const legalNoticeEn: LegalPage = {
  eyebrow: 'Legal information',
  title: 'Legal notices',
  lead: 'Who publishes this site, who hosts it, and who owns what you read on it.',
  sections: [
    {
      heading: 'Publisher',
      paragraphs: [
        'Armenian General Benevolent Union — Swiss Committee, an association under articles 60 et seq. of the Swiss Civil Code, seated in Geneva.',
      ],
    },
    {
      heading: 'Tax status',
      paragraphs: [
        'The Committee makes no public statement at this time about recognition of public utility or about the tax deductibility of donations. Such a statement will appear on this site only on production of the corresponding cantonal decision. See the question put to the Committee in the pre-launch checklist.',
      ],
    },
    {
      heading: 'Hosting',
      paragraphs: [
        'The site and the mailboxes are hosted by Infomaniak Network SA, in Geneva, on servers located in Switzerland.',
      ],
    },
    {
      heading: 'Ownership of the content',
      paragraphs: [
        'The texts, photographs, logos and documents published here belong to the AGBU Swiss Committee or to their respective authors. You may quote and share our pages freely with credit; full reproduction or commercial use needs our written agreement, which we give readily when asked.',
      ],
    },
    {
      heading: 'Photographs of people',
      paragraphs: [
        'Identifiable people in the photographs published here appear with their agreement. If that is not your case, write to us and the image comes down.',
      ],
    },
    {
      heading: 'Links to other sites',
      paragraphs: [
        'This site links to sites we do not control — AGBU worldwide, event venues, our social accounts. Their content and their data practices are not ours. None of them is contacted by your browser until you click.',
      ],
    },
    {
      heading: 'Reporting an error',
      paragraphs: [
        'A wrong date, a misspelt name, a dead link? Write to us. This site is run by volunteers and corrections are welcome.',
      ],
    },
  ],
};

const accessibilityFr: LegalPage = {
  eyebrow: 'Accessibilité',
  title: "Déclaration d'accessibilité",
  lead: "Le niveau que nous visons, ce qui n'y répond pas encore, et à qui le dire.",
  sections: [
    {
      heading: 'Notre engagement',
      paragraphs: [
        "Aucune loi n'impose un niveau d'accessibilité à une association privée suisse. Nous en visons un quand même : ce site doit pouvoir être lu au clavier, à la loupe, à la voix synthétique, ou simplement par quelqu'un qui voit mal les contrastes faibles.",
        "L'objectif est le niveau AA des règles WCAG 2.2. Nous ne prétendons pas l'atteindre partout — nous disons ci-dessous où nous savons ne pas y être.",
      ],
    },
    {
      heading: 'Ce que nous avons fait',
      bullets: [
        'Navigation complète au clavier, avec un indicateur de focus visible.',
        'Contraste des textes vérifié sur les couleurs de la charte.',
        'Structure de titres cohérente, pour la navigation par lecteur d’écran.',
        'Textes alternatifs sur les images porteuses de sens.',
        'Aucune animation déclenchée automatiquement, et respect du réglage « réduire les animations » de votre système.',
      ],
    },
    {
      heading: 'Ce qui ne va pas encore',
      bullets: [
        "Les étapes de don et de réservation sont fournies par des prestataires extérieurs. Leur accessibilité est la leur, pas la nôtre, et nous ne pouvons pas la corriger. Si l'une d'elles vous bloque, la solution de repli ci-dessous s'applique.",
        "Les cartes des lieux d'événement sont des plans interactifs difficiles à explorer autrement qu'à la souris. L'adresse est toujours écrite en toutes lettres à côté.",
        "Les documents PDF que nous mettons en ligne, notamment le dossier de sponsoring, ne sont pas balisés pour la lecture assistée.",
        "La version arménienne du site n'est pas encore disponible.",
      ],
    },
    {
      heading: 'Si quelque chose vous bloque',
      paragraphs: [
        `Écrivez-nous en décrivant la page et ce qui n'a pas fonctionné. Nous répondons dans les ${rightsResponseDays} jours.`,
        "Et si le site vous empêche de faire quelque chose, nous le faisons autrement : un don peut être versé par virement bancaire, une place peut être réservée par téléphone ou par e-mail. Personne ne doit renoncer à soutenir l'UGAB parce qu'un formulaire résiste.",
      ],
    },
    {
      heading: 'Comment nous le vérifions',
      paragraphs: [
        "Par un contrôle automatisé à chaque mise en ligne, complété par un parcours au clavier et au lecteur d'écran avant chaque lancement. Un contrôle automatisé ne trouve qu'une partie des problèmes ; votre signalement en trouve d'autres.",
      ],
    },
  ],
};

const accessibilityEn: LegalPage = {
  eyebrow: 'Accessibility',
  title: 'Accessibility statement',
  lead: 'The level we aim for, what does not meet it yet, and who to tell.',
  sections: [
    {
      heading: 'Our commitment',
      paragraphs: [
        'No law imposes an accessibility level on a private Swiss association. We aim for one anyway: this site should be readable with a keyboard, with magnification, with a screen reader, or simply by someone who cannot see low contrast.',
        'The target is level AA of the WCAG 2.2 guidelines. We do not claim to reach it everywhere — below we say where we know we do not.',
      ],
    },
    {
      heading: 'What we have done',
      bullets: [
        'Full keyboard navigation, with a visible focus indicator.',
        'Text contrast checked against the brand colours.',
        'A consistent heading structure, for screen-reader navigation.',
        'Alternative text on images that carry meaning.',
        'No animation that starts on its own, and the system “reduce motion” setting is respected.',
      ],
    },
    {
      heading: 'What is not right yet',
      bullets: [
        'The donation and booking steps are supplied by outside providers. Their accessibility is theirs, not ours, and we cannot fix it. If one of them blocks you, the fallback below applies.',
        'Venue maps are interactive plans that are hard to explore with anything but a mouse. The address is always written out in full beside them.',
        'The PDFs we publish, notably the sponsorship pack, are not tagged for assistive reading.',
        'The Armenian version of the site is not available yet.',
      ],
    },
    {
      heading: 'If something blocks you',
      paragraphs: [
        `Write to us describing the page and what did not work. We answer within ${rightsResponseDays} days.`,
        'And if the site stops you doing something, we do it another way: a donation can be made by bank transfer, a place can be booked by telephone or email. Nobody should have to give up on supporting AGBU because a form resisted.',
      ],
    },
    {
      heading: 'How we check',
      paragraphs: [
        'By an automated check on every deployment, plus a keyboard and screen-reader pass before each launch. An automated check finds only some of the problems; your report finds the others.',
      ],
    },
  ],
};

export const legalPages: Record<LegalLang, { privacy: LegalPage; legalNotice: LegalPage; accessibility: LegalPage }> = {
  fr: { privacy: privacyFr, legalNotice: legalNoticeFr, accessibility: accessibilityFr },
  en: { privacy: privacyEn, legalNotice: legalNoticeEn, accessibility: accessibilityEn },
};

/** Labels for the parts the pages render themselves rather than as prose. */
export const legalChrome: Record<
  LegalLang,
  {
    processorsHeading: string;
    processorsIntro: string;
    columnProvider: string;
    columnRole: string;
    columnReceives: string;
    columnWhere: string;
    columnKeeps: string;
    notYetConnected: string;
    hostsHeading: string;
    hostsIntro: string;
    hostsNone: string;
    contactHeading: string;
    lastReviewed: string;
    seeAlso: string;
    privacyLink: string;
    legalLink: string;
    accessibilityLink: string;
  }
> = {
  fr: {
    processorsHeading: 'À qui vos données sont transmises',
    processorsIntro:
      "Voici la liste complète. Chacun de ces prestataires traite vos données pour notre compte, pour la finalité indiquée, et n'a pas le droit de s'en servir pour autre chose.",
    columnProvider: 'Prestataire',
    columnRole: 'Ce qu’il fait pour nous',
    columnReceives: 'Ce qu’il reçoit',
    columnWhere: 'Où',
    columnKeeps: 'Combien de temps il le garde',
    notYetConnected: 'pas encore raccordé',
    hostsHeading: 'Ce que votre navigateur contacte',
    hostsIntro:
      "Le détail technique, pour qui veut vérifier. En dehors de ce site, votre navigateur ne contacte aucun serveur de lui-même. Cette liste est comparée automatiquement au site publié à chaque mise en ligne.",
    hostsNone: "Aucun. Ce site ne charge rien depuis un serveur tiers.",
    contactHeading: 'Nous écrire',
    lastReviewed: 'Dernière révision',
    seeAlso: 'Voir aussi',
    privacyLink: 'Politique de confidentialité',
    legalLink: 'Mentions légales',
    accessibilityLink: "Déclaration d'accessibilité",
  },
  en: {
    processorsHeading: 'Who your data is passed to',
    processorsIntro:
      'Here is the complete list. Each of these providers processes your data on our behalf, for the stated purpose, and is not allowed to use it for anything else.',
    columnProvider: 'Provider',
    columnRole: 'What it does for us',
    columnReceives: 'What it receives',
    columnWhere: 'Where',
    columnKeeps: 'How long it keeps it',
    notYetConnected: 'not connected yet',
    hostsHeading: 'What your browser contacts',
    hostsIntro:
      'The technical detail, for anyone who wants to check. Apart from this site, your browser contacts no server on its own. This list is compared automatically against the published site on every deployment.',
    hostsNone: 'None. This site loads nothing from a third-party server.',
    contactHeading: 'Write to us',
    lastReviewed: 'Last reviewed',
    seeAlso: 'See also',
    privacyLink: 'Privacy policy',
    legalLink: 'Legal notices',
    accessibilityLink: 'Accessibility statement',
  },
};
