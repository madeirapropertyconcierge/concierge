import { describe, expect, it } from 'bun:test';
import { applyCmsPageDocumentToHtml } from './server-render';
import type { CmsPageDocument } from './schema';

describe('cms server render', () => {
  it('applies text, link, and image overrides server-side', () => {
    const page: CmsPageDocument = {
      pageId: 'home',
      updatedAt: '2026-02-28T00:00:00.000Z',
      seo: {
        en: { title: '', description: '', ogTitle: '', ogDescription: '', ogImage: '', canonical: '' },
        pt: { title: '', description: '', ogTitle: '', ogDescription: '', ogImage: '', canonical: '' },
      },
      texts: [
        {
          id: 'text:hero',
          selector: 'main > h1:nth-of-type(1)',
          kind: 'inline',
          value: { en: 'New **Headline**', pt: '' },
        },
      ],
      links: [
        {
          id: 'link:cta',
          selector: 'main > a:nth-of-type(1)',
          label: { en: 'Read **More**', pt: '' },
          href: { en: '/en/contact', pt: '' },
        },
      ],
      images: [
        {
          id: 'image:hero',
          selector: 'main > img:nth-of-type(1)',
          src: '/images/library/hero.jpg',
          alt: { en: 'Hero image', pt: '' },
          attributionName: '',
          attributionUrl: '',
          licenseUrl: '',
        },
      ],
    };

    const input = '<html><body><main><h1>Old</h1><a href="/old">Old link</a><img src="/old.jpg" alt="old" /></main></body></html>';
    const output = applyCmsPageDocumentToHtml(input, page, 'pt');

    expect(output).toContain('New <strong>Headline</strong>');
    expect(output).toContain('href="/en/contact"');
    expect(output).toContain('Read <strong>More</strong>');
    expect(output).toContain('src="/images/library/hero.jpg"');
    expect(output).toContain('alt="Hero image"');
  });

  it('preserves complex link structure while updating href', () => {
    const page: CmsPageDocument = {
      pageId: 'home',
      updatedAt: '2026-02-28T00:00:00.000Z',
      seo: {
        en: { title: '', description: '', ogTitle: '', ogDescription: '', ogImage: '', canonical: '' },
        pt: { title: '', description: '', ogTitle: '', ogDescription: '', ogImage: '', canonical: '' },
      },
      texts: [],
      links: [
        {
          id: 'link:tile',
          selector: 'main > a:nth-of-type(1)',
          label: { en: 'Will not replace card', pt: '' },
          href: { en: '/en/contact', pt: '' },
        },
      ],
      images: [],
    };

    const input = '<html><body><main><a href="/old"><img src="/tile.jpg" alt="tile" /><span>Card label</span></a></main></body></html>';
    const output = applyCmsPageDocumentToHtml(input, page, 'en');

    expect(output).toContain('href="/en/contact"');
    expect(output).toContain('<img src="/tile.jpg" alt="tile">');
    expect(output).toContain('<span>Card label</span>');
    expect(output).not.toContain('Will not replace card');
  });

  it('skips page overrides for shared package-owned elements', () => {
    const page: CmsPageDocument = {
      pageId: 'home',
      updatedAt: '2026-02-28T00:00:00.000Z',
      seo: {
        en: { title: '', description: '', ogTitle: '', ogDescription: '', ogImage: '', canonical: '' },
        pt: { title: '', description: '', ogTitle: '', ogDescription: '', ogImage: '', canonical: '' },
      },
      texts: [
        {
          id: 'text:package-title',
          selector: 'main > section:nth-of-type(1) > h2:nth-of-type(1)',
          kind: 'inline',
          value: { en: 'Old CMS Title', pt: '' },
        },
      ],
      links: [
        {
          id: 'link:package-link',
          selector: 'main > section:nth-of-type(1) > a:nth-of-type(1)',
          label: { en: 'Old CMS Label', pt: '' },
          href: { en: '/en/old-link', pt: '' },
        },
      ],
      images: [
        {
          id: 'image:package-image',
          selector: 'main > section:nth-of-type(1) > img:nth-of-type(1)',
          src: '/images/old-package.jpg',
          alt: { en: 'Old CMS Alt', pt: '' },
          attributionName: '',
          attributionUrl: '',
          licenseUrl: '',
        },
      ],
    };

    const input = `
      <html>
        <body>
          <main>
            <section>
              <h2 data-cms-owner="packages">Shared Package Title</h2>
              <a
                href="/en/services"
                data-cms-owner="packages"
                data-cms-shared-doc="packages"
                data-cms-shared-key="essentialCare"
                data-cms-shared-field="title"
              >
                Shared Package Link
              </a>
              <img
                src="/images/package.jpg"
                alt="Shared Package Alt"
                data-cms-owner="packages"
              />
            </section>
          </main>
        </body>
      </html>
    `;

    const output = applyCmsPageDocumentToHtml(input, page, 'en');

    expect(output).toContain('Shared Package Title');
    expect(output).toContain('href="/en/services"');
    expect(output).toContain('Shared Package Link');
    expect(output).toContain('src="/images/package.jpg"');
    expect(output).toContain('alt="Shared Package Alt"');
    expect(output).not.toContain('Old CMS Title');
    expect(output).not.toContain('/en/old-link');
    expect(output).not.toContain('/images/old-package.jpg');
  });

  it('applies a canonical data-cms-id field to ALL matching elements', () => {
    const page: CmsPageDocument = {
      pageId: 'home',
      updatedAt: '2026-02-28T00:00:00.000Z',
      seo: {
        en: { title: '', description: '', ogTitle: '', ogDescription: '', ogImage: '', canonical: '' },
        pt: { title: '', description: '', ogTitle: '', ogDescription: '', ogImage: '', canonical: '' },
      },
      texts: [
        {
          id: 'text:repeated',
          selector: '[data-cms-id="text:repeated"]',
          kind: 'inline',
          value: { en: 'Synced', pt: 'Synced' },
        },
      ],
      links: [],
      images: [],
    };

    const input =
      '<html><body><main>' +
      '<p data-cms-id="text:repeated">one</p>' +
      '<p data-cms-id="text:repeated">two</p>' +
      '</main></body></html>';
    const output = applyCmsPageDocumentToHtml(input, page, 'en');

    expect(output.match(/data-cms-source="Synced"/g)?.length).toBe(2);
    expect(output).not.toContain('>one<');
    expect(output).not.toContain('>two<');
  });

  it('navigates non-anchor link targets via a constant onclick reading data-cms-href', () => {
    const page: CmsPageDocument = {
      pageId: 'home',
      updatedAt: '2026-02-28T00:00:00.000Z',
      seo: {
        en: { title: '', description: '', ogTitle: '', ogDescription: '', ogImage: '', canonical: '' },
        pt: { title: '', description: '', ogTitle: '', ogDescription: '', ogImage: '', canonical: '' },
      },
      texts: [],
      links: [
        {
          id: 'link:cta',
          selector: '[data-cms-id="link:cta"]',
          label: { en: 'Go', pt: 'Go' },
          href: { en: "/en/it's-here", pt: "/en/it's-here" },
        },
      ],
      images: [],
    };

    const input = '<html><body><main><button data-cms-id="link:cta">Go</button></main></body></html>';
    const output = applyCmsPageDocumentToHtml(input, page, 'en');

    // The handler is a fixed literal (no interpolation); the URL lives only in the
    // HTML-encoded data attribute, so a quote in the href cannot break out.
    expect(output).toContain('onclick="window.location.href=this.dataset.cmsHref"');
    expect(output).toContain('data-cms-href="/en/it\'s-here"');
  });

  it('marks pt→en fallback with data-cms-fallback', () => {
    const page: CmsPageDocument = {
      pageId: 'home',
      updatedAt: '2026-02-28T00:00:00.000Z',
      seo: {
        en: { title: '', description: '', ogTitle: '', ogDescription: '', ogImage: '', canonical: '' },
        pt: { title: '', description: '', ogTitle: '', ogDescription: '', ogImage: '', canonical: '' },
      },
      texts: [
        {
          id: 'text:only-en',
          selector: '[data-cms-id="text:only-en"]',
          kind: 'inline',
          value: { en: 'English only', pt: '' },
        },
        {
          id: 'text:both',
          selector: '[data-cms-id="text:both"]',
          kind: 'inline',
          value: { en: 'English', pt: 'Portugues' },
        },
      ],
      links: [],
      images: [],
    };

    const input =
      '<html><body><main>' +
      '<p data-cms-id="text:only-en">x</p>' +
      '<p data-cms-id="text:both">y</p>' +
      '</main></body></html>';

    const ptOutput = applyCmsPageDocumentToHtml(input, page, 'pt');
    expect(ptOutput).toContain('English only');
    expect(ptOutput).toMatch(/data-cms-id="text:only-en"[^>]*data-cms-fallback="pt"|data-cms-fallback="pt"[^>]*data-cms-id="text:only-en"/);
    expect(ptOutput).not.toContain('data-cms-fallback="pt"' + ' data-cms-id="text:both"');

    const enOutput = applyCmsPageDocumentToHtml(input, page, 'en');
    expect(enOutput).not.toContain('data-cms-fallback');
  });
});
