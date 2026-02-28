export const COOKIE_CONSENT_STORAGE_KEY = 'cookie-consent';
export const COOKIE_CONSENT_ACCEPTED_VALUE = 'accepted';
export const COOKIE_CONSENT_DECLINED_VALUE = 'declined';
export const COOKIE_CONSENT_CHANGED_EVENT = 'cookie-consent-change';

export type CookieConsentValue =
  | typeof COOKIE_CONSENT_ACCEPTED_VALUE
  | typeof COOKIE_CONSENT_DECLINED_VALUE;
