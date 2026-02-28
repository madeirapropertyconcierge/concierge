import { readdir } from 'node:fs/promises';
import { basename, extname, relative, resolve } from 'node:path';
import { pexelsMadeiraImages, PEXELS_LICENSE_URL } from '../lib/pexelsImages';
import {
  listBlogPosts,
  listPageDocuments,
  loadMediaLibrary,
} from './content-loader';
import type { CmsMediaItem } from './schema';

type LocaleText = { en: string; pt: string };

export type GallerySource = 'library' | 'page' | 'blog' | 'seo' | 'visible';

export interface CmsGalleryImage extends CmsMediaItem {
  source: GallerySource;
  sourceLabels: string[];
  libraryItemId?: string;
}

const IMAGE_FILE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.avif',
  '.svg',
]);

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

const GALLERY_SOURCE_PRIORITY: Record<GallerySource, number> = {
  library: 0,
  page: 1,
  blog: 2,
  seo: 3,
  visible: 4,
};

function addGalleryCandidate(
  map: Map<string, CmsGalleryImage>,
  candidate: CmsGalleryImage,
): void {
  const key = normalizeImageSrc(candidate.src);
  if (!key) {
    return;
  }

  const nextCandidate: CmsGalleryImage = {
    ...candidate,
    src: key,
    sourceLabels: [...candidate.sourceLabels],
  };

  const existing = map.get(key);
  if (!existing) {
    map.set(key, nextCandidate);
    return;
  }

  existing.sourceLabels = Array.from(new Set([...existing.sourceLabels, ...nextCandidate.sourceLabels]));

  if (nextCandidate.libraryItemId) {
    existing.libraryItemId = nextCandidate.libraryItemId;
    existing.source = 'library';
    existing.alt = nextCandidate.alt;
    existing.caption = nextCandidate.caption;
    existing.attributionName = nextCandidate.attributionName;
    existing.attributionUrl = nextCandidate.attributionUrl;
    existing.licenseUrl = nextCandidate.licenseUrl;
    return;
  }

  if (GALLERY_SOURCE_PRIORITY[nextCandidate.source] < GALLERY_SOURCE_PRIORITY[existing.source]) {
    existing.source = nextCandidate.source;
  }

  existing.alt = mergeLocaleText(existing.alt, nextCandidate.alt);
  existing.caption = mergeCaption(existing.caption, nextCandidate.caption);
  existing.attributionName = existing.attributionName.trim() || nextCandidate.attributionName.trim();
  existing.attributionUrl = existing.attributionUrl.trim() || nextCandidate.attributionUrl.trim();
  existing.licenseUrl = existing.licenseUrl.trim() || nextCandidate.licenseUrl.trim();
}

function fallbackAltFromPath(filePath: string): string {
  const base = basename(filePath, extname(filePath))
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return base || 'Website image';
}

async function walkDirectory(directoryPath: string): Promise<string[]> {
  const results: string[] = [];
  let entries: Awaited<ReturnType<typeof readdir>>;

  try {
    entries = await readdir(directoryPath, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const absolute = resolve(directoryPath, entry.name);

    if (entry.isDirectory()) {
      const nested = await walkDirectory(absolute);
      results.push(...nested);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const extension = extname(entry.name).toLowerCase();
    if (!IMAGE_FILE_EXTENSIONS.has(extension)) {
      continue;
    }

    results.push(absolute);
  }

  return results;
}

async function listPublicImageAssets(): Promise<string[]> {
  const publicRoot = resolve(process.cwd(), 'public');
  const imageRoot = resolve(publicRoot, 'images');
  const files = await walkDirectory(imageRoot);
  return files.map((absolute) => {
    const normalized = relative(publicRoot, absolute).replaceAll('\\', '/');
    return `/${normalized}`;
  });
}

export async function collectSiteGalleryImages(): Promise<CmsGalleryImage[]> {
  const [mediaLibrary, pages, blogPosts, publicImages] = await Promise.all([
    loadMediaLibrary(),
    listPageDocuments(),
    listBlogPosts(),
    listPublicImageAssets(),
  ]);

  const map = new Map<string, CmsGalleryImage>();

  for (const item of mediaLibrary.items) {
    addGalleryCandidate(map, {
      ...item,
      source: 'library',
      sourceLabels: ['Library'],
      libraryItemId: item.id,
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

  for (const [key, item] of Object.entries(pexelsMadeiraImages)) {
    addGalleryCandidate(map, {
      id: `pexels:${key}`,
      src: item.src,
      alt: toLocaleText(item.alt),
      attributionName: item.photographer,
      attributionUrl: item.photoUrl,
      licenseUrl: PEXELS_LICENSE_URL,
      source: 'visible',
      sourceLabels: [`Pexels catalog: ${item.label}`],
    });
  }

  for (const src of publicImages) {
    addGalleryCandidate(map, {
      id: `public:${src}`,
      src,
      alt: toLocaleText(fallbackAltFromPath(src)),
      attributionName: '',
      attributionUrl: '',
      licenseUrl: '',
      source: 'visible',
      sourceLabels: ['Public asset'],
    });
  }

  return Array.from(map.values()).sort((a, b) => a.src.localeCompare(b.src));
}
