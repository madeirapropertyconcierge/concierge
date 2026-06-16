import { pageId } from './context';
import type { ContentResponse } from './types';

interface ApiErrorPayload {
  error?: string;
}

export interface ApiResult<T> {
  ok: boolean;
  status: number;
  payload: T & ApiErrorPayload;
}

async function readApiPayload<T>(response: Response): Promise<T & ApiErrorPayload> {
  const contentType = response.headers.get('content-type') ?? '';

  if (contentType.includes('application/json')) {
    return (await response.json()) as T & ApiErrorPayload;
  }

  const text = (await response.text()).trim();
  return {
    ...(text ? { error: text } : {}),
  } as T & ApiErrorPayload;
}

async function toResult<T>(response: Response): Promise<ApiResult<T>> {
  return {
    ok: response.ok,
    status: response.status,
    payload: await readApiPayload<T>(response),
  };
}

export async function getJson<T>(url: string): Promise<ApiResult<T>> {
  const response = await fetch(url, { credentials: 'include', cache: 'no-store' });
  return toResult<T>(response);
}

export async function sendJson<T>(method: string, url: string, body?: unknown): Promise<ApiResult<T>> {
  const response = await fetch(url, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return toResult<T>(response);
}

export async function sendForm<T>(url: string, formData: FormData): Promise<ApiResult<T>> {
  const response = await fetch(url, { method: 'POST', credentials: 'include', body: formData });
  return toResult<T>(response);
}

export async function login(password: string): Promise<boolean> {
  const { ok } = await sendJson('POST', '/api/admin/login', { password });
  return ok;
}

export async function fetchContent(): Promise<ContentResponse> {
  const { ok, payload } = await getJson<ContentResponse>(
    `/api/admin/content?pageId=${encodeURIComponent(pageId)}`,
  );

  if (!ok) {
    throw new Error(payload.error ?? 'Failed to load CMS content');
  }

  return payload;
}

export async function checkSession(): Promise<boolean> {
  const { ok, payload } = await getJson<{ authenticated?: boolean }>('/api/admin/session');
  return ok && Boolean(payload.authenticated);
}
