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

export function getPageIdFromPath(pathname: string): string {
  const segments = pathname.replace(/\/+$/, '').split('/').filter(Boolean);

  if (segments.length === 0) {
    return 'en-home';
  }

  const locale = segments[0] === 'pt' ? 'pt' : 'en';
  const routeParts = segments.slice(1).map(sanitizeSegment).filter(Boolean);

  if (routeParts.length === 0) {
    return `${locale}-home`;
  }

  if (routeParts[0] === 'blog' && routeParts.length > 1) {
    return `${locale}-blog-post`;
  }

  return `${locale}-${routeParts.join('-')}`;
}

export function normalizePageId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
