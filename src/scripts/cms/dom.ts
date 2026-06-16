/** Centralised lookups for the admin UI elements plus small DOM helpers. */

export const loginModal = document.querySelector<HTMLElement>('#cms-login-modal');
export const loginForm = document.querySelector<HTMLFormElement>('#cms-login-form');
export const loginError = document.querySelector<HTMLElement>('#cms-login-error');
export const loginCancel = document.querySelector<HTMLButtonElement>('#cms-login-cancel');

export const banner = document.querySelector<HTMLElement>('#cms-admin-banner');
export const statusEl = document.querySelector<HTMLElement>('#cms-status');
export const fallbackWarning = document.querySelector<HTMLElement>('#cms-fallback-warning');
export const integrityWarning = document.querySelector<HTMLElement>('#cms-integrity-warning');
export const dirtyIndicator = document.querySelector<HTMLElement>('#cms-dirty-indicator');

export const discardChangesButton = document.querySelector<HTMLButtonElement>('#cms-discard-changes');
export const cleanupOrphansButton = document.querySelector<HTMLButtonElement>('#cms-cleanup-orphans');
export const editSeoButton = document.querySelector<HTMLButtonElement>('#cms-edit-seo');
export const openImageEditorButton = document.querySelector<HTMLButtonElement>('#cms-open-image-editor');
export const openImageLibraryButton = document.querySelector<HTMLButtonElement>('#cms-open-image-library');
export const openBlogManagerButton = document.querySelector<HTMLButtonElement>('#cms-open-blog-manager');
export const publishButton = document.querySelector<HTMLButtonElement>('#cms-publish');
export const logoutButton = document.querySelector<HTMLButtonElement>('#cms-logout');

export const seoPanel = document.querySelector<HTMLElement>('#cms-seo-editor');
export const seoClose = document.querySelector<HTMLButtonElement>('#cms-seo-close');
export const seoFillCanonicalButton = document.querySelector<HTMLButtonElement>('#cms-seo-fill-canonical');
export const seoForm = document.querySelector<HTMLFormElement>('#cms-seo-form');
export const seoLocaleTabs = Array.from(document.querySelectorAll<HTMLButtonElement>('#cms-seo-editor [data-seo-locale]'));
export const seoCopyEnButton = document.querySelector<HTMLButtonElement>('#cms-seo-copy-en');
export const seoPickOgImageButton = document.querySelector<HTMLButtonElement>('#cms-seo-pick-ogimage');
export const seoClearOgImageButton = document.querySelector<HTMLButtonElement>('#cms-seo-clear-ogimage');

export const imageEditorPanel = document.querySelector<HTMLElement>('#cms-image-editor');
export const imageEditorClose = document.querySelector<HTMLButtonElement>('#cms-image-editor-close');
export const imageEditorOpenLibraryButton = document.querySelector<HTMLButtonElement>('#cms-image-open-library');
export const imageEditorSelected = document.querySelector<HTMLElement>('#cms-image-selected');
export const imageEditorPreview = document.querySelector<HTMLImageElement>('#cms-image-preview');
export const imageEditorPreviewEmpty = document.querySelector<HTMLElement>('#cms-image-preview-empty');
export const imageReplaceUploadForm = document.querySelector<HTMLFormElement>('#cms-image-replace-upload-form');
export const imageEditorForm = document.querySelector<HTMLFormElement>('#cms-image-form');

export const imageLibraryPanel = document.querySelector<HTMLElement>('#cms-image-library');
export const imageLibraryClose = document.querySelector<HTMLButtonElement>('#cms-image-library-close');
export const imageLibraryList = document.querySelector<HTMLElement>('#cms-image-library-list');
export const imageLibraryCount = document.querySelector<HTMLElement>('#cms-image-library-count');
export const imageLibrarySearch = document.querySelector<HTMLInputElement>('#cms-image-search');
export const imageNeedsAltToggle = document.querySelector<HTMLButtonElement>('#cms-image-needs-alt');
export const imageUploadForm = document.querySelector<HTMLFormElement>('#cms-image-upload-form');

export const blogManagerPanel = document.querySelector<HTMLElement>('#cms-blog-manager');
export const blogManagerClose = document.querySelector<HTMLButtonElement>('#cms-blog-manager-close');
export const blogSelect = document.querySelector<HTMLSelectElement>('#cms-blog-select');
export const blogForm = document.querySelector<HTMLFormElement>('#cms-blog-form');
export const blogNewButton = document.querySelector<HTMLButtonElement>('#cms-blog-new');
export const blogDuplicateButton = document.querySelector<HTMLButtonElement>('#cms-blog-duplicate');
export const blogDeleteButton = document.querySelector<HTMLButtonElement>('#cms-blog-delete');

export function showElement(element: HTMLElement | null): void {
  element?.classList.remove('cms-hidden');
}

export function hideElement(element: HTMLElement | null): void {
  element?.classList.add('cms-hidden');
}

export function setStatus(message: string): void {
  if (!statusEl) {
    return;
  }

  statusEl.textContent = message;
}

export function setPanelVisibility(panel: HTMLElement | null, open: boolean): void {
  if (!panel) {
    return;
  }

  if (open) {
    panel.classList.remove('cms-hidden');
    return;
  }

  panel.classList.add('cms-hidden');
}

export function isPanelOpen(panel: HTMLElement | null): boolean {
  if (!panel) {
    return false;
  }

  return !panel.classList.contains('cms-hidden');
}

export function closePanels(except?: HTMLElement | null): void {
  const panels = [seoPanel, imageEditorPanel, imageLibraryPanel, blogManagerPanel];
  for (const panel of panels) {
    if (panel && panel !== except) {
      panel.classList.add('cms-hidden');
    }
  }
}
