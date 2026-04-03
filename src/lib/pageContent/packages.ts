import { loadServicePackageDocument } from '../../cms/content-loader';
import type { SiteLocale, ServicePackageKey } from './packageTypes';

export type { SiteLocale, ServicePackageKey } from './packageTypes';

export interface PackagePrice {
  headline: string;
  detail?: string;
}

export interface PricingTier {
  tierLabel: string;
  title: string;
  price: PackagePrice | null;
  audience: string;
  features: string[];
  idealFor?: string;
  showQuoteLabel?: boolean;
}

export interface ServicePackage extends PricingTier {
  key: ServicePackageKey;
  servicesBullets: string[];
  homeBlurb: string;
}

function resolveLocaleText(
  value: {
    en: string;
    pt: string;
  },
  locale: SiteLocale,
): string {
  return value[locale].trim() || value.en.trim();
}

export async function loadServicePackages(locale: SiteLocale): Promise<ServicePackage[]> {
  const document = await loadServicePackageDocument();

  return document.packages.map((entry) => {
    const priceHeadline = entry.price ? resolveLocaleText(entry.price.headline, locale) : '';
    const priceDetail = entry.price ? resolveLocaleText(entry.price.detail, locale) : '';
    const idealFor = resolveLocaleText(entry.idealFor, locale);

    return {
      key: entry.key,
      tierLabel: resolveLocaleText(entry.tierLabel, locale),
      title: resolveLocaleText(entry.title, locale),
      price: entry.price
        ? {
            headline: priceHeadline,
            ...(priceDetail ? { detail: priceDetail } : {}),
          }
        : null,
      audience: resolveLocaleText(entry.audience, locale),
      features: entry.features[locale].map((item) => item.trim()).filter(Boolean),
      idealFor: idealFor || undefined,
      servicesBullets: entry.servicesBullets[locale].map((item) => item.trim()).filter(Boolean),
      homeBlurb: resolveLocaleText(entry.homeBlurb, locale),
      showQuoteLabel: entry.price === null,
    };
  });
}

export async function loadCoreServicePackages(locale: SiteLocale): Promise<ServicePackage[]> {
  const packages = await loadServicePackages(locale);
  return packages.filter((item) => item.key !== 'addOns');
}

export async function loadFooterServiceLabels(locale: SiteLocale): Promise<string[]> {
  const packages = await loadCoreServicePackages(locale);
  return packages.map((item) => item.title);
}

export async function loadContactServiceOptions(
  locale: SiteLocale,
): Promise<Record<ServicePackageKey, string>> {
  const packages = await loadServicePackages(locale);
  return Object.fromEntries(
    packages.map((item) => [item.key, item.title]),
  ) as Record<ServicePackageKey, string>;
}
