import { escapeJsString, selectorForId } from '../cms/cms-keys';
import { renderMarkdown } from '../cms/markdown-core';
import {
  normalizeBlogPost,
  normalizeImageField,
  normalizeLinkField,
  normalizePageDocument,
  normalizeServicePackageDocument,
  normalizeTextField,
} from '../cms/content-normalization';
import { normalizeCmsText } from '../cms/text-normalization';

import type {
  CmsBlogLocale,
  CmsBlogPost,
  CmsBlogSeo,
  CmsGalleryItem,
  CmsImageField,
  CmsLinkField,
  CmsPageDocument,
  CmsSeoLocale,
  CmsServicePackageDocument,
  CmsServicePackageEntry,
  CmsServicePackageField,
  CmsServicePackageKey,
  CmsServicePackagePrice,
  CmsTextField,
  ContentResponse,
  GallerySource,
  Locale,
  LocaleText,
  SelectedImageTarget,
  WorkingState,
} from "./cms/types";
import { state } from "./cms/store";
import {
  clearAllPendingAdminImagePreviews,
  clearPendingAdminImagePreview,
  resolveAdminImageSrc,
  setPendingAdminImagePreview,
} from "./cms/preview-images";
import {
  deepClone,
  isBlogPage,
  isMediaPage,
  locale,
  localeValue,
  normalizeTextInput,
  nowIso,
  pageId,
  resolveCmsId,
  setLocaleValue,
} from "./cms/context";
import {
  banner,
  blogDeleteButton,
  blogDuplicateButton,
  blogForm,
  blogManagerClose,
  blogManagerPanel,
  blogNewButton,
  blogSelect,
  closePanels,
  dirtyIndicator,
  discardChangesButton,
  editSeoButton,
  fallbackWarning,
  hideElement,
  imageEditorClose,
  imageEditorForm,
  imageEditorOpenLibraryButton,
  imageEditorPanel,
  imageEditorPreview,
  imageEditorSelected,
  imageLibraryClose,
  imageLibraryCount,
  imageLibraryList,
  imageLibraryPanel,
  imageLibrarySearch,
  imageReplaceUploadForm,
  imageUploadForm,
  integrityWarning,
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
  setPanelVisibility,
  setStatus,
  showElement,
  statusEl,
} from "./cms/dom";
import { checkSession, fetchContent, login, readApiPayload } from "./cms/api";
import {
  markDirty,
  setBusy,
  setDirty,
  updateActionAvailability,
  updateDirtyIndicator,
} from "./cms/banner-ui";
import {
  applyBlogFormChanges,
  createEmptyBlogPost,
  findSelectedBlogPost,
  hydrateBlogForm,
  renderBlogSelect,
  toggleBlogManager,
} from "./cms/blog";
import {
  findServicePackageEntry,
  readSharedPackageFieldValue,
  upsertImageField,
  upsertLinkField,
  upsertTextField,
  writeSharedPackageFieldValue,
} from "./cms/fields";
import {
  findEditableTextElement,
  isAdminControl,
  isSharedOwnedElement,
  isSharedPackageElement,
  isTextCandidate,
} from "./cms/editable-dom";
import { applyCurrentState } from "./cms/apply";
import { subscribe } from "./cms/store";
import {
  applySeoFormChanges,
  fillSeoCanonicalFromCurrentPath,
  hydrateSeoForm,
  toggleSeoPanel,
} from "./cms/seo";
import {
  applyImageFormChanges,
  ensureImageField,
  findContextualImageCandidate,
  hydrateImageEditorForm,
  selectImageForEditing,
  toggleImageEditor,
} from "./cms/image-editing";
import {
  createPublicGalleryItem,
  renderImageLibrary,
  replaceSelectedImage,
  toggleImageLibrary,
  upsertGalleryItem,
} from "./cms/gallery";


if (!isBlogPage && openBlogManagerButton) {
  openBlogManagerButton.classList.add('cms-hidden');
}

