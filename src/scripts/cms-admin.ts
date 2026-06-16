import { escapeJsString, selectorForId } from '../cms/cms-keys';
import { renderMarkdown } from '../cms/markdown-core';
import {
  normalizeBlogPost,
  normalizeImageField,
  normalizeLinkField,
  normalizePageDocument,
  normalizeServicePackageDocument,
  normalizeTextField,
} from '../cms/content-normalization';
import { normalizeCmsText } from '../cms/text-normalization';

import type {
  CmsBlogLocale,
  CmsBlogPost,
  CmsBlogSeo,
  CmsGalleryItem,
  CmsImageField,
  CmsLinkField,
  CmsPageDocument,
  CmsSeoLocale,
  CmsServicePackageDocument,
  CmsServicePackageEntry,
  CmsServicePackageField,
  CmsServicePackageKey,
  CmsServicePackagePrice,
  CmsTextField,
  ContentResponse,
  GallerySource,
  Locale,
  LocaleText,
  SelectedImageTarget,
  WorkingState,
} from "./cms/types";
import { state } from "./cms/store";
import {
  clearAllPendingAdminImagePreviews,
  clearPendingAdminImagePreview,
  resolveAdminImageSrc,
  setPendingAdminImagePreview,
} from "./cms/preview-images";
import {
  deepClone,
  isBlogPage,
  isMediaPage,
  locale,
  localeValue,
  normalizeTextInput,
  nowIso,
  pageId,
  resolveCmsId,
  setLocaleValue,
} from "./cms/context";
import {
  banner,
  blogDeleteButton,
  blogDuplicateButton,
  blogForm,
  blogManagerClose,
  blogManagerPanel,
  blogNewButton,
  blogSelect,
  closePanels,
  dirtyIndicator,
  discardChangesButton,
  editSeoButton,
  fallbackWarning,
  hideElement,
  imageEditorClose,
  imageEditorForm,
  imageEditorOpenLibraryButton,
  imageEditorPanel,
  imageEditorPreview,
  imageEditorSelected,
  imageLibraryClose,
  imageLibraryCount,
  imageLibraryList,
  imageLibraryPanel,
  imageLibrarySearch,
  imageReplaceUploadForm,
  imageUploadForm,
  integrityWarning,
  isPanelOpen,
  loginCancel,
  loginError,
  loginForm,
  loginModal,
  logoutButton,
  modeLabel,
  openBlogManagerButton,
  openImageEditorButton,
  openImageLibraryButton,
  publishButton,
  seoClose,
  seoFillCanonicalButton,
  seoForm,
  seoPanel,
  setPanelVisibility,
  setStatus,
  showElement,
  statusEl,
  toggleModeButton,
} from "./cms/dom";
import { checkSession, fetchContent, login, readApiPayload } from "./cms/api";
import {
  markDirty,
  setBusy,
  setDirty,
  updateActionAvailability,
  updateDirtyIndicator,
  updateModeLabel,
} from "./cms/banner-ui";
import {
  applyBlogFormChanges,
  createEmptyBlogPost,
  findSelectedBlogPost,
  hydrateBlogForm,
  renderBlogSelect,
  toggleBlogManager,
} from "./cms/blog";


if (!isBlogPage && openBlogManagerButton) {
  openBlogManagerButton.classList.add('cms-hidden');
}

const BANNER_OFFSET_CSS_VAR = '--cms-admin-banner-offset';
const LOGOUT_MARKER_STORAGE_KEY = 'cms-admin-force-logout';

const MARKDOWN_BLOCK_TAGS = new Set(['P', 'DIV', 'LI', 'BLOCKQUOTE']);
const TEXT_TAGS = new Set([
  'P',
  'SPAN',
  'DIV',
  'LI',
  'BLOCKQUOTE',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'STRONG',
  'EM',
]);




function isSharedPackageElement(element: Element | null): element is HTMLElement {
  return Boolean(element instanceof HTMLElement && element.dataset.cmsSharedDoc === 'packages');
}

function hasSharedEditableDescendant(element: HTMLElement): boolean {
  return Boolean(element.querySelector('[data-cms-shared-doc="packages"]'));
}

function isSharedOwnedElement(element: Element | null): boolean {
  const owner = element instanceof HTMLElement
    ? element.closest<HTMLElement>('[data-cms-owner]')
    : null;

  return Boolean(owner && owner.dataset.cmsOwner && owner.dataset.cmsOwner !== 'page');
}

function isAdminControl(element: Element | null): boolean {
  return Boolean(element?.closest('[data-admin-allow]'));
}

function isTextCandidate(element: HTMLElement): boolean {
  if (!TEXT_TAGS.has(element.tagName)) {
    return false;
  }

  if (element.tagName === 'DIV' && element.childElementCount > 0) {
    return false;
  }

  if (element.matches('a,button,label,summary')) {
    return false;
  }

  if (element.querySelector('img,svg,video,iframe,a,button,input,textarea,select')) {
    return false;
  }

  if (hasSharedEditableDescendant(element)) {
    return false;
  }

  return Boolean(element.textContent?.trim());
}

function findEditableTextElement(target: Element): HTMLElement | null {
  const sharedElement = target.closest<HTMLElement>('[data-cms-shared-doc="packages"]');
  if (sharedElement?.closest('main')) {
    return sharedElement;
  }

  // Prefer the authored/keyed text field when the click lands inside one, so a
  // click on inline markup (e.g. a <strong> inside the field) edits the whole
  // field rather than minting a field for the fragment.
  const keyedElement = target.closest<HTMLElement>('main [data-cms-field="text"][data-cms-id]');
  if (keyedElement && isTextCandidate(keyedElement)) {
    return keyedElement;
  }

  const textElement = target.closest<HTMLElement>('main *');
  if (textElement && isTextCandidate(textElement)) {
    return textElement;
  }

  return null;
}

function upsertTextField(field: CmsTextField): void {
  if (!state.workingState) {
    return;
  }

  const normalizedField = normalizeTextField(field);
  const index = state.workingState.page.texts.findIndex((entry) => entry.id === field.id);
  if (index >= 0) {
    state.workingState.page.texts[index] = normalizedField;
    return;
  }

  state.workingState.page.texts.push(normalizedField);
}

