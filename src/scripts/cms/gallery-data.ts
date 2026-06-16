import { deepClone, pageId } from './context';
import { state } from './store';
import type { CmsGalleryItem, CmsImageField, GallerySource, LocaleText } from './types';

function normalizeImageSrc(src: string): string {
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return '';
  }

  try {
    const resolved = new URL(trimmed, window.location.origin);
    if (resolved.origin === window.location.origin) {
      return `${resolved.pathname}${resolved.search}`;
    }

    return resolved.toString();
  } catch {
    return trimmed;
  }
}

export function imageDedupKey(src: string): string {
  const normalized = normalizeImageSrc(src);
  if (!normalized) {
    return '';
  }

  if (normalized.startsWith('/')) {
    return normalized;
  }

  try {
    return new URL(normalized).toString();
  } catch {
    return normalized;
  }
}

function mergeLocaleText(base: LocaleText, incoming: LocaleText): LocaleText {
  return {
    en: base.en.trim() || incoming.en.trim(),
    pt: base.pt.trim() || incoming.pt.trim(),
  };
}

function mergeCaption(base: LocaleText | undefined, incoming: LocaleText | undefined): LocaleText | undefined {
  if (!base && !incoming) {
    return undefined;
  }

  if (!base) {
    return incoming;
  }

  if (!incoming) {
    return base;
  }

  return mergeLocaleText(base, incoming);
}

const GALLERY_SOURCE_PRIORITY: Record<GallerySource, number> = {
  public: 0,
  page: 1,
  blog: 2,
  seo: 3,
};

function addGalleryCandidate(
  map: Map<string, CmsGalleryItem>,
  candidate: CmsGalleryItem,
): void {
  const key = imageDedupKey(candidate.src);
  const normalizedSrc = normalizeImageSrc(candidate.src);
  if (!key || !normalizedSrc) {
    return;
  }

  const nextCandidate: CmsGalleryItem = {
    ...candidate,
    src: normalizedSrc,
    sourceLabels: [...candidate.sourceLabels],
  };

  const existing = map.get(key);
  if (!existing) {
    map.set(key, nextCandidate);
    return;
  }

  existing.sourceLabels = Array.from(new Set([...existing.sourceLabels, ...nextCandidate.sourceLabels]));

  if (GALLERY_SOURCE_PRIORITY[nextCandidate.source] < GALLERY_SOURCE_PRIORITY[existing.source]) {
    existing.source = nextCandidate.source;
    existing.src = nextCandidate.src;
  }

  existing.alt = mergeLocaleText(existing.alt, nextCandidate.alt);
  existing.caption = mergeCaption(existing.caption, nextCandidate.caption);
  existing.attributionName = existing.attributionName.trim() || nextCandidate.attributionName.trim();
  existing.attributionUrl = existing.attributionUrl.trim() || nextCandidate.attributionUrl.trim();
  existing.licenseUrl = existing.licenseUrl.trim() || nextCandidate.licenseUrl.trim();
}

export function collectGalleryItems(): CmsGalleryItem[] {
  const map = new Map<string, CmsGalleryItem>();

  for (const item of state.globalGalleryItems) {
    addGalleryCandidate(map, deepClone(item));
  }

  if (state.workingState) {
    for (const image of state.workingState.page.images) {
      addGalleryCandidate(map, {
        id: `page:${image.id}`,
        src: image.src,
        alt: deepClone(image.alt),
        attributionName: image.attributionName,
        attributionUrl: image.attributionUrl,
        licenseUrl: image.licenseUrl,
        caption: image.caption ? deepClone(image.caption) : undefined,
        source: 'page',
        sourceLabels: [`Page content: ${pageId}`],
      });
    }

    for (const post of state.workingState.blogPosts) {
      if (!post.coverImage.trim()) {
        continue;
      }

      addGalleryCandidate(map, {
        id: `blog:${post.id}`,
        src: post.coverImage,
        alt: {
          en: post.locales.en.coverAlt,
          pt: post.locales.pt.coverAlt,
        },
        attributionName: '',
        attributionUrl: '',
        licenseUrl: '',
        source: 'blog',
        sourceLabels: [`Blog: ${post.slug}`],
      });
    }

    for (const localeKey of ['en', 'pt'] as const) {
      const seo = state.workingState.page.seo[localeKey];
      if (!seo.ogImage.trim()) {
        continue;
      }

      addGalleryCandidate(map, {
        id: `seo:${localeKey}:${pageId}`,
        src: seo.ogImage,
        alt: {
          en: state.workingState.page.seo.en.ogTitle || state.workingState.page.seo.en.title,
          pt: state.workingState.page.seo.pt.ogTitle || state.workingState.page.seo.pt.title,
        },
        attributionName: '',
        attributionUrl: '',
        licenseUrl: '',
        source: 'seo',
        sourceLabels: [`SEO ${localeKey.toUpperCase()}: ${pageId}`],
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => {
    const rankDiff = GALLERY_SOURCE_PRIORITY[a.source] - GALLERY_SOURCE_PRIORITY[b.source];
    if (rankDiff !== 0) {
      return rankDiff;
    }

    return a.src.localeCompare(b.src);
  });
}

/** Page image fields that point at the same asset as `src` (so alt is editable). */
export function pageImageFieldsForSrc(src: string): CmsImageField[] {
  if (!state.workingState) {
    return [];
  }

  const key = imageDedupKey(src);
  if (!key) {
    return [];
  }

  return state.workingState.page.images.filter((image) => imageDedupKey(image.src) === key);
}

export function altIsMissing(item: CmsGalleryItem): boolean {
  return !item.alt.en.trim() && !item.alt.pt.trim();
}

/** A gallery item "needs alt" when it is placed on this page yet has no alt text. */
export function itemNeedsAlt(item: CmsGalleryItem): boolean {
  return pageImageFieldsForSrc(item.src).length > 0 && altIsMissing(item);
}
