import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse } from '../../../cms/api';
import { getPageIdFromPath, normalizePageId } from '../../../cms/page-id';
import {
  listBlogPosts,
  loadPageDocument,
} from '../../../cms/content-loader';
import { collectSiteGalleryImages } from '../../../cms/image-gallery';
import { getAuthEnv, tryGetGithubEnv } from '../../../cms/config';
import { getSessionToken, verifySessionToken } from '../../../cms/auth';
import { getBranchHeadSha } from '../../../cms/github-publisher';

function resolvePageId(url: URL): string {
  const fromQuery = url.searchParams.get('pageId');
  if (fromQuery) {
    return normalizePageId(fromQuery);
  }

  const fromPath = url.searchParams.get('path');
  if (fromPath) {
    return getPageIdFromPath(fromPath);
  }

  return 'en-home';
}

function isAuthenticated(token: string | null): boolean {
  if (!token) {
    return false;
  }

  try {
    const auth = getAuthEnv();
    return Boolean(verifySessionToken(token, auth.sessionSecret));
  } catch {
    return false;
  }
}

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    const pageId = resolvePageId(url);
    const [page, allBlogPosts] = await Promise.all([
      loadPageDocument(pageId),
      listBlogPosts(),
    ]);

    const sessionValid = isAuthenticated(getSessionToken(cookies));
    const blogPosts = sessionValid
      ? allBlogPosts
      : allBlogPosts.filter((post) => post.status === 'published');
    let branchSha: string | null = null;
    let galleryItems: Awaited<ReturnType<typeof collectSiteGalleryImages>> = [];

    if (sessionValid) {
      const githubEnv = tryGetGithubEnv();
      [branchSha, galleryItems] = await Promise.all([
        githubEnv ? getBranchHeadSha(githubEnv) : Promise.resolve(null),
        collectSiteGalleryImages(),
      ]);
    }

    return jsonResponse({
      page,
      blogPosts,
      branchSha,
      galleryItems,
      authenticated: sessionValid,
    });
  } catch (error) {
    return errorResponse(error);
  }
};