function upsertLinkField(field: CmsLinkField): void {
  if (!state.workingState) {
    return;
  }

  const normalizedField = normalizeLinkField(field);
  const index = state.workingState.page.links.findIndex((entry) => entry.id === field.id);
  if (index >= 0) {
    state.workingState.page.links[index] = normalizedField;
    return;
  }

  state.workingState.page.links.push(normalizedField);
}

function upsertImageField(field: CmsImageField): void {
  if (!state.workingState) {
    return;
  }

  const normalizedField = normalizeImageField(field);
  const index = state.workingState.page.images.findIndex((entry) => entry.id === field.id);
  if (index >= 0) {
    state.workingState.page.images[index] = normalizedField;
    return;
  }

  state.workingState.page.images.push(normalizedField);
}

function findServicePackageEntry(key: CmsServicePackageKey): CmsServicePackageEntry | null {
  if (!state.workingState) {
    return null;
  }

  return state.workingState.packages.packages.find((entry) => entry.key === key) ?? null;
}

function resolveLocalizedListValue(values: Record<Locale, string[]>, index: number): string {
  const localized = values[locale]?.[index]?.trim();
  if (localized) {
    return localized;
  }

  return values.en[index]?.trim() ?? '';
}

function readSharedPackageFieldValue(
  entry: CmsServicePackageEntry,
  field: CmsServicePackageField,
  index?: number,
): string {
  switch (field) {
    case 'tierLabel':
      return localeValue(entry.tierLabel);
    case 'title':
      return localeValue(entry.title);
    case 'audience':
      return localeValue(entry.audience);
    case 'priceHeadline':
      return entry.price ? localeValue(entry.price.headline) : '';
    case 'priceDetail':
      return entry.price ? localeValue(entry.price.detail) : '';
    case 'idealFor':
      return localeValue(entry.idealFor);
    case 'homeBlurb':
      return localeValue(entry.homeBlurb);
    case 'feature':
      return typeof index === 'number' ? resolveLocalizedListValue(entry.features, index) : '';
    case 'servicesBullet':
      return typeof index === 'number' ? resolveLocalizedListValue(entry.servicesBullets, index) : '';
  }
}

function setLocalizedListValue(values: Record<Locale, string[]>, index: number, nextValue: string): void {
  const nextItems = [...values[locale]];
  while (nextItems.length <= index) {
    nextItems.push('');
  }
  nextItems[index] = nextValue;
  values[locale] = nextItems;
}

function writeSharedPackageFieldValue(
  entry: CmsServicePackageEntry,
  field: CmsServicePackageField,
  nextValue: string,
  index?: number,
): void {
  switch (field) {
    case 'tierLabel':
      entry.tierLabel = setLocaleValue(entry.tierLabel, nextValue);
      return;
    case 'title':
      entry.title = setLocaleValue(entry.title, nextValue);
      return;
    case 'audience':
      entry.audience = setLocaleValue(entry.audience, nextValue);
      return;
    case 'priceHeadline':
      entry.price = entry.price ?? {
        headline: { en: '', pt: '' },
        detail: { en: '', pt: '' },
      };
      entry.price.headline = setLocaleValue(entry.price.headline, nextValue);
      return;
    case 'priceDetail':
      entry.price = entry.price ?? {
        headline: { en: '', pt: '' },
        detail: { en: '', pt: '' },
      };
      entry.price.detail = setLocaleValue(entry.price.detail, nextValue);
      return;
    case 'idealFor':
      entry.idealFor = setLocaleValue(entry.idealFor, nextValue);
      return;
    case 'homeBlurb':
      entry.homeBlurb = setLocaleValue(entry.homeBlurb, nextValue);
      return;
    case 'feature':
      if (typeof index === 'number') {
        setLocalizedListValue(entry.features, index, nextValue);
      }
      return;
    case 'servicesBullet':
      if (typeof index === 'number') {
        setLocalizedListValue(entry.servicesBullets, index, nextValue);
      }
      return;
  }
}


function localeFallbackUsed(value: LocaleText): boolean {
  return locale !== 'en' && !value[locale].trim() && Boolean(value.en.trim());
}

function markElementFallback(element: HTMLElement, used: boolean): void {
  if (used) {
    element.dataset.cmsFallback = locale;
  } else {
    delete element.dataset.cmsFallback;
  }
}

function applyPageDocument(page: CmsPageDocument): void {
  for (const field of page.texts) {
    const source = localeValue(field.value);
    const rendered = renderMarkdown(source, field.kind);
    const fallback = localeFallbackUsed(field.value);

    document.querySelectorAll<HTMLElement>(field.selector).forEach((element) => {
      if (isSharedOwnedElement(element)) {
        return;
      }

      element.innerHTML = rendered;
      element.dataset.cmsField = 'text';
      element.dataset.cmsId = field.id;
      element.dataset.cmsSelector = field.selector;
      element.dataset.cmsKind = field.kind;
      element.dataset.cmsSource = source;
      markElementFallback(element, fallback);
    });
  }

  for (const field of page.links) {
    const targetHref = localeValue(field.href);
    const renderedLabel = renderMarkdown(localeValue(field.label), 'inline');
    const labelText = localeValue(field.label);
    const fallback = localeFallbackUsed(field.label) || localeFallbackUsed(field.href);

    document.querySelectorAll<HTMLElement>(field.selector).forEach((element) => {
      if (isSharedOwnedElement(element)) {
        return;
      }

      const isSimpleLinkLabelTarget = element.childElementCount === 0;

      if (element instanceof HTMLAnchorElement) {
        element.href = targetHref;
        if (isSimpleLinkLabelTarget) {
          element.innerHTML = renderedLabel;
        }
      } else {
        element.setAttribute('data-cms-href', targetHref);
        if (isSimpleLinkLabelTarget) {
          element.textContent = labelText;
        }

        if (element instanceof HTMLButtonElement && !element.closest('form')) {
          element.type = 'button';
          element.setAttribute('onclick', `window.location.href='${escapeJsString(targetHref)}'`);
        }
      }

      element.dataset.cmsField = 'link';
      element.dataset.cmsId = field.id;
      element.dataset.cmsSelector = field.selector;
      markElementFallback(element, fallback);
    });
  }

  for (const field of page.images) {
    const resolvedSrc = resolveAdminImageSrc(field.src);
    const altText = localeValue(field.alt);
    const fallback = localeFallbackUsed(field.alt);

    document.querySelectorAll<HTMLImageElement>(field.selector).forEach((element) => {
      if (isSharedOwnedElement(element)) {
        return;
      }

      element.src = resolvedSrc;
      element.alt = altText;
      element.dataset.cmsField = 'image';
      element.dataset.cmsId = field.id;
      element.dataset.cmsSelector = field.selector;
      element.dataset.cmsSourceSrc = field.src;
      markElementFallback(element, fallback);
    });
  }
}

