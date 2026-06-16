import type { APIRoute } from 'astro';
import { z } from 'zod';
import {
  assertAdminSession,
  assertSameOrigin,
  errorResponse,
  jsonResponse,
} from '../../../cms/api';
import {
  listBlogPosts,
  replaceBlogPosts,
  savePageDocument,
  saveServicePackageDocument,
} from '../../../cms/content-loader';
import { getGithubEnv } from '../../../cms/config';
import {
  normalizePublishRequest,
  normalizeServicePackageDocument,
} from '../../../cms/content-normalization';
import {
  commitFiles,
  PublishConflictError,
  type PublishFile,
} from '../../../cms/github-publisher';
import { getPublishErrorResponse } from '../../../cms/publish-errors';
import {
  collectPageLocaleWarnings,
  validateBlogPosts,
  validatePackages,
  validatePageUrls,
} from '../../../cms/publish-validation';
import {
  cmsPublishRequestSchema,
  cmsServicePackageDocumentSchema,
} from '../../../cms/schema';

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
    validatePackages(payload.packages);

    const warnings = collectPageLocaleWarnings(payload.pages);

    const files: PublishFile[] = [];
    for (const page of payload.pages) {
      validatePageUrls(page);
      files.push(toJsonFile(`content/cms/pages/${page.pageId}.json`, page));
    }

    for (const post of payload.blogPosts) {
      files.push(toJsonFile(`content/cms/blog/posts/${post.id}.json`, post));
    }

    files.push(
      toJsonFile(
        'content/cms/packages.json',
        cmsServicePackageDocumentSchema.parse(payload.packages),
      ),
    );

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

    try {
      await saveServicePackageDocument(normalizeServicePackageDocument(payload.packages));
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

    return jsonResponse({ ok: true, commitSha, warnings });
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
