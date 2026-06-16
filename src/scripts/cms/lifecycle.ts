import {
  normalizeBlogPost,
  normalizePageDocument,
  normalizeServicePackageDocument,
} from '../../cms/content-normalization';
import { fetchContent, sendForm, sendJson } from './api';
import { applyCurrentState } from './apply';
import { setForcedLogoutMarker } from './auth';
import { markDirty, setBusy, setDirty, updateActionAvailability } from './banner-ui';
import { setBannerVisibility } from './banner-visibility';
import { renderBlogSelect } from './blog';
import { deepClone } from './context';
import { closePanels, setStatus } from './dom';
import { createPublicGalleryItem, renderImageLibrary, replaceSelectedImage, upsertGalleryItem } from './gallery';
import { hydrateImageEditorForm } from './image-editing';
import { findOrphanFields, removeOrphanFields } from './integrity';
import { clearPendingAdminImagePreview, setPendingAdminImagePreview } from './preview-images';
import { hydrateSeoForm } from './seo';
import { state } from './store';
import { finalizeActiveTextEdit } from './text-editing';
import type { ContentResponse, WorkingState } from './types';

export function hydrateStateFromResponse(response: ContentResponse): void {
  const baseState: WorkingState = {
    page: normalizePageDocument(response.page),
    packages: normalizeServicePackageDocument(response.packages),
    blogPosts: response.blogPosts.map(normalizeBlogPost),
    baseSha: response.branchSha,
  };

  state.publishedState = deepClone(baseState);
  state.workingState = deepClone(baseState);
  state.authenticated = response.authenticated;
  state.globalGalleryItems = deepClone(response.galleryItems ?? []);
  state.selectedImageTarget = null;

  applyCurrentState();
  renderImageLibrary();
  renderBlogSelect();
  hydrateSeoForm();
  hydrateImageEditorForm();
  setDirty(false);
}

export async function refreshContent(): Promise<void> {
  const response = await fetchContent();
  hydrateStateFromResponse(response);
  setBannerVisibility();
  updateActionAvailability();
}

async function syncBaseShaFromServer(): Promise<void> {
  const response = await fetchContent();
  if (state.workingState) {
    state.workingState.baseSha = response.branchSha;
  }
  if (state.publishedState) {
    state.publishedState.baseSha = response.branchSha;
  }
}

export async function publishChanges(): Promise<void> {
  if (!state.workingState || state.isBusy) {
    return;
  }

  finalizeActiveTextEdit();
  setStatus('Publishing changes...');
  setBusy(true);

  try {
    const { ok, status, payload } = await sendJson<{ commitSha?: string; warnings?: string[] }>(
      'POST',
      '/api/admin/publish',
      {
        pages: [state.workingState.page],
        packages: state.workingState.packages,
        blogPosts: state.workingState.blogPosts,
        baseSha: state.workingState.baseSha,
      },
    );

    if (status === 409) {
      // The site changed since this session loaded. Keep the in-flight edits and
      // re-sync only the base commit so the next Publish click can succeed.
      await syncBaseShaFromServer();
      setStatus('Publish conflict: the site changed since you loaded. Your edits are kept — click Publish again to retry.');
      return;
    }

    if (!ok) {
      setStatus(payload.error ?? 'Publish failed');
      return;
    }

    const warnings = payload.warnings ?? [];
    if (warnings.length > 0) {
      for (const warning of warnings) {
        console.warn(`[cms publish] ${warning}`);
      }
      setStatus(`Published ${payload.commitSha ?? ''}`.trim() + ` — ${warnings.length} translation warning(s), see console.`);
    } else {
      setStatus(`Published ${payload.commitSha ?? ''}`.trim());
    }

    await refreshContent();
  } finally {
    setBusy(false);
  }
}

export async function uploadImage(
  formData: FormData,
  options: {
    applyToSelected?: boolean;
  } = {},
): Promise<void> {
  if (state.isBusy) {
    return;
  }

  const uploadedFile = formData.get('file');
  setBusy(true);
  try {
    const { ok, payload } = await sendForm<{ ok?: boolean; src?: string; commitSha?: string }>(
      '/api/admin/upload-image',
      formData,
    );

    if (!ok || !payload.src || !state.workingState) {
      setStatus(payload.error ?? 'Image upload failed');
      return;
    }

    if (uploadedFile instanceof File && uploadedFile.size > 0) {
      setPendingAdminImagePreview(payload.src, uploadedFile);
    }

    upsertGalleryItem(createPublicGalleryItem(payload.src));

    if (payload.commitSha) {
      state.workingState.baseSha = payload.commitSha;
      if (state.publishedState) {
        state.publishedState.baseSha = payload.commitSha;
      }
    }

    if (options.applyToSelected) {
      const replaced = replaceSelectedImage({ src: payload.src });
      if (!replaced) {
        // The preview blob will never be shown, so don't leak it.
        clearPendingAdminImagePreview(payload.src);
        setStatus('Image uploaded. Choose a selected page image before replacing it.');
        renderImageLibrary();
        return;
      }

      setDirty(true);
      renderImageLibrary();
      setStatus('Image uploaded and applied. Publish to save the page reference.');
      return;
    }

    renderImageLibrary();
    setStatus('Image uploaded. It is ready in the gallery and preview uses the local file until deploy finishes.');
  } finally {
    setBusy(false);
  }
}

export async function logout(): Promise<void> {
  state.suppressBeforeUnloadPrompt = true;
  setForcedLogoutMarker();

  try {
    await fetch('/api/admin/logout', {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      keepalive: true,
    });
  } catch {
    // Keep local logout state even if request fails.
  } finally {
    state.suppressBeforeUnloadPrompt = false;
  }

  state.authenticated = false;
  closePanels();
  setBannerVisibility();
  setDirty(false);
  updateActionAvailability();
  setStatus('Logged out');
}

export function cleanupOrphanFields(): void {
  const page = state.workingState?.page;
  if (!page || state.isBusy) {
    return;
  }

  finalizeActiveTextEdit();

  const orphans = findOrphanFields(page);
  if (orphans.length === 0) {
    setStatus('No orphaned fields to clean up');
    return;
  }

  const summary = orphans.map((field) => `• ${field.group} — ${field.id}`).join('\n');
  const confirmed = window.confirm(
    `Remove ${orphans.length} orphaned field${orphans.length === 1 ? '' : 's'} from this page?\n\n`
    + `${summary}\n\n`
    + 'These fields no longer match any element on the page. They are deleted from the '
    + 'page content when you next Publish.',
  );
  if (!confirmed) {
    return;
  }

  const removed = removeOrphanFields(page);
  applyCurrentState();
  markDirty(`Removed ${removed} orphaned field${removed === 1 ? '' : 's'} — Publish to save`);
}

export function discardChanges(): void {
  if (!state.publishedState) {
    return;
  }

  finalizeActiveTextEdit();
  state.workingState = deepClone(state.publishedState);
  state.selectedImageTarget = null;
  applyCurrentState();
  renderImageLibrary();
  renderBlogSelect();
  hydrateSeoForm();
  hydrateImageEditorForm();
  setDirty(false);
  setStatus('All unpublished changes discarded');
}
