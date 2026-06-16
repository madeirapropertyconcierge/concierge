import { renderMarkdown } from '../../cms/markdown-core';
import { locale, localeValue } from './context';
import { isSharedOwnedElement, linkOwnsLabel } from './editable-dom';
import { readSharedPackageFieldValue } from './fields';
import { resolveAdminImageSrc } from './preview-images';
import { updateSeoPreview } from './seo-preview';
import { notifyStateApplied, state } from './store';
import type {
  CmsPageDocument,
  CmsServicePackageDocument,
  CmsServicePackageField,
  CmsServicePackageKey,
  LocaleText,
} from './types';
import { updateFallbackWarning, updateIntegrityWarning } from './warnings';

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

      const ownsLabel = linkOwnsLabel(element);

      if (element instanceof HTMLAnchorElement) {
        element.href = targetHref;
        if (ownsLabel) {
          element.innerHTML = renderedLabel;
        }
      } else {
        element.setAttribute('data-cms-href', targetHref);
        if (ownsLabel) {
          element.textContent = labelText;
        }

        if (element instanceof HTMLButtonElement && !element.closest('form')) {
          element.type = 'button';
          element.onclick = () => {
            window.location.href = targetHref;
          };
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

export function applyCurrentState(): void {
  if (!state.workingState) {
    return;
  }

  applyServicePackageDocument(state.workingState.packages);
  applyPageDocument(state.workingState.page);
  updateFallbackWarning(state.workingState.page);
  updateIntegrityWarning(state.workingState.page);
  updateSeoPreview(state.workingState.page);

  // Open panels re-hydrate themselves via their store subscriptions.
  notifyStateApplied();
}
