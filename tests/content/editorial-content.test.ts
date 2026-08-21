/**
 * The content boundary — `src/lib/content.ts`.
 *
 * These are the rules the site applies to whatever the Comité types into the
 * CMS: what a visitor may see, in what order, and what happens to every field
 * an editor left empty. They run against an in-memory source rather than a
 * build, so they are fast and say exactly which rule broke.
 *
 * That the file imports at all is part of the test: if the boundary reached for
 * `astro:content` outside its adapter, this module could not be loaded without
 * a running Astro build.
 *
 * Whether the *pages* survive incomplete content is a different question, asked
 * of a real build in `events.test.mjs` and `bureau.test.mjs`. Nothing here
 * duplicates those.
 */

import { describe, expect, it } from 'vitest';

import {
  biographyOf,
  createEditorialContent,
  type EditorialSource,
  type EventFields,
  initialsOf,
  type OfficerFields,
  paragraphs,
  type RenderedBody,
} from '../../src/lib/content';

const AN_EVENING = new Date('2026-11-14T19:00:00+01:00');
const BEFORE_IT = new Date('2026-10-01T12:00:00+01:00');
const AFTER_IT = new Date('2027-01-05T12:00:00+01:00');

/** An event with nothing filled in but what the schema demands. */
const minimal = (overrides: Partial<EventFields> = {}): EventFields => ({
  title: 'Soirée de gala',
  lang: 'fr',
  date: AN_EVENING,
  location: 'Genève',
  excerpt: 'Une soirée au profit des programmes du Comité.',
  soldOut: false,
  draft: false,
  demo: false,
  ...overrides,
});

const sourceOf = (
  events: Array<{ id: string; data: EventFields }> = [],
  bureau: Array<{ id: string; data: OfficerFields }> = [],
): EditorialSource => ({
  events: async () => events,
  bureau: async () => bureau,
});

const contentWith = (...events: Array<{ id: string; data: EventFields }>) =>
  createEditorialContent(sourceOf(events));

describe('an event the Comité has only half filled in', () => {
  it('still produces every field a page needs', async () => {
    const [event] = await contentWith({ id: 'gala', data: minimal() }).events({ now: BEFORE_IT });

    expect(event).toMatchObject({
      id: 'gala',
      title: 'Soirée de gala',
      location: 'Genève',
      end: null,
      address: null,
      cover: null,
      pricing: null,
      capacity: null,
      ticketUrl: null,
      gallery: [],
      programme: [],
      soldOut: false,
    });
    expect(Object.values(event)).not.toContain(undefined);
  });

  it('has no body to render when the entry has none', async () => {
    const [event] = await contentWith({ id: 'gala', data: minimal() }).events({ now: BEFORE_IT });

    await expect(event.body()).resolves.toBeNull();
  });

  it('treats a field the editor blanked out as absent, not as empty text', async () => {
    const [event] = await contentWith({
      id: 'gala',
      data: minimal({ address: '   ', ticketUrl: '', cover: '', pricing: '\n' }),
    }).events({ now: BEFORE_IT });

    expect(event).toMatchObject({ address: null, ticketUrl: null, cover: null, pricing: null });
  });
});

describe('what a visitor is shown', () => {
  it('hides an announcement the Comité is still preparing', async () => {
    const content = contentWith(
      { id: 'public', data: minimal() },
      { id: 'brouillon', data: minimal({ draft: true }) },
    );

    const published = await content.events({ now: BEFORE_IT });
    expect(published.map((event) => event.id)).toEqual(['public']);
  });

  it('shows drafts to a staging build that asks for them', async () => {
    const content = contentWith(
      { id: 'public', data: minimal() },
      { id: 'brouillon', data: minimal({ draft: true }) },
    );

    const staging = await content.events({ now: BEFORE_IT, includeDrafts: true });
    expect(staging.map((event) => event.id)).toEqual(['public', 'brouillon']);
    expect(staging.find((event) => event.id === 'brouillon')?.isDraft).toBe(true);
  });

  it('never shows an invented event, whatever the build does', async () => {
    const content = contentWith({ id: 'demo', data: minimal({ demo: true }) });

    expect(await content.events({ now: BEFORE_IT, includeDrafts: true })).toEqual([]);
  });
});

