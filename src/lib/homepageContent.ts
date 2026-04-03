import type { Locale } from '../i18n/utils';
import type { RouteKey } from '../i18n/routes';
import { madeiraImages } from './madeiraImages';
import {
  loadRequiredPageFields,
  type CmsPageImageValue,
  type CmsPageLinkValue,
  type CmsPageTextValue,
} from './pageContent/cmsPageText';
import { loadCoreServicePackages, type ServicePackageKey } from './pageContent/packages';

export interface HomeTrustSignal {
  value: CmsPageTextValue;
  label: CmsPageTextValue;
}

export interface HomeServiceTile {
  packageKey: Exclude<ServicePackageKey, 'addOns'>;
  title: string;
  blurb: string;
  image: string;
  alt: string;
  hrefKey: RouteKey;
  span: string;
}

export interface HomeStep {
  step: string;
  title: CmsPageTextValue;
  detail: CmsPageTextValue;
}

export interface HomePageContent {
  heroBackground: CmsPageImageValue;
  finalBackground: CmsPageImageValue;
  heroBadge: CmsPageTextValue;
  heroTitle: CmsPageTextValue;
  heroSubtitle: CmsPageTextValue;
  heroPrimaryCta: CmsPageLinkValue;
  heroSecondaryCta: CmsPageLinkValue;
  mediaCards: [
    { image: CmsPageImageValue; caption: CmsPageTextValue },
    { image: CmsPageImageValue; caption: CmsPageTextValue },
    { image: CmsPageImageValue; caption: CmsPageTextValue },
  ];
  trustSignals: HomeTrustSignal[];
  architectureEyebrow: CmsPageTextValue;
  architectureTitle: CmsPageTextValue;
  architectureLink: CmsPageLinkValue;
  serviceTiles: HomeServiceTile[];
  processEyebrow: CmsPageTextValue;
  processTitle: CmsPageTextValue;
  processBody: CmsPageTextValue;
  processChecklist: CmsPageTextValue;
  processClosing: CmsPageTextValue;
  processLink: CmsPageLinkValue;
  processPrimaryCta: CmsPageLinkValue;
  processSecondaryCta: CmsPageLinkValue;
  steps: HomeStep[];
  finalEyebrow: CmsPageTextValue;
  finalTitle: CmsPageTextValue;
  finalSubtitle: CmsPageTextValue;
  finalPrimaryCta: CmsPageLinkValue;
  finalSecondaryCta: CmsPageLinkValue;
}

const homeTileConfig: Record<
  Exclude<ServicePackageKey, 'addOns'>,
  { image: string; alt: string; hrefKey: RouteKey; span: string }
> = {
  essentialCare: {
    image: madeiraImages.treeFramedValleyTown.src,
    alt: madeiraImages.treeFramedValleyTown.alt,
    hrefKey: 'services',
    span: 'lg:col-span-5',
  },
  managedCare: {
    image: madeiraImages.tobogganRideFunchal.src,
    alt: madeiraImages.tobogganRideFunchal.alt,
    hrefKey: 'pricing',
    span: 'lg:col-span-7',
  },
  premiumCare: {
    image: madeiraImages.saoVicenteCoast.src,
    alt: madeiraImages.saoVicenteCoast.alt,
    hrefKey: 'services',
    span: 'lg:col-span-4',
  },
  revenueHosting: {
    image: madeiraImages.mercadoMural.src,
    alt: madeiraImages.mercadoMural.alt,
    hrefKey: 'pricing',
    span: 'lg:col-span-4',
  },
  onDemand: {
    image: madeiraImages.villageRuggedMountains.src,
    alt: madeiraImages.villageRuggedMountains.alt,
    hrefKey: 'contact',
    span: 'lg:col-span-4',
  },
};

const homePageIds = {
  en: 'en-home',
  pt: 'pt-home',
} as const satisfies Record<Locale, string>;

const homeTextIds = [
  'text:hero-badge',
  'text:hero-title',
  'text:hero-subtitle',
  'text:media-card-1-caption',
  'text:media-card-2-caption',
  'text:media-card-3-caption',
  'text:trust-signal-1-value',
  'text:trust-signal-1-label',
  'text:trust-signal-2-value',
  'text:trust-signal-2-label',
  'text:architecture-eyebrow',
  'text:architecture-title',
  'text:process-eyebrow',
  'text:process-title',
  'text:process-body',
  'text:process-checklist',
  'text:process-closing',
  'text:step-1-title',
  'text:step-1-detail',
  'text:step-2-title',
  'text:step-2-detail',
  'text:step-3-title',
  'text:step-3-detail',
  'text:final-eyebrow',
  'text:final-title',
  'text:final-subtitle',
] as const;

