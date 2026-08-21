/**
 * The seam between the site and wherever the Comité's editorial content lives.
 *
 * Everything an editor can change — events, past-event galleries, the Bureau —
 * reaches a page through this module and through nothing else. Pages do not
 * import `astro:content`, do not know that entries are Markdown files in git,
 * and do not each re-implement what a draft is or which officer comes first.
 *
 * Two reasons, in order of importance:
 *
 * 1. **The CMS is not settled.** ADR-0001 picks a git-backed editor (Sveltia)
 *    but leaves it conditional on one committee answer: must an editor log in
 *    with only an email address? If the answer is yes, content moves to a
 *    hosted platform. That swap should be one adapter — `EditorialSource`
 *    below — and not an edit to every page.
 * 2. **Editorial policy is a decision, not a detail.** Whether a draft is
 *    visible, whether a full room still shows a booking button, which office is
 *    listed first, what an officer's card shows when the Comité has not sent a
 *    portrait: those are answers this project has taken deliberately, and they
 *    are worth having in one readable place rather than spread across four
 *    templates that can drift apart.
 *
 * Nothing here formats a date, chooses a word or knows a URL: presentation and
 * copy stay where they are. This module answers questions about content.
 *
 * Everything it returns is *complete*: an event the Comité has half filled in
 * still produces every field, with `null`, `[]` or `false` where the answer is
 * "not yet". Incomplete content is the normal case for this site, not the
 * exception, so no page should have to guard against `undefined`.
 */

// Type-only imports are erased before anything runs, so this module can be
// tested in plain Node without Astro's virtual modules existing. The one place
// that genuinely needs them is `astroCollections`, at the bottom, which loads
// them on demand.
import type { render } from 'astro:content';

import { type BureauRole, bureauRoles, defaultLang, type Lang } from '../i18n/ui';

/** A value the Comité writes once per language. Adding a language adds a slot. */
export type Localised<T> = Partial<Record<Lang, T>>;

/** What `render()` hands back for an entry's Markdown body. */
export type RenderedBody = Awaited<ReturnType<typeof render>>;

// ---------------------------------------------------------------------------
// What storage hands over
// ---------------------------------------------------------------------------

/**
 * An event exactly as it is stored. Mirrors the schema in
 * `src/content.config.ts`; the optional fields are optional because the Comité
 * publishes an announcement as soon as the date and the venue are settled.
 */
export interface EventFields {
  title: string;
  lang: Lang;
  date: Date;
  endDate?: Date;
  location: string;
  address?: string;
  cover?: string;
  gallery?: string[];
  excerpt: string;
  programme?: string;
  pricing?: string;
  capacity?: number;
  soldOut: boolean;
  ticketUrl?: string;
  draft: boolean;
  demo: boolean;
}

/** An officer exactly as stored. Only the office and the name are required. */
export interface OfficerFields {
  role: BureauRole;
  name: string;
  portrait?: string;
  bio?: Localised<string>;
}

export interface EventRecord {
  readonly id: string;
  readonly data: EventFields;
  /** Absent when the storage has no rich body — a hosted CMS may not. */
  readonly renderBody?: () => Promise<RenderedBody>;
}

export interface OfficerRecord {
  readonly id: string;
  readonly data: OfficerFields;
}

/**
 * The only vendor-specific thing in the site. Implemented once for Astro's
 * content collections below; a hosted CMS would implement it again, and
 * nothing else would move.
 */
export interface EditorialSource {
  events(): Promise<readonly EventRecord[]>;
  bureau(): Promise<readonly OfficerRecord[]>;
}

// ---------------------------------------------------------------------------
// What a page receives
// ---------------------------------------------------------------------------

export interface EditorialEvent {
  readonly id: string;
  /** The language the entry was written in, which is not the language of the page. */
  readonly lang: Lang;
  readonly title: string;
  readonly excerpt: string;
  readonly start: Date;
  readonly end: Date | null;
  readonly location: string;
  readonly address: string | null;
  readonly cover: string | null;
  readonly gallery: readonly string[];
  /** The programme as paragraphs, in the order the Comité wrote them. */
  readonly programme: readonly string[];
  readonly pricing: string | null;
  readonly capacity: number | null;
  readonly soldOut: boolean;
  readonly ticketUrl: string | null;
  /** Prepared but not yet shown to visitors. */
  readonly isDraft: boolean;
  readonly isPast: boolean;
  /**
   * Whether to offer the booking button. A past evening, a full room and a
   * missing ticketing link are three different reasons not to, and all three
   * are the same answer to a page.
   */
  readonly canBook: boolean;
  /** The Markdown body, or `null` when the entry has none. */
  body(): Promise<RenderedBody | null>;
}

