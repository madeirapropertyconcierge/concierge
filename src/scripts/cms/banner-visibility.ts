import { banner } from './dom';
import { state } from './store';
import { finalizeActiveTextEdit } from './text-editing';

const BANNER_OFFSET_CSS_VAR = '--cms-admin-banner-offset';

export function syncBannerOffset(): void {
  if (!banner || !state.authenticated || banner.classList.contains('cms-hidden')) {
    return;
  }

  const offsetPx = Math.ceil(banner.getBoundingClientRect().height + 10);
  document.documentElement.style.setProperty(BANNER_OFFSET_CSS_VAR, `${offsetPx}px`);
}

export function setBannerVisibility(): void {
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
