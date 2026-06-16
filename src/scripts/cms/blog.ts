import { normalizeBlogPost } from '../../cms/content-normalization';
import { normalizeCmsText } from '../../cms/text-normalization';
import { markDirty } from './banner-ui';
import { isBlogPage, nowIso } from './context';
import {
  blogForm,
  blogManagerPanel,
  blogSelect,
  closePanels,
  hideElement,
  setStatus,
  showElement,
} from './dom';
import { getFormFieldText, getFormFieldValue, setFormFieldValue } from './form-fields';
import { state } from './store';
import type { CmsBlogPost } from './types';

function setBlogField(name: string, value: string): void {
  setFormFieldValue(blogForm, name, value);
}

function getBlogField(name: string): string {
  return getFormFieldValue(blogForm, name);
}

function getBlogTextField(name: string): string {
  return getFormFieldText(blogForm, name);
}

export function findSelectedBlogPost(): CmsBlogPost | null {
  const select = blogSelect;
  if (!state.workingState || !select || !select.value) {
    return null;
  }

  return state.workingState.blogPosts.find((post) => post.id === select.value) ?? null;
}

export function hydrateBlogForm(): void {
  const post = findSelectedBlogPost();
  if (!post) {
    blogForm?.reset();
    return;
  }

  setBlogField('slug', post.slug);
  setBlogField('status', post.status);
  setBlogField('publishedAt', post.publishedAt);
  setBlogField('readingMinutes', String(post.readingMinutes));
  setBlogField('coverImage', post.coverImage);
  setBlogField('tags', post.tags.join(','));

  setBlogField('titleEn', post.locales.en.title);
  setBlogField('excerptEn', post.locales.en.excerpt);
  setBlogField('bodyEn', post.locales.en.body);
  setBlogField('coverAltEn', post.locales.en.coverAlt);

  setBlogField('titlePt', post.locales.pt.title);
  setBlogField('excerptPt', post.locales.pt.excerpt);
  setBlogField('bodyPt', post.locales.pt.body);
  setBlogField('coverAltPt', post.locales.pt.coverAlt);

  setBlogField('seoTitleEn', post.seoByLocale.en.title);
  setBlogField('seoDescEn', post.seoByLocale.en.description);
  setBlogField('ogTitleEn', post.seoByLocale.en.ogTitle);
  setBlogField('ogDescEn', post.seoByLocale.en.ogDescription);
  setBlogField('ogImageEn', post.seoByLocale.en.ogImage);
  setBlogField('canonicalEn', post.seoByLocale.en.canonical);

  setBlogField('seoTitlePt', post.seoByLocale.pt.title);
  setBlogField('seoDescPt', post.seoByLocale.pt.description);
  setBlogField('ogTitlePt', post.seoByLocale.pt.ogTitle);
  setBlogField('ogDescPt', post.seoByLocale.pt.ogDescription);
  setBlogField('ogImagePt', post.seoByLocale.pt.ogImage);
  setBlogField('canonicalPt', post.seoByLocale.pt.canonical);
}

export function renderBlogSelect(preferredId?: string): void {
  if (!state.workingState || !blogSelect) {
    return;
  }

  const previous = preferredId ?? blogSelect.value;
  blogSelect.innerHTML = '';

  for (const post of state.workingState.blogPosts) {
    const option = document.createElement('option');
    option.value = post.id;
    option.textContent = `${post.slug} (${post.status})`;
    blogSelect.append(option);
  }

  const hasPrevious = previous && state.workingState.blogPosts.some((post) => post.id === previous);
  if (hasPrevious) {
    blogSelect.value = previous;
  } else if (state.workingState.blogPosts[0]) {
    blogSelect.value = state.workingState.blogPosts[0].id;
  }

  hydrateBlogForm();
}

function upsertBlogPost(post: CmsBlogPost): void {
  if (!state.workingState) {
    return;
  }

  const normalizedPost = normalizeBlogPost(post);
  const index = state.workingState.blogPosts.findIndex((entry) => entry.id === post.id);
  if (index >= 0) {
    state.workingState.blogPosts[index] = normalizedPost;
    return;
  }

  state.workingState.blogPosts.unshift(normalizedPost);
}

export function createEmptyBlogPost(): CmsBlogPost {
  const id = `post-${Date.now()}`;
  return {
    id,
    slug: `new-post-${Date.now()}`,
    status: 'draft',
    publishedAt: nowIso().slice(0, 10),
    updatedAt: nowIso(),
    tags: [],
    readingMinutes: 5,
    coverImage: '',
    locales: {
      en: { title: '', excerpt: '', body: '', coverAlt: '' },
      pt: { title: '', excerpt: '', body: '', coverAlt: '' },
    },
    seoByLocale: {
      en: {
        title: '',
        description: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        canonical: '',
      },
      pt: {
        title: '',
        description: '',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        canonical: '',
      },
    },
  };
}

export function applyBlogFormChanges(): void {
  const selected = findSelectedBlogPost();
  if (!selected) {
    return;
  }

  const readingMinutesRaw = getBlogField('readingMinutes') || String(selected.readingMinutes);
  const readingMinutesParsed = Number.parseInt(readingMinutesRaw, 10);
  const readingMinutes = Number.isFinite(readingMinutesParsed) && readingMinutesParsed > 0
    ? readingMinutesParsed
    : selected.readingMinutes;

  const nextPost = normalizeBlogPost({
    ...selected,
    slug: getBlogField('slug'),
    status: (getBlogField('status') as 'draft' | 'published') || 'draft',
    publishedAt: getBlogField('publishedAt') || selected.publishedAt,
    readingMinutes,
    coverImage: getBlogField('coverImage'),
    updatedAt: nowIso(),
    tags: getBlogField('tags')
      .split(',')
      .map((tag) => normalizeCmsText(tag).trim())
      .filter(Boolean),
    locales: {
      en: {
        title: getBlogTextField('titleEn'),
        excerpt: getBlogTextField('excerptEn'),
        body: getBlogTextField('bodyEn'),
        coverAlt: getBlogTextField('coverAltEn'),
      },
      pt: {
        title: getBlogTextField('titlePt'),
        excerpt: getBlogTextField('excerptPt'),
        body: getBlogTextField('bodyPt'),
        coverAlt: getBlogTextField('coverAltPt'),
      },
    },
    seoByLocale: {
      en: {
        title: getBlogTextField('seoTitleEn'),
        description: getBlogTextField('seoDescEn'),
        ogTitle: getBlogTextField('ogTitleEn'),
        ogDescription: getBlogTextField('ogDescEn'),
        ogImage: getBlogField('ogImageEn'),
        canonical: getBlogField('canonicalEn'),
      },
      pt: {
        title: getBlogTextField('seoTitlePt'),
        description: getBlogTextField('seoDescPt'),
        ogTitle: getBlogTextField('ogTitlePt'),
        ogDescription: getBlogTextField('ogDescPt'),
        ogImage: getBlogField('ogImagePt'),
        canonical: getBlogField('canonicalPt'),
      },
    },
  });

  if (JSON.stringify(selected) === JSON.stringify(nextPost)) {
    setStatus('Post unchanged');
    return;
  }

  upsertBlogPost(nextPost);
  renderBlogSelect(nextPost.id);
  markDirty('Blog post updated');
}

export function toggleBlogManager(open: boolean): void {
  if (!blogManagerPanel || !isBlogPage) {
    return;
  }

  if (open) {
    closePanels(blogManagerPanel);
    showElement(blogManagerPanel);
    renderBlogSelect();
    return;
  }

  hideElement(blogManagerPanel);
}
