import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

marked.setOptions({
  gfm: true,
  breaks: true,
});

const BASE_ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'code',
  'pre',
  'ul',
  'ol',
  'li',
  'blockquote',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'a',
  'span',
] as const;

const BASE_ALLOWED_ATTRS: sanitizeHtml.IOptions['allowedAttributes'] = {
  a: ['href', 'target', 'rel'],
  span: ['class'],
};

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitize(input: string): string {
  return sanitizeHtml(input, {
    allowedTags: [...BASE_ALLOWED_TAGS],
    allowedAttributes: BASE_ALLOWED_ATTRS,
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  });
}

export function renderInlineMarkdown(input: string): string {
  const escaped = escapeHtml(input);
  const html = marked.parseInline(escaped) as string;
  return sanitize(html);
}

export function renderBlockMarkdown(input: string): string {
  const escaped = escapeHtml(input);
  const html = marked.parse(escaped) as string;
  return sanitize(html);
}

export function stripMarkdown(input: string): string {
  return input
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1');
}
