import { hideElement, loginError, loginForm, loginModal, showElement } from './dom';

const LOGOUT_MARKER_STORAGE_KEY = 'cms-admin-force-logout';

export function openLoginModal(): void {
  showElement(loginModal);
  loginError?.classList.add('cms-hidden');
}

export function closeLoginModal(): void {
  hideElement(loginModal);
  loginForm?.reset();
}

export function hasForcedLogoutMarker(): boolean {
  try {
    return window.sessionStorage.getItem(LOGOUT_MARKER_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

export function setForcedLogoutMarker(): void {
  try {
    window.sessionStorage.setItem(LOGOUT_MARKER_STORAGE_KEY, '1');
  } catch {
    // Ignore storage failures in privacy-restricted contexts.
  }
}

export function clearForcedLogoutMarker(): void {
  try {
    window.sessionStorage.removeItem(LOGOUT_MARKER_STORAGE_KEY);
  } catch {
    // Ignore storage failures in privacy-restricted contexts.
  }
}
