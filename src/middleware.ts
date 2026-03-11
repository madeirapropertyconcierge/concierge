import type { MiddlewareHandler } from 'astro';
import { loadPageDocument } from './cms/content-loader';
import { getPageIdFromPath } from './cms/page-id';
import { applyCmsPageDocumentToHtml, getLocaleFromPath } from './cms/server-render';

function shouldSkipPath(pathname: string): boolean {
  return (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_astro/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/favicon') ||
    pathname === '/robots.txt'
  );
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  if (context.request.method !== 'GET') {
    return next();
  }

  if (shouldSkipPath(context.url.pathname)) {
    return next();
  }

  const response = await next();

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  if (response.status >= 300 && response.status < 400) {
    return response;
  }

  const pageId = getPageIdFromPath(context.url.pathname);
  const pageDocument = await loadPageDocument(pageId);

  if (pageDocument.texts.length === 0 && pageDocument.links.length === 0 && pageDocument.images.length === 0) {
    return response;
  }

  const locale = getLocaleFromPath(context.url.pathname);
  const html = await response.text();
  const transformedHtml = applyCmsPageDocumentToHtml(html, pageDocument, locale);

  const headers = new Headers(response.headers);
  headers.delete('content-length');
  const transformedContentType = headers.get('content-type');
  if (transformedContentType && !/charset=/i.test(transformedContentType)) {
    headers.set('content-type', `${transformedContentType}; charset=utf-8`);
  }

  return new Response(transformedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