describe('order', () => {
  const evenings = [
    { id: 'mars', data: minimal({ date: new Date('2027-03-01T19:00:00+01:00') }) },
    { id: 'janvier', data: minimal({ date: new Date('2027-01-15T19:00:00+01:00') }) },
    { id: 'passe', data: minimal({ date: new Date('2026-02-02T19:00:00+01:00') }) },
    { id: 'plus-ancien', data: minimal({ date: new Date('2025-06-06T19:00:00+01:00') }) },
  ];

  it('lists what is coming up soonest first', async () => {
    const upcoming = await contentWith(...evenings).upcomingEvents({ now: BEFORE_IT });

    expect(upcoming.map((event) => event.id)).toEqual(['janvier', 'mars']);
  });

  it('lists what has happened most recent first, which is the gallery order', async () => {
    const past = await contentWith(...evenings).pastEvents({ now: BEFORE_IT });

    expect(past.map((event) => event.id)).toEqual(['passe', 'plus-ancien']);
  });

  it('takes only the first few when the home page asks for a few', async () => {
    const next = await contentWith(...evenings).upcomingEvents({ now: BEFORE_IT, limit: 1 });

    expect(next.map((event) => event.id)).toEqual(['janvier']);
  });

  it('counts an evening as past once it has happened', async () => {
    const content = contentWith({ id: 'gala', data: minimal() });

    expect((await content.events({ now: BEFORE_IT }))[0].isPast).toBe(false);
    expect((await content.events({ now: AFTER_IT }))[0].isPast).toBe(true);
  });
});

describe('whether the booking button is offered', () => {
  const bookable = minimal({ ticketUrl: 'https://billetterie.example/gala' });

  it('is offered when tickets are on sale for an evening still to come', async () => {
    const [event] = await contentWith({ id: 'gala', data: bookable }).events({ now: BEFORE_IT });

    expect(event.canBook).toBe(true);
    expect(event.ticketUrl).toBe('https://billetterie.example/gala');
  });

  it('is withdrawn when the room is full', async () => {
    const content = contentWith({ id: 'gala', data: { ...bookable, soldOut: true } });

    expect((await content.events({ now: BEFORE_IT }))[0].canBook).toBe(false);
  });

  it('is withdrawn once the evening is over', async () => {
    const content = contentWith({ id: 'gala', data: bookable });

    expect((await content.events({ now: AFTER_IT }))[0].canBook).toBe(false);
  });

  it('is not offered before the ticketing link exists', async () => {
    const content = contentWith({ id: 'gala', data: minimal() });

    expect((await content.events({ now: BEFORE_IT }))[0].canBook).toBe(false);
  });
});

describe('one event by name', () => {
  it('finds a published event', async () => {
    const content = contentWith({ id: '2026-gala', data: minimal() });

    expect((await content.event('2026-gala', { now: BEFORE_IT }))?.title).toBe('Soirée de gala');
  });

  it('answers nothing rather than throwing for an address that no longer exists', async () => {
    const content = contentWith({ id: '2026-gala', data: minimal() });

    expect(await content.event('supprime', { now: BEFORE_IT })).toBeNull();
  });
});

describe('the programme, as an editor types it', () => {
  it('becomes the paragraphs they separated with a blank line', () => {
    expect(paragraphs('19h00 — accueil\n\n19h30 — dîner\n\n  \n\n21h00 — concert')).toEqual([
      '19h00 — accueil',
      '19h30 — dîner',
      '21h00 — concert',
    ]);
  });

  it('is empty when the programme has not been written yet', () => {
    expect(paragraphs(undefined)).toEqual([]);
  });
});

describe('the Bureau', () => {
  const officers = [
    { id: 'tresorier', data: { role: 'tresorier', name: 'Anna Sarkissian' } as OfficerFields },
    { id: 'president', data: { role: 'president', name: 'Jean Dupont' } as OfficerFields },
    {
      id: 'secretaire',
      data: { role: 'secretaire-general', name: 'Marie Aznavour' } as OfficerFields,
    },
  ];

  const bureauOf = (entries = officers) => createEditorialContent(sourceOf([], entries)).bureau();

  it('is presented in the order of the offices, not alphabetically', async () => {
    const { officers: listed } = await bureauOf();

    expect(listed.map((officer) => officer.role)).toEqual([
      'president',
      'secretaire-general',
      'tresorier',
    ]);
  });

  it('keeps an officer whose portrait and biography have not arrived', async () => {
    const { officers: listed } = await bureauOf();
    const president = listed[0];

    expect(president).toMatchObject({
      name: 'Jean Dupont',
      portrait: null,
      biography: '',
      hasBiography: false,
    });
  });

  it('offers initials to stand in for the portrait that is missing', async () => {
    expect(initialsOf('Jean Dupont')).toBe('JD');
    // A hyphen separates words the way a space does: a compound forename is one
    // person's first name, and `MA` would read as somebody called Marie Aznavour.
    expect(initialsOf('Marie-Claire Aznavour')).toBe('MC');
    expect(initialsOf('Ani')).toBe('A');
    // The comment on `initialsOf` promises never punctuation. Checked, not assumed.
    expect(initialsOf('- -')).toBe('');
    // A name an editor typed with a leading space is still that person's name.
    // This is the case that pins the empty-part filter: without it the leading
    // gap counts as a word and one initial is lost. The line above does not —
    // it holds either way.
    expect(initialsOf(' Jean Dupont')).toBe('JD');
  });

  it('says the section is unfinished while an office is unfilled', async () => {
    expect((await bureauOf()).isComplete).toBe(false);
  });

  it('says the section is finished only when every office is filled in fully', async () => {
    const complete = (
      ['president', 'vice-president', 'secretaire-general', 'tresorier'] as const
    ).map((role) => ({
      id: role,
      data: {
        role,
        name: `Prénom ${role}`,
        portrait: `/uploads/${role}.webp`,
        bio: { fr: 'Quatre lignes.' },
      } as OfficerFields,
    }));

    expect((await bureauOf(complete)).isComplete).toBe(true);
  });
});

