import { login } from './api';
import { clearForcedLogoutMarker, closeLoginModal, openLoginModal } from './auth';
import { markDirty, updateActionAvailability } from './banner-ui';
import { setBannerVisibility } from './banner-visibility';
import {
  applyBlogFormChanges,
  createEmptyBlogPost,
  findSelectedBlogPost,
  hydrateBlogForm,
  renderBlogSelect,
  toggleBlogManager,
} from './blog';
import { deepClone, isMediaPage, nowIso } from './context';
import {
  blogDeleteButton,
  blogDuplicateButton,
  blogForm,
  blogManagerClose,
  blogManagerPanel,
  blogNewButton,
  blogSelect,
  discardChangesButton,
  editSeoButton,
  imageEditorClose,
  imageEditorForm,
  imageEditorOpenLibraryButton,
  imageEditorPanel,
  imageLibraryClose,
  imageLibraryPanel,
  imageLibrarySearch,
  imageReplaceUploadForm,
  imageUploadForm,
  isPanelOpen,
  loginCancel,
  loginError,
  loginForm,
  loginModal,
  logoutButton,
  openBlogManagerButton,
  openImageEditorButton,
  openImageLibraryButton,
  publishButton,
  seoClose,
  seoFillCanonicalButton,
  seoForm,
  seoPanel,
  setStatus,
} from './dom';
import { renderImageLibrary, toggleImageLibrary } from './gallery';
import { applyImageFormChanges, toggleImageEditor } from './image-editing';
import { discardChanges, logout, publishChanges, refreshContent, uploadImage } from './lifecycle';
import { clearAllPendingAdminImagePreviews } from './preview-images';
import { applySeoFormChanges, fillSeoCanonicalFromCurrentPath, toggleSeoPanel } from './seo';
import { state } from './store';

export function bindAuthUI(): void {
  document.querySelectorAll<HTMLElement>('[data-cms-open-login]').forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      if (state.authenticated) {
        setStatus('Already authenticated');
        return;
      }
      openLoginModal();
    });
  });

  loginCancel?.addEventListener('click', () => {
    closeLoginModal();
  });

  loginModal?.addEventListener('click', (event) => {
    if (event.target === loginModal) {
      closeLoginModal();
    }
  });

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    const form = loginForm;
    if (!form) {
      return;
    }

    const formData = new FormData(form);
    const password = String(formData.get('password') ?? '');
    const ok = await login(password);

    if (!ok) {
      loginError?.classList.remove('cms-hidden');
      return;
    }

    clearForcedLogoutMarker();
    state.authenticated = true;
    closeLoginModal();
    setBannerVisibility();
    updateActionAvailability();
    setStatus('Editing. Click text, links, or images to edit.');
    await refreshContent();

    if (isMediaPage) {
      toggleImageLibrary(true);
    }
  });
}

export function bindBannerUI(): void {
  discardChangesButton?.addEventListener('click', () => {
    if (!state.hasUnsavedChanges) {
      setStatus('Nothing to discard');
      return;
    }

    const confirmed = window.confirm('Discard all unpublished changes?');
    if (!confirmed) {
      return;
    }

    discardChanges();
  });

  editSeoButton?.addEventListener('click', () => {
    const open = !isPanelOpen(seoPanel);
    toggleSeoPanel(open);
  });

  openImageEditorButton?.addEventListener('click', () => {
    const open = !isPanelOpen(imageEditorPanel);
    toggleImageEditor(open);
    if (open && !state.selectedImageTarget) {
      setStatus('Click an image in edit mode to load it into the editor.');
    }
  });

  openImageLibraryButton?.addEventListener('click', () => {
    const open = !isPanelOpen(imageLibraryPanel);
    toggleImageLibrary(open);
  });

  openBlogManagerButton?.addEventListener('click', () => {
    const open = !isPanelOpen(blogManagerPanel);
    toggleBlogManager(open);
  });

  publishButton?.addEventListener('click', async () => {
    await publishChanges();
  });

  logoutButton?.addEventListener('click', async () => {
    await logout();
  });
}

export function bindSeoUI(): void {
  seoClose?.addEventListener('click', () => {
    toggleSeoPanel(false);
  });

  seoFillCanonicalButton?.addEventListener('click', () => {
    fillSeoCanonicalFromCurrentPath();
  });

  seoForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    applySeoFormChanges();
  });
}

export function bindImageEditorUI(): void {
  imageEditorClose?.addEventListener('click', () => {
    toggleImageEditor(false);
  });

  imageEditorOpenLibraryButton?.addEventListener('click', () => {
    toggleImageLibrary(true);
  });

  imageReplaceUploadForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = imageReplaceUploadForm;
    if (!form) {
      return;
    }
    const data = new FormData(form);
    await uploadImage(data, { applyToSelected: true });
    form.reset();
  });

  imageEditorForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    applyImageFormChanges();
  });
}

export function bindImageLibraryUI(): void {
  imageLibraryClose?.addEventListener('click', () => {
    toggleImageLibrary(false);
  });

  imageLibrarySearch?.addEventListener('input', () => {
    renderImageLibrary();
  });

  imageUploadForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = imageUploadForm;
    if (!form) {
      return;
    }
    const data = new FormData(form);
    await uploadImage(data);
    form.reset();
  });
}

export function bindBlogManagerUI(): void {
  blogManagerClose?.addEventListener('click', () => {
    toggleBlogManager(false);
  });

  blogSelect?.addEventListener('change', () => {
    hydrateBlogForm();
  });

  blogForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    applyBlogFormChanges();
  });

  blogNewButton?.addEventListener('click', () => {
    if (!state.workingState) {
      return;
    }

    const post = createEmptyBlogPost();
    state.workingState.blogPosts.unshift(post);
    renderBlogSelect(post.id);
    markDirty('Created new post');
  });

  blogDuplicateButton?.addEventListener('click', () => {
    if (!state.workingState) {
      return;
    }

    const selected = findSelectedBlogPost();
    if (!selected) {
      return;
    }

    const clone = deepClone(selected);
    clone.id = `copy-${Date.now()}`;
    clone.slug = `${selected.slug}-copy`;
    clone.status = 'draft';
    clone.updatedAt = nowIso();

    state.workingState.blogPosts.unshift(clone);
    renderBlogSelect(clone.id);
    markDirty('Post duplicated');
  });

  blogDeleteButton?.addEventListener('click', () => {
    if (!state.workingState) {
      return;
    }

    const selected = findSelectedBlogPost();
    if (!selected) {
      return;
    }

    const shouldDelete = window.confirm(`Delete post "${selected.slug}"?`);
    if (!shouldDelete) {
      return;
    }

    state.workingState.blogPosts = state.workingState.blogPosts.filter((post) => post.id !== selected.id);
    renderBlogSelect();
    markDirty('Post deleted');
  });
}

export function bindUnloadGuard(): void {
  window.addEventListener('beforeunload', (event) => {
    if (!state.hasUnsavedChanges || state.suppressBeforeUnloadPrompt) {
      return;
    }

    event.preventDefault();
    event.returnValue = '';
  });

  window.addEventListener('pagehide', () => {
    clearAllPendingAdminImagePreviews();
  }, { once: true });
}
