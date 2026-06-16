import { locale } from './context';
import type { CmsPageDocument } from './types';

function setMetaContent(selector: string, content: string): void {
  const element = document.querySelector<HTMLMetaElement>(selector);
  if (element && content.trim()) {
    element.content = content;
  }
}

function updateSeoPreview(page: CmsPageDocument): void {
  const seo = page.seo[locale];
  if (!seo) {
    return;
  }

  if (seo.title.trim()) {
    document.title = seo.title;
  }

  setMetaContent('meta[name="description"]', seo.description);
  setMetaContent('meta[property="og:title"]', seo.ogTitle || seo.title);
  setMetaContent('meta[property="og:description"]', seo.ogDescription || seo.description);
  setMetaContent('meta[property="og:image"]', seo.ogImage);

  const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (canonical && seo.canonical.trim()) {
    canonical.href = seo.canonical;
  }
}

export { updateSeoPreview };
