import { isAdminControl, findEditableTextElement } from './editable-dom';
import { imageEditorPanel, isPanelOpen } from './dom';
import { findContextualImageCandidate, selectImageForEditing } from './image-editing';
import { state } from './store';
import { beginTextEdit, editLink } from './text-editing';

export function handleEditClick(event: MouseEvent): void {
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
    void editLink(clickable);
    return;
  }
}

export function lockNavigation(event: MouseEvent): void {
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

export function lockFormSubmit(event: SubmitEvent): void {
  if (!state.authenticated) {
    return;
  }

  const target = event.target instanceof Element ? event.target : null;
  if (!target || isAdminControl(target)) {
    return;
  }

  event.preventDefault();
}
