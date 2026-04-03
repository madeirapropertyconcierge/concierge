export type Locale = 'en' | 'pt';

export function getCurrentLocale(url: URL): Locale {
  const [, locale] = url.pathname.split("/");
  if (locale === "pt") return "pt";
  return "en";
}

export function getLocalizedPath(path: string, locale: Locale): string {
  return `/${locale}${path}`;
}

export const locales: Locale[] = ["en", "pt"];
