import { describe, expect, test } from 'bun:test';
import { ApiError, assertSameOrigin } from './api';

function createContext(
  url: string,
  {
    method = 'POST',
    headers = {},
  }: {
    method?: string;
    headers?: Record<string, string>;
  } = {},
) {
  return {
    request: new Request(url, {
      method,
      headers: new Headers(headers),
    }),
    url: new URL(url),
  };
}

describe('cms api origin checks', () => {
  test('accepts matching origin and host', () => {
    const context = createContext('https://www.madeirapropertyconcierge.com/api/admin/upload-image', {
      headers: {
        origin: 'https://www.madeirapropertyconcierge.com',
        host: 'www.madeirapropertyconcierge.com',
      },
    });

    expect(() => assertSameOrigin(context)).not.toThrow();
  });

  test('accepts forwarded custom domain against deployment url', () => {
    const context = createContext('https://concierge-7hjhys3e0-madeirapropertyconcierges-projects.vercel.app/api/admin/upload-image', {
      headers: {
        origin: 'https://www.madeirapropertyconcierge.com',
        host: 'concierge-7hjhys3e0-madeirapropertyconcierges-projects.vercel.app',
        'x-forwarded-host': 'www.madeirapropertyconcierge.com',
        'x-forwarded-proto': 'https',
      },
    });

    expect(() => assertSameOrigin(context)).not.toThrow();
  });

  test('rejects mismatched origin', () => {
    const context = createContext('https://www.madeirapropertyconcierge.com/api/admin/upload-image', {
      headers: {
        origin: 'https://evil.example',
        host: 'www.madeirapropertyconcierge.com',
      },
    });

    expect(() => assertSameOrigin(context)).toThrow(ApiError);
  });
});
