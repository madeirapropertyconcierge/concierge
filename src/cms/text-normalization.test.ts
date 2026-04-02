import { describe, expect, it } from 'bun:test';
import { normalizePublishRequest } from './content-normalization';
import type { CmsPublishRequest } from './schema';
import { normalizeCmsText } from './text-normalization';

const packageFixture: CmsPublishRequest['packages'] = {
  updatedAt: '2026-03-11T10:00:00.000Z',
  packages: [
    {
      key: 'essentialCare',
      tierLabel: { en: 'Property Care', pt: 'Cuidado do Imovel' },
      title: { en: 'Essential Care Package', pt: 'Pacote de Cuidados Essenciais' },
      price: {
        headline: { en: '€95/month', pt: 'EUR95/mes' },
        detail: { en: '', pt: '' },
      },
      audience: {
        en: 'Designed for overseas owners.',
        pt: 'Pensado para proprietarios no estrangeiro.',
      },
      features: {
        en: ['Secure key holding'],
        pt: ['Guarda segura de chaves'],
      },
      idealFor: {
        en: 'Vacant homes.',
        pt: 'Casas vazias.',
      },
      servicesBullets: {
        en: ['Monthly inspections'],
        pt: ['Inspecoes mensais'],
      },
      homeBlurb: {
        en: 'Monthly inspections and reports.',
        pt: 'Inspecoes mensais e relatorios.',
      },
    },
  ],
};

describe('cms text normalization', () => {
  it('repairs common UTF-8 mojibake', () => {
    expect(normalizeCmsText('Fundadora & VisÃ£o')).toBe('Fundadora & Visão');
    expect(normalizeCmsText('Vai saber sempre quem Ã© responsÃ¡vel.')).toBe(
      'Vai saber sempre quem é responsável.',
    );
    expect(normalizeCmsText('ExperiÃªncia em UX, raÃ­zes madeirenses.')).toBe(
      'Experiência em UX, raízes madeirenses.',
    );
  });

  it('keeps valid Portuguese untouched', () => {
    expect(normalizeCmsText('Âmbito de Serviço e Contratação')).toBe(
      'Âmbito de Serviço e Contratação',
    );
  });

  it('normalizes nested CMS publish payload text fields', () => {
    const payload: CmsPublishRequest = {
      pages: [
        {
          pageId: 'pt-sobre',
          updatedAt: '2026-03-11T10:00:00.000Z',
          seo: {
            en: {
              title: '',
              description: '',
              ogTitle: '',
              ogDescription: '',
              ogImage: '',
              canonical: '',
            },
            pt: {
              title: 'Sobre a Lisa',
              description: 'ConheÃ§a a Lisa.',
              ogTitle: 'Fundadora & VisÃ£o',
              ogDescription: 'Uma pessoa gere tudo. Vai saber sempre quem Ã© responsÃ¡vel.',
              ogImage: '/images/about/lisa_1.webp',
              canonical: '/pt/sobre',
            },
          },
          texts: [
            {
              id: 'text:hero',
              selector: 'main > h1:nth-of-type(1)',
              kind: 'inline',
              value: {
                en: '',
                pt: 'ExperiÃªncia em UX, raÃ­zes madeirenses.',
              },
            },
          ],
          links: [],
          images: [],
        },
      ],
      blogPosts: [
        {
          id: 'post-1',
          slug: 'post-1',
          status: 'draft',
          publishedAt: '2026-03-11',
          updatedAt: '2026-03-11T10:00:00.000Z',
          tags: ['gestÃ£o'],
          readingMinutes: 5,
          coverImage: '/images/blog/post.webp',
          locales: {
            en: { title: '', excerpt: '', body: '', coverAlt: '' },
            pt: {
              title: 'GestÃ£o remota',
              excerpt: 'OperaÃ§Ã£o local com controlo.',
              body: 'ConteÃºdo com revisÃ£o.',
              coverAlt: 'Vista para o oceano',
            },
          },
          seoByLocale: {
            en: {
              title: '',
              description: '',
              ogTitle: '',
              ogDescription: '',
              ogImage: '',
              canonical: '',
            },
            pt: {
              title: 'GestÃ£o remota',
              description: 'OperaÃ§Ã£o local com controlo.',
              ogTitle: 'GestÃ£o remota',
              ogDescription: 'OperaÃ§Ã£o local com controlo.',
              ogImage: '/images/blog/post.webp',
              canonical: '/pt/blog/post-1',
            },
          },
        },
      ],
      packages: packageFixture,
      baseSha: 'abc123',
    };

    const normalized = normalizePublishRequest(payload);

    expect(normalized.pages[0]?.seo.pt.description).toBe('Conheça a Lisa.');
    expect(normalized.pages[0]?.seo.pt.ogTitle).toBe('Fundadora & Visão');
    expect(normalized.pages[0]?.texts[0]?.value.pt).toBe('Experiência em UX, raízes madeirenses.');
    expect(normalized.blogPosts[0]?.locales.pt.title).toBe('Gestão remota');
    expect(normalized.blogPosts[0]?.tags[0]).toBe('gestão');
  });
});
