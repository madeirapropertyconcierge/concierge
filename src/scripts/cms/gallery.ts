import { normalizeImageField } from '../../cms/content-normalization';
import { sendJson } from './api';
import { applyCurrentState } from './apply';
import { markDirty } from './banner-ui';
import { deepClone, locale, localeValue, pageId } from './context';
import {
  closePanels,
  hideElement,
  imageLibraryCount,
  imageLibraryList,
  imageLibraryPanel,
  imageLibrarySearch,
  setStatus,
  showElement,
} from './dom';
import { upsertImageField } from './fields';
import { ensureImageField, hydrateImageEditorForm, toggleImageEditor } from './image-editing';
import { clearPendingAdminImagePreview, resolveAdminImageSrc } from './preview-images';
import { state } from './store';
import type { CmsGalleryItem, GallerySource, LocaleText } from './types';

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

function imageDedupKey(src: string): string {
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

function collectGalleryItems(): CmsGalleryItem[] {
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

function filteredLibraryItems(): CmsGalleryItem[] {
  const items = collectGalleryItems();
  const query = imageLibrarySearch?.value.trim().toLowerCase() ?? '';

  if (!query) {
    return items;
  }

  return items.filter((item) => {
    const haystack = [
      item.src,
      item.alt.en,
      item.alt.pt,
      item.caption?.en ?? '',
      item.caption?.pt ?? '',
      item.attributionName,
      item.attributionUrl,
      item.licenseUrl,
      item.source,
      ...item.sourceLabels,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });
}

export function createPublicGalleryItem(src: string): CmsGalleryItem {
  return {
    id: `public:${src}`,
    src,
    alt: {
      en: '',
      pt: '',
    },
    attributionName: '',
    attributionUrl: '',
    licenseUrl: '',
    source: 'public',
    sourceLabels: ['Public folder'],
  };
}

export function upsertGalleryItem(item: CmsGalleryItem): void {
  const key = imageDedupKey(item.src);
  if (!key) {
    return;
  }

  state.globalGalleryItems = [
    item,
    ...state.globalGalleryItems.filter((existingItem) => imageDedupKey(existingItem.src) !== key),
  ];
}

function removeGalleryItem(item: CmsGalleryItem): void {
  const key = imageDedupKey(item.src);
  if (!key) {
    return;
  }

  state.globalGalleryItems = state.globalGalleryItems.filter((item) => imageDedupKey(item.src) !== key);
  clearPendingAdminImagePreview(item.src);
}

export function replaceSelectedImage(options: {
  src: string;
  alt?: LocaleText;
  attributionName?: string;
  attributionUrl?: string;
  licenseUrl?: string;
  caption?: LocaleText;
}): boolean {
  if (!state.workingState || !state.selectedImageTarget) {
    setStatus('Select an image on the page first.');
    toggleImageEditor(true);
    return false;
  }

  const existing = ensureImageField(state.selectedImageTarget);
  if (!existing) {
    setStatus('Selected image could not be resolved.');
    return false;
  }

  const nextField = normalizeImageField({
    ...existing,
    src: options.src,
    alt: options.alt ? deepClone(options.alt) : deepClone(existing.alt),
    attributionName: options.attributionName ?? existing.attributionName,
    attributionUrl: options.attributionUrl ?? existing.attributionUrl,
    licenseUrl: options.licenseUrl ?? existing.licenseUrl,
    caption: options.caption ? deepClone(options.caption) : existing.caption ? deepClone(existing.caption) : undefined,
  });

  if (JSON.stringify(existing) === JSON.stringify(nextField)) {
    return false;
  }

  upsertImageField(nextField);
  applyCurrentState();
  hydrateImageEditorForm();
  toggleImageLibrary(false);
  toggleImageEditor(true);
  return true;
}

function applyGalleryImageToSelected(item: CmsGalleryItem): void {
  const changed = replaceSelectedImage({
    src: item.src,
    alt: item.alt,
    attributionName: item.attributionName,
    attributionUrl: item.attributionUrl,
    licenseUrl: item.licenseUrl,
    caption: item.caption,
  });

  if (!changed) {
    setStatus('Selected image already uses this asset.');
    return;
  }

  markDirty('Selected image replaced from gallery');
}

function canDeleteGalleryItem(item: CmsGalleryItem): boolean {
  return item.source === 'public';
}

function isGalleryItemInUse(item: CmsGalleryItem): boolean {
  return item.sourceLabels.some((label) => label !== 'Public folder');
}

async function deleteGalleryItem(item: CmsGalleryItem): Promise<void> {
  if (!canDeleteGalleryItem(item)) {
    setStatus('Only files that exist in the public folder can be deleted here.');
    return;
  }

  if (isGalleryItemInUse(item)) {
    setStatus('This image is still used somewhere and cannot be deleted yet.');
    return;
  }

  const confirmed = window.confirm(`Delete ${item.src} from the public folder?`);
  if (!confirmed) {
    return;
  }

  const { ok, payload } = await sendJson<{ ok?: boolean; src?: string; commitSha?: string }>(
    'POST',
    '/api/admin/delete-image',
    { src: item.src },
  );

  if (!ok || !payload.src || !state.workingState) {
    setStatus(payload.error ?? 'Image delete failed');
    return;
  }

  removeGalleryItem(item);

  if (payload.commitSha) {
    state.workingState.baseSha = payload.commitSha;
    if (state.publishedState) {
      state.publishedState.baseSha = payload.commitSha;
    }
  }

  renderImageLibrary();
  setStatus('Image file deleted from the public folder.');
}

export function renderImageLibrary(): void {
  if (!imageLibraryList || !imageLibraryCount) {
    return;
  }

  imageLibraryList.innerHTML = '';

  const items = filteredLibraryItems();
  imageLibraryCount.textContent = `${items.length} image${items.length === 1 ? '' : 's'} in gallery`;

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'cms-subtitle';
    empty.textContent = 'No images match your filter.';
    imageLibraryList.append(empty);
    return;
  }

  for (const item of items) {
    const card = document.createElement('article');
    card.className = 'cms-library-item';
    card.addEventListener('click', (event) => {
      const eventTarget = event.target instanceof Element ? event.target : null;
      if (eventTarget?.closest('button')) {
        return;
      }

      applyGalleryImageToSelected(item);
    });

    const image = document.createElement('img');
    image.src = resolveAdminImageSrc(item.src);
    image.alt = localeValue(item.alt);
    image.loading = 'lazy';

    const path = document.createElement('p');
    path.className = 'cms-library-path';
    path.textContent = item.src;

    const alt = document.createElement('p');
    alt.className = 'cms-library-meta';
    alt.textContent = `ALT ${locale.toUpperCase()}: ${localeValue(item.alt) || '—'}`;

    const source = document.createElement('p');
    source.className = 'cms-library-meta';
    source.textContent = `Source: ${item.sourceLabels.join(' • ')}`;

    const actions = document.createElement('div');
    actions.className = 'cms-library-actions';

    const useButton = document.createElement('button');
    useButton.type = 'button';
    useButton.className = 'cms-btn cms-btn-primary';
    useButton.textContent = 'Replace selected image';
    useButton.disabled = !state.selectedImageTarget;
    useButton.addEventListener('click', () => {
      applyGalleryImageToSelected(item);
    });

    actions.append(useButton);

    if (canDeleteGalleryItem(item)) {
      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'cms-btn cms-btn-danger';
      deleteButton.textContent = 'Delete file';
      deleteButton.disabled = isGalleryItemInUse(item);
      deleteButton.title = isGalleryItemInUse(item)
        ? 'This image is still referenced by page, blog, or SEO content.'
        : 'Delete this file from the public folder';
      deleteButton.addEventListener('click', async () => {
        await deleteGalleryItem(item);
      });

      actions.append(deleteButton);
    }

    card.append(image, path, alt, source, actions);
    imageLibraryList.append(card);
  }
}

export function toggleImageLibrary(open: boolean): void {
  if (!imageLibraryPanel) {
    return;
  }

  if (open) {
    closePanels(imageLibraryPanel);
    showElement(imageLibraryPanel);
    renderImageLibrary();
    return;
  }

  hideElement(imageLibraryPanel);
}
