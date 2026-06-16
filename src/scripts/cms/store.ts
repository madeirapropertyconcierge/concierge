import type { CmsGalleryItem, SelectedImageTarget, WorkingState } from './types';

/**
 * Single mutable store for the editor. Replaces the scattered module-level
 * globals. It is a plain object exported as `const` — modules read and write
 * `state.<field>` directly (property mutation on a shared object works across
 * ES modules, unlike reassigning an exported binding).
 */
export interface CmsState {
  authenticated: boolean;
  editMode: boolean;
  hasUnsavedChanges: boolean;
  isBusy: boolean;
  suppressBeforeUnloadPrompt: boolean;
  publishedState: WorkingState | null;
  workingState: WorkingState | null;
  globalGalleryItems: CmsGalleryItem[];
  selectedImageTarget: SelectedImageTarget | null;
  activeEditableElement: HTMLElement | null;
  bannerResizeObserver: ResizeObserver | null;
}

export const state: CmsState = {
  authenticated: false,
  editMode: false,
  hasUnsavedChanges: false,
  isBusy: false,
  suppressBeforeUnloadPrompt: false,
  publishedState: null,
  workingState: null,
  globalGalleryItems: [],
  selectedImageTarget: null,
  activeEditableElement: null,
  bannerResizeObserver: null,
};