function applyServicePackageDocument(packages: CmsServicePackageDocument): void {
  const elements = document.querySelectorAll<HTMLElement>('[data-cms-shared-doc="packages"]');

  for (const element of elements) {
    const key = element.dataset.cmsSharedKey as CmsServicePackageKey | undefined;
    const field = element.dataset.cmsSharedField as CmsServicePackageField | undefined;
    const kind = (element.dataset.cmsKind as 'inline' | 'block' | undefined) ?? 'inline';
    const index = element.dataset.cmsSharedIndex ? Number.parseInt(element.dataset.cmsSharedIndex, 10) : undefined;

    if (!key || !field) {
      continue;
    }

    const entry = packages.packages.find((item) => item.key === key);
    if (!entry) {
      continue;
    }

    const source = readSharedPackageFieldValue(entry, field, index);
    element.innerHTML = renderMarkdown(source, kind);
    element.dataset.cmsField = 'text';
    element.dataset.cmsSource = source;
  }
}

function updateFallbackWarning(page: CmsPageDocument): void {
  if (!fallbackWarning) {
    return;
  }

  let fallbackCount = 0;

  if (locale === 'pt') {
    for (const field of page.texts) {
      if (!field.value.pt.trim() && field.value.en.trim()) {
        fallbackCount += 1;
      }
    }

    for (const field of page.links) {
      if (!field.label.pt.trim() && field.label.en.trim()) {
        fallbackCount += 1;
      }
    }

    for (const field of page.images) {
      if (!field.alt.pt.trim() && field.alt.en.trim()) {
        fallbackCount += 1;
      }
    }

    for (const entry of state.workingState?.packages.packages ?? []) {
      if (!entry.tierLabel.pt.trim() && entry.tierLabel.en.trim()) {
        fallbackCount += 1;
      }

      if (!entry.title.pt.trim() && entry.title.en.trim()) {
        fallbackCount += 1;
      }

      if (!entry.audience.pt.trim() && entry.audience.en.trim()) {
        fallbackCount += 1;
      }

      if (!entry.idealFor.pt.trim() && entry.idealFor.en.trim()) {
        fallbackCount += 1;
      }

      if (!entry.homeBlurb.pt.trim() && entry.homeBlurb.en.trim()) {
        fallbackCount += 1;
      }

      if (entry.price) {
        if (!entry.price.headline.pt.trim() && entry.price.headline.en.trim()) {
          fallbackCount += 1;
        }

        if (!entry.price.detail.pt.trim() && entry.price.detail.en.trim()) {
          fallbackCount += 1;
        }
      }

      fallbackCount += entry.features.en.reduce((count, item, index) => (
        count + (!entry.features.pt[index]?.trim() && item.trim() ? 1 : 0)
      ), 0);

      fallbackCount += entry.servicesBullets.en.reduce((count, item, index) => (
        count + (!entry.servicesBullets.pt[index]?.trim() && item.trim() ? 1 : 0)
      ), 0);
    }
  }

  if (fallbackCount > 0) {
    fallbackWarning.textContent = `PT fallback active (${fallbackCount})`;
    fallbackWarning.classList.remove('cms-hidden');
    return;
  }

  fallbackWarning.classList.add('cms-hidden');
}

function countOrphanFields(page: CmsPageDocument): number {
  const selectors = [
    ...page.texts.map((field) => field.selector),
    ...page.links.map((field) => field.selector),
    ...page.images.map((field) => field.selector),
  ];

  let orphans = 0;
  for (const selector of selectors) {
    try {
      if (document.querySelectorAll(selector).length === 0) {
        orphans += 1;
      }
    } catch {
      // An unusable selector cannot match anything, so it is orphaned.
      orphans += 1;
    }
  }

  return orphans;
}

function updateIntegrityWarning(page: CmsPageDocument): void {
  if (!integrityWarning) {
    return;
  }

  const orphans = countOrphanFields(page);
  if (orphans > 0) {
    integrityWarning.textContent = `${orphans} orphaned field${orphans === 1 ? '' : 's'}`;
    integrityWarning.classList.remove('cms-hidden');
    return;
  }

  integrityWarning.classList.add('cms-hidden');
}

function setMetaContent(selector: string, content: string): void {
  const element = document.querySelector<HTMLMetaElement>(selector);
  if (element && content.trim()) {
    element.content = content;
  }
}

function updateSeoPreview(page: CmsPageDocument): void {
  const seo = page.seo[locale];
  if (!seo) {
    return;
  }

  if (seo.title.trim()) {
    document.title = seo.title;
  }

  setMetaContent('meta[name="description"]', seo.description);
  setMetaContent('meta[property="og:title"]', seo.ogTitle || seo.title);
  setMetaContent('meta[property="og:description"]', seo.ogDescription || seo.description);
  setMetaContent('meta[property="og:image"]', seo.ogImage);

  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical && seo.canonical.trim()) {
    canonical.href = seo.canonical;
  }
}

function applyCurrentState(): void {
  if (!state.workingState) {
    return;
  }

  applyServicePackageDocument(state.workingState.packages);
  applyPageDocument(state.workingState.page);
  updateFallbackWarning(state.workingState.page);
  updateIntegrityWarning(state.workingState.page);
  updateSeoPreview(state.workingState.page);

  if (isPanelOpen(seoPanel)) {
    hydrateSeoForm();
  }

  if (isPanelOpen(imageEditorPanel)) {
    hydrateImageEditorForm();
  }

  if (isPanelOpen(imageLibraryPanel)) {
    renderImageLibrary();
  }
}

