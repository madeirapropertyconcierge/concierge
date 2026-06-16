import { ApiError } from './api';
import type { CmsBlogPost, CmsPageDocument, CmsServicePackageDocument } from './schema';

export function isValidCmsUrl(value: string): boolean {
  if (!value) {
    return true;
  }

  if (value.startsWith('/')) {
    return true;
  }

  return /^https:\/\//.test(value);
}

export function assertUrlField(value: string, fieldName: string): void {
  if (!isValidCmsUrl(value)) {
    throw new ApiError(400, `Invalid URL for ${fieldName}`);
  }
}

function assertPublishedLocale(post: CmsBlogPost, locale: 'en' | 'pt'): void {
  const entry = post.locales[locale];
  const seo = post.seoByLocale[locale];

  const required: Array<[string, string]> = [
    ['title', entry.title],
    ['excerpt', entry.excerpt],
    ['body', entry.body],
    ['coverAlt', entry.coverAlt],
    ['seo.title', seo.title],
    ['seo.description', seo.description],
  ];

  for (const [field, value] of required) {
    if (!value || !value.trim()) {
      throw new ApiError(400, `Published post "${post.slug}" is missing ${locale}.${field}`);
    }
  }
}

/**
 * Hard rules for blog posts: unique slugs, valid URLs, and — for PUBLISHED
 * posts — both locales fully populated. Drafts only need one locale.
 */
export function validateBlogPosts(posts: CmsBlogPost[]): void {
  const slugSet = new Set<string>();

  for (const post of posts) {
    if (slugSet.has(post.slug)) {
      throw new ApiError(400, `Duplicate blog slug: ${post.slug}`);
    }

    slugSet.add(post.slug);

    assertUrlField(post.coverImage, `${post.slug}.coverImage`);

    for (const locale of ['en', 'pt'] as const) {
      const seo = post.seoByLocale[locale];
      assertUrlField(seo.ogImage, `${post.slug}.${locale}.seo.ogImage`);
      assertUrlField(seo.canonical, `${post.slug}.${locale}.seo.canonical`);
    }

    if (post.status === 'published') {
      assertPublishedLocale(post, 'en');
      assertPublishedLocale(post, 'pt');
      continue;
    }

    const hasAnyDraftContent =
      post.locales.en.title.trim() ||
      post.locales.en.body.trim() ||
      post.locales.pt.title.trim() ||
      post.locales.pt.body.trim();

    if (!hasAnyDraftContent) {
      throw new ApiError(400, `Draft post "${post.slug}" must include at least one locale title/body`);
    }
  }
}

export function validatePackages(packages: CmsServicePackageDocument): void {
  for (const entry of packages.packages) {
    if (!entry.title.en.trim()) {
      throw new ApiError(400, `Package "${entry.key}" is missing en.title`);
    }

    if (!entry.title.pt.trim()) {
      throw new ApiError(400, `Package "${entry.key}" is missing pt.title`);
    }

    if (!entry.audience.en.trim()) {
      throw new ApiError(400, `Package "${entry.key}" is missing en.audience`);
    }

    if (!entry.audience.pt.trim()) {
      throw new ApiError(400, `Package "${entry.key}" is missing pt.audience`);
    }
  }
}

/** Hard rule: page SEO, link, and image URLs must be valid. */
export function validatePageUrls(page: CmsPageDocument): void {
  for (const locale of ['en', 'pt'] as const) {
    const seo = page.seo[locale];
    assertUrlField(seo.ogImage, `${page.pageId}.${locale}.seo.ogImage`);
    assertUrlField(seo.canonical, `${page.pageId}.${locale}.seo.canonical`);
  }

  for (const link of page.links) {
    assertUrlField(link.href.en, `${page.pageId}.links.${link.id}.href.en`);
    assertUrlField(link.href.pt, `${page.pageId}.links.${link.id}.href.pt`);
  }

  for (const image of page.images) {
    assertUrlField(image.src, `${page.pageId}.images.${image.id}.src`);
    assertUrlField(image.attributionUrl, `${page.pageId}.images.${image.id}.attributionUrl`);
    assertUrlField(image.licenseUrl, `${page.pageId}.images.${image.id}.licenseUrl`);
  }
}

/**
 * Soft rule for pages: unlike published blog posts, pages may legitimately ship
 * with an English fallback, so a missing Portuguese translation is reported as
 * a warning instead of blocking the publish.
 */
export function collectPageLocaleWarnings(pages: CmsPageDocument[]): string[] {
  const warnings: string[] = [];

  for (const page of pages) {
    for (const text of page.texts) {
      if (text.value.en.trim() && !text.value.pt.trim()) {
        warnings.push(`${page.pageId}: text "${text.id}" has no Portuguese translation (English will be shown).`);
      }
    }

    for (const link of page.links) {
      if (link.label.en.trim() && !link.label.pt.trim()) {
        warnings.push(`${page.pageId}: link "${link.id}" has no Portuguese label (English will be shown).`);
      }
    }
  }

  return warnings;
}
