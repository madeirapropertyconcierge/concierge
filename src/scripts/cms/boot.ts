import { checkSession, fetchContent } from './api';
import { clearForcedLogoutMarker, hasForcedLogoutMarker, openLoginModal } from './auth';
import { updateActionAvailability, updateDirtyIndicator } from './banner-ui';
import { setBannerVisibility, syncBannerOffset } from './banner-visibility';
import {
  bindAuthUI,
  bindBannerUI,
  bindBlogManagerUI,
  bindImageEditorUI,
  bindImageLibraryUI,
  bindSeoUI,
  bindUnloadGuard,
} from './bindings';
import { isBlogPage, isMediaPage } from './context';
import {
  banner,
  imageEditorPanel,
  imageLibraryPanel,
  isPanelOpen,
  openBlogManagerButton,
  seoPanel,
  setStatus,
} from './dom';
import { renderImageLibrary, toggleImageLibrary } from './gallery';
import { hydrateImageEditorForm } from './image-editing';
import { handleEditClick, lockFormSubmit, lockNavigation } from './interactions';
import { hydrateStateFromResponse } from './lifecycle';
import { hydrateSeoForm } from './seo';
import { state, subscribe } from './store';

export async function boot(): Promise<void> {
  if (!isBlogPage && openBlogManagerButton) {
    openBlogManagerButton.classList.add('cms-hidden');
  }

  // Open panels re-hydrate from state in response to applyCurrentState()'s
  // notify, replacing the direct calls that used to live inside it.
  subscribe(() => {
    if (isPanelOpen(seoPanel)) {
      hydrateSeoForm();
    }
  });
  subscribe(() => {
    if (isPanelOpen(imageEditorPanel)) {
      hydrateImageEditorForm();
    }
  });
  subscribe(() => {
    if (isPanelOpen(imageLibraryPanel)) {
      renderImageLibrary();
    }
  });

  bindAuthUI();
  bindBannerUI();
  bindSeoUI();
  bindImageEditorUI();
  bindImageLibraryUI();
  bindBlogManagerUI();
  bindUnloadGuard();

  if (banner && typeof ResizeObserver === 'function') {
    state.bannerResizeObserver = new ResizeObserver(() => {
      syncBannerOffset();
    });

    state.bannerResizeObserver.observe(banner);
  }

  document.addEventListener('click', lockNavigation, true);
  document.addEventListener('submit', lockFormSubmit, true);
  document.addEventListener('click', handleEditClick, true);

  const forceLoggedOut = hasForcedLogoutMarker();
  state.authenticated = forceLoggedOut ? false : await checkSession();

  if (state.authenticated) {
    clearForcedLogoutMarker();
    const content = await fetchContent();
    hydrateStateFromResponse(content);

    if (isMediaPage) {
      toggleImageLibrary(true);
    }
  }

  setBannerVisibility();
  updateDirtyIndicator();
  updateActionAvailability();

  if (state.authenticated) {
    setStatus('Editing. Click text, links, or images to edit.');
  } else {
    setStatus('Public view');
    if (isMediaPage) {
      openLoginModal();
    }
  }
}
