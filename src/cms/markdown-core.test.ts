import { describe, expect, it } from 'bun:test';
import {
  renderBlockMarkdown,
  renderInlineMarkdown,
  renderMarkdown,
  stripMarkdown,
} from './markdown-core';
import * as serverMarkdown from './markdown';

describe('markdown-core inline', () => {
  it('renders bold/italic', () => {
    expect(renderInlineMarkdown('New **Headline**')).toBe('New <strong>Headline</strong>');
    expect(renderInlineMarkdown('say *hi*')).toBe('say <em>hi</em>');
  });

  it('keeps allowed link schemes', () => {
    expect(renderInlineMarkdown('[c](/en/contact)')).toContain('href="/en/contact"');
    expect(renderInlineMarkdown('[m](mailto:a@b.com)')).toContain('href="mailto:a@b.com"');
  });

  it('drops disallowed link schemes but keeps the text', () => {
    const out = renderInlineMarkdown('[x](javascript:alert(1))');
    expect(out).not.toContain('javascript:');
    expect(out).toContain('x');
  });

  it('escapes raw html so injected tags never survive', () => {
    const out = renderInlineMarkdown('<img src=x onerror=alert(1)> hi <script>bad()</script>');
    expect(out).not.toContain('<img');
    expect(out).not.toContain('<script');
    expect(out).toContain('hi');
  });
});

describe('markdown-core block', () => {
  it('wraps paragraphs', () => {
    expect(renderBlockMarkdown('Hello world')).toBe('<p>Hello world</p>\n');
  });

  it('treats single newlines as <br> (breaks:true)', () => {
    expect(renderBlockMarkdown('line one\nline two')).toContain('line one<br>line two');
  });

  it('renders lists', () => {
    const out = renderBlockMarkdown('- a\n- b');
    expect(out).toContain('<ul>');
    expect(out).toContain('<li>a</li>');
  });
});

describe('markdown-core helpers', () => {
  it('renderMarkdown dispatches by kind', () => {
    expect(renderMarkdown('**b**', 'inline')).toBe(renderInlineMarkdown('**b**'));
    expect(renderMarkdown('**b**', 'block')).toBe(renderBlockMarkdown('**b**'));
  });

  it('stripMarkdown removes syntax', () => {
    expect(stripMarkdown('**bold** and [a](b)')).toBe('bold and a');
  });
});

describe('server markdown re-export is identical to core', () => {
  const samples = ['New **Headline**', 'a\nb', '[c](/x)', '# Title', '- one\n- two'];

  it('produces byte-identical inline + block output', () => {
    for (const sample of samples) {
      expect(serverMarkdown.renderInlineMarkdown(sample)).toBe(renderInlineMarkdown(sample));
      expect(serverMarkdown.renderBlockMarkdown(sample)).toBe(renderBlockMarkdown(sample));
    }
  });
});
