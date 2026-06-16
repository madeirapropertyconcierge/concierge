import { selectorForId } from '../../cms/cms-keys';
import { normalizeImageField } from '../../cms/content-normalization';
import { applyCurrentState } from './apply';
import { markDirty } from './banner-ui';
import { locale, localeValue, resolveCmsId } from './context';
import {
  closePanels,
  hideElement,
  imageEditorForm,
  imageEditorPanel,
  imageEditorPreview,
  imageEditorPreviewEmpty,
  imageEditorSelected,
  imageReplaceUploadForm,
  setStatus,
  showElement,
} from './dom';
import { getFormFieldText, getFormFieldValue, setFormFieldValue } from './form-fields';
import { upsertImageField } from './fields';
import { resolveAdminImageSrc } from './preview-images';
import { state } from './store';
import type { CmsImageField, SelectedImageTarget } from './types';

export function ensureImageField(target: SelectedImageTarget): CmsImageField | null {
  if (!state.workingState) {
    return null;
  }

  const existing = state.workingState.page.images.find((field) => field.id === target.id);
  if (existing) {
    return existing;
  }

  const element = document.querySelector<HTMLImageElement>(target.selector);
  if (!element) {
    return null;
  }

  const nextField = normalizeImageField({
    id: target.id,
    selector: target.selector,
    src: element.dataset.cmsSourceSrc || element.currentSrc || element.src,
    alt: { en: '', pt: '', [locale]: element.alt },
    attributionName: '',
    attributionUrl: '',
    licenseUrl: '',
  });

  upsertImageField(nextField);
  return nextField;
}

/** Empty/error state for the preview: hide the <img> so it can never render a
 * broken-image glyph, and show the placeholder caption instead. */
function clearImagePreview(): void {
  if (imageEditorPreview) {
    imageEditorPreview.removeAttribute('src');
    imageEditorPreview.alt = 'Selected image preview';
    imageEditorPreview.hidden = true;
  }
  if (imageEditorPreviewEmpty) {
    imageEditorPreviewEmpty.hidden = false;
  }
}

function showImagePreview(src: string, alt: string): void {
  const trimmed = src.trim();
  if (!imageEditorPreview || !trimmed) {
    clearImagePreview();
    return;
  }

  imageEditorPreview.alt = alt;
  // A missing/unservable file would otherwise leave a broken-image glyph that
  // looks like an error — fall back to the placeholder caption instead.
  imageEditorPreview.onerror = () => {
    clearImagePreview();
  };
  imageEditorPreview.hidden = false;
  if (imageEditorPreviewEmpty) {
    imageEditorPreviewEmpty.hidden = true;
  }
  imageEditorPreview.src = trimmed;
}

function setImageEditorField(name: string, value: string): void {
  setFormFieldValue(imageEditorForm, name, value);
}

function getImageEditorField(name: string): string {
  return getFormFieldValue(imageEditorForm, name);
}

function getImageEditorTextField(name: string): string {
  return getFormFieldText(imageEditorForm, name);
}

function setFormDisabled(form: HTMLFormElement | null, disabled: boolean): void {
  if (!form) {
    return;
  }

  form.querySelectorAll('input,textarea,select,button').forEach((node) => {
    if (
      node instanceof HTMLInputElement ||
      node instanceof HTMLTextAreaElement ||
      node instanceof HTMLSelectElement ||
      node instanceof HTMLButtonElement
    ) {
      node.disabled = disabled;
    }
  });
}

