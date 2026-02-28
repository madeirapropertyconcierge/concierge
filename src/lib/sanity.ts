import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'your-project-id',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

export interface BlogPost {
  _id: string;
  title: string;
  slug: { current: string };
  publishedAt: string;
  excerpt: string;
  body: any[];
  locale: string;
  mainImage?: {
    asset: { url: string };
    alt?: string;
  };
  categories?: string[];
}

export async function getBlogPosts(locale: string = 'en'): Promise<BlogPost[]> {
  return sanityClient.fetch(
    `*[_type == "blogPost" && locale == $locale] | order(publishedAt desc) {
      _id, title, slug, publishedAt, excerpt, locale,
      mainImage { asset->{ url }, alt },
      categories
    }`,
    { locale }
  );
}

export async function getBlogPost(slug: string, locale: string = 'en'): Promise<BlogPost | null> {
  return sanityClient.fetch(
    `*[_type == "blogPost" && slug.current == $slug && locale == $locale][0] {
      _id, title, slug, publishedAt, excerpt, body, locale,
      mainImage { asset->{ url }, alt },
      categories
    }`,
    { slug, locale }
  );
}