describe('a biography in the language of the page', () => {
  it('is read in that language when the Comité has written it', () => {
    expect(biographyOf({ fr: 'Biographie', en: 'Biography' }, 'en')).toBe('Biography');
  });

  it('falls back to French rather than leaving an empty card', () => {
    expect(biographyOf({ fr: 'Biographie' }, 'en')).toBe('Biographie');
  });

  it('is empty, not undefined, when there is none at all', () => {
    expect(biographyOf(undefined, 'fr')).toBe('');
    expect(biographyOf({ fr: '   ' }, 'fr')).toBe('');
  });
});

/**
 * The questions the four pages ask, now that they ask them here rather than
 * calling the content API themselves (#47). Everything above is about the rules;
 * this is about the shape of the conversation between a page and this module.
 */
describe('what the event page depends on', () => {
  const evenings = [
    { id: '2027-mars', data: minimal({ date: new Date('2027-03-01T19:00:00+01:00') }) },
    { id: '2026-passe', data: minimal({ date: new Date('2026-02-02T19:00:00+01:00') }) },
    { id: '2027-brouillon', data: minimal({ draft: true }) },
  ];

  it('resolves every event the routes were built from', async () => {
    // `getStaticPaths` builds one route per entry `events()` returns, and the
    // page then asks for that entry by name. The two answers have to agree:
    // a route whose event resolves to null is a page that throws mid-build.
    const content = contentWith(...evenings);

    for (const { id } of await content.events({ now: BEFORE_IT })) {
      expect(await content.event(id, { now: BEFORE_IT }), `no event resolved for ${id}`).not.toBe(
        null,
      );
    }
  });

  it('refuses a draft by name too, so a route built from one cannot quietly render it', async () => {
    const content = contentWith(...evenings);

    expect(await content.event('2027-brouillon', { now: BEFORE_IT })).toBe(null);
    expect(
      (await content.event('2027-brouillon', { now: BEFORE_IT, includeDrafts: true }))?.isDraft,
    ).toBe(true);
  });

  it('hands the page whatever the storage rendered, without inspecting it', async () => {
    const rendered = { Content: () => null } as unknown as RenderedBody;
    const content = createEditorialContent({
      events: async () => [{ id: 'gala', data: minimal(), renderBody: async () => rendered }],
      bureau: async () => [],
    });

    const event = await content.event('gala', { now: BEFORE_IT });
    await expect(event?.body()).resolves.toBe(rendered);
  });
});

describe('what the About page depends on', () => {
  const officers = [
    {
      id: 'president',
      data: {
        role: 'president',
        name: 'Jean Dupont',
        bio: { fr: 'Président depuis 2019.', en: 'President since 2019.' },
      } as OfficerFields,
    },
    {
      id: 'tresorier',
      data: {
        role: 'tresorier',
        name: 'Anna Sarkissian',
        bio: { fr: 'Trésorière.' },
      } as OfficerFields,
    },
  ];

  it('reads each biography in the language the page is being served in', async () => {
    const { officers: listed } = await createEditorialContent(sourceOf([], officers)).bureau('en');

    expect(listed.map((officer) => officer.biography)).toEqual([
      'President since 2019.',
      // Not yet translated: the page shows the French rather than an empty card.
      'Trésorière.',
    ]);
  });

  it('is read in French when the page does not say which language it is in', async () => {
    const { officers: listed } = await createEditorialContent(sourceOf([], officers)).bureau();

    expect(listed[0].biography).toBe('Président depuis 2019.');
  });
});
