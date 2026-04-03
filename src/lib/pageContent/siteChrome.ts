import type { Locale } from '../../i18n/utils';
import { loadRequiredPageFields } from './cmsPageText';

const siteChromeTextIds = [
  'text:brand-eyebrow',
  'text:brand-wordmark',
  'text:nav-home',
  'text:nav-services',
  'text:nav-about',
  'text:nav-how-it-works',
  'text:nav-pricing',
  'text:nav-blog',
  'text:nav-contact',
  'text:nav-faq',
  'text:nav-guide',
  'text:nav-cta',
  'text:nav-language-toggle',
  'text:nav-language-toggle-aria',
  'text:mobile-open-menu',
  'text:mobile-close-menu',
  'text:mobile-panel-label',
  'text:mobile-navigation-label',
  'text:footer-tagline',
  'text:footer-description',
  'text:footer-company-heading',
  'text:footer-copyright',
  'text:footer-privacy',
  'text:footer-terms',
  'text:footer-complaints-book',
  'text:footer-adr-info',
  'text:footer-tax-id-label',
  'text:footer-cta-secondary',
  'text:footer-instagram-label',
  'text:footer-facebook-label',
  'text:footer-linkedin-label',
  'text:cookie-message',
  'text:cookie-accept',
  'text:cookie-decline',
  'text:cookie-learn-more',
] as const;

const notFoundTextIds = [
  'text:title',
  'text:description',
  'text:primary-cta',
  'text:secondary-cta',
] as const;

export interface SiteChromeContent {
  brand: {
    eyebrow: string;
    wordmark: string;
    fullName: string;
  };
  nav: {
    home: string;
    services: string;
    about: string;
    howItWorks: string;
    pricing: string;
    blog: string;
    contact: string;
    faq: string;
    guide: string;
    cta: string;
    languageToggle: string;
    languageToggleAria: string;
  };
  mobileNav: {
    openLabel: string;
    closeLabel: string;
    panelLabel: string;
    navigationLabel: string;
  };
  footer: {
    tagline: string;
    description: string;
    companyHeading: string;
    copyright: string;
    privacy: string;
    terms: string;
    complaintsBook: string;
    adrInfo: string;
    taxIdLabel: string;
    ctaSecondary: string;
    instagramLabel: string;
    facebookLabel: string;
    linkedinLabel: string;
  };
  cookies: {
    message: string;
    accept: string;
    decline: string;
    learnMore: string;
  };
}

export interface NotFoundContent {
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
}

export async function getSiteChromeContent(lang: Locale): Promise<SiteChromeContent> {
  const fields = await loadRequiredPageFields('shared-site', lang, { texts: siteChromeTextIds });
  const eyebrow = fields.texts['text:brand-eyebrow'].value;
  const wordmark = fields.texts['text:brand-wordmark'].value;

  return {
    brand: {
      eyebrow,
      wordmark,
      fullName: `${eyebrow} ${wordmark}`,
    },
    nav: {
      home: fields.texts['text:nav-home'].value,
      services: fields.texts['text:nav-services'].value,
      about: fields.texts['text:nav-about'].value,
      howItWorks: fields.texts['text:nav-how-it-works'].value,
      pricing: fields.texts['text:nav-pricing'].value,
      blog: fields.texts['text:nav-blog'].value,
      contact: fields.texts['text:nav-contact'].value,
      faq: fields.texts['text:nav-faq'].value,
      guide: fields.texts['text:nav-guide'].value,
      cta: fields.texts['text:nav-cta'].value,
      languageToggle: fields.texts['text:nav-language-toggle'].value,
      languageToggleAria: fields.texts['text:nav-language-toggle-aria'].value,
    },
    mobileNav: {
      openLabel: fields.texts['text:mobile-open-menu'].value,
      closeLabel: fields.texts['text:mobile-close-menu'].value,
      panelLabel: fields.texts['text:mobile-panel-label'].value,
      navigationLabel: fields.texts['text:mobile-navigation-label'].value,
    },
    footer: {
      tagline: fields.texts['text:footer-tagline'].value,
      description: fields.texts['text:footer-description'].value,
      companyHeading: fields.texts['text:footer-company-heading'].value,
      copyright: fields.texts['text:footer-copyright'].value,
      privacy: fields.texts['text:footer-privacy'].value,
      terms: fields.texts['text:footer-terms'].value,
      complaintsBook: fields.texts['text:footer-complaints-book'].value,
      adrInfo: fields.texts['text:footer-adr-info'].value,
      taxIdLabel: fields.texts['text:footer-tax-id-label'].value,
      ctaSecondary: fields.texts['text:footer-cta-secondary'].value,
      instagramLabel: fields.texts['text:footer-instagram-label'].value,
      facebookLabel: fields.texts['text:footer-facebook-label'].value,
      linkedinLabel: fields.texts['text:footer-linkedin-label'].value,
    },
    cookies: {
      message: fields.texts['text:cookie-message'].value,
      accept: fields.texts['text:cookie-accept'].value,
      decline: fields.texts['text:cookie-decline'].value,
      learnMore: fields.texts['text:cookie-learn-more'].value,
    },
  };
}

export async function getNotFoundContent(lang: Locale): Promise<NotFoundContent> {
  const fields = await loadRequiredPageFields('shared-404', lang, { texts: notFoundTextIds });

  return {
    title: fields.texts['text:title'].value,
    description: fields.texts['text:description'].value,
    primaryCta: fields.texts['text:primary-cta'].value,
    secondaryCta: fields.texts['text:secondary-cta'].value,
  };
}
