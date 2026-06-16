import { normalizeCmsText } from '../../cms/text-normalization';
import { applyCurrentState } from './apply';
import { markDirty } from './banner-ui';
import { deepClone, locale } from './context';
import {
  closePanels,
  hideElement,
  seoCopyEnButton,
  seoForm,
  seoLocaleTabs,
  seoPanel,
  showElement,
} from './dom';
import { toggleImageLibrary } from './gallery';
import { resolveAdminImageSrc } from './preview-images';
import { state } from './store';
import type { CmsSeoLocale, Locale } from './types';

/** Soft character targets used by the friendly inline counters. */
const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

type SeoFieldName = keyof CmsSeoLocale;

const SEO_FIELD_NAMES: SeoFieldName[] = [
  'title',
  'description',
  'ogTitle',
  'ogDescription',
  'ogImage',
  'canonical',
];

function emptySeoLocale(): CmsSeoLocale {
  return { title: '', description: '', ogTitle: '', ogDescription: '', ogImage: '', canonical: '' };
}

/**
 * Working copy of both locales while the panel is open. The form only ever
 * shows one locale at a time; switching tabs flushes the visible inputs into
 * this draft and reloads the other locale, so unsaved edits in the hidden
 * locale survive until everything commits on "Apply".
 */
let seoDraft: Record<Locale, CmsSeoLocale> = { en: emptySeoLocale(), pt: emptySeoLocale() };
let activeSeoLocale: Locale = locale;

// Live-preview + counter nodes (cached once; this module loads after the DOM).
const pvUrl = document.querySelector<HTMLElement>('#cms-seo-pv-url');
const pvTitle = document.querySelector<HTMLElement>('#cms-seo-pv-title');
const pvDesc = document.querySelector<HTMLElement>('#cms-seo-pv-desc');
const pvOgImage = document.querySelector<HTMLImageElement>('#cms-seo-pv-ogimage');
const pvOgHost = document.querySelector<HTMLElement>('#cms-seo-pv-oghost');
const pvOgTitle = document.querySelector<HTMLElement>('#cms-seo-pv-ogtitle');
const pvOgDesc = document.querySelector<HTMLElement>('#cms-seo-pv-ogdesc');
const socialPreview = document.querySelector<HTMLElement>('#cms-seo-preview-social');
const seoStatus = document.querySelector<HTMLElement>('#cms-seo-status');

const counters: Record<'title' | 'description' | 'ogTitle', HTMLElement | null> = {
  title: document.querySelector<HTMLElement>('#cms-seo-count-title'),
  description: document.querySelector<HTMLElement>('#cms-seo-count-description'),
  ogTitle: document.querySelector<HTMLElement>('#cms-seo-count-ogTitle'),
};

function setSeoStatus(message: string): void {
  if (seoStatus) {
    seoStatus.textContent = message;
  }
}

function getInput(name: SeoFieldName): HTMLInputElement | HTMLTextAreaElement | null {
  const field = seoForm?.elements.namedItem(name);
  if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) {
    return field;
  }
  return null;
}

function captureActiveLocaleIntoDraft(): void {
  const target = seoDraft[activeSeoLocale];
  for (const name of SEO_FIELD_NAMES) {
    const input = getInput(name);
    if (input) {
      target[name] = input.value;
    }
  }
}

function loadActiveLocaleIntoForm(): void {
  const source = seoDraft[activeSeoLocale];
  for (const name of SEO_FIELD_NAMES) {
    const input = getInput(name);
    if (input) {
      input.value = source[name];
    }
  }
  refreshSeoUi();
}

function fallbackTitle(): string {
  return document.title.trim();
}

function fallbackDescription(): string {
  return document.querySelector<HTMLMetaElement>('meta[name="description"]')?.content.trim() ?? '';
}

function previewUrl(canonical: string): string {
  const host = window.location.host;
  const raw = canonical.trim() || window.location.pathname;

  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      return (`${url.host}${url.pathname}`.replace(/\/$/, '') || url.host);
    } catch {
      return raw;
    }
  }

  const path = raw.startsWith('/') ? raw : `/${raw}`;
  return (`${host}${path}`.replace(/\/$/, '') || host);
}

function setCounter(name: 'title' | 'description' | 'ogTitle', length: number, max: number): void {
  const element = counters[name];
  if (!element) {
    return;
  }

  element.classList.remove('cms-count-good', 'cms-count-over');

  if (length === 0) {
    element.textContent = '';
    return;
  }

  element.textContent = `${length} / ${max}`;
  element.classList.add(length > max ? 'cms-count-over' : 'cms-count-good');
}

function updateCounters(): void {
  const draft = seoDraft[activeSeoLocale];
  setCounter('title', draft.title.trim().length, TITLE_MAX);
  setCounter('description', draft.description.trim().length, DESCRIPTION_MAX);
  setCounter('ogTitle', draft.ogTitle.trim().length, TITLE_MAX);
}

