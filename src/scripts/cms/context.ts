import { adHocId, type CmsFieldKind } from '../../cms/cms-keys';
import { normalizeCmsText } from '../../cms/text-normalization';
import type { Locale, LocaleText } from './types';

const root = document.querySelector<HTMLDivElement>('#cms-admin-root');
if (!root) {
  throw new Error('CMS admin root not found');
}

export const pageId = root.dataset.pageId ?? 'home';
export const locale = (root.dataset.locale ?? 'en') as Locale;
export const isBlogPage = root.dataset.isBlogPage === 'true';
export const isMediaPage = window.location.pathname === '/admin/images';

export function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function localeValue(value: LocaleText): string {
  return value[locale] || value.en || '';
}

export function normalizeTextInput(value: string): string {
  return normalizeCmsText(value.trim());
}

export function setLocaleValue(value: LocaleText, nextValue: string): LocaleText {
  return {
    ...value,
    [locale]: nextValue,
  };
}

function structuralSeed(element: Element): string {
  const parts: string[] = [];
  let node: Element | null = element;

  while (node && node !== document.body) {
    const currentNode: Element = node;
    const parentElement: HTMLElement | null = currentNode.parentElement;
    if (!parentElement) {
      break;
    }

    const tag = currentNode.tagName.toLowerCase();
    const sameTagSiblings = Array.from(parentElement.children) as Element[];
    const index = sameTagSiblings.filter((child) => child.tagName === currentNode.tagName).indexOf(currentNode) + 1;
    parts.unshift(`${tag}:nth-of-type(${index})`);

    if (parentElement.matches('main')) {
      parts.unshift('main');
      break;
    }

    node = parentElement;
  }

  return parts.join(' > ');
}

/**
 * Resolve the canonical `data-cms-id` for an element being edited. Authored
 * elements already carry one and we MUST reuse it (recomputing was the root
 * cause of orphaned fields). Truly ad-hoc elements get a deterministic id that
 * is stamped onto the DOM so subsequent edits reuse it instead of re-deriving.
 */
export function resolveCmsId(element: HTMLElement, kind: CmsFieldKind): string {
  const existing = element.dataset.cmsId;
  if (existing) {
    return existing;
  }

  const id = adHocId(kind, structuralSeed(element));
  element.dataset.cmsId = id;
  return id;
}
