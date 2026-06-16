import { pageId } from './context';
import type { ContentResponse } from './types';

interface ApiErrorPayload {
  error?: string;
}

export async function readApiPayload<T>(response: Response): Promise<T & ApiErrorPayload> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return (await response.json()) as T & ApiErrorPayload;
  }

  const text = (await response.text()).trim();
  return {
    ...(text ? { error: text } : {}),
  } as T & ApiErrorPayload;
}

export async function login(password: string): Promise<boolean> {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password }),
  });

  return response.ok;
}

export async function fetchContent(): Promise<ContentResponse> {
  const response = await fetch(`/api/admin/content?pageId=${encodeURIComponent(pageId)}`, {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    const payload = await readApiPayload<ContentResponse>(response);
    throw new Error(payload.error ?? 'Failed to load CMS content');
  }

  return await readApiPayload<ContentResponse>(response);
}

export async function checkSession(): Promise<boolean> {
  const response = await fetch('/api/admin/session', {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!response.ok) {
    return false;
  }

  const payload = await readApiPayload<{ authenticated?: boolean }>(response);
  return Boolean(payload.authenticated);
}