function setBannerVisibility(): void {
  if (!banner) {
    return;
  }

  if (state.authenticated) {
    banner.classList.remove('cms-hidden');
    document.body.classList.add('cms-admin-offset');
    syncBannerOffset();
    return;
  }

  banner.classList.add('cms-hidden');
  document.body.classList.remove('cms-admin-offset');
  document.documentElement.style.removeProperty(BANNER_OFFSET_CSS_VAR);
}

function syncBannerOffset(): void {
  if (!banner || !state.authenticated || banner.classList.contains('cms-hidden')) {
    return;
  }

  const offsetPx = Math.ceil(banner.getBoundingClientRect().height + 10);
  document.documentElement.style.setProperty(BANNER_OFFSET_CSS_VAR, `${offsetPx}px`);
}

function openLoginModal(): void {
  showElement(loginModal);
  loginError?.classList.add('cms-hidden');
}

function closeLoginModal(): void {
  hideElement(loginModal);
  loginForm?.reset();
}


function finalizeActiveTextEdit(): void {
  if (!state.activeEditableElement) {
    return;
  }

  const element = state.activeEditableElement;
  state.activeEditableElement = null;
  element.removeAttribute('contenteditable');
  element.removeAttribute('data-cms-editing');
  completeTextEdit(element);
}

function enableEditMode(): void {
  state.editMode = true;
  document.body.classList.add('cms-navigate-locked');
  updateModeLabel();
  setStatus('Edit mode enabled. Click text, links, or images to edit.');
}

function disableEditMode(): void {
  state.editMode = false;
  finalizeActiveTextEdit();
  document.body.classList.remove('cms-navigate-locked');
  updateModeLabel();
}

function toggleEditMode(): void {
  if (!state.authenticated) {
    return;
  }

  if (state.editMode) {
    disableEditMode();
    setStatus('View mode enabled');
    return;
  }

  enableEditMode();
}

function completeSharedPackageTextEdit(element: HTMLElement): void {
  if (!state.workingState) {
    return;
  }

  const key = element.dataset.cmsSharedKey as CmsServicePackageKey | undefined;
  const field = element.dataset.cmsSharedField as CmsServicePackageField | undefined;
  const kind = (element.dataset.cmsKind as 'inline' | 'block' | undefined) ?? 'inline';
  const index = element.dataset.cmsSharedIndex ? Number.parseInt(element.dataset.cmsSharedIndex, 10) : undefined;

  if (!key || !field) {
    return;
  }

  const entry = findServicePackageEntry(key);
  if (!entry) {
    return;
  }

  const previousValue = readSharedPackageFieldValue(entry, field, index);
  const nextValue = normalizeTextInput(element.textContent ?? '');

  if (nextValue === previousValue) {
    element.innerHTML = renderMarkdown(nextValue, kind);
    element.dataset.cmsSource = nextValue;
    return;
  }

  writeSharedPackageFieldValue(entry, field, nextValue, index);
  state.workingState.packages = normalizeServicePackageDocument(state.workingState.packages);

  element.innerHTML = renderMarkdown(nextValue, kind);
  element.dataset.cmsField = 'text';
  element.dataset.cmsSource = nextValue;
  markDirty('Package content updated');
}

function completeTextEdit(element: HTMLElement): void {
  if (!state.workingState) {
    return;
  }

  if (isSharedPackageElement(element)) {
    completeSharedPackageTextEdit(element);
    return;
  }

  const id = resolveCmsId(element, 'text');
  const selector = selectorForId(id);
  const kind = MARKDOWN_BLOCK_TAGS.has(element.tagName) ? 'block' : 'inline';
  const existing = state.workingState.page.texts.find((field) => field.id === id);
  const previousValue = existing
    ? localeValue(existing.value).trim()
    : normalizeTextInput(element.dataset.cmsSource ?? '');
  const nextValue = normalizeTextInput(element.textContent ?? '');

  if (!existing && nextValue === previousValue) {
    element.innerHTML = renderMarkdown(nextValue, kind);
    return;
  }

  const nextLocaleValue = existing
    ? setLocaleValue(existing.value, nextValue)
    : { en: '', pt: '', [locale]: nextValue };

  upsertTextField({
    id,
    selector,
    kind,
    value: nextLocaleValue,
  });

  element.innerHTML = renderMarkdown(nextValue, kind);
  element.dataset.cmsField = 'text';
  element.dataset.cmsId = id;
  element.dataset.cmsSelector = selector;
  element.dataset.cmsKind = kind;
  element.dataset.cmsSource = nextValue;

  if (nextValue !== previousValue || !existing) {
    markDirty('Text updated');
  }
}

function beginTextEdit(element: HTMLElement): void {
  if (state.activeEditableElement && state.activeEditableElement !== element) {
    finalizeActiveTextEdit();
  }

  state.activeEditableElement = element;
  const source = normalizeCmsText(element.dataset.cmsSource ?? element.textContent ?? '');
  element.textContent = source;
  element.setAttribute('contenteditable', 'true');
  element.setAttribute('data-cms-editing', 'true');

  const selection = window.getSelection();
  selection?.removeAllRanges();

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection?.addRange(range);

  element.focus();

  const handleBlur = (): void => {
    element.removeEventListener('blur', handleBlur);
    element.removeAttribute('contenteditable');
    element.removeAttribute('data-cms-editing');
    completeTextEdit(element);
    if (state.activeEditableElement === element) {
      state.activeEditableElement = null;
    }
  };

  element.addEventListener('blur', handleBlur);
}

