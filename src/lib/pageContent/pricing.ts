import type { Locale } from '../../i18n/utils';
import { loadRequiredPageTexts, type CmsPageTextValue } from './cmsPageText';
import { loadServicePackages, type ServicePackage } from './packages';

export type { ServicePackage } from './packages';

export interface PricingPageContent {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  customQuote: CmsPageTextValue;
  includesLabel: string;
  idealForLabel: string;
  tiers: ServicePackage[];
  transparencyTitle: CmsPageTextValue;
  transparencyItems: CmsPageTextValue[];
  ctaTitle: string;
  ctaBody: string;
  ctaPrimary: string;
  ctaProject: string;
}

const pricingPageIds = {
  en: 'en-pricing',
  pt: 'pt-precos',
} as const satisfies Record<Locale, string>;

const pricingTextIds = [
  'text:custom-quote-label',
  'text:transparency-title',
  'text:transparency-item-essential-care',
  'text:transparency-item-managed-care',
  'text:transparency-item-premium-care',
  'text:transparency-item-revenue-hosting',
  'text:transparency-item-on-demand',
] as const;

const pricingPageCopy = {
  pt: {
    heroEyebrow: 'Modelo Transparente',
    heroTitle: 'Precos alinhados com o tipo de apoio que o seu imovel realmente precisa.',
    heroSubtitle:
      'Cinco pacotes claros, servicos sob pedido e add-ons opcionais. Sem taxas escondidas e sem linguagem vaga.',
    includesLabel: 'Inclui',
    idealForLabel: 'Ideal para',
    ctaTitle: 'Recomendamos o pacote certo para a operacao real, nao o mais caro.',
    ctaBody:
      'Explique-nos como usa o imovel, se recebe hospedes e onde precisa de apoio. Respondemos com um escopo claro e sem pressao.',
    ctaPrimary: 'Marcar Chamada de Diagnostico',
    ctaProject: 'Definir Projeto',
  },
  en: {
    heroEyebrow: 'Transparent Model',
    heroTitle: 'Pricing aligned with the level of support your property actually needs.',
    heroSubtitle:
      'Five clear packages, flexible on-demand help, and optional add-ons. No hidden fees and no vague bundles.',
    includesLabel: 'Includes',
    idealForLabel: 'Ideal for',
    ctaTitle: "We'll recommend the package that matches the operation, not the most expensive one.",
    ctaBody:
      "Tell us how the property is used, whether it hosts guests, and where you need help. We'll reply with a clear, no-pressure scope.",
    ctaPrimary: 'Book Diagnostic Call',
    ctaProject: 'Scope Add-On Project',
  },
} as const satisfies Record<
  Omit<Locale, never>,
  Omit<PricingPageContent, 'tiers' | 'customQuote' | 'transparencyTitle' | 'transparencyItems'>
>;

export async function getPricingPageContent(lang: Locale): Promise<PricingPageContent> {
  const [tiers, pricingTexts] = await Promise.all([
    loadServicePackages(lang),
    loadRequiredPageTexts(pricingPageIds[lang], pricingTextIds, lang),
  ]);

  return {
    ...pricingPageCopy[lang],
    customQuote: pricingTexts['text:custom-quote-label'],
    transparencyTitle: pricingTexts['text:transparency-title'],
    transparencyItems: [
      pricingTexts['text:transparency-item-essential-care'],
      pricingTexts['text:transparency-item-managed-care'],
      pricingTexts['text:transparency-item-premium-care'],
      pricingTexts['text:transparency-item-revenue-hosting'],
      pricingTexts['text:transparency-item-on-demand'],
    ],
    tiers,
  };
}
