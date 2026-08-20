import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

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
      registrationUrl: z.string().url().optional(),
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

export const collections = { events };
