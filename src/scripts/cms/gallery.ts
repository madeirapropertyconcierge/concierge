import { normalizeImageField } from '../../cms/content-normalization';
import { normalizeCmsText } from '../../cms/text-normalization';
import { sendJson } from './api';
import { applyCurrentState } from './apply';
import { markDirty } from './banner-ui';
import { deepClone, localeValue } from './context';
import {
  closePanels,
  hideElement,
  imageLibraryCount,
  imageLibraryList,
  imageLibraryPanel,
  imageLibrarySearch,
  imageNeedsAltToggle,
  setStatus,
  showElement,
} from './dom';
import { upsertImageField } from './fields';
import { altIsMissing, collectGalleryItems, imageDedupKey, itemNeedsAlt, pageImageFieldsForSrc } from './gallery-data';
import { ensureImageField, hydrateImageEditorForm, toggleImageEditor } from './image-editing';
import { clearPendingAdminImagePreview, resolveAdminImageSrc } from './preview-images';
import { state } from './store';
import type { CmsGalleryItem, LocaleText } from './types';

/** When set, only images that are placed on this page but lack alt text show. */
let needsAltOnly = false;

function saveGalleryAlt(src: string, altEn: string, altPt: string): void {
  const fields = pageImageFieldsForSrc(src);
  if (!state.workingState || fields.length === 0) {
    return;
  }

  let changed = false;
  for (const field of fields) {
    const nextField = normalizeImageField({
      ...field,
      alt: { en: normalizeCmsText(altEn.trim()), pt: normalizeCmsText(altPt.trim()) },
    });

    if (JSON.stringify(field) !== JSON.stringify(nextField)) {
      upsertImageField(nextField);
      changed = true;
    }
  }

  if (!changed) {
    setStatus('Alt text unchanged');
    return;
  }

  applyCurrentState();
  renderImageLibrary();
  markDirty('Alt text updated');
}

export function isGalleryPickActive(): boolean {
  return Boolean(state.galleryPickHandler);
}

function finishGalleryPick(src: string | null): void {
  const handler = state.galleryPickHandler;
  state.galleryPickHandler = null;
  hideElement(imageLibraryPanel);
  handler?.(src);
}

export function cancelGalleryPick(): void {
  finishGalleryPick(null);
}

export function toggleNeedsAltFilter(): void {
  needsAltOnly = !needsAltOnly;
  imageNeedsAltToggle?.classList.toggle('cms-chip-toggle-active', needsAltOnly);
  imageNeedsAltToggle?.setAttribute('aria-pressed', needsAltOnly ? 'true' : 'false');
  renderImageLibrary();
}

function filteredLibraryItems(): CmsGalleryItem[] {
  let items = collectGalleryItems();
  const query = imageLibrarySearch?.value.trim().toLowerCase() ?? '';

  if (needsAltOnly) {
    items = items.filter((item) => itemNeedsAlt(item));
  }

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

function buildAltBadge(item: CmsGalleryItem): HTMLElement {
  const badge = document.createElement('span');
  badge.className = 'cms-badge';

  const editable = pageImageFieldsForSrc(item.src).length > 0;
  if (!editable) {
    badge.classList.add('cms-badge-muted');
    badge.textContent = 'Not on this page';
    return badge;
  }

  if (altIsMissing(item)) {
    badge.classList.add('cms-badge-warn');
    badge.textContent = 'Needs alt text';
  } else {
    badge.classList.add('cms-badge-ok');
    badge.textContent = 'Alt text set';
  }

  return badge;
}

function buildAltEditor(item: CmsGalleryItem): HTMLElement | null {
  const fields = pageImageFieldsForSrc(item.src);
  if (fields.length === 0) {
    return null;
  }

  const sourceAlt = fields[0].alt;

  const editor = document.createElement('div');
  editor.className = 'cms-library-alt-editor';

  const makeField = (labelText: string, value: string): HTMLInputElement => {
    const field = document.createElement('label');
    field.className = 'cms-library-alt-field';
    const label = document.createElement('span');
    label.textContent = labelText;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = value;
    input.placeholder = 'Describe this image for search & screen readers';
    field.append(label, input);
    editor.append(field);
    return input;
  };

  const enInput = makeField('Alt text · EN', sourceAlt.en);
  const ptInput = makeField('Alt text · PT', sourceAlt.pt);

  const saveButton = document.createElement('button');
  saveButton.type = 'button';
  saveButton.className = 'cms-btn cms-btn-primary';
  saveButton.textContent = 'Save alt text';
  saveButton.addEventListener('click', () => {
    saveGalleryAlt(item.src, enInput.value, ptInput.value);
  });
  editor.append(saveButton);

  return editor;
}

function renderPickBanner(): void {
  if (!imageLibraryList) {
    return;
  }

  const banner = document.createElement('div');
  banner.className = 'cms-pick-banner';

  const label = document.createElement('span');
  label.textContent = 'Pick an image for the social share card.';

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'cms-btn cms-btn-muted cms-btn-sm';
  cancel.textContent = 'Cancel';
  cancel.addEventListener('click', () => {
    cancelGalleryPick();
  });

  banner.append(label, cancel);
  imageLibraryList.append(banner);
}

export function renderImageLibrary(): void {
  if (!imageLibraryList || !imageLibraryCount) {
    return;
  }

  imageLibraryList.innerHTML = '';

  const picking = isGalleryPickActive();
  if (picking) {
    renderPickBanner();
  }

  const items = filteredLibraryItems();
  const needsAltCount = collectGalleryItems().filter((item) => itemNeedsAlt(item)).length;
  const countLabel = `${items.length} image${items.length === 1 ? '' : 's'} in gallery`;
  imageLibraryCount.textContent = needsAltCount > 0
    ? `${countLabel} · ${needsAltCount} need alt text`
    : countLabel;

  if (items.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'cms-subtitle';
    empty.textContent = needsAltOnly
      ? 'Every image on this page has alt text. 🎉'
      : 'No images match your filter.';
    imageLibraryList.append(empty);
    return;
  }

  for (const item of items) {
    const card = document.createElement('article');
    card.className = 'cms-library-item';
    card.addEventListener('click', (event) => {
      const eventTarget = event.target instanceof Element ? event.target : null;
      if (eventTarget?.closest('button, input, textarea, label, .cms-library-alt-editor')) {
        return;
      }

      if (picking) {
        finishGalleryPick(item.src);
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

    const badges = document.createElement('div');
    badges.className = 'cms-library-badges';
    badges.append(buildAltBadge(item));

    const source = document.createElement('p');
    source.className = 'cms-library-meta';
    source.textContent = `Source: ${item.sourceLabels.join(' • ')}`;

    card.append(image, path, badges, source);

    const altEditor = picking ? null : buildAltEditor(item);
    if (altEditor) {
      card.append(altEditor);
    }

    const actions = document.createElement('div');
    actions.className = 'cms-library-actions';

    if (picking) {
      const pickButton = document.createElement('button');
      pickButton.type = 'button';
      pickButton.className = 'cms-btn cms-btn-primary';
      pickButton.textContent = 'Use for social card';
      pickButton.addEventListener('click', () => {
        finishGalleryPick(item.src);
      });
      actions.append(pickButton);
    } else {
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
    }

    card.append(actions);
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
