import { load } from 'cheerio';
import type { Locale } from '../i18n/utils';
import type { CmsPageDocument } from './schema';
import { escapeJsString } from './cms-keys';
import { renderBlockMarkdown, renderInlineMarkdown, stripMarkdown } from './markdown';

interface ResolvedLocaleText {
  text: string;
  usedFallback: boolean;
}

function resolveLocaleText(value: { en: string; pt: string }, locale: Locale): ResolvedLocaleText {
  const primary = value[locale].trim();
  if (primary) {
    return { text: primary, usedFallback: false };
  }

  const fallback = value.en.trim();
  return { text: fallback, usedFallback: locale !== 'en' && fallback.length > 0 };
}

function markFallback(node: ReturnType<ReturnType<typeof load>>, usedFallback: boolean, locale: Locale): void {
  if (usedFallback) {
    node.attr('data-cms-fallback', locale);
  } else {
    node.removeAttr('data-cms-fallback');
  }
}

function isSimpleLinkLabelTarget(childrenCount: number): boolean {
  return childrenCount === 0;
}

function hasSharedOwner(
  $: ReturnType<typeof load>,
  element: Parameters<ReturnType<typeof load>>[0],
): boolean {
  return $(element)
    .parents()
    .addBack()
    .toArray()
    .some((node) => {
      const owner = $(node).attr('data-cms-owner')?.trim();
      return Boolean(owner && owner !== 'page');
    });
}

export function getLocaleFromPath(pathname: string): Locale {
  return pathname.startsWith('/pt') ? 'pt' : 'en';
}

export function applyCmsPageDocumentToHtml(
  html: string,
  page: CmsPageDocument,
  locale: Locale,
): string {
  if (page.texts.length === 0 && page.links.length === 0 && page.images.length === 0) {
    return html;
  }

  const $ = load(html);

  for (const field of page.texts) {
    const { text: content, usedFallback } = resolveLocaleText(field.value, locale);
    const rendered = field.kind === 'block'
      ? renderBlockMarkdown(content)
      : renderInlineMarkdown(content);

    $(field.selector).each((_index, element) => {
      if (hasSharedOwner($, element)) {
        return;
      }

      const node = $(element);
      node.html(rendered);
      node.attr('data-cms-field', 'text');
      node.attr('data-cms-id', field.id);
      node.attr('data-cms-selector', field.selector);
      node.attr('data-cms-kind', field.kind);
      node.attr('data-cms-source', content);
      markFallback(node, usedFallback, locale);
    });
  }

  for (const field of page.links) {
    const { text: label, usedFallback: labelFallback } = resolveLocaleText(field.label, locale);
    const { text: href, usedFallback: hrefFallback } = resolveLocaleText(field.href, locale);
    const renderedLabel = renderInlineMarkdown(label);

    $(field.selector).each((_index, element) => {
      const node = $(element);
      const tagName = 'tagName' in element ? element.tagName.toLowerCase() : '';
      const simpleLabelTarget = isSimpleLinkLabelTarget(node.children().length);

      if (hasSharedOwner($, element)) {
        return;
      }

      if (!tagName) {
        return;
      }

      if (tagName === 'a') {
        node.attr('href', href);
        if (simpleLabelTarget) {
          node.html(renderedLabel);
        }
      } else {
        node.attr('data-cms-href', href);
        if (simpleLabelTarget) {
          node.text(stripMarkdown(label));
        }

        if (tagName === 'button') {
          node.attr('type', 'button');
          node.attr('onclick', `window.location.href='${escapeJsString(href)}'`);
        }
      }

      node.attr('data-cms-field', 'link');
      node.attr('data-cms-id', field.id);
      node.attr('data-cms-selector', field.selector);
      markFallback(node, labelFallback || hrefFallback, locale);
    });
  }

  for (const field of page.images) {
    const { text: alt, usedFallback } = resolveLocaleText(field.alt, locale);

    $(field.selector).each((_index, element) => {
      const node = $(element);
      if (hasSharedOwner($, element)) {
        return;
      }

      node.attr('src', field.src);
      node.attr('alt', alt);
      node.attr('data-cms-field', 'image');
      node.attr('data-cms-id', field.id);
      node.attr('data-cms-selector', field.selector);
      markFallback(node, usedFallback, locale);
    });
  }

  return $.html();
}
