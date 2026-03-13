import { z } from 'zod';

export const localeTextSchema = z.object({
  en: z.string(),
  pt: z.string(),
});

const urlFieldSchema = z.string().trim().max(2048);

export const cmsTextFieldSchema = z.object({
  id: z.string().min(1),
  selector: z.string().min(1),
  kind: z.enum(['inline', 'block']),
  value: localeTextSchema,
});

export const cmsLinkFieldSchema = z.object({
  id: z.string().min(1),
  selector: z.string().min(1),
  label: localeTextSchema,
  href: localeTextSchema,
});

export const cmsImageFieldSchema = z.object({
  id: z.string().min(1),
  selector: z.string().min(1),
  src: urlFieldSchema,
  alt: localeTextSchema,
  attributionName: z.string().max(256).default(''),
  attributionUrl: urlFieldSchema.default(''),
  licenseUrl: urlFieldSchema.default(''),
  caption: localeTextSchema.optional(),
});

export const cmsSeoLocaleSchema = z.object({
  title: z.string().default(''),
  description: z.string().default(''),
  ogTitle: z.string().default(''),
  ogDescription: z.string().default(''),
  ogImage: z.string().default(''),
  canonical: z.string().default(''),
});

export const cmsPageSeoSchema = z.object({
  en: cmsSeoLocaleSchema,
  pt: cmsSeoLocaleSchema,
});

export const cmsPageDocumentSchema = z.object({
  pageId: z.string().min(1),
  updatedAt: z.string().min(1),
  seo: cmsPageSeoSchema,
  texts: z.array(cmsTextFieldSchema),
  links: z.array(cmsLinkFieldSchema),
  images: z.array(cmsImageFieldSchema),
});

export const cmsBlogLocaleSchema = z.object({
  title: z.string(),
  excerpt: z.string(),
  body: z.string(),
  coverAlt: z.string(),
});

export const cmsBlogSeoSchema = z.object({
  title: z.string(),
  description: z.string(),
  ogTitle: z.string(),
  ogDescription: z.string(),
  ogImage: z.string(),
  canonical: z.string(),
});

export const cmsBlogPostSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  status: z.enum(['draft', 'published']),
  publishedAt: z.string(),
  updatedAt: z.string(),
  tags: z.array(z.string()),
  readingMinutes: z.number().int().positive().default(5),
  coverImage: z.string(),
  locales: z.object({
    en: cmsBlogLocaleSchema,
    pt: cmsBlogLocaleSchema,
  }),
  seoByLocale: z.object({
    en: cmsBlogSeoSchema,
    pt: cmsBlogSeoSchema,
  }),
});

export const cmsPublishRequestSchema = z.object({
  pages: z.array(cmsPageDocumentSchema),
  blogPosts: z.array(cmsBlogPostSchema),
  baseSha: z.string().optional(),
});

export type CmsTextField = z.infer<typeof cmsTextFieldSchema>;
export type CmsLinkField = z.infer<typeof cmsLinkFieldSchema>;
export type CmsImageField = z.infer<typeof cmsImageFieldSchema>;
export type CmsPageDocument = z.infer<typeof cmsPageDocumentSchema>;
export type CmsBlogPost = z.infer<typeof cmsBlogPostSchema>;
export type CmsPublishRequest = z.infer<typeof cmsPublishRequestSchema>;
