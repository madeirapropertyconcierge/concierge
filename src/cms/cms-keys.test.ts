import { describe, expect, it } from 'bun:test';
import { adHocId, cssEscapeAttr, escapeJsString, selectorForId } from './cms-keys';

describe('cms-keys', () => {
  it('builds a canonical attribute selector for an id', () => {
    expect(selectorForId('text:hero-subtitle')).toBe('[data-cms-id="text:hero-subtitle"]');
  });

  it('escapes quotes and backslashes inside ids', () => {
    expect(cssEscapeAttr('a"b\\c')).toBe('a\\"b\\\\c');
    expect(selectorForId('a"b')).toBe('[data-cms-id="a\\"b"]');
  });

  it('escapes single quotes and backslashes for inline JS strings', () => {
    expect(escapeJsString("/path'x")).toBe("/path\\'x");
    expect(escapeJsString('a\\b')).toBe('a\\\\b');
  });

  it('produces deterministic, fixed-shape ad-hoc ids', () => {
    const a = adHocId('text', 'main > p:nth-of-type(2)');
    const b = adHocId('text', 'main > p:nth-of-type(2)');
    expect(a).toBe(b);
    expect(a).toMatch(/^text:adhoc-[a-z0-9]+$/);
  });

  it('varies the ad-hoc id by kind and seed', () => {
    expect(adHocId('text', 'seed')).not.toBe(adHocId('link', 'seed'));
    expect(adHocId('text', 'seed-a')).not.toBe(adHocId('text', 'seed-b'));
  });
});
