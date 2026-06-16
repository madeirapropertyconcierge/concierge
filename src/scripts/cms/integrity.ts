/**
 * Content-integrity helpers that depend on the live DOM, so they live in the
 * browser bundle (unlike the pure helpers in `src/cms/content-integrity.ts`).
 */

import { listPageFields } from '../../cms/content-integrity';
import type { CmsFieldRef } from '../../cms/content-integrity';
import type { CmsPageDocument } from './types';

function selectorMatchesNothing(selector: string): boolean {
  try {
    return document.querySelectorAll(selector).length === 0;
  } catch {
    // An unusable selector cannot match anything, so it is orphaned.
    return true;
  }
}

/**
 * Stored fields whose selector matches no element on the current page (or whose
 * selector is invalid). These are the "orphaned fields" surfaced by the banner:
 * leftover content that no element on the page can bind to.
 */
export function findOrphanFields(page: CmsPageDocument): CmsFieldRef[] {
  return listPageFields(page).filter((field) => selectorMatchesNothing(field.selector));
}

/**
 * Drop every orphaned field from the page document in place and report how many
 * were removed. Orphan-ness is re-evaluated against the live DOM here so the
 * removal always matches exactly what `findOrphanFields` reports — never a
 * still-bound field that happens to share an id with an orphan.
 */
export function removeOrphanFields(page: CmsPageDocument): number {
  const before = page.texts.length + page.links.length + page.images.length;

  page.texts = page.texts.filter((field) => !selectorMatchesNothing(field.selector));
  page.links = page.links.filter((field) => !selectorMatchesNothing(field.selector));
  page.images = page.images.filter((field) => !selectorMatchesNothing(field.selector));

  return before - (page.texts.length + page.links.length + page.images.length);
}