function editLink(element: HTMLElement): void {
  if (!state.workingState) {
    return;
  }

  const id = resolveCmsId(element, 'link');
  const selector = selectorForId(id);
  const existing = state.workingState.page.links.find((field) => field.id === id);
  const isSimpleLinkLabelTarget = element.childElementCount === 0;

  const currentLabel = existing ? localeValue(existing.label) : normalizeTextInput(element.textContent ?? '');
  const currentHref = existing?.href[locale]
    ?? (element instanceof HTMLAnchorElement
      ? element.getAttribute('href') ?? ''
      : element.getAttribute('data-cms-href') ?? '');

  const href = window.prompt('Target URL (absolute https:// or /relative)', currentHref);
  if (href === null) {
    return;
  }

  let label = currentLabel;
  if (isSimpleLinkLabelTarget) {
    const promptedLabel = window.prompt('Link/Button label', currentLabel);
    if (promptedLabel === null) {
      return;
    }
    label = normalizeTextInput(promptedLabel);
  }

  const nextHref = href.trim();
  const nextLabel = normalizeTextInput(label);
  const nextLabelValue = isSimpleLinkLabelTarget
    ? (existing ? setLocaleValue(existing.label, nextLabel) : { en: '', pt: '', [locale]: nextLabel })
    : (existing?.label ?? { en: '', pt: '' });
  const nextHrefValue = existing
    ? setLocaleValue(existing.href, nextHref)
    : { en: '', pt: '', [locale]: nextHref };

  if (
    existing &&
    JSON.stringify(existing.label) === JSON.stringify(nextLabelValue) &&
    JSON.stringify(existing.href) === JSON.stringify(nextHrefValue)
  ) {
    return;
  }

  upsertLinkField({
    id,
    selector,
    label: nextLabelValue,
    href: nextHrefValue,
  });

  applyCurrentState();
  if (!isSimpleLinkLabelTarget) {
    markDirty('Link URL updated. Text can be edited directly inside the card/button.');
    return;
  }
  markDirty('Link updated');
}

function ensureImageField(target: SelectedImageTarget): CmsImageField | null {
  if (!state.workingState) {
    return null;
  }

  const existing = state.workingState.page.images.find((field) => field.id === target.id);
  if (existing) {
    return existing;
  }

  const element = document.querySelector<HTMLImageElement>(target.selector);
  if (!element) {
    return null;
  }

  const nextField = normalizeImageField({
    id: target.id,
    selector: target.selector,
    src: element.dataset.cmsSourceSrc || element.currentSrc || element.src,
    alt: { en: '', pt: '', [locale]: element.alt },
    attributionName: '',
    attributionUrl: '',
    licenseUrl: '',
  });

  upsertImageField(nextField);
  return nextField;
}

function setImageEditorField(name: string, value: string): void {
  if (!imageEditorForm) {
    return;
  }

  const field = imageEditorForm.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    field.value = value;
  }
}

function getImageEditorField(name: string): string {
  if (!imageEditorForm) {
    return '';
  }

  const field = imageEditorForm.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    return field.value.trim();
  }

  return '';
}

function getImageEditorTextField(name: string): string {
  return normalizeCmsText(getImageEditorField(name));
}

function setFormDisabled(form: HTMLFormElement | null, disabled: boolean): void {
  if (!form) {
    return;
  }

  form.querySelectorAll('input,textarea,select,button').forEach((node) => {
    if (
      node instanceof HTMLInputElement ||
      node instanceof HTMLTextAreaElement ||
      node instanceof HTMLSelectElement ||
      node instanceof HTMLButtonElement
    ) {
      node.disabled = disabled;
    }
  });
}

function hydrateImageEditorForm(): void {
  if (!imageEditorForm) {
    return;
  }

  if (!state.workingState || !state.selectedImageTarget) {
    imageEditorSelected && (imageEditorSelected.textContent = 'Click an image while edit mode is enabled to edit it here.');
    setFormDisabled(imageReplaceUploadForm, true);
    setFormDisabled(imageEditorForm, true);
    imageReplaceUploadForm?.reset();
    imageEditorForm.reset();
    if (imageEditorPreview) {
      imageEditorPreview.removeAttribute('src');
      imageEditorPreview.alt = 'Selected image preview';
    }
    return;
  }

  const field = ensureImageField(state.selectedImageTarget);
  if (!field) {
    return;
  }

  setFormDisabled(imageReplaceUploadForm, false);
  setFormDisabled(imageEditorForm, false);

  imageEditorSelected && (imageEditorSelected.textContent = `Selected: ${field.selector}`);
  setImageEditorField('src', field.src);
  setImageEditorField('altEn', field.alt.en);
  setImageEditorField('altPt', field.alt.pt);
  setImageEditorField('captionEn', field.caption?.en ?? '');
  setImageEditorField('captionPt', field.caption?.pt ?? '');
  setImageEditorField('attributionName', field.attributionName);
  setImageEditorField('attributionUrl', field.attributionUrl);
  setImageEditorField('licenseUrl', field.licenseUrl);

  if (imageEditorPreview) {
    imageEditorPreview.src = resolveAdminImageSrc(field.src);
    imageEditorPreview.alt = localeValue(field.alt);
  }
}

function toggleImageEditor(open: boolean): void {
  if (!imageEditorPanel) {
    return;
  }

  if (open) {
    closePanels(imageEditorPanel);
    showElement(imageEditorPanel);
    hydrateImageEditorForm();
    return;
  }

  hideElement(imageEditorPanel);
}

function applyImageFormChanges(): void {
  if (!state.workingState || !state.selectedImageTarget) {
    setStatus('Select an image before editing image details.');
    return;
  }

  const existing = ensureImageField(state.selectedImageTarget);
  if (!existing) {
    setStatus('Selected image could not be resolved.');
    return;
  }

  const nextCaptionEn = getImageEditorTextField('captionEn');
  const nextCaptionPt = getImageEditorTextField('captionPt');
  const nextCaption = nextCaptionEn || nextCaptionPt
    ? { en: nextCaptionEn, pt: nextCaptionPt }
    : undefined;

  const nextField = normalizeImageField({
    id: state.selectedImageTarget.id,
    selector: state.selectedImageTarget.selector,
    src: getImageEditorField('src'),
    alt: {
      en: getImageEditorTextField('altEn'),
      pt: getImageEditorTextField('altPt'),
    },
    attributionName: getImageEditorTextField('attributionName'),
    attributionUrl: getImageEditorField('attributionUrl'),
    licenseUrl: getImageEditorField('licenseUrl'),
    caption: nextCaption,
  });

  const changed = JSON.stringify(existing) !== JSON.stringify(nextField);
  if (!changed) {
    setStatus('Image details unchanged');
    return;
  }

  upsertImageField(nextField);
  applyCurrentState();
  hydrateImageEditorForm();
  markDirty('Image details updated');
}

