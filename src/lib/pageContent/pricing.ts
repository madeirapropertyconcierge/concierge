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
  transparencyTitle: CmsPageTextValue;
  transparencyItems: CmsPageTextValue[];
  ctaTitle: CmsPageTextValue;
  ctaBody: CmsPageTextValue;
  ctaPrimary: CmsPageLinkValue;
  tierProjectCta: CmsPageLinkValue;
}

const pricingPageIds = {
  en: 'en-pricing',
  pt: 'pt-precos',
} as const satisfies Record<Locale, string>;

const pricingTextIds = [
  'text:hero-eyebrow',
  'text:hero-title',
  'text:hero-subtitle',
  'text:custom-quote-label',
  'text:includes-label',
  'text:ideal-for-label',
  'text:transparency-title',
  'text:transparency-item-essential-care',
  'text:transparency-item-managed-care',
  'text:transparency-item-premium-care',
  'text:transparency-item-revenue-hosting',
  'text:transparency-item-on-demand',
  'text:cta-title',
  'text:cta-body',
] as const;

const pricingLinkIds = [
  'link:hero-primary-cta',
  'link:hero-secondary-cta',
  'link:tier-project-cta',
] as const;

export async function getPricingPageContent(lang: Locale): Promise<PricingPageContent> {
  const pageId = pricingPageIds[lang];
  const [tiers, pageFields] = await Promise.all([
    loadServicePackages(lang),
    loadRequiredPageFields(pageId, lang, {
      texts: pricingTextIds,
      links: pricingLinkIds,
    }),
  ]);

  return {
    heroEyebrow: pageFields.texts['text:hero-eyebrow'],
    heroTitle: pageFields.texts['text:hero-title'],
    heroSubtitle: pageFields.texts['text:hero-subtitle'],
    heroPrimaryCta: pageFields.links['link:hero-primary-cta'],
    heroSecondaryCta: pageFields.links['link:hero-secondary-cta'],
    customQuote: pageFields.texts['text:custom-quote-label'],
    includesLabel: pageFields.texts['text:includes-label'],
    idealForLabel: pageFields.texts['text:ideal-for-label'],
    transparencyTitle: pageFields.texts['text:transparency-title'],
    transparencyItems: [
      pageFields.texts['text:transparency-item-essential-care'],
      pageFields.texts['text:transparency-item-managed-care'],
      pageFields.texts['text:transparency-item-premium-care'],
      pageFields.texts['text:transparency-item-revenue-hosting'],
      pageFields.texts['text:transparency-item-on-demand'],
    ],
    ctaTitle: pageFields.texts['text:cta-title'],
    ctaBody: pageFields.texts['text:cta-body'],
    ctaPrimary: pageFields.links['link:hero-primary-cta'],
    tierProjectCta: pageFields.links['link:tier-project-cta'],
    tiers,
  };
}
