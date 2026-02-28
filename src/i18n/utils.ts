import en from "./en";
import pt from "./pt";

const translations = { en, pt } as const;

export type Locale = keyof typeof translations;
export type TranslationKey = string;

export function t(locale: Locale, key: string): string {
  const value = key
    .split(".")
    .reduce<unknown>((current, segment) => {
      if (current && typeof current === "object") {
        return (current as Record<string, unknown>)[segment];
      }
      return undefined;
    }, translations[locale]);

  return typeof value === "string" ? value : key;
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