const homeLinkIds = [
  'link:hero-primary-cta',
  'link:hero-secondary-cta',
  'link:architecture-cta',
  'link:process-cta',
  'link:process-primary-cta',
  'link:process-secondary-cta',
  'link:final-primary-cta',
  'link:final-secondary-cta',
] as const;

const homeImageIds = [
  'image:hero-background',
  'image:final-background',
  'image:media-card-1',
  'image:media-card-2',
  'image:media-card-3',
] as const;

async function buildHomeServiceTiles(locale: Locale): Promise<HomeServiceTile[]> {
  const packages = await loadCoreServicePackages(locale);

  return packages.map((item) => ({
    packageKey: item.key,
    title: item.title,
    blurb: item.homeBlurb,
    ...homeTileConfig[item.key],
  }));
}

export async function getHomepageContent(locale: Locale): Promise<HomePageContent> {
  const pageId = homePageIds[locale];
  const [serviceTiles, pageFields] = await Promise.all([
    buildHomeServiceTiles(locale),
    loadRequiredPageFields(pageId, locale, {
      texts: homeTextIds,
      links: homeLinkIds,
      images: homeImageIds,
    }),
  ]);

  return {
    heroBackground: pageFields.images['image:hero-background'],
    finalBackground: pageFields.images['image:final-background'],
    heroBadge: pageFields.texts['text:hero-badge'],
    heroTitle: pageFields.texts['text:hero-title'],
    heroSubtitle: pageFields.texts['text:hero-subtitle'],
    heroPrimaryCta: pageFields.links['link:hero-primary-cta'],
    heroSecondaryCta: pageFields.links['link:hero-secondary-cta'],
    mediaCards: [
      {
        image: pageFields.images['image:media-card-1'],
        caption: pageFields.texts['text:media-card-1-caption'],
      },
      {
        image: pageFields.images['image:media-card-2'],
        caption: pageFields.texts['text:media-card-2-caption'],
      },
      {
        image: pageFields.images['image:media-card-3'],
        caption: pageFields.texts['text:media-card-3-caption'],
      },
    ],
    trustSignals: [
      {
        value: pageFields.texts['text:trust-signal-1-value'],
        label: pageFields.texts['text:trust-signal-1-label'],
      },
      {
        value: pageFields.texts['text:trust-signal-2-value'],
        label: pageFields.texts['text:trust-signal-2-label'],
      },
    ],
    architectureEyebrow: pageFields.texts['text:architecture-eyebrow'],
    architectureTitle: pageFields.texts['text:architecture-title'],
    architectureLink: pageFields.links['link:architecture-cta'],
    serviceTiles,
    processEyebrow: pageFields.texts['text:process-eyebrow'],
    processTitle: pageFields.texts['text:process-title'],
    processBody: pageFields.texts['text:process-body'],
    processChecklist: pageFields.texts['text:process-checklist'],
    processClosing: pageFields.texts['text:process-closing'],
    processLink: pageFields.links['link:process-cta'],
    processPrimaryCta: pageFields.links['link:process-primary-cta'],
    processSecondaryCta: pageFields.links['link:process-secondary-cta'],
    steps: [
      {
        step: '01',
        title: pageFields.texts['text:step-1-title'],
        detail: pageFields.texts['text:step-1-detail'],
      },
      {
        step: '02',
        title: pageFields.texts['text:step-2-title'],
        detail: pageFields.texts['text:step-2-detail'],
      },
      {
        step: '03',
        title: pageFields.texts['text:step-3-title'],
        detail: pageFields.texts['text:step-3-detail'],
      },
    ],
    finalEyebrow: pageFields.texts['text:final-eyebrow'],
    finalTitle: pageFields.texts['text:final-title'],
    finalSubtitle: pageFields.texts['text:final-subtitle'],
    finalPrimaryCta: pageFields.links['link:final-primary-cta'],
    finalSecondaryCta: pageFields.links['link:final-secondary-cta'],
  };
}
