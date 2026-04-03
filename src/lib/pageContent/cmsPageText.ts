import { loadPageDocument } from '../../cms/content-loader';
import type { CmsImageField, CmsLinkField, CmsTextField } from '../../cms/schema';
import type { Locale } from '../../i18n/utils';

export interface CmsPageTextValue {
  id: string;
  selector: string;
  kind: CmsTextField['kind'];
  value: string;
}

export interface CmsPageLinkValue {
  id: string;
  selector: string;
  label: string;
  href: string;
}

export interface CmsPageImageValue {
  id: string;
  selector: string;
  src: string;
  alt: string;
  caption?: string;
}

function resolveRequiredLocaleValue(
  value: { en: string; pt: string },
  locale: Locale,
  pageId: string,
  id: string,
  fieldLabel: string,
): string {
  const resolved = value[locale].trim();
  if (!resolved) {
    throw new Error(`Missing required ${locale} CMS ${fieldLabel} "${id}" on page "${pageId}"`);
  }

  return resolved;
}

function resolveRequiredTextField(
  fields: readonly CmsTextField[],
  id: string,
  locale: Locale,
  pageId: string,
): CmsPageTextValue {
  const field = fields.find((entry) => entry.id === id);
  if (!field) {
    throw new Error(`Missing required CMS text "${id}" on page "${pageId}"`);
  }

  return {
    id: field.id,
    selector: field.selector,
    kind: field.kind,
    value: resolveRequiredLocaleValue(field.value, locale, pageId, id, 'text'),
  };
}

function resolveRequiredLinkField(
  fields: readonly CmsLinkField[],
  id: string,
  locale: Locale,
  pageId: string,
): CmsPageLinkValue {
  const field = fields.find((entry) => entry.id === id);
  if (!field) {
    throw new Error(`Missing required CMS link "${id}" on page "${pageId}"`);
  }

  return {
    id: field.id,
    selector: field.selector,
    label: resolveRequiredLocaleValue(field.label, locale, pageId, id, 'link label'),
    href: resolveRequiredLocaleValue(field.href, locale, pageId, id, 'link href'),
  };
}

function resolveRequiredImageField(
  fields: readonly CmsImageField[],
  id: string,
  locale: Locale,
  pageId: string,
): CmsPageImageValue {
  const field = fields.find((entry) => entry.id === id);
  if (!field) {
    throw new Error(`Missing required CMS image "${id}" on page "${pageId}"`);
  }

  return {
    id: field.id,
    selector: field.selector,
    src: field.src,
    alt: resolveRequiredLocaleValue(field.alt, locale, pageId, id, 'image alt'),
    caption: field.caption?.[locale].trim() || undefined,
  };
}

export async function loadRequiredPageFields<
  const TTexts extends readonly string[] = [],
  const TLinks extends readonly string[] = [],
  const TImages extends readonly string[] = [],
>(
  pageId: string,
  locale: Locale,
  {
    texts = [] as unknown as TTexts,
    links = [] as unknown as TLinks,
    images = [] as unknown as TImages,
  }: {
    texts?: TTexts;
    links?: TLinks;
    images?: TImages;
  } = {},
): Promise<{
  texts: Record<TTexts[number], CmsPageTextValue>;
  links: Record<TLinks[number], CmsPageLinkValue>;
  images: Record<TImages[number], CmsPageImageValue>;
}> {
  const page = await loadPageDocument(pageId);

  return {
    texts: Object.fromEntries(
      texts.map((id) => [id, resolveRequiredTextField(page.texts, id, locale, pageId)]),
    ) as Record<TTexts[number], CmsPageTextValue>,
    links: Object.fromEntries(
      links.map((id) => [id, resolveRequiredLinkField(page.links, id, locale, pageId)]),
    ) as Record<TLinks[number], CmsPageLinkValue>,
    images: Object.fromEntries(
      images.map((id) => [id, resolveRequiredImageField(page.images, id, locale, pageId)]),
    ) as Record<TImages[number], CmsPageImageValue>,
  };
}

export async function loadRequiredPageText(
  pageId: string,
  id: string,
  locale: Locale,
): Promise<CmsPageTextValue> {
  const fields = await loadRequiredPageFields(pageId, locale, { texts: [id] as const });
  return fields.texts[id];
}

export async function loadRequiredPageTexts<const T extends readonly string[]>(
  pageId: string,
  ids: T,
  locale: Locale,
): Promise<Record<T[number], CmsPageTextValue>> {
  const fields = await loadRequiredPageFields(pageId, locale, { texts: ids });
  return fields.texts;
}

export async function loadRequiredPageLinks<const T extends readonly string[]>(
  pageId: string,
  ids: T,
  locale: Locale,
): Promise<Record<T[number], CmsPageLinkValue>> {
  const fields = await loadRequiredPageFields(pageId, locale, { links: ids });
  return fields.links;
}

export async function loadRequiredPageImages<const T extends readonly string[]>(
  pageId: string,
  ids: T,
  locale: Locale,
): Promise<Record<T[number], CmsPageImageValue>> {
  const fields = await loadRequiredPageFields(pageId, locale, { images: ids });
  return fields.images;
}
