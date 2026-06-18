import { selectorForId } from '../../cms/cms-keys';
import { normalizeServicePackageDocument } from '../../cms/content-normalization';
import { renderMarkdown } from '../../cms/markdown-core';
import { normalizeCmsText } from '../../cms/text-normalization';
import { applyCurrentState } from './apply';
import { markDirty, setDirty } from './banner-ui';
import { locale, localeValue, normalizeTextInput, resolveCmsId, setLocaleValue } from './context';
import { elementOwner, isSharedPackageElement, linkOwnsLabel } from './editable-dom';
import {
  findServicePackageEntry,
  readSharedPackageFieldValue,
  upsertLinkField,
  upsertTextField,
  writeSharedPackageFieldValue,
} from './fields';
import { openLinkEditor } from './link-editor';
import { state } from './store';
import type { CmsServicePackageField, CmsServicePackageKey, FieldOwner } from './types';

// A <p> is phrasing-content only and cannot host block markup, so paragraph
// fields stay inline. Only true containers may carry multi-block (block) markup.
const MARKDOWN_BLOCK_TAGS = new Set(['DIV', 'LI', 'BLOCKQUOTE']);

export function finalizeActiveTextEdit(): void {
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

  // Site-chrome fields (header/footer) flow into the shared `site` document;
  // everything else into the current page document.
  const owner: FieldOwner = elementOwner(element) === 'site' ? 'site' : 'page';
  const doc = owner === 'site' ? state.workingState.site : state.workingState.page;

  const id = resolveCmsId(element, 'text');
  const selector = selectorForId(id);
  const kind = MARKDOWN_BLOCK_TAGS.has(element.tagName) ? 'block' : 'inline';
  const existing = doc.texts.find((field) => field.id === id);
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
  }, owner);

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

export function beginTextEdit(element: HTMLElement): void {
  // Already editing this element: keep the live buffer intact. Re-seeding
  // textContent from the stored source below would silently revert whatever the
  // admin has typed so far — the "edit disappears" symptom when the same field
  // is clicked again mid-edit.
  if (state.activeEditableElement === element) {
    return;
  }

  if (state.activeEditableElement) {
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

  // Flip the page to "unsaved" the moment the admin actually types, so Publish
  // and Discard enable immediately. Without this, the first edit on a clean page
  // leaves Publish disabled (it is gated on `hasUnsavedChanges`) until the field
  // is blurred. A disabled button swallows the click *and* does not blur the
  // field, so the first Publish click neither commits nor publishes the edit —
  // the admin has to click out and try again. Marking dirty on input keeps the
  // button live so a single Publish click reliably saves.
  const handleInput = (): void => {
    if (!state.hasUnsavedChanges) {
      setDirty(true);
    }
  };

  const handleBlur = (): void => {
    element.removeEventListener('blur', handleBlur);
    element.removeEventListener('input', handleInput);
    element.removeAttribute('contenteditable');
    element.removeAttribute('data-cms-editing');
    completeTextEdit(element);
    if (state.activeEditableElement === element) {
      state.activeEditableElement = null;
    }
  };

  element.addEventListener('input', handleInput);
  element.addEventListener('blur', handleBlur);
}

export async function editLink(element: HTMLElement): Promise<void> {
  if (!state.workingState) {
    return;
  }

  const id = resolveCmsId(element, 'link');
  const selector = selectorForId(id);
  const existing = state.workingState.page.links.find((field) => field.id === id);
  const ownsLabel = linkOwnsLabel(element);

  const currentLabel = existing ? localeValue(existing.label) : normalizeTextInput(element.textContent ?? '');
  const currentHref = existing?.href[locale]
    ?? (element instanceof HTMLAnchorElement
      ? element.getAttribute('href') ?? ''
      : element.getAttribute('data-cms-href') ?? '');

  const result = await openLinkEditor({
    label: currentLabel,
    href: currentHref,
    allowLabel: ownsLabel,
  });
  if (result === null) {
    return;
  }

  const nextHref = result.href.trim();
  const nextLabel = normalizeTextInput(result.label);
  const nextLabelValue = ownsLabel
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
  if (!ownsLabel) {
    markDirty('Link target updated. Edit the button text directly on the page.');
    return;
  }
  markDirty('Link updated');
}
