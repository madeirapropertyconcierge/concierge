import { routeMap, type RouteKey } from '../i18n/routes';

const SAFE_SEGMENT_RE = /[^a-z0-9-]/g;

function sanitizeSegment(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(SAFE_SEGMENT_RE, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Reverse map: PT route slug → canonical (EN) page key */
const ptSlugToCanonical: Record<string, string> = {};
for (const key of Object.keys(routeMap.en) as RouteKey[]) {
  const ptSlug = routeMap.pt[key].replace('/pt/', '').replace(/\/$/, '');
  const enSlug = routeMap.en[key].replace('/en/', '').replace(/\/$/, '');
  if (ptSlug && enSlug && ptSlug !== enSlug) {
    ptSlugToCanonical[ptSlug] = enSlug;
  }
}

export function getPageIdFromPath(pathname: string): string {
  const segments = pathname.replace(/\/+$/, '').split('/').filter(Boolean);

  if (segments.length === 0) {
    return 'home';
  }

  const locale = segments[0] === 'pt' ? 'pt' : 'en';
  const routeParts = segments.slice(1).map(sanitizeSegment).filter(Boolean);

  if (routeParts.length === 0) {
    return 'home';
  }

  if (routeParts[0] === 'blog' && routeParts.length > 1) {
    return 'blog-post';
  }

  const slug = routeParts.join('-');

  if (locale === 'pt') {
    return ptSlugToCanonical[slug] ?? slug;
  }

  return slug;
}

export function normalizePageId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
