import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const events = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/events' }),
  schema: z.object({
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
  }),
});

const antennes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/antennes' }),
  schema: z.object({
    city: z.string(),
    canton: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    description: z.string(),
  }),
});

export const collections = { events, antennes };
