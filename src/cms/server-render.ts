import { load } from 'cheerio';
import type { Locale } from '../i18n/utils';
import type { CmsPageDocument } from './schema';
import { renderBlockMarkdown, renderInlineMarkdown, stripMarkdown } from './markdown';

function resolveLocaleText(value: { en: string; pt: string }, locale: Locale): string {
  return value[locale].trim() || value.en.trim();
}

function escapeJsString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
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
    const content = resolveLocaleText(field.value, locale);
    const rendered = field.kind === 'block'
      ? renderBlockMarkdown(content)
      : renderInlineMarkdown(content);

    $(field.selector).each((_index, element) => {
      if (hasSharedOwner($, element)) {
        return;
      }

      $(element).html(rendered);
      $(element).attr('data-cms-field', 'text');
      $(element).attr('data-cms-id', field.id);
      $(element).attr('data-cms-selector', field.selector);
      $(element).attr('data-cms-kind', field.kind);
      $(element).attr('data-cms-source', content);
    });
  }

  for (const field of page.links) {
    const label = resolveLocaleText(field.label, locale);
    const href = resolveLocaleText(field.href, locale);
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
    });
  }

  for (const field of page.images) {
    const alt = resolveLocaleText(field.alt, locale);

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
    });
  }

  return $.html();
}
