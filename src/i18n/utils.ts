import en from "./en";
import pt from "./pt";

const translations = { en, pt } as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof en;

export function t(locale: Locale, key: string): string {
  const keys = key.split(".");
  let value: any = translations[locale];
  for (const k of keys) {
    value = value?.[k];
  }
  if (value === undefined) {
    // Fallback to English
    value = translations.en;
    for (const k of keys) {
      value = value?.[k];
    }
  }
  return value ?? key;
}

export function getCurrentLocale(url: URL): Locale {
  const [, locale] = url.pathname.split("/");
  if (locale === "pt") return "pt";
  return "en";
}

export function getLocalizedPath(path: string, locale: Locale): string {
  return `/${locale}${path}`;
}

export const locales: Locale[] = ["en", "pt"];
