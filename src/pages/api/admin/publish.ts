import type { APIRoute } from 'astro';
import { z } from 'zod';
import {
  ApiError,
  assertAdminSession,
  assertSameOrigin,
  errorResponse,
  jsonResponse,
} from '../../../cms/api';
import {
  listBlogPosts,
  replaceBlogPosts,
  savePageDocument,
} from '../../../cms/content-loader';
import { getGithubEnv } from '../../../cms/config';
import { normalizePublishRequest } from '../../../cms/content-normalization';
import {
  commitFiles,
  PublishConflictError,
  type PublishFile,
} from '../../../cms/github-publisher';
import { getPublishErrorResponse } from '../../../cms/publish-errors';
import { cmsPublishRequestSchema, type CmsBlogPost } from '../../../cms/schema';

function isValidCmsUrl(value: string): boolean {
  if (!value) {
    return true;
  }

  if (value.startsWith('/')) {
    return true;
  }

  return /^https:\/\//.test(value);
}

function assertUrlField(value: string, fieldName: string): void {
  if (!isValidCmsUrl(value)) {
    throw new ApiError(400, `Invalid URL for ${fieldName}`);
  }
}

function assertPublishedLocale(post: CmsBlogPost, locale: 'en' | 'pt'): void {
  const entry = post.locales[locale];
  const seo = post.seoByLocale[locale];

  const required = [
    ['title', entry.title],
    ['excerpt', entry.excerpt],
    ['body', entry.body],
    ['coverAlt', entry.coverAlt],
    ['seo.title', seo.title],
    ['seo.description', seo.description],
  ];

  for (const [field, value] of required) {
    if (!value || !value.trim()) {
      throw new ApiError(400, `Published post "${post.slug}" is missing ${locale}.${field}`);
    }
  }
}

function validateBlogPosts(posts: CmsBlogPost[]): void {
  const slugSet = new Set<string>();

  for (const post of posts) {
    if (slugSet.has(post.slug)) {
      throw new ApiError(400, `Duplicate blog slug: ${post.slug}`);
    }

    slugSet.add(post.slug);

    assertUrlField(post.coverImage, `${post.slug}.coverImage`);

    for (const locale of ['en', 'pt'] as const) {
      const seo = post.seoByLocale[locale];
      const canonical = seo.canonical;

      assertUrlField(seo.ogImage, `${post.slug}.${locale}.seo.ogImage`);
      assertUrlField(canonical, `${post.slug}.${locale}.seo.canonical`);
    }

    if (post.status === 'published') {
      assertPublishedLocale(post, 'en');
      assertPublishedLocale(post, 'pt');
      continue;
    }

    const hasAnyDraftContent =
      post.locales.en.title.trim() ||
      post.locales.en.body.trim() ||
      post.locales.pt.title.trim() ||
      post.locales.pt.body.trim();

    if (!hasAnyDraftContent) {
      throw new ApiError(400, `Draft post "${post.slug}" must include at least one locale title/body`);
    }
  }
}

function toJsonFile(path: string, payload: unknown): PublishFile {
  return {
    path,
    content: `${JSON.stringify(payload, null, 2)}\n`,
    encoding: 'utf-8',
  };
}

export const POST: APIRoute = async (context) => {
  try {
    assertSameOrigin(context);
    assertAdminSession(context);

    const payload = normalizePublishRequest(
      cmsPublishRequestSchema.parse(await context.request.json()),
    );

    validateBlogPosts(payload.blogPosts);

    const files: PublishFile[] = [];
    for (const page of payload.pages) {
      for (const locale of ['en', 'pt'] as const) {
        const seo = page.seo[locale];
        assertUrlField(seo.ogImage, `${page.pageId}.${locale}.seo.ogImage`);
        assertUrlField(seo.canonical, `${page.pageId}.${locale}.seo.canonical`);
      }

      for (const link of page.links) {
        assertUrlField(link.href.en, `${page.pageId}.links.${link.id}.href.en`);
        assertUrlField(link.href.pt, `${page.pageId}.links.${link.id}.href.pt`);
      }

      for (const image of page.images) {
        assertUrlField(image.src, `${page.pageId}.images.${image.id}.src`);
        assertUrlField(image.attributionUrl, `${page.pageId}.images.${image.id}.attributionUrl`);
        assertUrlField(image.licenseUrl, `${page.pageId}.images.${image.id}.licenseUrl`);
      }

      files.push(toJsonFile(`content/cms/pages/${page.pageId}.json`, page));
    }

    for (const post of payload.blogPosts) {
      files.push(toJsonFile(`content/cms/blog/posts/${post.id}.json`, post));
    }

    const existingPosts = await listBlogPosts();
    const incomingIds = new Set(payload.blogPosts.map((post) => post.id));
    for (const existingPost of existingPosts) {
      if (incomingIds.has(existingPost.id)) {
        continue;
      }

      files.push({
        path: `content/cms/blog/posts/${existingPost.id}.json`,
        delete: true,
      });
    }

    for (const page of payload.pages) {
      try {
        await savePageDocument(page);
      } catch {
        // Ignore read-only filesystem failures in serverless runtime.
      }
    }

    try {
      await replaceBlogPosts(payload.blogPosts);
    } catch {
      // Ignore read-only filesystem failures in serverless runtime.
    }

    const githubEnv = getGithubEnv();

    const commitSha = await commitFiles({
      config: githubEnv,
      files,
      message: `cms: publish by admin ${new Date().toISOString()}`,
      expectedHeadSha: payload.baseSha,
    });

    return jsonResponse({ ok: true, commitSha });
  } catch (error) {
    const publishError = getPublishErrorResponse(error);
    if (publishError) {
      return jsonResponse({ error: publishError.message }, publishError.status);
    }

    if (error instanceof PublishConflictError) {
      return jsonResponse({ error: error.message }, 409);
    }

    if (error instanceof z.ZodError) {
      return jsonResponse({ error: 'Validation failed', details: error.flatten() }, 400);
    }

    return errorResponse(error);
  }
};
