import { selectorForId } from '../../cms/cms-keys';
import { normalizeServicePackageDocument } from '../../cms/content-normalization';
import { renderMarkdown } from '../../cms/markdown-core';
import { normalizeCmsText } from '../../cms/text-normalization';
import { applyCurrentState } from './apply';
import { markDirty } from './banner-ui';
import { locale, localeValue, normalizeTextInput, resolveCmsId, setLocaleValue } from './context';
import { isSharedPackageElement, linkOwnsLabel } from './editable-dom';
import {
  findServicePackageEntry,
  readSharedPackageFieldValue,
  upsertLinkField,
  upsertTextField,
  writeSharedPackageFieldValue,
} from './fields';
import { openLinkEditor } from './link-editor';
import { state } from './store';
import type { CmsServicePackageField, CmsServicePackageKey } from './types';

const MARKDOWN_BLOCK_TAGS = new Set(['P', 'DIV', 'LI', 'BLOCKQUOTE']);

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

export function beginTextEdit(element: HTMLElement): void {
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