const BANNER_OFFSET_CSS_VAR = '--cms-admin-banner-offset';
const LOGOUT_MARKER_STORAGE_KEY = 'cms-admin-force-logout';

const MARKDOWN_BLOCK_TAGS = new Set(['P', 'DIV', 'LI', 'BLOCKQUOTE']);





function setBannerVisibility(): void {
  if (!banner) {
    return;
  }

  if (state.authenticated) {
    banner.classList.remove('cms-hidden');
    document.body.classList.add('cms-admin-offset');
    // Editing is implicit while authenticated — there is no view/edit toggle.
    document.body.classList.add('cms-navigate-locked');
    syncBannerOffset();
    return;
  }

  finalizeActiveTextEdit();
  banner.classList.add('cms-hidden');
  document.body.classList.remove('cms-admin-offset');
  document.body.classList.remove('cms-navigate-locked');
  document.documentElement.style.removeProperty(BANNER_OFFSET_CSS_VAR);
}

function syncBannerOffset(): void {
  if (!banner || !state.authenticated || banner.classList.contains('cms-hidden')) {
    return;
  }

  const offsetPx = Math.ceil(banner.getBoundingClientRect().height + 10);
  document.documentElement.style.setProperty(BANNER_OFFSET_CSS_VAR, `${offsetPx}px`);
}

function openLoginModal(): void {
  showElement(loginModal);
  loginError?.classList.add('cms-hidden');
}

function closeLoginModal(): void {
  hideElement(loginModal);
  loginForm?.reset();
}


function finalizeActiveTextEdit(): void {
  if (!state.activeEditableElement) {
    return;
  }

  const element = state.activeEditableElement;
  state.activeEditableElement = null;
  element.removeAttribute('contenteditable');
  element.removeAttribute('data-cms-editing');
  completeTextEdit(element);
}

function completeSharedPackageTextEdit(element: HTMLElement): void {
  if (!state.workingState) {
    return;
  }

  const key = element.dataset.cmsSharedKey as CmsServicePackageKey | undefined;
  const field = element.dataset.cmsSharedField as CmsServicePackageField | undefined;
  const kind = (element.dataset.cmsKind as 'inline' | 'block' | undefined) ?? 'inline';
  const index = element.dataset.cmsSharedIndex ? Number.parseInt(element.dataset.cmsSharedIndex, 10) : undefined;

  if (!key || !field) {
    return;
  }

  const entry = findServicePackageEntry(key);
  if (!entry) {
    return;
  }

  const previousValue = readSharedPackageFieldValue(entry, field, index);
  const nextValue = normalizeTextInput(element.textContent ?? '');

  if (nextValue === previousValue) {
    element.innerHTML = renderMarkdown(nextValue, kind);
    element.dataset.cmsSource = nextValue;
    return;
  }

  writeSharedPackageFieldValue(entry, field, nextValue, index);
  state.workingState.packages = normalizeServicePackageDocument(state.workingState.packages);

  element.innerHTML = renderMarkdown(nextValue, kind);
  element.dataset.cmsField = 'text';
  element.dataset.cmsSource = nextValue;
  markDirty('Package content updated');
}

function completeTextEdit(element: HTMLElement): void {
  if (!state.workingState) {
    return;
  }

  if (isSharedPackageElement(element)) {
    completeSharedPackageTextEdit(element);
    return;
  }

  const id = resolveCmsId(element, 'text');
  const selector = selectorForId(id);
  const kind = MARKDOWN_BLOCK_TAGS.has(element.tagName) ? 'block' : 'inline';
  const existing = state.workingState.page.texts.find((field) => field.id === id);
  const previousValue = existing
    ? localeValue(existing.value).trim()
    : normalizeTextInput(element.dataset.cmsSource ?? '');
  const nextValue = normalizeTextInput(element.textContent ?? '');

  if (!existing && nextValue === previousValue) {
    element.innerHTML = renderMarkdown(nextValue, kind);
    return;
  }

  const nextLocaleValue = existing
    ? setLocaleValue(existing.value, nextValue)
    : { en: '', pt: '', [locale]: nextValue };

  upsertTextField({
    id,
    selector,
    kind,
    value: nextLocaleValue,
  });

  element.innerHTML = renderMarkdown(nextValue, kind);
  element.dataset.cmsField = 'text';
  element.dataset.cmsId = id;
  element.dataset.cmsSelector = selector;
  element.dataset.cmsKind = kind;
  element.dataset.cmsSource = nextValue;

  if (nextValue !== previousValue || !existing) {
    markDirty('Text updated');
  }
}

