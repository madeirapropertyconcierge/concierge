import type { CmsGalleryItem, SelectedImageTarget, WorkingState } from './types';

/**
 * Single mutable store for the editor. Replaces the scattered module-level
 * globals. It is a plain object exported as `const` — modules read and write
 * `state.<field>` directly (property mutation on a shared object works across
 * ES modules, unlike reassigning an exported binding).
 */
export interface CmsState {
  authenticated: boolean;
  hasUnsavedChanges: boolean;
  isBusy: boolean;
  suppressBeforeUnloadPrompt: boolean;
  publishedState: WorkingState | null;
  workingState: WorkingState | null;
  globalGalleryItems: CmsGalleryItem[];
  selectedImageTarget: SelectedImageTarget | null;
  /**
   * When set, the image gallery is in "pick" mode: clicking a gallery card
   * hands its source path to this callback instead of replacing the selected
   * page image. Used by the SEO editor to choose a social-share image. The
   * argument is the chosen source path, or `null` when the pick was cancelled.
   */
  galleryPickHandler: ((src: string | null) => void) | null;
  activeEditableElement: HTMLElement | null;
  bannerResizeObserver: ResizeObserver | null;
}

export const state: CmsState = {
  authenticated: false,
  hasUnsavedChanges: false,
  isBusy: false,
  suppressBeforeUnloadPrompt: false,
  publishedState: null,
  workingState: null,
  globalGalleryItems: [],
  selectedImageTarget: null,
  galleryPickHandler: null,
  activeEditableElement: null,
  bannerResizeObserver: null,
};

/**
 * Lightweight subscription used to break the `applyCurrentState` → panel
 * back-edge: `apply` notifies after re-rendering the page, and each open panel
 * (SEO/image editor/image library) re-hydrates itself in response. This keeps
 * the dependency graph one-directional (panels depend on `apply`, not vice
 * versa).
 */
type StateListener = () => void;

const listeners = new Set<StateListener>();

export function subscribe(listener: StateListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyStateApplied(): void {
  for (const listener of listeners) {
    listener();
  }
}