export interface EditorialOfficer {
  readonly id: string;
  readonly role: BureauRole;
  readonly name: string;
  readonly portrait: string | null;
  /** Stands in for a portrait the Comité has not supplied. */
  readonly initials: string;
  /** The biography in the requested language, or '' when there is none yet. */
  readonly biography: string;
  readonly hasBiography: boolean;
}

export interface Bureau {
  readonly officers: readonly EditorialOfficer[];
  /**
   * False while an office is unfilled or a portrait or biography is missing.
   * The About page uses it to say what is still owed instead of pretending
   * the section is finished.
   */
  readonly isComplete: boolean;
}

export interface EventQuery {
  /** What "past" is measured against. Defaults to now; tests pass a fixed date. */
  now?: Date;
  /**
   * Show entries marked as drafts. Defaults to the `UGAB_SHOW_DRAFTS`
   * environment variable, which is how a staging build shows the Comité an
   * announcement before visitors see it. See docs/editorial/publication.md.
   */
  includeDrafts?: boolean;
  /** Keep only the first n, after ordering. */
  limit?: number;
}

// ---------------------------------------------------------------------------
// Editorial policy
// ---------------------------------------------------------------------------

const trimmed = (value: string | undefined | null): string | null => {
  const text = (value ?? '').trim();
  return text === '' ? null : text;
};

/**
 * A staging build shows drafts; a production build does not. Read from the
 * environment rather than passed down through pages, because it is a property
 * of the build and not of any one page. `src/content.config.ts` reads
 * `UGAB_CONTENT_DIR` the same way.
 */
export function draftsVisibleByDefault(): boolean {
  const flag = typeof process === 'undefined' ? undefined : process.env.UGAB_SHOW_DRAFTS;
  return flag === '1' || flag === 'true';
}

/**
 * Entries a visitor may be shown. `demo` is refused here as well as by the
 * build: `src/content.config.ts` already fails the build on an invented entry,
 * and a second refusal costs one line and survives that check being loosened.
 */
const isVisible = (event: EventFields, includeDrafts: boolean): boolean =>
  !event.demo && (includeDrafts || !event.draft);