function selectImageForEditing(element: HTMLImageElement): void {
  if (!state.workingState) {
    return;
  }

  const id = resolveCmsId(element, 'image');
  state.selectedImageTarget = {
    selector: selectorForId(id),
    id,
  };

  ensureImageField(state.selectedImageTarget);
  toggleImageEditor(true);
  setStatus('Image selected. Upload a replacement here or choose one from the image gallery.');
}

function findContextualImageCandidate(target: Element): HTMLImageElement | null {
  if (target instanceof HTMLImageElement && target.closest('main')) {
    return target;
  }

  let node: HTMLElement | null = target instanceof HTMLElement ? target : target.parentElement;
  while (node && node !== document.body) {
    if (!node.closest('main')) {
      node = node.parentElement;
      continue;
    }

    const images = Array.from(node.querySelectorAll('img')).filter(
      (image) => !image.closest('[data-admin-allow]'),
    );

    if (images.length === 0) {
      node = node.parentElement;
      continue;
    }

    const absoluteImage = images.find((image) => {
      const style = window.getComputedStyle(image);
      return style.position === 'absolute' || image.classList.contains('absolute');
    });

    return absoluteImage ?? images[0];
  }

  return null;
}

function setSeoField(name: string, value: string): void {
  if (!seoForm) {
    return;
  }

  const field = seoForm.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    field.value = value;
  }
}

function getSeoField(name: string): string {
  if (!seoForm) {
    return '';
  }

  const field = seoForm.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    return field.value.trim();
  }

  return '';
}

function getSeoTextField(name: string): string {
  return normalizeCmsText(getSeoField(name));
}

function hydrateSeoForm(): void {
  if (!seoForm || !state.workingState) {
    return;
  }

  const seoEn = state.workingState.page.seo.en;
  const seoPt = state.workingState.page.seo.pt;

  setSeoField('enTitle', seoEn.title);
  setSeoField('enDescription', seoEn.description);
  setSeoField('enOgTitle', seoEn.ogTitle);
  setSeoField('enOgDescription', seoEn.ogDescription);
  setSeoField('enOgImage', seoEn.ogImage);
  setSeoField('enCanonical', seoEn.canonical);

  setSeoField('ptTitle', seoPt.title);
  setSeoField('ptDescription', seoPt.description);
  setSeoField('ptOgTitle', seoPt.ogTitle);
  setSeoField('ptOgDescription', seoPt.ogDescription);
  setSeoField('ptOgImage', seoPt.ogImage);
  setSeoField('ptCanonical', seoPt.canonical);
}

function toggleSeoPanel(open: boolean): void {
  if (!seoPanel) {
    return;
  }

  if (open) {
    closePanels(seoPanel);
    showElement(seoPanel);
    hydrateSeoForm();
    return;
  }

  hideElement(seoPanel);
}

function applySeoFormChanges(): void {
  if (!state.workingState) {
    return;
  }

  const current = state.workingState.page.seo;

  const nextSeo: Record<Locale, CmsSeoLocale> = {
    en: {
      title: getSeoTextField('enTitle'),
      description: getSeoTextField('enDescription'),
      ogTitle: getSeoTextField('enOgTitle'),
      ogDescription: getSeoTextField('enOgDescription'),
      ogImage: getSeoField('enOgImage'),
      canonical: getSeoField('enCanonical'),
    },
    pt: {
      title: getSeoTextField('ptTitle'),
      description: getSeoTextField('ptDescription'),
      ogTitle: getSeoTextField('ptOgTitle'),
      ogDescription: getSeoTextField('ptOgDescription'),
      ogImage: getSeoField('ptOgImage'),
      canonical: getSeoField('ptCanonical'),
    },
  };

  if (JSON.stringify(current) === JSON.stringify(nextSeo)) {
    setStatus('SEO unchanged');
    return;
  }

  state.workingState.page.seo = nextSeo;
  applyCurrentState();
  markDirty('SEO updated');
}

function fillSeoCanonicalFromCurrentPath(): void {
  const path = window.location.pathname;

  if (!path) {
    return;
  }

  if (!getSeoField('enCanonical')) {
    setSeoField('enCanonical', path);
  }

  if (!getSeoField('ptCanonical')) {
    setSeoField('ptCanonical', path);
  }

  setStatus('Canonical fields filled where empty');
}

