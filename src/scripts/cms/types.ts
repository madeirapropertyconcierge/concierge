export type Locale = 'en' | 'pt';

export type LocaleText = Record<Locale, string>;

export interface CmsTextField {
  id: string;
  selector: string;
  kind: 'inline' | 'block';
  value: LocaleText;
}

export interface CmsLinkField {
  id: string;
  selector: string;
  label: LocaleText;
  href: LocaleText;
}

export interface CmsImageField {
  id: string;
  selector: string;
  src: string;
  alt: LocaleText;
  attributionName: string;
  attributionUrl: string;
  licenseUrl: string;
  caption?: LocaleText;
}

export interface CmsSeoLocale {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
}

export interface CmsPageDocument {
  pageId: string;
  updatedAt: string;
  seo: Record<Locale, CmsSeoLocale>;
  texts: CmsTextField[];
  links: CmsLinkField[];
  images: CmsImageField[];
}

export type CmsServicePackageKey =
  | 'essentialCare'
  | 'managedCare'
  | 'premiumCare'
  | 'revenueHosting'
  | 'onDemand'
  | 'addOns';

export type CmsServicePackageField =
  | 'tierLabel'
  | 'title'
  | 'audience'
  | 'priceHeadline'
  | 'priceDetail'
  | 'idealFor'
  | 'homeBlurb'
  | 'feature'
  | 'servicesBullet';

export interface CmsServicePackagePrice {
  headline: LocaleText;
  detail: LocaleText;
}

export interface CmsServicePackageEntry {
  key: CmsServicePackageKey;
  tierLabel: LocaleText;
  title: LocaleText;
  price: CmsServicePackagePrice | null;
  audience: LocaleText;
  features: Record<Locale, string[]>;
  idealFor: LocaleText;
  servicesBullets: Record<Locale, string[]>;
  homeBlurb: LocaleText;
}

export interface CmsServicePackageDocument {
  updatedAt: string;
  packages: CmsServicePackageEntry[];
}

export interface CmsBlogLocale {
  title: string;
  excerpt: string;
  body: string;
  coverAlt: string;
}

export interface CmsBlogSeo {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonical: string;
}

export interface CmsBlogPost {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  readingMinutes: number;
  coverImage: string;
  locales: Record<Locale, CmsBlogLocale>;
  seoByLocale: Record<Locale, CmsBlogSeo>;
}

export interface ContentResponse {
  page: CmsPageDocument;
  packages: CmsServicePackageDocument;
  blogPosts: CmsBlogPost[];
  branchSha: string | null;
  galleryItems?: CmsGalleryItem[];
  authenticated: boolean;
}

export interface WorkingState {
  page: CmsPageDocument;
  packages: CmsServicePackageDocument;
  blogPosts: CmsBlogPost[];
  baseSha: string | null;
}

export interface SelectedImageTarget {
  selector: string;
  id: string;
}

export type GallerySource = 'public' | 'page' | 'blog' | 'seo';

export interface CmsGalleryItem {
  id: string;
  src: string;
  alt: LocaleText;
  attributionName: string;
  attributionUrl: string;
  licenseUrl: string;
  caption?: LocaleText;
  source: GallerySource;
  sourceLabels: string[];
}
