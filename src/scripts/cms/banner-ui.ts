import { state } from './store';
import {
  dirtyIndicator,
  discardChangesButton,
  editSeoButton,
  logoutButton,
  openBlogManagerButton,
  openImageEditorButton,
  openImageLibraryButton,
  publishButton,
  setStatus,
} from './dom';

export function updateDirtyIndicator(): void {
  if (!dirtyIndicator) {
    return;
  }

  dirtyIndicator.textContent = state.hasUnsavedChanges ? 'Unsaved changes' : 'Up to date';
  dirtyIndicator.classList.toggle('cms-pill-dirty', state.hasUnsavedChanges);
  dirtyIndicator.classList.toggle('cms-pill-neutral', !state.hasUnsavedChanges);
}

export function updateActionAvailability(): void {
  const canUseActions = state.authenticated && !state.isBusy;

  if (publishButton) {
    publishButton.disabled = !canUseActions || !state.hasUnsavedChanges;
  }

  if (discardChangesButton) {
    discardChangesButton.disabled = !canUseActions || !state.hasUnsavedChanges;
  }

  if (editSeoButton) {
    editSeoButton.disabled = !canUseActions;
  }

  if (openImageEditorButton) {
    openImageEditorButton.disabled = !canUseActions;
  }

  if (openImageLibraryButton) {
    openImageLibraryButton.disabled = !canUseActions;
  }

  if (openBlogManagerButton) {
    openBlogManagerButton.disabled = !canUseActions;
  }

  if (logoutButton) {
    logoutButton.disabled = !canUseActions;
  }
}

export function setDirty(nextValue: boolean): void {
  state.hasUnsavedChanges = nextValue;
  updateDirtyIndicator();
  updateActionAvailability();
}

export function markDirty(message: string): void {
  setDirty(true);
  setStatus(message);
}

export function setBusy(nextValue: boolean): void {
  state.isBusy = nextValue;
  state.suppressBeforeUnloadPrompt = nextValue;
  updateActionAvailability();
}
