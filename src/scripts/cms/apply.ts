import { renderMarkdown } from '../../cms/markdown-core';
import { locale, localeValue } from './context';
import { fallbackWarning, integrityWarning } from './dom';
import { isSharedOwnedElement } from './editable-dom';
import { readSharedPackageFieldValue } from './fields';
import { resolveAdminImageSrc } from './preview-images';
import { notifyStateApplied, state } from './store';
import type {
  CmsPageDocument,
  CmsServicePackageDocument,
  CmsServicePackageField,
  CmsServicePackageKey,
  LocaleText,
} from './types';

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
