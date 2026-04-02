import { describe, expect, it } from 'bun:test';
import { applyCmsPageDocumentToHtml } from './server-render';
import type { CmsPageDocument } from './schema';

describe('cms server render', () => {
  it('applies text, link, and image overrides server-side', () => {
    const page: CmsPageDocument = {
      pageId: 'en-home',
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
      pageId: 'en-home',
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
      pageId: 'en-home',
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
});
