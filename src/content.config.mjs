import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/* 에디토리얼 글: data/editorial/*.md  (Pages CMS 에서 작성) */
const editorial = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './data/editorial' }),
  schema: z.object({
    title: z.string(),
    slug: z.string().optional(),
    description: z.string().default(''),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    cover: z.string().optional().default(''),
    cover_alt: z.string().optional().default(''),
    category: z.string().optional().default(''),
    tags: z.array(z.string()).optional().default([]),
    author: z.string().optional().default('마롱컴퍼니'),
    related: z.array(z.string()).optional().default([]),
    seo_title: z.string().optional().default(''),
    seo_description: z.string().optional().default(''),
    noindex: z.boolean().optional().default(false),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { editorial };
