import { applyCurrentState } from './apply';
import { markDirty } from './banner-ui';
import { closePanels, hideElement, seoForm, seoPanel, setStatus, showElement } from './dom';
import { getFormFieldText, getFormFieldValue, setFormFieldValue } from './form-fields';
import { state } from './store';
import type { CmsSeoLocale, Locale } from './types';

function setSeoField(name: string, value: string): void {
  setFormFieldValue(seoForm, name, value);
}

function getSeoField(name: string): string {
  return getFormFieldValue(seoForm, name);
}

function getSeoTextField(name: string): string {
  return getFormFieldText(seoForm, name);
}

export function hydrateSeoForm(): void {
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

export function toggleSeoPanel(open: boolean): void {
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

export function applySeoFormChanges(): void {
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

export function fillSeoCanonicalFromCurrentPath(): void {
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
