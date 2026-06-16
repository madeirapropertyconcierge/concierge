import { describe, expect, it } from 'bun:test';
import {
  collectPageLocaleWarnings,
  validateBlogPosts,
} from './publish-validation';
import type { CmsBlogPost, CmsPageDocument } from './schema';

function emptySeo() {
  return { title: '', description: '', ogTitle: '', ogDescription: '', ogImage: '', canonical: '' };
}

function makePage(overrides: Partial<CmsPageDocument> = {}): CmsPageDocument {
  return {
    pageId: 'home',
    updatedAt: '2026-01-01T00:00:00.000Z',
    seo: { en: emptySeo(), pt: emptySeo() },
    texts: [],
    links: [],
    images: [],
    ...overrides,
  };
}

function makePost(overrides: Partial<CmsBlogPost> = {}): CmsBlogPost {
  const locale = { title: 'T', excerpt: 'E', body: 'B', coverAlt: 'C' };
  const seo = { title: 'T', description: 'D', ogTitle: '', ogDescription: '', ogImage: '', canonical: '' };
  return {
    id: 'post-1',
    slug: 'post-1',
    status: 'draft',
    publishedAt: '',
    updatedAt: '',
    tags: [],
    readingMinutes: 5,
    coverImage: '',
    locales: { en: { ...locale }, pt: { ...locale } },
    seoByLocale: { en: { ...seo }, pt: { ...seo } },
    ...overrides,
  };
}

describe('collectPageLocaleWarnings (pages: soft)', () => {
  it('warns when an English text has no Portuguese translation', () => {
    const page = makePage({
      texts: [
        { id: 'text:a', selector: '[data-cms-id="text:a"]', kind: 'inline', value: { en: 'Hello', pt: '' } },
      ],
    });
    expect(collectPageLocaleWarnings([page])).toHaveLength(1);
  });

  it('does not warn when both locales are present', () => {
    const page = makePage({
      texts: [
        { id: 'text:a', selector: '[data-cms-id="text:a"]', kind: 'inline', value: { en: 'Hello', pt: 'Ola' } },
      ],
    });
    expect(collectPageLocaleWarnings([page])).toEqual([]);
  });
});

describe('validateBlogPosts (blog: hard)', () => {
  it('blocks a published post missing a Portuguese title', () => {
    const post = makePost({
      status: 'published',
      locales: {
        en: { title: 'T', excerpt: 'E', body: 'B', coverAlt: 'C' },
        pt: { title: '', excerpt: 'E', body: 'B', coverAlt: 'C' },
      },
    });
    expect(() => validateBlogPosts([post])).toThrow(/missing pt\.title/);
  });

  it('allows a draft with only one locale', () => {
    const post = makePost({
      status: 'draft',
      locales: {
        en: { title: 'Draft', excerpt: '', body: 'Body', coverAlt: '' },
        pt: { title: '', excerpt: '', body: '', coverAlt: '' },
      },
    });
    expect(() => validateBlogPosts([post])).not.toThrow();
  });

  it('blocks duplicate slugs', () => {
    expect(() => validateBlogPosts([makePost({ id: 'a' }), makePost({ id: 'b' })])).toThrow(/Duplicate blog slug/);
  });
});
