import { listBlogPosts, listPageDocuments } from './content-loader';
import { listPublicImagePaths } from './public-images';

type LocaleText = { en: string; pt: string };

export type GallerySource = 'public' | 'page' | 'blog' | 'seo';

export interface CmsGalleryImage {
  id: string;
  src: string;
  alt: LocaleText;
  attributionName: string;
  attributionUrl: string;
  licenseUrl: string;
  caption?: LocaleText;
  source: GallerySource;
  sourceLabels: string[];
}

const GALLERY_SOURCE_PRIORITY: Record<GallerySource, number> = {
  public: 0,
  page: 1,
  blog: 2,
  seo: 3,
};

function emptyLocaleText(): LocaleText {
  return {
    en: '',
    pt: '',
  };
}

function normalizeImageSrc(src: string): string {
  const trimmed = src.trim();
  if (!trimmed || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return '';
  }

  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return trimmed;
  }

  return `/${trimmed.replace(/^\/+/, '')}`;
}

function imageDedupKey(src: string): string {
  const normalized = normalizeImageSrc(src);
  if (!normalized) {
    return '';
  }

  if (normalized.startsWith('/')) {
    return normalized;
  }

  try {
    const resolved = new URL(normalized);
    if (resolved.hostname.toLowerCase() === 'images.pexels.com') {
      return `${resolved.origin}${resolved.pathname}`;
    }

    return resolved.toString();
  } catch {
    return normalized;
  }
}

function toLocaleText(value: string): LocaleText {
  return {
    en: value,
    pt: value,
  };
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

function addGalleryCandidate(map: Map<string, CmsGalleryImage>, candidate: CmsGalleryImage): void {
  const key = imageDedupKey(candidate.src);
  const normalizedSrc = normalizeImageSrc(candidate.src);
  if (!key || !normalizedSrc) {
    return;
  }

  const nextCandidate: CmsGalleryImage = {
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

export async function collectSiteGalleryImages(): Promise<CmsGalleryImage[]> {
  const [publicImages, pages, blogPosts] = await Promise.all([
    listPublicImagePaths(),
    listPageDocuments(),
    listBlogPosts(),
  ]);

  const map = new Map<string, CmsGalleryImage>();

  for (const src of publicImages) {
    addGalleryCandidate(map, {
      id: `public:${src}`,
      src,
      alt: emptyLocaleText(),
      attributionName: '',
      attributionUrl: '',
      licenseUrl: '',
      source: 'public',
      sourceLabels: ['Public folder'],
    });
  }

  for (const page of pages) {
    for (const image of page.images) {
      addGalleryCandidate(map, {
        id: `page:${page.pageId}:${image.id}`,
        src: image.src,
        alt: image.alt,
        attributionName: image.attributionName,
        attributionUrl: image.attributionUrl,
        licenseUrl: image.licenseUrl,
        caption: image.caption,
        source: 'page',
        sourceLabels: [`Page: ${page.pageId}`],
      });
    }

    for (const localeKey of ['en', 'pt'] as const) {
      const seo = page.seo[localeKey];
      if (!seo.ogImage.trim()) {
        continue;
      }

      addGalleryCandidate(map, {
        id: `seo:${page.pageId}:${localeKey}`,
        src: seo.ogImage,
        alt: toLocaleText(seo.ogTitle || seo.title),
        attributionName: '',
        attributionUrl: '',
        licenseUrl: '',
        source: 'seo',
        sourceLabels: [`SEO ${localeKey.toUpperCase()}: ${page.pageId}`],
      });
    }
  }

  for (const post of blogPosts) {
    if (post.coverImage.trim()) {
      addGalleryCandidate(map, {
        id: `blog:cover:${post.id}`,
        src: post.coverImage,
        alt: {
          en: post.locales.en.coverAlt,
          pt: post.locales.pt.coverAlt,
        },
        attributionName: '',
        attributionUrl: '',
        licenseUrl: '',
        source: 'blog',
        sourceLabels: [`Blog cover: ${post.slug}`],
      });
    }

    for (const localeKey of ['en', 'pt'] as const) {
      const seo = post.seoByLocale[localeKey];
      if (!seo.ogImage.trim()) {
        continue;
      }

      addGalleryCandidate(map, {
        id: `blog:seo:${post.id}:${localeKey}`,
        src: seo.ogImage,
        alt: toLocaleText(seo.ogTitle || seo.title),
        attributionName: '',
        attributionUrl: '',
        licenseUrl: '',
        source: 'seo',
        sourceLabels: [`Blog SEO ${localeKey.toUpperCase()}: ${post.slug}`],
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
