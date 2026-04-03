import { describe, expect, it } from 'bun:test';
import { getPageIdFromPath } from './page-id';

describe('cms page id mapping', () => {
  it('maps localized home paths', () => {
    expect(getPageIdFromPath('/en/')).toBe('home');
    expect(getPageIdFromPath('/pt/')).toBe('home');
  });

  it('maps nested localized routes', () => {
    expect(getPageIdFromPath('/en/how-it-works')).toBe('how-it-works');
    expect(getPageIdFromPath('/pt/como-funciona')).toBe('how-it-works');
  });

  it('maps blog detail routes', () => {
    expect(getPageIdFromPath('/en/blog/my-slug')).toBe('blog-post');
    expect(getPageIdFromPath('/pt/blog/o-meu-artigo')).toBe('blog-post');
  });

  it('maps PT slugs to canonical EN page names', () => {
    expect(getPageIdFromPath('/pt/sobre')).toBe('about');
    expect(getPageIdFromPath('/pt/precos')).toBe('pricing');
    expect(getPageIdFromPath('/pt/servicos')).toBe('services');
    expect(getPageIdFromPath('/pt/contacto')).toBe('contact');
    expect(getPageIdFromPath('/pt/perguntas-frequentes')).toBe('faq');
    expect(getPageIdFromPath('/pt/guia')).toBe('guide');
    expect(getPageIdFromPath('/pt/privacidade')).toBe('privacy');
    expect(getPageIdFromPath('/pt/termos')).toBe('terms');
  });

  it('maps EN paths directly', () => {
    expect(getPageIdFromPath('/en/about')).toBe('about');
    expect(getPageIdFromPath('/en/services')).toBe('services');
    expect(getPageIdFromPath('/en/pricing')).toBe('pricing');
    expect(getPageIdFromPath('/en/faq')).toBe('faq');
  });
});
