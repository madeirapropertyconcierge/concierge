import type { APIRoute } from 'astro';
import { z } from 'zod';
import { errorResponse, jsonResponse } from '../../../cms/api';
import { createSessionToken, setSessionCookie, verifyPassword } from '../../../cms/auth';
import { getAuthEnv } from '../../../cms/config';

const payloadSchema = z.object({
  password: z.string().min(1),
});

const MAX_ATTEMPTS = 8;
const WINDOW_MS = 15 * 60 * 1000;
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }

  return 'unknown';
}

function isRateLimited(clientKey: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(clientKey);

  if (!record) {
    return false;
  }

  if (now > record.resetAt) {
    loginAttempts.delete(clientKey);
    return false;
  }

  return record.count >= MAX_ATTEMPTS;
}

function trackFailedAttempt(clientKey: string): void {
  const now = Date.now();
  const existing = loginAttempts.get(clientKey);

  if (!existing || now > existing.resetAt) {
    loginAttempts.set(clientKey, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }

  loginAttempts.set(clientKey, {
    count: existing.count + 1,
    resetAt: existing.resetAt,
  });
}

function clearFailedAttempts(clientKey: string): void {
  loginAttempts.delete(clientKey);
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const clientKey = getClientKey(request);
    if (isRateLimited(clientKey)) {
      return jsonResponse({ error: 'Too many attempts. Try again later.' }, 429);
    }

    const payload = payloadSchema.parse(await request.json());
    const auth = getAuthEnv();

    const valid = await verifyPassword(payload.password, auth.passwordHash);
    if (!valid) {
      trackFailedAttempt(clientKey);
      return jsonResponse({ error: 'Invalid credentials' }, 401);
    }

    clearFailedAttempts(clientKey);
    const token = createSessionToken(auth.sessionSecret);
    setSessionCookie(cookies, token);

    return jsonResponse({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
};
