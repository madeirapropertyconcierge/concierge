import { selectorForId } from './cms-keys';
import type { CmsPageDocument } from './schema';

export interface CmsFieldRef {
  id: string;
  selector: string;
  group: 'texts' | 'links' | 'images';
}

export function listPageFields(page: CmsPageDocument): CmsFieldRef[] {
  return [
    ...page.texts.map((field) => ({ id: field.id, selector: field.selector, group: 'texts' as const })),
    ...page.links.map((field) => ({ id: field.id, selector: field.selector, group: 'links' as const })),
    ...page.images.map((field) => ({ id: field.id, selector: field.selector, group: 'images' as const })),
  ];
}

/**
 * Fields whose stored selector is not the canonical `[data-cms-id="<id>"]`.
 * These are the legacy/orphan entries that drift away from the elements that
 * authored components render by id.
 */
export function findNonCanonicalFields(page: CmsPageDocument): CmsFieldRef[] {
  return listPageFields(page).filter((field) => field.selector !== selectorForId(field.id));
}

/** Ids that appear more than once within a single page (would collide on apply). */
export function findDuplicateIds(page: CmsPageDocument): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const field of listPageFields(page)) {
    if (seen.has(field.id)) {
      duplicates.add(field.id);
    }
    seen.add(field.id);
  }

  return [...duplicates];
}
