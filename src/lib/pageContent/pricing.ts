import type { Locale } from '../../i18n/utils';
import { getServicePackages, type PricingTier } from './packages';

export type { PricingTier } from './packages';

export interface PricingPageContent {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  customQuote: string;
  includesLabel: string;
  idealForLabel: string;
  tiers: PricingTier[];
  transparencyTitle: string;
  transparencyItems: string[];
  ctaTitle: string;
  ctaBody: string;
  ctaPrimary: string;
  ctaProject: string;
}

const pricingPageCopy = {
  pt: {
    heroEyebrow: 'Modelo Transparente',
    heroTitle: 'Precos alinhados com o tipo de apoio que o seu imovel realmente precisa.',
    heroSubtitle:
      'Cinco pacotes claros, servicos sob pedido e add-ons opcionais. Sem taxas escondidas e sem linguagem vaga.',
    customQuote: 'Orcamento por escopo',
    includesLabel: 'Inclui',
    idealForLabel: 'Ideal para',
    transparencyTitle: 'Como estruturamos os custos',
    transparencyItems: [
      'Cuidados Essenciais: EUR95/mes',
      'Gestao Assistida: EUR95/mes + EUR80 por suporte de turnover',
      'Cuidados Premium: EUR140/mes',
      'Revenue & Hosting: EUR95/mes + 25% da receita bruta',
      'Servicos Sob Pedido: desde EUR35/hora',
    ],
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
    customQuote: 'Scoped Quote',
    includesLabel: 'Includes',
    idealForLabel: 'Ideal for',
    transparencyTitle: 'How costs are structured',
    transparencyItems: [
      'Essential Care: €95/month',
      'Managed Care: €95/month + €80 per turnover support',
      'Premium Care: €140/month',
      'Revenue & Hosting: €95/month + 25% of gross rental revenue',
      'On-Demand Services: from €35/hour',
    ],
    ctaTitle: "We'll recommend the package that matches the operation, not the most expensive one.",
    ctaBody:
      "Tell us how the property is used, whether it hosts guests, and where you need help. We'll reply with a clear, no-pressure scope.",
    ctaPrimary: 'Book Diagnostic Call',
    ctaProject: 'Scope Add-On Project',
  },
} as const satisfies Record<Omit<Locale, never>, Omit<PricingPageContent, 'tiers'>>;

export function getPricingPageContent(lang: Locale): PricingPageContent {
  return {
    ...pricingPageCopy[lang],
    tiers: getServicePackages(lang),
  };
}
