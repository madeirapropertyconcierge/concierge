import type { Locale } from '../../i18n/utils';
import {
  loadRequiredPageFields,
  type CmsPageLinkValue,
  type CmsPageTextValue,
} from './cmsPageText';

export interface FAQItem {
  question: CmsPageTextValue;
  answer: CmsPageTextValue;
}

export interface FAQCategory {
  title: CmsPageTextValue;
  items: FAQItem[];
}

export interface FAQPageContent {
  heroEyebrow: CmsPageTextValue;
  heroTitle: CmsPageTextValue;
  heroSubtitle: CmsPageTextValue;
  heroPrimaryCta: CmsPageLinkValue;
  heroSecondaryCta: CmsPageLinkValue;
  categories: FAQCategory[];
  closingTitle: CmsPageTextValue;
  closingBody: CmsPageTextValue;
  closingCta: CmsPageLinkValue;
}

const faqPageIds = {
  en: 'en-faq',
  pt: 'pt-perguntas-frequentes',
} as const satisfies Record<Locale, string>;

const faqTextIds = [
  'text:hero-eyebrow',
  'text:hero-title',
  'text:hero-subtitle',
  'text:category-fit-title',
  'text:category-fit-question-1',
  'text:category-fit-answer-1',
  'text:category-fit-question-2',
  'text:category-fit-answer-2',
  'text:category-fit-question-3',
  'text:category-fit-answer-3',
  'text:category-operations-title',
  'text:category-operations-question-1',
  'text:category-operations-answer-1',
  'text:category-operations-question-2',
  'text:category-operations-answer-2',
  'text:category-operations-question-3',
  'text:category-operations-answer-3',
  'text:category-legal-title',
  'text:category-legal-question-1',
  'text:category-legal-answer-1',
  'text:category-legal-question-2',
  'text:category-legal-answer-2',
  'text:closing-title',
  'text:closing-body',
] as const;

const faqLinkIds = [
  'link:primary-cta',
  'link:secondary-cta',
] as const;

export async function getFaqPageContent(lang: Locale): Promise<FAQPageContent> {
  const pageId = faqPageIds[lang];
  const pageFields = await loadRequiredPageFields(pageId, lang, {
    texts: faqTextIds,
    links: faqLinkIds,
  });

  return {
    heroEyebrow: pageFields.texts['text:hero-eyebrow'],
    heroTitle: pageFields.texts['text:hero-title'],
    heroSubtitle: pageFields.texts['text:hero-subtitle'],
    heroPrimaryCta: pageFields.links['link:primary-cta'],
    heroSecondaryCta: pageFields.links['link:secondary-cta'],
    categories: [
      {
        title: pageFields.texts['text:category-fit-title'],
        items: [
          {
            question: pageFields.texts['text:category-fit-question-1'],
            answer: pageFields.texts['text:category-fit-answer-1'],
          },
          {
            question: pageFields.texts['text:category-fit-question-2'],
            answer: pageFields.texts['text:category-fit-answer-2'],
          },
          {
            question: pageFields.texts['text:category-fit-question-3'],
            answer: pageFields.texts['text:category-fit-answer-3'],
          },
        ],
      },
      {
        title: pageFields.texts['text:category-operations-title'],
        items: [
          {
            question: pageFields.texts['text:category-operations-question-1'],
            answer: pageFields.texts['text:category-operations-answer-1'],
          },
          {
            question: pageFields.texts['text:category-operations-question-2'],
            answer: pageFields.texts['text:category-operations-answer-2'],
          },
          {
            question: pageFields.texts['text:category-operations-question-3'],
            answer: pageFields.texts['text:category-operations-answer-3'],
          },
        ],
      },
      {
        title: pageFields.texts['text:category-legal-title'],
        items: [
          {
            question: pageFields.texts['text:category-legal-question-1'],
            answer: pageFields.texts['text:category-legal-answer-1'],
          },
          {
            question: pageFields.texts['text:category-legal-question-2'],
            answer: pageFields.texts['text:category-legal-answer-2'],
          },
        ],
      },
    ],
    closingTitle: pageFields.texts['text:closing-title'],
    closingBody: pageFields.texts['text:closing-body'],
    closingCta: pageFields.links['link:primary-cta'],
  };
}
