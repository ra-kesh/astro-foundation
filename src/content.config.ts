import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'zod';
import { isSafeHref, isSafeImageSource } from '@/lib/urls';

const href = z.string().trim().min(1).refine(isSafeHref, 'Unsafe URL');
const imageSource = z
  .string()
  .trim()
  .min(1)
  .refine(isSafeImageSource, 'Unsafe image URL');

const seo = z
  .object({
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    image: imageSource.optional(),
    noIndex: z.boolean().default(false),
  })
  .optional();

const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    draft: z.boolean().default(false),
    order: z.number().int().default(0),
    seo,
  }),
});

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        description: z.string().min(1),
        publishedAt: z.coerce.date(),
        updatedAt: z.coerce.date().optional(),
        draft: z.boolean().default(false),
        featured: z.boolean().default(false),
        tags: z.array(z.string().min(1)).default([]),
        image: image().optional(),
        imageAlt: z.string().min(1).optional(),
        seo,
      })
      .refine((data) => !data.image || data.imageAlt, {
        message: 'imageAlt is required when image is set',
        path: ['imageAlt'],
      }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/projects' }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string().min(1),
        description: z.string().min(1),
        year: z.number().int().min(1000).max(9999),
        draft: z.boolean().default(false),
        featured: z.boolean().default(false),
        tags: z.array(z.string().min(1)).default([]),
        image: image().optional(),
        imageAlt: z.string().min(1).optional(),
        links: z
          .object({
            website: href.optional(),
            repository: href.optional(),
          })
          .default({}),
        seo,
      })
      .refine((data) => !data.image || data.imageAlt, {
        message: 'imageAlt is required when image is set',
        path: ['imageAlt'],
      }),
});

export const collections = { pages, posts, projects };