function hasForcedLogoutMarker(): boolean {
  try {
    return window.sessionStorage.getItem(LOGOUT_MARKER_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function setForcedLogoutMarker(): void {
  try {
    window.sessionStorage.setItem(LOGOUT_MARKER_STORAGE_KEY, '1');
  } catch {
    // Ignore storage failures in privacy-restricted contexts.
  }
}

function clearForcedLogoutMarker(): void {
  try {
    window.sessionStorage.removeItem(LOGOUT_MARKER_STORAGE_KEY);
  } catch {
    // Ignore storage failures in privacy-restricted contexts.
  }
}

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

function createPublicGalleryItem(src: string): CmsGalleryItem {
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

function upsertGalleryItem(item: CmsGalleryItem): void {
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

function replaceSelectedImage(options: {
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

  const response = await fetch('/api/admin/delete-image', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ src: item.src }),
  });

  const payload = await readApiPayload<{
    ok?: boolean;
    src?: string;
    commitSha?: string;
  }>(response);

  if (!response.ok || !payload.src || !state.workingState) {
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

function renderImageLibrary(): void {
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

function toggleImageLibrary(open: boolean): void {
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

function hydrateStateFromResponse(response: ContentResponse): void {
  const baseState: WorkingState = {
    page: normalizePageDocument(response.page),
    packages: normalizeServicePackageDocument(response.packages),
    blogPosts: response.blogPosts.map(normalizeBlogPost),
    baseSha: response.branchSha,
  };

  state.publishedState = deepClone(baseState);
  state.workingState = deepClone(baseState);
  state.authenticated = response.authenticated;
  state.globalGalleryItems = deepClone(response.galleryItems ?? []);
  state.selectedImageTarget = null;

  applyCurrentState();
  renderImageLibrary();
  renderBlogSelect();
  hydrateSeoForm();
  hydrateImageEditorForm();
  setDirty(false);
}

async function refreshContent(): Promise<void> {
  const response = await fetchContent();
  hydrateStateFromResponse(response);
  setBannerVisibility();
  updateActionAvailability();
}

async function syncBaseShaFromServer(): Promise<void> {
  const response = await fetchContent();
  if (state.workingState) {
    state.workingState.baseSha = response.branchSha;
  }
  if (state.publishedState) {
    state.publishedState.baseSha = response.branchSha;
  }
}

async function publishChanges(): Promise<void> {
  if (!state.workingState || state.isBusy) {
    return;
  }

  finalizeActiveTextEdit();
  setStatus('Publishing changes...');
  setBusy(true);

  try {
    const response = await fetch('/api/admin/publish', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pages: [state.workingState.page],
        packages: state.workingState.packages,
        blogPosts: state.workingState.blogPosts,
        baseSha: state.workingState.baseSha,
      }),
    });

    const payload = await readApiPayload<{ commitSha?: string; warnings?: string[] }>(response);

    if (response.status === 409) {
      // The site changed since this session loaded. Keep the in-flight edits and
      // re-sync only the base commit so the next Publish click can succeed.
      await syncBaseShaFromServer();
      setStatus('Publish conflict: the site changed since you loaded. Your edits are kept — click Publish again to retry.');
      return;
    }

    if (!response.ok) {
      setStatus(payload.error ?? 'Publish failed');
      return;
    }

    const warnings = payload.warnings ?? [];
    if (warnings.length > 0) {
      for (const warning of warnings) {
        console.warn(`[cms publish] ${warning}`);
      }
      setStatus(`Published ${payload.commitSha ?? ''}`.trim() + ` — ${warnings.length} translation warning(s), see console.`);
    } else {
      setStatus(`Published ${payload.commitSha ?? ''}`.trim());
    }

    await refreshContent();
  } finally {
    setBusy(false);
  }
}

async function uploadImage(
  formData: FormData,
  options: {
    applyToSelected?: boolean;
  } = {},
): Promise<void> {
  if (state.isBusy) {
    return;
  }

  const uploadedFile = formData.get('file');
  setBusy(true);
  try {
    const response = await fetch('/api/admin/upload-image', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const payload = await readApiPayload<{
      ok?: boolean;
      src?: string;
      commitSha?: string;
    }>(response);

    if (!response.ok || !payload.src || !state.workingState) {
      setStatus(payload.error ?? 'Image upload failed');
      return;
    }

    if (uploadedFile instanceof File && uploadedFile.size > 0) {
      setPendingAdminImagePreview(payload.src, uploadedFile);
    }

    upsertGalleryItem(createPublicGalleryItem(payload.src));

    if (payload.commitSha) {
      state.workingState.baseSha = payload.commitSha;
      if (state.publishedState) {
        state.publishedState.baseSha = payload.commitSha;
      }
    }

    if (options.applyToSelected) {
      const replaced = replaceSelectedImage({ src: payload.src });
      if (!replaced) {
        // The preview blob will never be shown, so don't leak it.
        clearPendingAdminImagePreview(payload.src);
        setStatus('Image uploaded. Choose a selected page image before replacing it.');
        renderImageLibrary();
        return;
      }

      setDirty(true);
      renderImageLibrary();
      setStatus('Image uploaded and applied. Publish to save the page reference.');
      return;
    }

    renderImageLibrary();
    setStatus('Image uploaded. It is ready in the gallery and preview uses the local file until deploy finishes.');
  } finally {
    setBusy(false);
  }
}

async function logout(): Promise<void> {
  state.suppressBeforeUnloadPrompt = true;
  setForcedLogoutMarker();

  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      keepalive: true,
    });
  } catch {
    // Keep local logout state even if request fails.
  } finally {
    state.suppressBeforeUnloadPrompt = false;
  }

  state.authenticated = false;
  disableEditMode();
  closePanels();
  setBannerVisibility();
  setDirty(false);
  updateActionAvailability();
  setStatus('Logged out');
}

function discardChanges(): void {
  if (!state.publishedState) {
    return;
  }

  finalizeActiveTextEdit();
  state.workingState = deepClone(state.publishedState);
  state.selectedImageTarget = null;
  applyCurrentState();
  renderImageLibrary();
  renderBlogSelect();
  hydrateSeoForm();
  hydrateImageEditorForm();
  setDirty(false);
  setStatus('All unpublished changes discarded');
}

function handleEditClick(event: MouseEvent): void {
  if (!state.editMode) {
    return;
  }

  const target = event.target instanceof Element ? event.target : null;
  if (!target || isAdminControl(target)) {
    return;
  }

  const image = target.closest('img');
  if (image instanceof HTMLImageElement && image.closest('main')) {
    event.preventDefault();
    event.stopPropagation();
    selectImageForEditing(image);
    return;
  }

  if (isPanelOpen(imageEditorPanel)) {
    const contextualImage = findContextualImageCandidate(target);
    if (contextualImage) {
      event.preventDefault();
      event.stopPropagation();
      selectImageForEditing(contextualImage);
      return;
    }
  }

  const textElement = findEditableTextElement(target);
  if (textElement) {
    event.preventDefault();
    event.stopPropagation();
    beginTextEdit(textElement);
    return;
  }

  const clickable = target.closest('a,button');
  if (clickable instanceof HTMLElement && clickable.closest('main')) {
    event.preventDefault();
    event.stopPropagation();
    editLink(clickable);
    return;
  }
}

function lockNavigation(event: MouseEvent): void {
  if (!state.editMode) {
    return;
  }

  const target = event.target instanceof Element ? event.target : null;
  if (!target || isAdminControl(target)) {
    return;
  }

  if (target.closest('a,button,[role="button"]')) {
    event.preventDefault();
  }
}

function lockFormSubmit(event: SubmitEvent): void {
  if (!state.editMode) {
    return;
  }

  const target = event.target instanceof Element ? event.target : null;
  if (!target || isAdminControl(target)) {
    return;
  }

  event.preventDefault();
}

function bindAuthUI(): void {
  document.querySelectorAll<HTMLElement>('[data-cms-open-login]').forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      if (state.authenticated) {
        setStatus('Already authenticated');
        return;
      }
      openLoginModal();
    });
  });

  loginCancel?.addEventListener('click', () => {
    closeLoginModal();
  });

  loginModal?.addEventListener('click', (event) => {
    if (event.target === loginModal) {
      closeLoginModal();
    }
  });

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = loginForm;
    if (!form) {
      return;
    }

    const formData = new FormData(form);
    const password = String(formData.get('password') ?? '');
    const ok = await login(password);

    if (!ok) {
      loginError?.classList.remove('cms-hidden');
      return;
    }

    clearForcedLogoutMarker();
    state.authenticated = true;
    closeLoginModal();
    setBannerVisibility();
    updateActionAvailability();
    setStatus('Logged in');
    await refreshContent();

    if (isMediaPage) {
      toggleImageLibrary(true);
    }
  });
}

