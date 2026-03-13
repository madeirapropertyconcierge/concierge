import { normalizeCmsText } from './text-normalization';
import type {
  CmsBlogPost,
  CmsImageField,
  CmsLinkField,
  CmsPageDocument,
  CmsPublishRequest,
  CmsTextField,
} from './schema';

type LocaleText = { en: string; pt: string };

type CmsSeoLocale = CmsPageDocument['seo']['en'];

export function normalizeLocaleText(value: LocaleText): LocaleText {
  return {
    en: normalizeCmsText(value.en),
    pt: normalizeCmsText(value.pt),
  };
}

function normalizeSeoLocale(seo: CmsSeoLocale): CmsSeoLocale {
  return {
    ...seo,
    title: normalizeCmsText(seo.title),
    description: normalizeCmsText(seo.description),
    ogTitle: normalizeCmsText(seo.ogTitle),
    ogDescription: normalizeCmsText(seo.ogDescription),
  };
}

export function normalizeTextField(field: CmsTextField): CmsTextField {
  return {
    ...field,
    value: normalizeLocaleText(field.value),
  };
}

export function normalizeLinkField(field: CmsLinkField): CmsLinkField {
  return {
    ...field,
    label: normalizeLocaleText(field.label),
    href: {
      en: field.href.en.trim(),
      pt: field.href.pt.trim(),
    },
  };
}

export function normalizeImageField(field: CmsImageField): CmsImageField {
  return {
    ...field,
    alt: normalizeLocaleText(field.alt),
    attributionName: normalizeCmsText(field.attributionName),
    attributionUrl: field.attributionUrl.trim(),
    licenseUrl: field.licenseUrl.trim(),
    caption: field.caption ? normalizeLocaleText(field.caption) : undefined,
  };
}

export function normalizeBlogPost(post: CmsBlogPost): CmsBlogPost {
  return {
    ...post,
    slug: post.slug.trim(),
    coverImage: post.coverImage.trim(),
    tags: post.tags.map((tag) => normalizeCmsText(tag).trim()).filter(Boolean),
    locales: {
      en: {
        title: normalizeCmsText(post.locales.en.title),
        excerpt: normalizeCmsText(post.locales.en.excerpt),
        body: normalizeCmsText(post.locales.en.body),
        coverAlt: normalizeCmsText(post.locales.en.coverAlt),
      },
      pt: {
        title: normalizeCmsText(post.locales.pt.title),
        excerpt: normalizeCmsText(post.locales.pt.excerpt),
        body: normalizeCmsText(post.locales.pt.body),
        coverAlt: normalizeCmsText(post.locales.pt.coverAlt),
      },
    },
    seoByLocale: {
      en: normalizeSeoLocale(post.seoByLocale.en),
      pt: normalizeSeoLocale(post.seoByLocale.pt),
    },
  };
}

export function normalizePageDocument(page: CmsPageDocument): CmsPageDocument {
  return {
    ...page,
    seo: {
      en: normalizeSeoLocale(page.seo.en),
      pt: normalizeSeoLocale(page.seo.pt),
    },
    texts: page.texts.map(normalizeTextField),
    links: page.links.map(normalizeLinkField),
    images: page.images.map(normalizeImageField),
  };
}

export function normalizePublishRequest(payload: CmsPublishRequest): CmsPublishRequest {
  return {
    ...payload,
    pages: payload.pages.map(normalizePageDocument),
    blogPosts: payload.blogPosts.map(normalizeBlogPost),
  };
}
