import { load } from 'cheerio';
import { renderBlockMarkdown } from '../cms/markdown';

export interface BlogTocEntry {
  id: string;
  text: string;
}

export interface RenderedBlogBody {
  html: string;
  toc: BlogTocEntry[];
}

function anchorId(value: string, index: number): string {
  const slug = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${slug || 'section'}-${index}`;
}

/**
 * Render a blog post body through the shared markdown pipeline (the same one the
 * pages and the editor use), then assign stable anchor ids to the h2/h3 headings
 * and extract the h2 table of contents. Keeping the body on the shared pipeline
 * means posts get the same inline formatting and escaping as everything else.
 */
export function renderBlogBody(body: string): RenderedBlogBody {
  const $ = load(renderBlockMarkdown(body), null, false);
  const toc: BlogTocEntry[] = [];

  $('h2, h3').each((index, element) => {
    const node = $(element);
    const text = node.text().trim();
    const id = anchorId(text, index);
    node.attr('id', id);

    if (node.is('h2')) {
      toc.push({ id, text });
    }
  });

  return { html: $.html(), toc };
}
