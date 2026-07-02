import { defineCollection, z } from 'astro:content';

const recordsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    year: z.string(),
    category: z.enum(['lie', 'cheat', 'steal', 'trifecta']),
    order: z.number().default(1),
    fullWidth: z.boolean().default(false),
    footnote: z.string().optional(),
  }),
});

export const collections = {
  records: recordsCollection,
};