function beginTextEdit(element: HTMLElement): void {
  if (state.activeEditableElement && state.activeEditableElement !== element) {
    finalizeActiveTextEdit();
  }

  state.activeEditableElement = element;
  const source = normalizeCmsText(element.dataset.cmsSource ?? element.textContent ?? '');
  element.textContent = source;
  element.setAttribute('contenteditable', 'true');
  element.setAttribute('data-cms-editing', 'true');

  const selection = window.getSelection();
  selection?.removeAllRanges();

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection?.addRange(range);

  element.focus();

  const handleBlur = (): void => {
    element.removeEventListener('blur', handleBlur);
    element.removeAttribute('contenteditable');
    element.removeAttribute('data-cms-editing');
    completeTextEdit(element);
    if (state.activeEditableElement === element) {
      state.activeEditableElement = null;
    }
  };

  element.addEventListener('blur', handleBlur);
}

function editLink(element: HTMLElement): void {
  if (!state.workingState) {
    return;
  }

  const id = resolveCmsId(element, 'link');
  const selector = selectorForId(id);
  const existing = state.workingState.page.links.find((field) => field.id === id);
  const isSimpleLinkLabelTarget = element.childElementCount === 0;

  const currentLabel = existing ? localeValue(existing.label) : normalizeTextInput(element.textContent ?? '');
  const currentHref = existing?.href[locale]
    ?? (element instanceof HTMLAnchorElement
      ? element.getAttribute('href') ?? ''
      : element.getAttribute('data-cms-href') ?? '');

  const href = window.prompt('Target URL (absolute https:// or /relative)', currentHref);
  if (href === null) {
    return;
  }

  let label = currentLabel;
  if (isSimpleLinkLabelTarget) {
    const promptedLabel = window.prompt('Link/Button label', currentLabel);
    if (promptedLabel === null) {
      return;
    }
    label = normalizeTextInput(promptedLabel);
  }

  const nextHref = href.trim();
  const nextLabel = normalizeTextInput(label);
  const nextLabelValue = isSimpleLinkLabelTarget
    ? (existing ? setLocaleValue(existing.label, nextLabel) : { en: '', pt: '', [locale]: nextLabel })
    : (existing?.label ?? { en: '', pt: '' });
  const nextHrefValue = existing
    ? setLocaleValue(existing.href, nextHref)
    : { en: '', pt: '', [locale]: nextHref };

  if (
    existing &&
    JSON.stringify(existing.label) === JSON.stringify(nextLabelValue) &&
    JSON.stringify(existing.href) === JSON.stringify(nextHrefValue)
  ) {
    return;
  }

  upsertLinkField({
    id,
    selector,
    label: nextLabelValue,
    href: nextHrefValue,
  });

  applyCurrentState();
  if (!isSimpleLinkLabelTarget) {
    markDirty('Link URL updated. Text can be edited directly inside the card/button.');
    return;
  }
  markDirty('Link updated');
}

