import type { Locale } from '../../i18n/utils';
import {
  loadRequiredPageFields,
  type CmsPageLinkValue,
  type CmsPageTextValue,
} from './cmsPageText';

export type LegalPageType = 'privacy' | 'terms';

export interface LegalSection {
  title: CmsPageTextValue;
  body: CmsPageTextValue;
  note?: CmsPageTextValue;
}

export interface LegalPageContent {
  heroEyebrow: CmsPageTextValue;
  heroTitle: CmsPageTextValue;
  heroSubtitle: CmsPageTextValue;
  updatedLabel: CmsPageTextValue;
  primaryCta: CmsPageLinkValue;
  secondaryCta: CmsPageLinkValue;
  sections: LegalSection[];
}

export interface LegalPageContext {
  legalName: string;
  taxId: string;
  commercialRegistry: string;
  email: string;
  phone: string;
  address: string;
  complaintsBookUrl: string;
  adrInfoUrl: string;
  termsHref: string;
  hasLegalPlaceholders: boolean;
}

const legalPageIds: Record<LegalPageType, string> = {
  privacy: 'privacy',
  terms: 'terms',
};

const legalFieldIds = {
  privacy: [
    'text:hero-eyebrow',
    'text:hero-title',
    'text:hero-subtitle',
    'text:updated-label',
    'text:section-1-title',
    'text:section-1-body',
    'text:section-2-title',
    'text:section-2-body',
    'text:section-3-title',
    'text:section-3-body',
    'text:section-4-title',
    'text:section-4-body',
    'text:section-5-title',
    'text:section-5-body',
    'text:section-6-title',
    'text:section-6-body',
    'text:section-7-title',
    'text:section-7-body',
  ] as const,
  terms: [
    'text:hero-eyebrow',
    'text:hero-title',
    'text:hero-subtitle',
    'text:updated-label',
    'text:section-1-title',
    'text:section-1-body',
    'text:section-2-title',
    'text:section-2-body',
    'text:section-3-title',
    'text:section-3-body',
    'text:section-4-title',
    'text:section-4-body',
    'text:section-5-title',
    'text:section-5-body',
    'text:section-6-title',
    'text:section-6-body',
    'text:section-6-note',
  ] as const,
} as const;

const legalLinkIds = [
  'link:primary-cta',
  'link:secondary-cta',
] as const;

function interpolateTokens(value: string, context: LegalPageContext): string {
  const replacements: Record<string, string> = {
    legalName: context.legalName,
    taxId: context.taxId,
    commercialRegistry: context.commercialRegistry,
    email: context.email,
    phone: context.phone,
    address: context.address,
    complaintsBookUrl: context.complaintsBookUrl,
    adrInfoUrl: context.adrInfoUrl,
    termsHref: context.termsHref,
  };

  return value.replace(/\{\{(\w+)\}\}/g, (_match, token) => replacements[token] ?? '');
}

function interpolateTextField(field: CmsPageTextValue, context: LegalPageContext): CmsPageTextValue {
  return {
    ...field,
    value: interpolateTokens(field.value, context),
  };
}

function interpolateLinkField(field: CmsPageLinkValue, context: LegalPageContext): CmsPageLinkValue {
  return {
    ...field,
    label: interpolateTokens(field.label, context),
    href: interpolateTokens(field.href, context),
  };
}

export async function getLegalPageContent(
  lang: Locale,
  type: LegalPageType,
  context: LegalPageContext,
): Promise<LegalPageContent> {
  const pageFields = await loadRequiredPageFields(legalPageIds[type], lang, {
    texts: legalFieldIds[type],
    links: legalLinkIds,
  });

  const text = pageFields.texts;

  return {
    heroEyebrow: interpolateTextField(text['text:hero-eyebrow'], context),
    heroTitle: interpolateTextField(text['text:hero-title'], context),
    heroSubtitle: interpolateTextField(text['text:hero-subtitle'], context),
    updatedLabel: interpolateTextField(text['text:updated-label'], context),
    primaryCta: interpolateLinkField(pageFields.links['link:primary-cta'], context),
    secondaryCta: interpolateLinkField(pageFields.links['link:secondary-cta'], context),
    sections: type === 'privacy'
      ? [
          {
            title: interpolateTextField(text['text:section-1-title'], context),
            body: interpolateTextField(text['text:section-1-body'], context),
          },
          {
            title: interpolateTextField(text['text:section-2-title'], context),
            body: interpolateTextField(text['text:section-2-body'], context),
          },
          {
            title: interpolateTextField(text['text:section-3-title'], context),
            body: interpolateTextField(text['text:section-3-body'], context),
          },
          {
            title: interpolateTextField(text['text:section-4-title'], context),
            body: interpolateTextField(text['text:section-4-body'], context),
          },
          {
            title: interpolateTextField(text['text:section-5-title'], context),
            body: interpolateTextField(text['text:section-5-body'], context),
          },
          {
            title: interpolateTextField(text['text:section-6-title'], context),
            body: interpolateTextField(text['text:section-6-body'], context),
          },
          {
            title: interpolateTextField(text['text:section-7-title'], context),
            body: interpolateTextField(text['text:section-7-body'], context),
          },
        ]
      : [
          {
            title: interpolateTextField(text['text:section-1-title'], context),
            body: interpolateTextField(text['text:section-1-body'], context),
          },
          {
            title: interpolateTextField(text['text:section-2-title'], context),
            body: interpolateTextField(text['text:section-2-body'], context),
          },
          {
            title: interpolateTextField(text['text:section-3-title'], context),
            body: interpolateTextField(text['text:section-3-body'], context),
          },
          {
            title: interpolateTextField(text['text:section-4-title'], context),
            body: interpolateTextField(text['text:section-4-body'], context),
          },
          {
            title: interpolateTextField(text['text:section-5-title'], context),
            body: interpolateTextField(text['text:section-5-body'], context),
          },
          {
            title: interpolateTextField(text['text:section-6-title'], context),
            body: interpolateTextField(text['text:section-6-body'], context),
            note: context.hasLegalPlaceholders
              ? interpolateTextField(text['text:section-6-note'], context)
              : undefined,
          },
        ],
  };
}