/** Paragraphs, as typed in the CMS: blank line between them, blanks dropped. */
export function paragraphs(text: string | undefined | null): string[] {
  return (text ?? '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** `Marie-Claire Dupont` → `MD`. Two letters at most; never punctuation only. */
export function initialsOf(name: string): string {
  return name
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => [...word][0] ?? '')
    .join('')
    .toUpperCase();
}

/**
 * The biography the Comité has actually written, in the language asked for if
 * it exists, otherwise in French. An officer with no biography at all is not an
 * error: portraits and biographies are still owed (#9) and the section
 * publishes without them.
 */
export function biographyOf(bio: Localised<string> | undefined, lang: Lang): string {
  return trimmed(bio?.[lang]) ?? trimmed(bio?.[defaultLang]) ?? '';
}

function toEvent(record: EventRecord, now: Date): EditorialEvent {
  const { data } = record;
  // Measured against the end of the event, not its beginning. A weekend
  // festival is one entry with two dates; measuring from the opening night
  // retires it on its own first evening, so it leaves the Événements page and
  // joins the gallery of what has already happened while the doors are open.
  // An entry with no `endDate` is a single occasion, and its start is the only
  // moment there is.
  const endsAt = data.endDate ?? data.date;
  const isPast = endsAt.valueOf() < now.valueOf();
  const ticketUrl = trimmed(data.ticketUrl);

  return {
    id: record.id,
    lang: data.lang,
    title: data.title,
    excerpt: data.excerpt,
    start: data.date,
    end: data.endDate ?? null,
    location: data.location,
    address: trimmed(data.address),
    cover: trimmed(data.cover),
    gallery: data.gallery?.filter((image) => trimmed(image) !== null) ?? [],
    programme: paragraphs(data.programme),
    pricing: trimmed(data.pricing),
    capacity: data.capacity ?? null,
    soldOut: data.soldOut,
    ticketUrl,
    isDraft: data.draft,
    isPast,
    canBook: !isPast && !data.soldOut && ticketUrl !== null,
    body: async () => (await record.renderBody?.()) ?? null,
  };
}

function toOfficer(record: OfficerRecord, lang: Lang): EditorialOfficer {
  const { data } = record;
  const biography = biographyOf(data.bio, lang);

  return {
    id: record.id,
    role: data.role,
    name: data.name,
    portrait: trimmed(data.portrait),
    initials: initialsOf(data.name),
    biography,
    hasBiography: biography !== '',
  };
}

// ---------------------------------------------------------------------------
// The questions pages ask
// ---------------------------------------------------------------------------

export interface EditorialContent {
  /** Every published event, soonest first. */
  events(query?: EventQuery): Promise<EditorialEvent[]>;
  /** What is still to come, soonest first. */
  upcomingEvents(query?: EventQuery): Promise<EditorialEvent[]>;
  /** What has already happened, most recent first — the gallery order. */
  pastEvents(query?: EventQuery): Promise<EditorialEvent[]>;
  /** One event, or null when no published entry has that id. */
  event(id: string, query?: EventQuery): Promise<EditorialEvent | null>;
  /** The Bureau, in the hierarchical order of the offices. */
  bureau(lang?: Lang): Promise<Bureau>;
}

export function createEditorialContent(source: EditorialSource): EditorialContent {
  const read = async (query: EventQuery = {}): Promise<EditorialEvent[]> => {
    const now = query.now ?? new Date();
    const includeDrafts = query.includeDrafts ?? draftsVisibleByDefault();

    return (await source.events())
      .filter((record) => isVisible(record.data, includeDrafts))
      .map((record) => toEvent(record, now))
      .sort((a, b) => a.start.valueOf() - b.start.valueOf());
  };

  const capped = (events: EditorialEvent[], limit?: number): EditorialEvent[] =>
    typeof limit === 'number' ? events.slice(0, Math.max(0, limit)) : events;

  return {
    async events(query) {
      return capped(await read(query), query?.limit);
    },

    async upcomingEvents(query) {
      const events = await read(query);
      return capped(
        events.filter((event) => !event.isPast),
        query?.limit,
      );
    },

    async pastEvents(query) {
      const events = await read(query);
      return capped(events.filter((event) => event.isPast).reverse(), query?.limit);
    },

    async event(id, query) {
      // Drafts are addressable by id so that a staging build can link to one.
      return (await read(query)).find((event) => event.id === id) ?? null;
    },

    async bureau(lang = defaultLang) {
      const officers = (await source.bureau())
        .map((record) => toOfficer(record, lang))
        // The order the brief presents the offices in — never alphabetical,
        // never file order. An unknown office sorts last rather than first.
        .sort((a, b) => roleRank(a.role) - roleRank(b.role));

      return {
        officers,
        isComplete:
          officers.length === bureauRoles.length &&
          officers.every((officer) => officer.portrait !== null && officer.hasBiography),
      };
    },
  };
}

const roleRank = (role: BureauRole): number => {
  const index = bureauRoles.indexOf(role);
  return index === -1 ? bureauRoles.length : index;
};

// ---------------------------------------------------------------------------
// The Astro adapter — the only CMS-specific code in the site
// ---------------------------------------------------------------------------

/**
 * Content collections, loaded on demand. The import is dynamic so that this
 * module can be read outside a build: `astro:content` is a virtual module that
 * only exists while Astro is running.
 *
 * Replacing the CMS means replacing this object. Nothing above it changes.
 */
export const astroCollections: EditorialSource = {
  async events() {
    const { getCollection, render } = await import('astro:content');
    return (await getCollection('events')).map((entry) => ({
      id: entry.id,
      data: entry.data,
      renderBody: () => render(entry),
    }));
  },

  async bureau() {
    const { getCollection } = await import('astro:content');
    return (await getCollection('bureau')).map((entry) => ({
      id: entry.id,
      data: entry.data,
    }));
  },
};

/** What pages import. `import { editorial } from '../../lib/content';` */
export const editorial: EditorialContent = createEditorialContent(astroCollections);
