import {
  normalizeImageField,
  normalizeLinkField,
  normalizeTextField,
} from '../../cms/content-normalization';
import { locale, localeValue, setLocaleValue } from './context';
import { state } from './store';
import type {
  CmsImageField,
  CmsLinkField,
  CmsServicePackageEntry,
  CmsServicePackageField,
  CmsServicePackageKey,
  CmsTextField,
  Locale,
} from './types';

export function upsertTextField(field: CmsTextField): void {
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

export function upsertLinkField(field: CmsLinkField): void {
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

export function upsertImageField(field: CmsImageField): void {
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

export function findServicePackageEntry(key: CmsServicePackageKey): CmsServicePackageEntry | null {
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

export function readSharedPackageFieldValue(
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

export function writeSharedPackageFieldValue(
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