function updatePreviews(): void {
  const draft = seoDraft[activeSeoLocale];

  const title = draft.title.trim() || fallbackTitle() || 'Page title';
  const description =
    draft.description.trim() || fallbackDescription() || 'Your search description will appear here.';

  if (pvUrl) {
    pvUrl.textContent = previewUrl(draft.canonical);
  }
  if (pvTitle) {
    pvTitle.textContent = title;
  }
  if (pvDesc) {
    pvDesc.textContent = description;
  }

  const ogTitle = draft.ogTitle.trim() || draft.title.trim() || fallbackTitle() || 'Page title';
  const ogDescription = draft.ogDescription.trim() || draft.description.trim() || fallbackDescription() || '';
  const ogImage = draft.ogImage.trim();

  if (pvOgHost) {
    pvOgHost.textContent = window.location.host;
  }
  if (pvOgTitle) {
    pvOgTitle.textContent = ogTitle;
  }
  if (pvOgDesc) {
    pvOgDesc.textContent = ogDescription;
  }
  if (socialPreview && pvOgImage) {
    if (ogImage) {
      pvOgImage.src = resolveAdminImageSrc(ogImage);
      socialPreview.classList.remove('cms-social-noimg');
    } else {
      pvOgImage.removeAttribute('src');
      socialPreview.classList.add('cms-social-noimg');
    }
  }
}

function refreshSeoUi(): void {
  updateCounters();
  updatePreviews();
}

function updateTabUi(): void {
  for (const tab of seoLocaleTabs) {
    const isActive = tab.dataset.seoLocale === activeSeoLocale;
    tab.classList.toggle('cms-tab-active', isActive);
    tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
  }

  // "Copy from English" only makes sense while editing the Portuguese locale.
  seoCopyEnButton?.classList.toggle('cms-hidden', activeSeoLocale !== 'pt');
}

export function hydrateSeoForm(): void {
  if (!seoForm || !state.workingState) {
    return;
  }

  seoDraft = {
    en: deepClone(state.workingState.page.seo.en),
    pt: deepClone(state.workingState.page.seo.pt),
  };

  loadActiveLocaleIntoForm();
  updateTabUi();
}

function showSeoElement(): void {
  if (!seoPanel) {
    return;
  }
  closePanels(seoPanel);
  showElement(seoPanel);
}

export function toggleSeoPanel(open: boolean): void {
  if (!seoPanel) {
    return;
  }

  if (open) {
    activeSeoLocale = locale;
    showSeoElement();
    hydrateSeoForm();
    setSeoStatus('');
    return;
  }

  hideElement(seoPanel);
}

export function switchSeoLocale(nextLocale: Locale): void {
  if (nextLocale === activeSeoLocale) {
    return;
  }

  captureActiveLocaleIntoDraft();
  activeSeoLocale = nextLocale;
  loadActiveLocaleIntoForm();
  updateTabUi();
}

export function handleSeoFieldInput(): void {
  captureActiveLocaleIntoDraft();
  refreshSeoUi();
}

export function copySeoFromEnglish(): void {
  captureActiveLocaleIntoDraft();

  let filled = 0;
  for (const name of SEO_FIELD_NAMES) {
    if (!seoDraft.pt[name].trim() && seoDraft.en[name].trim()) {
      seoDraft.pt[name] = seoDraft.en[name];
      filled += 1;
    }
  }

  if (activeSeoLocale === 'pt') {
    loadActiveLocaleIntoForm();
  }

  setSeoStatus(
    filled > 0
      ? `Filled ${filled} empty field${filled === 1 ? '' : 's'} from English.`
      : 'Nothing to copy — Portuguese is already filled.',
  );
}

export function beginOgImagePick(): void {
  captureActiveLocaleIntoDraft();

  state.galleryPickHandler = (src) => {
    if (src) {
      seoDraft[activeSeoLocale].ogImage = src;
    }
    showSeoElement();
    loadActiveLocaleIntoForm();
    setSeoStatus(src ? 'Social image set — Apply SEO changes to save.' : 'Picked nothing — social image unchanged.');
  };

  setSeoStatus('Pick a social image from the gallery…');
  toggleImageLibrary(true);
}

export function clearSeoOgImage(): void {
  seoDraft[activeSeoLocale].ogImage = '';
  const input = getInput('ogImage');
  if (input) {
    input.value = '';
  }
  refreshSeoUi();
  setSeoStatus('Social image cleared — Apply SEO changes to save.');
}

function normalizeSeoLocale(value: CmsSeoLocale): CmsSeoLocale {
  return {
    title: normalizeCmsText(value.title.trim()),
    description: normalizeCmsText(value.description.trim()),
    ogTitle: normalizeCmsText(value.ogTitle.trim()),
    ogDescription: normalizeCmsText(value.ogDescription.trim()),
    ogImage: value.ogImage.trim(),
    canonical: value.canonical.trim(),
  };
}

export function applySeoFormChanges(): void {
  if (!state.workingState) {
    return;
  }

  captureActiveLocaleIntoDraft();

  const current = state.workingState.page.seo;
  const nextSeo: Record<Locale, CmsSeoLocale> = {
    en: normalizeSeoLocale(seoDraft.en),
    pt: normalizeSeoLocale(seoDraft.pt),
  };

  if (JSON.stringify(current) === JSON.stringify(nextSeo)) {
    setSeoStatus('No changes to apply.');
    return;
  }

  state.workingState.page.seo = nextSeo;
  applyCurrentState();
  markDirty('SEO updated');
  setSeoStatus('SEO applied. Publish to make it live.');
}

export function fillSeoCanonicalFromCurrentPath(): void {
  const path = window.location.pathname;
  if (!path) {
    return;
  }

  captureActiveLocaleIntoDraft();

  if (seoDraft[activeSeoLocale].canonical.trim()) {
    setSeoStatus('Canonical URL is already set.');
    return;
  }

  seoDraft[activeSeoLocale].canonical = path;
  loadActiveLocaleIntoForm();
  setSeoStatus(`Canonical set to ${path} — Apply SEO changes to save.`);
}
