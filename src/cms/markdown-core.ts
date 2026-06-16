import { marked } from 'marked';

/**
 * Isomorphic markdown rendering shared by the Astro server components, the
 * middleware renderer, and the in-browser editor. Having ONE implementation is
 * what guarantees the editor preview matches the published HTML.
 *
 * Inputs are HTML-escaped before being handed to `marked`, so the only markup
 * that reaches the sanitizer is `marked`'s own controlled output. The sanitizer
 * therefore only has to enforce a small tag/attribute allowlist — it never sees
 * raw user HTML.
 */

marked.setOptions({
  gfm: true,
  breaks: true,
});

const ALLOWED_TAGS = new Set([
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
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'target', 'rel']),
  span: new Set(['class']),
};

const ALLOWED_HREF = /^(https?:\/\/|mailto:|tel:|\/|#)/i;

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sanitizeAttributes(tagName: string, rawAttrs: string): string {
  const allowed = ALLOWED_ATTRS[tagName];
  if (!allowed) {
    return '';
  }

  const attrPattern = /([a-zA-Z][a-zA-Z0-9-]*)\s*=\s*("([^"]*)"|'([^']*)')/g;
  let result = '';
  let match: RegExpExecArray | null;

  while ((match = attrPattern.exec(rawAttrs)) !== null) {
    const attrName = match[1].toLowerCase();
    const attrValue = match[3] ?? match[4] ?? '';

    if (!allowed.has(attrName)) {
      continue;
    }

    if (tagName === 'a' && attrName === 'href' && !ALLOWED_HREF.test(attrValue.trim())) {
      continue;
    }

    result += ` ${attrName}="${attrValue}"`;
  }

  return result;
}

/**
 * Allowlist sanitizer for `marked` output. Disallowed tags are discarded while
 * their text content is preserved (matching the server's previous
 * `sanitize-html` `discard` behaviour). Disallowed attributes are dropped.
 */
function sanitize(html: string): string {
  return html.replace(
    /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g,
    (_match, closing: string, rawName: string, rawAttrs: string) => {
      const tagName = rawName.toLowerCase();

      if (!ALLOWED_TAGS.has(tagName)) {
        return '';
      }

      if (closing) {
        return `</${tagName}>`;
      }

      return `<${tagName}${sanitizeAttributes(tagName, rawAttrs)}>`;
    },
  );
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

export function renderMarkdown(source: string, kind: 'inline' | 'block'): string {
  return kind === 'block' ? renderBlockMarkdown(source) : renderInlineMarkdown(source);
}
