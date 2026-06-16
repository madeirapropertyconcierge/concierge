import { locale } from './context';
import { fallbackWarning, integrityWarning } from './dom';
import { state } from './store';
import type { CmsPageDocument } from './types';

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

export { updateFallbackWarning, updateIntegrityWarning };
