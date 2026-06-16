/**
 * Client-facing CMS types.
 *
 * The content shapes are derived from the server Zod schema (src/cms/schema.ts)
 * so the editor and the publish endpoint can never drift apart. These are
 * type-only imports — zod itself never enters the browser bundle. Types that
 * exist only in the editor UI are declared locally below.
 */

import type {
  CmsBlogPost,
  CmsImageField,
  CmsLinkField,
  CmsPageDocument,
  CmsServicePackageDocument,
  CmsServicePackageEntry,
  CmsTextField,
} from '../../cms/schema';
import type { Locale } from '../../i18n/utils';

export type {
  CmsBlogPost,
  CmsImageField,
  CmsLinkField,
  CmsPageDocument,
  CmsServicePackageDocument,
  CmsServicePackageEntry,
  CmsTextField,
  Locale,
};

export type LocaleText = CmsTextField['value'];
export type CmsSeoLocale = CmsPageDocument['seo']['en'];
export type CmsBlogLocale = CmsBlogPost['locales']['en'];
export type CmsBlogSeo = CmsBlogPost['seoByLocale']['en'];
export type CmsServicePackagePrice = NonNullable<CmsServicePackageEntry['price']>;
export type CmsServicePackageKey = CmsServicePackageEntry['key'];

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
