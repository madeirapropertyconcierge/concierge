import type { APIContext } from 'astro';
import type { AstroCookies } from 'astro';
import { z } from 'zod';
import { getAuthEnv } from './config';
import {
  clearSessionCookie,
  createSessionToken,
  getSessionToken,
  setSessionCookie,
  verifySessionToken,
} from './auth';

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function firstHeaderValue(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.split(',')[0]?.trim();
  return normalized || null;
}

function collectExpectedOrigins(context: Pick<APIContext, 'request' | 'url'>): Set<string> {
  const hosts = new Set<string>();
  const protocols = new Set<string>();

  const forwardedHost = firstHeaderValue(context.request.headers.get('x-forwarded-host'));
  const host = firstHeaderValue(context.request.headers.get('host'));
  const forwardedProto = firstHeaderValue(context.request.headers.get('x-forwarded-proto'));
  const urlProtocol = context.url.protocol.replace(/:$/, '');

  if (forwardedHost) {
    hosts.add(forwardedHost);
  }

  if (host) {
    hosts.add(host);
  }

  if (context.url.host) {
    hosts.add(context.url.host);
  }

  if (forwardedProto) {
    protocols.add(forwardedProto);
  }

  if (urlProtocol) {
    protocols.add(urlProtocol);
  }

  const origins = new Set<string>();
  for (const protocol of protocols) {
    for (const currentHost of hosts) {
      origins.add(`${protocol}://${currentHost}`);
    }
  }

  if (context.url.origin) {
    origins.add(context.url.origin);
  }

  return origins;
}

export function assertSameOrigin(context: Pick<APIContext, 'request' | 'url'>): void {
  if (SAFE_METHODS.has(context.request.method.toUpperCase())) {
    return;
  }

  const origin = firstHeaderValue(context.request.headers.get('origin'));
  if (!origin) {
    throw new ApiError(403, 'Cross-site request blocked');
  }

  const expectedOrigins = collectExpectedOrigins(context);
  if (!expectedOrigins.has(origin)) {
    throw new ApiError(403, 'Cross-site request blocked');
  }
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}

export function errorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return jsonResponse({ error: error.message }, error.status);
  }

  if (error instanceof z.ZodError) {
    return jsonResponse({
      error: 'Validation failed',
      issues: error.flatten(),
    }, 400);
  }

  return jsonResponse({ error: 'Internal server error' }, 500);
}

export function assertAdminSession(context: APIContext): void {
  const auth = getAuthEnv();
  const token = getSessionToken(context.cookies);

  if (!token) {
    throw new ApiError(401, 'Authentication required');
  }

  const payload = verifySessionToken(token, auth.sessionSecret);
  if (!payload) {
    clearSessionCookie(context.cookies);
    throw new ApiError(401, 'Session expired');
  }
}

export function refreshAdminSession(cookies: AstroCookies): void {
  const auth = getAuthEnv();
  const token = createSessionToken(auth.sessionSecret);
  setSessionCookie(cookies, token);
}

export async function readJsonBody<T>(request: Request): Promise<T> {
  const body = await request.json();
  return body as T;
}
