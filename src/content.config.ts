import { defineCollection, z } from 'astro:content';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { glob } from 'astro/loaders';

import { bureauRoles } from './i18n/ui';

// Where the editable content lives. Tests point this at a fixture directory so
// they can build a site containing a deliberately broken or deliberately
// incomplete entry without writing into src/content. Nothing else sets it.
const contentDir = process.env.UGAB_CONTENT_DIR ?? './src/content';

/**
 * Where an uploaded photograph actually lives. `media_folder: public/uploads`
 * and `public_folder: /uploads` in `public/admin/config.yml` are the two halves
 * of one decision: the file is written to `public/uploads/`, and the fiche
 * carries `/uploads/…`. `withBase()` prefixes the base path at render time, and
 * nothing else touches either value.
 *
 * This is deliberately not read from the content directory. A fixture supplies
 * entries, never photographs; the médiathèque is the same folder in every build.
 */
const publicDir = new URL('../public/', import.meta.url);

/**
 * Whether a fiche points at a photograph that is not there.
 *
 * This cannot be reached by choosing an image: the widget only offers files the
 * médiathèque already holds. It is reached by deleting one afterwards while a
 * fiche still names it — and what a visitor then gets is a broken image on a
 * real announcement, which nothing else in the build would notice. The entry is
 * valid, the page renders, the picture is a grey box.
 *
 * The cost of catching it here is that the whole site stops building over a
 * missing photograph, which is heavier than the defect. It is the trade this
 * repository already makes for `demo` and for reversed dates: an entry that
 * would embarrass the Comité in public fails before it reaches the public, and
 * the message says what to do about it.
 *
 * Only paths the médiathèque produces are checked. Anything else is somebody
 * else's file, and this build cannot say whether it exists.
 */
function photographIsMissing(reference: string): boolean {
  if (!reference.startsWith('/')) return false;
  return !existsSync(fileURLToPath(new URL(reference.slice(1), publicDir)));
}

/** Addressed to whoever has to fix it, which is an editor and not a developer. */
const missingPhotograph = (reference: string): string =>
  `La photo « ${reference} » ne se trouve pas dans public${reference}. Elle a ` +
  'probablement été supprimée de la médiathèque après avoir été choisie. ' +
  'Renvoyez-la, ou retirez-la de la fiche : une fiche qui désigne une photo ' +
  'absente publie une image cassée.';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: `${contentDir}/events` }),
  schema: z
    .object({
      title: z.string(),
      lang: z.enum(['fr', 'en', 'hy']).default('fr'),
      date: z.coerce.date(),
      /**
       * The last moment of an event that runs for more than one day: a weekend
       * festival is one entry with two dates. Whether an event is past is
       * measured from here, so an entry without one is a single occasion whose
       * start is the only moment there is.
       */
      endDate: z.coerce.date().optional(),
      location: z.string(),
      address: z.string().optional(),
      cover: z.string().optional(),
      gallery: z.array(z.string()).optional(),
      excerpt: z.string(),

      // The fiche événement the brief specifies. All optional: the Comité
      // publishes an event as soon as the date and the venue are settled, and
      // fills the rest in later.
      /** Déroulé, intervenants, dress code, informations pratiques. */
      programme: z.string().optional(),
      /** Free text, as the brief writes it: "CHF 150 / pers. — CHF 250 / couple". */
      pricing: z.string().optional(),
      /**
       * An override, and only an override.
       *
       * There is no `capacity` beside this any more, and its removal is the
       * reason this comment is long. The quota belongs to the ticketing
       * provider (PRD 6), which is the only system that can know it; a number
       * held here as well would be a second truth, drifting from the first the
       * moment ten seats are added to a room.
       *
       * A fiche written before that decision may still carry `capacity:` in its
       * frontmatter. It is ignored rather than refused: an editor's old entry
       * must not take the site down over a field nobody reads.
       *
       * So this flag is for an event that is *not* sold through the provider,
       * and as an answer the Comité can give immediately without waiting for
       * anything. Ticked out of habit on an event that is selling, it hides a
       * working booking widget and nothing on the site says so — which is why
       * the field help in the back-office says it in as many words.
       */
      soldOut: z.boolean().default(false),
      /** Where a visitor buys a ticket. */
      ticketUrl: z.string().url().optional(),

      draft: z.boolean().default(false),
      // Marks an entry as invented. The build refuses to publish it — see below.
      demo: z.boolean().default(false),
    })
    .superRefine((event, ctx) => {
      if (event.endDate && event.endDate.valueOf() < event.date.valueOf()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['endDate'],
          message:
            'La date de fin est antérieure à la date de début. Un événement est ' +
            'considéré comme passé à partir de sa date de fin : celui-ci quitterait ' +
            'la page Événements avant même d’avoir eu lieu, et personne ne le ' +
            'verrait. Corrigez l’une des deux dates.',
        });
      }

      if (event.cover && photographIsMissing(event.cover)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['cover'],
          message: missingPhotograph(event.cover),
        });
      }

      event.gallery?.forEach((image, index) => {
        if (photographIsMissing(image)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['gallery', index],
            message: missingPhotograph(image),
          });
        }
      });

      if (event.demo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['demo'],
          message:
            'Cette fiche est marquée comme contenu de démonstration et ne peut ' +
            'pas être publiée. Le Comité n’annonce que des événements réels : ' +
            'supprimez la fiche, ou sortez-la de src/content/events.',
        });
      }
    }),
});

/**
 * Bureau du Comité — one entry per officer. The four offices are fixed by the
 * brief; the people holding them change after an election, which is why they
 * are content and not page markup.
 *
 * Everything but the role and the name is optional: the Comité owes portraits
 * and biographies (#9) and the section publishes without them.
 */
const bureau = defineCollection({
  loader: glob({ pattern: '**/*.md', base: `${contentDir}/bureau` }),
  schema: z
    .object({
      role: z.enum(bureauRoles),
      name: z.string(),
      portrait: z.string().optional(),
      bio: z
        .object({
          fr: z.string().optional(),
          en: z.string().optional(),
          // Optional like the others: the Comité owes the Armenian translations
          // (#9) and the bureau section publishes without them.
          hy: z.string().optional(),
        })
        .optional(),
    })
    .superRefine((officer, ctx) => {
      // Same failure as an event's cover, same answer. An officer without a
      // portrait is expected — the Comité still owes them (#9) — and renders as
      // initials. An officer *with* a portrait that is not there renders as a
      // broken image on the page that introduces the Bureau by name.
      if (officer.portrait && photographIsMissing(officer.portrait)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['portrait'],
          message: missingPhotograph(officer.portrait),
        });
      }
    }),
});

export const collections = { events, bureau };
