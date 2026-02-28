import { describe, expect, it } from 'bun:test';
import { getPageIdFromPath } from './page-id';

describe('cms page id mapping', () => {
  it('maps localized home paths', () => {
    expect(getPageIdFromPath('/en/')).toBe('en-home');
    expect(getPageIdFromPath('/pt/')).toBe('pt-home');
  });

  it('maps nested localized routes', () => {
    expect(getPageIdFromPath('/en/how-it-works')).toBe('en-how-it-works');
    expect(getPageIdFromPath('/pt/perguntas-frequentes')).toBe('pt-perguntas-frequentes');
  });

  it('maps blog detail routes', () => {
    expect(getPageIdFromPath('/en/blog/my-slug')).toBe('en-blog-my-slug');
  });
});
