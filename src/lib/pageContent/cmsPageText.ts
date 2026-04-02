import { loadPageDocument } from '../../cms/content-loader';
import type { CmsTextField } from '../../cms/schema';
import type { Locale } from '../../i18n/utils';

export interface CmsPageTextValue {
  id: string;
  selector: string;
  kind: CmsTextField['kind'];
  value: string;
}

function resolveRequiredTextField(
  fields: CmsTextField[],
  id: string,
  locale: Locale,
  pageId: string,
): CmsPageTextValue {
  const field = fields.find((entry) => entry.id === id);
  if (!field) {
    throw new Error(`Missing required CMS text "${id}" on page "${pageId}"`);
  }

  const value = field.value[locale].trim();
  if (!value) {
    throw new Error(`Missing required ${locale} CMS text "${id}" on page "${pageId}"`);
  }

  return {
    id: field.id,
    selector: field.selector,
    kind: field.kind,
    value,
  };
}

export async function loadRequiredPageText(
  pageId: string,
  id: string,
  locale: Locale,
): Promise<CmsPageTextValue> {
  const page = await loadPageDocument(pageId);
  return resolveRequiredTextField(page.texts, id, locale, pageId);
}

export async function loadRequiredPageTexts<const T extends readonly string[]>(
  pageId: string,
  ids: T,
  locale: Locale,
): Promise<Record<T[number], CmsPageTextValue>> {
  const page = await loadPageDocument(pageId);

  return Object.fromEntries(
    ids.map((id) => [id, resolveRequiredTextField(page.texts, id, locale, pageId)]),
  ) as Record<T[number], CmsPageTextValue>;
}
