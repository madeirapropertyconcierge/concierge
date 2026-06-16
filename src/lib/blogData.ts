import type { Locale } from '../i18n/utils';
import { listBlogPosts, loadBlogPostBySlug } from '../cms/content-loader';
import type { CmsBlogPost } from '../cms/schema';

export interface LocalizedBlogPost {
  id: string;
  slug: string;
  status: 'draft' | 'published';
  publishedAt: string;
  updatedAt?: string;
  readingMinutes: number;
  tags: string[];
  coverImage: string;
  coverAlt: string;
  title: string;
  excerpt: string;
  body: string;
  seo: {
    title: string;
    description: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    canonical: string;
  };
}

function localizeBlogPost(post: CmsBlogPost, lang: Locale): LocalizedBlogPost {
  const localeData = post.locales[lang];
  const seo = post.seoByLocale[lang];

  return {
    id: post.id,
    slug: post.slug,
    status: post.status,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    readingMinutes: post.readingMinutes,
    tags: post.tags,
    coverImage: post.coverImage,
    coverAlt: localeData.coverAlt,
    title: localeData.title,
    excerpt: localeData.excerpt,
    body: localeData.body,
    seo,
  };
}

export async function getAllBlogPosts(): Promise<CmsBlogPost[]> {
  return listBlogPosts();
}

export async function getLocalizedBlogPosts(
  lang: Locale,
  options: { includeDrafts?: boolean } = {},
): Promise<LocalizedBlogPost[]> {
  const posts = await listBlogPosts();
  const includeDrafts = options.includeDrafts ?? false;

  return posts
    .filter((post) => includeDrafts || post.status === 'published')
    .map((post) => localizeBlogPost(post, lang));
}

export async function getLocalizedBlogPostBySlug(
  slug: string,
  lang: Locale,
  options: { includeDrafts?: boolean } = {},
): Promise<LocalizedBlogPost | null> {
  const post = await loadBlogPostBySlug(slug);
  if (!post) {
    return null;
  }

  if (post.status !== 'published' && !options.includeDrafts) {
    return null;
  }

  return localizeBlogPost(post, lang);
}
