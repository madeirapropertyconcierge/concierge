import type { Locale } from '../../i18n/utils';
import {
  loadRequiredPageFields,
  type CmsPageLinkValue,
  type CmsPageTextValue,
} from './cmsPageText';
import { loadServicePackages, type ServicePackage } from './packages';

export type { ServicePackage } from './packages';

export interface PricingPageContent {
  heroEyebrow: CmsPageTextValue;
  heroTitle: CmsPageTextValue;
  heroSubtitle: CmsPageTextValue;
  heroPrimaryCta: CmsPageLinkValue;
  heroSecondaryCta: CmsPageLinkValue;
  customQuote: CmsPageTextValue;
  includesLabel: CmsPageTextValue;
  idealForLabel: CmsPageTextValue;
  tiers: ServicePackage[];
  addOnsTier: ServicePackage;
  ctaTitle: CmsPageTextValue;
  ctaBody: CmsPageTextValue;
  ctaPrimary: CmsPageLinkValue;
  tierProjectCta: CmsPageLinkValue;
}

const pricingPageId = 'pricing';

const pricingTextIds = [
  'text:hero-eyebrow',
  'text:hero-title',
  'text:hero-subtitle',
  'text:custom-quote-label',
  'text:includes-label',
  'text:ideal-for-label',
  'text:cta-title',
  'text:cta-body',
] as const;

const pricingLinkIds = [
  'link:hero-primary-cta',
  'link:hero-secondary-cta',
  'link:tier-project-cta',
] as const;

export async function getPricingPageContent(lang: Locale): Promise<PricingPageContent> {
  const [allTiers, pageFields] = await Promise.all([
    loadServicePackages(lang),
    loadRequiredPageFields(pricingPageId, lang, {
      texts: pricingTextIds,
      links: pricingLinkIds,
    }),
  ]);

  const addOnsTier = allTiers.find((t) => t.key === 'addOns')!;
  const tiers = allTiers.filter((t) => t.key !== 'addOns');

  return {
    heroEyebrow: pageFields.texts['text:hero-eyebrow'],
    heroTitle: pageFields.texts['text:hero-title'],
    heroSubtitle: pageFields.texts['text:hero-subtitle'],
    heroPrimaryCta: pageFields.links['link:hero-primary-cta'],
    heroSecondaryCta: pageFields.links['link:hero-secondary-cta'],
    customQuote: pageFields.texts['text:custom-quote-label'],
    includesLabel: pageFields.texts['text:includes-label'],
    idealForLabel: pageFields.texts['text:ideal-for-label'],
    ctaTitle: pageFields.texts['text:cta-title'],
    ctaBody: pageFields.texts['text:cta-body'],
    ctaPrimary: pageFields.links['link:hero-primary-cta'],
    tierProjectCta: pageFields.links['link:tier-project-cta'],
    tiers,
    addOnsTier,
  };
}
