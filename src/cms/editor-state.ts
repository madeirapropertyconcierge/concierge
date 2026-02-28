import type { CmsBlogPost, CmsMediaLibrary, CmsPageDocument } from './schema';

const DRAFT_KEY_PREFIX = 'cms:draft:page:';

export interface PageDraftState {
  page: CmsPageDocument;
  blogPosts: CmsBlogPost[];
  mediaLibrary: CmsMediaLibrary;
  baseSha: string | null;
  updatedAt: string;
}

function readLocalStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeLocalStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // no-op when storage is blocked
  }
}

export function draftStorageKey(pageId: string): string {
  return `${DRAFT_KEY_PREFIX}${pageId}`;
}

export function loadDraft(pageId: string): PageDraftState | null {
  const raw = readLocalStorage(draftStorageKey(pageId));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PageDraftState;
  } catch {
    return null;
  }
}

export function saveDraft(pageId: string, draft: PageDraftState): void {
  writeLocalStorage(draftStorageKey(pageId), JSON.stringify(draft));
}

export function discardDraft(pageId: string): void {
  try {
    window.localStorage.removeItem(draftStorageKey(pageId));
  } catch {
    // no-op when storage is blocked
  }
}