function bindBannerUI(): void {
  toggleModeButton?.addEventListener('click', () => {
    toggleEditMode();
  });

  discardChangesButton?.addEventListener('click', () => {
    if (!state.hasUnsavedChanges) {
      setStatus('Nothing to discard');
      return;
    }

    const confirmed = window.confirm('Discard all unpublished changes?');
    if (!confirmed) {
      return;
    }

    discardChanges();
  });

  editSeoButton?.addEventListener('click', () => {
    const open = !isPanelOpen(seoPanel);
    toggleSeoPanel(open);
  });

  openImageEditorButton?.addEventListener('click', () => {
    const open = !isPanelOpen(imageEditorPanel);
    toggleImageEditor(open);
    if (open && !state.selectedImageTarget) {
      setStatus('Click an image in edit mode to load it into the editor.');
    }
  });

  openImageLibraryButton?.addEventListener('click', () => {
    const open = !isPanelOpen(imageLibraryPanel);
    toggleImageLibrary(open);
  });

  openBlogManagerButton?.addEventListener('click', () => {
    const open = !isPanelOpen(blogManagerPanel);
    toggleBlogManager(open);
  });

  publishButton?.addEventListener('click', async () => {
    await publishChanges();
  });

  logoutButton?.addEventListener('click', async () => {
    await logout();
  });
}

function bindSeoUI(): void {
  seoClose?.addEventListener('click', () => {
    toggleSeoPanel(false);
  });

  seoFillCanonicalButton?.addEventListener('click', () => {
    fillSeoCanonicalFromCurrentPath();
  });

  seoForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    applySeoFormChanges();
  });
}

function bindImageEditorUI(): void {
  imageEditorClose?.addEventListener('click', () => {
    toggleImageEditor(false);
  });

  imageEditorOpenLibraryButton?.addEventListener('click', () => {
    toggleImageLibrary(true);
  });

  imageReplaceUploadForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = imageReplaceUploadForm;
    if (!form) {
      return;
    }
    const data = new FormData(form);
    await uploadImage(data, { applyToSelected: true });
    form.reset();
  });

  imageEditorForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    applyImageFormChanges();
  });
}

function bindImageLibraryUI(): void {
  imageLibraryClose?.addEventListener('click', () => {
    toggleImageLibrary(false);
  });

  imageLibrarySearch?.addEventListener('input', () => {
    renderImageLibrary();
  });

  imageUploadForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = imageUploadForm;
    if (!form) {
      return;
    }
    const data = new FormData(form);
    await uploadImage(data);
    form.reset();
  });
}

function bindBlogManagerUI(): void {
  blogManagerClose?.addEventListener('click', () => {
    toggleBlogManager(false);
  });

  blogSelect?.addEventListener('change', () => {
    hydrateBlogForm();
  });

  blogForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    applyBlogFormChanges();
  });

  blogNewButton?.addEventListener('click', () => {
    if (!state.workingState) {
      return;
    }

    const post = createEmptyBlogPost();
    state.workingState.blogPosts.unshift(post);
    renderBlogSelect(post.id);
    markDirty('Created new post');
  });

  blogDuplicateButton?.addEventListener('click', () => {
    if (!state.workingState) {
      return;
    }

    const selected = findSelectedBlogPost();
    if (!selected) {
      return;
    }

    const clone = deepClone(selected);
    clone.id = `copy-${Date.now()}`;
    clone.slug = `${selected.slug}-copy`;
    clone.status = 'draft';
    clone.updatedAt = nowIso();

    state.workingState.blogPosts.unshift(clone);
    renderBlogSelect(clone.id);
    markDirty('Post duplicated');
  });

  blogDeleteButton?.addEventListener('click', () => {
    if (!state.workingState) {
      return;
    }

    const selected = findSelectedBlogPost();
    if (!selected) {
      return;
    }

    const shouldDelete = window.confirm(`Delete post \"${selected.slug}\"?`);
    if (!shouldDelete) {
      return;
    }

    state.workingState.blogPosts = state.workingState.blogPosts.filter((post) => post.id !== selected.id);
    renderBlogSelect();
    markDirty('Post deleted');
  });
}

function bindUnloadGuard(): void {
  window.addEventListener('beforeunload', (event) => {
    if (!state.hasUnsavedChanges || state.suppressBeforeUnloadPrompt) {
      return;
    }

    event.preventDefault();
    event.returnValue = '';
  });

  window.addEventListener('pagehide', () => {
    clearAllPendingAdminImagePreviews();
  }, { once: true });
}

async function boot(): Promise<void> {
  bindAuthUI();
  bindBannerUI();
  bindSeoUI();
  bindImageEditorUI();
  bindImageLibraryUI();
  bindBlogManagerUI();
  bindUnloadGuard();

  if (banner && typeof ResizeObserver === 'function') {
    state.bannerResizeObserver = new ResizeObserver(() => {
      syncBannerOffset();
    });

    state.bannerResizeObserver.observe(banner);
  }

  document.addEventListener('click', lockNavigation, true);
  document.addEventListener('submit', lockFormSubmit, true);
  document.addEventListener('click', handleEditClick, true);

  const forceLoggedOut = hasForcedLogoutMarker();
  state.authenticated = forceLoggedOut ? false : await checkSession();

  if (state.authenticated) {
    clearForcedLogoutMarker();
    const content = await fetchContent();
    hydrateStateFromResponse(content);

    if (isMediaPage) {
      toggleImageLibrary(true);
    }
  }

  setBannerVisibility();
  updateModeLabel();
  updateDirtyIndicator();
  updateActionAvailability();

  if (!state.authenticated) {
    setStatus('Public view');
    if (isMediaPage) {
      openLoginModal();
    }
  }
}

void boot();