export function hydrateImageEditorForm(): void {
  if (!imageEditorForm) {
    return;
  }

  if (!state.workingState || !state.selectedImageTarget) {
    imageEditorSelected && (imageEditorSelected.textContent = 'Click an image while edit mode is enabled to edit it here.');
    setFormDisabled(imageReplaceUploadForm, true);
    setFormDisabled(imageEditorForm, true);
    imageReplaceUploadForm?.reset();
    imageEditorForm.reset();
    clearImagePreview();
    return;
  }

  const field = ensureImageField(state.selectedImageTarget);
  if (!field) {
    return;
  }

  setFormDisabled(imageReplaceUploadForm, false);
  setFormDisabled(imageEditorForm, false);

  imageEditorSelected && (imageEditorSelected.textContent = `Selected: ${field.selector}`);
  setImageEditorField('src', field.src);
  setImageEditorField('altEn', field.alt.en);
  setImageEditorField('altPt', field.alt.pt);
  setImageEditorField('captionEn', field.caption?.en ?? '');
  setImageEditorField('captionPt', field.caption?.pt ?? '');
  setImageEditorField('attributionName', field.attributionName);
  setImageEditorField('attributionUrl', field.attributionUrl);
  setImageEditorField('licenseUrl', field.licenseUrl);

  showImagePreview(resolveAdminImageSrc(field.src), localeValue(field.alt));
}

export function toggleImageEditor(open: boolean): void {
  if (!imageEditorPanel) {
    return;
  }

  if (open) {
    closePanels(imageEditorPanel);
    showElement(imageEditorPanel);
    hydrateImageEditorForm();
    return;
  }

  hideElement(imageEditorPanel);
}

export function applyImageFormChanges(): void {
  if (!state.workingState || !state.selectedImageTarget) {
    setStatus('Select an image before editing image details.');
    return;
  }

  const existing = ensureImageField(state.selectedImageTarget);
  if (!existing) {
    setStatus('Selected image could not be resolved.');
    return;
  }

  const nextCaptionEn = getImageEditorTextField('captionEn');
  const nextCaptionPt = getImageEditorTextField('captionPt');
  const nextCaption = nextCaptionEn || nextCaptionPt
    ? { en: nextCaptionEn, pt: nextCaptionPt }
    : undefined;

  const nextField = normalizeImageField({
    id: state.selectedImageTarget.id,
    selector: state.selectedImageTarget.selector,
    src: getImageEditorField('src'),
    alt: {
      en: getImageEditorTextField('altEn'),
      pt: getImageEditorTextField('altPt'),
    },
    attributionName: getImageEditorTextField('attributionName'),
    attributionUrl: getImageEditorField('attributionUrl'),
    licenseUrl: getImageEditorField('licenseUrl'),
    caption: nextCaption,
  });

  const changed = JSON.stringify(existing) !== JSON.stringify(nextField);
  if (!changed) {
    setStatus('Image details unchanged');
    return;
  }

  upsertImageField(nextField);
  applyCurrentState();
  hydrateImageEditorForm();
  markDirty('Image details updated');
}

export function selectImageForEditing(element: HTMLImageElement): void {
  if (!state.workingState) {
    return;
  }

  const id = resolveCmsId(element, 'image');
  state.selectedImageTarget = {
    selector: selectorForId(id),
    id,
  };

  ensureImageField(state.selectedImageTarget);
  toggleImageEditor(true);
  setStatus('Image selected. Upload a replacement here or choose one from the image gallery.');
}

export function findContextualImageCandidate(target: Element): HTMLImageElement | null {
  if (target instanceof HTMLImageElement && target.closest('main')) {
    return target;
  }

  let node: HTMLElement | null = target instanceof HTMLElement ? target : target.parentElement;
  while (node && node !== document.body) {
    if (!node.closest('main')) {
      node = node.parentElement;
      continue;
    }

    const images = Array.from(node.querySelectorAll('img')).filter(
      (image) => !image.closest('[data-admin-allow]'),
    );

    if (images.length === 0) {
      node = node.parentElement;
      continue;
    }

    const absoluteImage = images.find((image) => {
      const style = window.getComputedStyle(image);
      return style.position === 'absolute' || image.classList.contains('absolute');
    });

    return absoluteImage ?? images[0];
  }

  return null;
}
