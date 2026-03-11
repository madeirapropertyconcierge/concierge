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
