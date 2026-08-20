import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

import { bureauRoles } from './i18n/ui';

// Where the editable content lives. Tests point this at a fixture directory so
// they can build a site containing a deliberately broken or deliberately
// incomplete entry without writing into src/content. Nothing else sets it.
const contentDir = process.env.UGAB_CONTENT_DIR ?? './src/content';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: `${contentDir}/events` }),
  schema: z
    .object({
      title: z.string(),
      lang: z.enum(['fr', 'en']).default('fr'),
      date: z.coerce.date(),
      endDate: z.coerce.date().optional(),
      location: z.string(),
      address: z.string().optional(),
      coordinates: z
        .object({
          lat: z.number(),
          lng: z.number(),
        })
        .optional(),
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
      /** Nombre de places. */
      capacity: z.number().int().positive().optional(),
      /**
       * Set by hand when the room is full. A static site cannot know a
       * provider's remaining stock; deriving this from live availability is
       * PRD 6's decision to make.
       */
      soldOut: z.boolean().default(false),
      /** Where a visitor buys a ticket. */
      ticketUrl: z.string().url().optional(),

      draft: z.boolean().default(false),
      // Marks an entry as invented. The build refuses to publish it — see below.
      demo: z.boolean().default(false),
    })
    .superRefine((event, ctx) => {
      if (event.demo) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['demo'],
          message:
            'This entry is marked as demo content and cannot be published. ' +
            'The Comité announces real events only: delete the entry, or move it ' +
            'out of src/content/events and into tests/content/fixtures.',
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
  schema: z.object({
    role: z.enum(bureauRoles),
    name: z.string(),
    portrait: z.string().optional(),
    bio: z
      .object({
        fr: z.string().optional(),
        en: z.string().optional(),
        // Add `hy` here when the Comité delivers the Armenian translations.
      })
      .optional(),
  }),
});

export const collections = { events, bureau };