function hasForcedLogoutMarker(): boolean {
  try {
    return window.sessionStorage.getItem(LOGOUT_MARKER_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function setForcedLogoutMarker(): void {
  try {
    window.sessionStorage.setItem(LOGOUT_MARKER_STORAGE_KEY, '1');
  } catch {
    // Ignore storage failures in privacy-restricted contexts.
  }
}

function clearForcedLogoutMarker(): void {
  try {
    window.sessionStorage.removeItem(LOGOUT_MARKER_STORAGE_KEY);
  } catch {
    // Ignore storage failures in privacy-restricted contexts.
  }
}

function hydrateStateFromResponse(response: ContentResponse): void {
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

async function refreshContent(): Promise<void> {
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

async function publishChanges(): Promise<void> {
  if (!state.workingState || state.isBusy) {
    return;
  }

  finalizeActiveTextEdit();
  setStatus('Publishing changes...');
  setBusy(true);

  try {
    const response = await fetch('/api/admin/publish', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pages: [state.workingState.page],
        packages: state.workingState.packages,
        blogPosts: state.workingState.blogPosts,
        baseSha: state.workingState.baseSha,
      }),
    });

    const payload = await readApiPayload<{ commitSha?: string; warnings?: string[] }>(response);

    if (response.status === 409) {
      // The site changed since this session loaded. Keep the in-flight edits and
      // re-sync only the base commit so the next Publish click can succeed.
      await syncBaseShaFromServer();
      setStatus('Publish conflict: the site changed since you loaded. Your edits are kept — click Publish again to retry.');
      return;
    }

    if (!response.ok) {
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

async function uploadImage(
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
    const response = await fetch('/api/admin/upload-image', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    const payload = await readApiPayload<{
      ok?: boolean;
      src?: string;
      commitSha?: string;
    }>(response);

    if (!response.ok || !payload.src || !state.workingState) {
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

async function logout(): Promise<void> {
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

function discardChanges(): void {
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

function handleEditClick(event: MouseEvent): void {
  if (!state.authenticated) {
    return;
  }

  const target = event.target instanceof Element ? event.target : null;
  if (!target || isAdminControl(target)) {
    return;
  }

  const image = target.closest('img');
  if (image instanceof HTMLImageElement && image.closest('main')) {
    event.preventDefault();
    event.stopPropagation();
    selectImageForEditing(image);
    return;
  }

  if (isPanelOpen(imageEditorPanel)) {
    const contextualImage = findContextualImageCandidate(target);
    if (contextualImage) {
      event.preventDefault();
      event.stopPropagation();
      selectImageForEditing(contextualImage);
      return;
    }
  }

  const textElement = findEditableTextElement(target);
  if (textElement) {
    event.preventDefault();
    event.stopPropagation();
    beginTextEdit(textElement);
    return;
  }

  const clickable = target.closest('a,button');
  if (clickable instanceof HTMLElement && clickable.closest('main')) {
    event.preventDefault();
    event.stopPropagation();
    editLink(clickable);
    return;
  }
}

function lockNavigation(event: MouseEvent): void {
  if (!state.authenticated) {
    return;
  }

  const target = event.target instanceof Element ? event.target : null;
  if (!target || isAdminControl(target)) {
    return;
  }

  if (target.closest('a,button,[role="button"]')) {
    event.preventDefault();
  }
}

function lockFormSubmit(event: SubmitEvent): void {
  if (!state.authenticated) {
    return;
  }

  const target = event.target instanceof Element ? event.target : null;
  if (!target || isAdminControl(target)) {
    return;
  }

  event.preventDefault();
}

function bindAuthUI(): void {
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

function bindBannerUI(): void {
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

function bindSeoUI(): void {
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

function bindImageEditorUI(): void {
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

function bindImageLibraryUI(): void {
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

function bindBlogManagerUI(): void {
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

    const shouldDelete = window.confirm(`Delete post \"${selected.slug}\"?`);
    if (!shouldDelete) {
      return;
    }

    state.workingState.blogPosts = state.workingState.blogPosts.filter((post) => post.id !== selected.id);
    renderBlogSelect();
    markDirty('Post deleted');
  });
}

function bindUnloadGuard(): void {
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

async function boot(): Promise<void> {
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

void boot();
