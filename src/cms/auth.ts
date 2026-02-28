import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { AstroCookies } from 'astro';

export const CMS_SESSION_COOKIE = 'cms_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8;

interface SessionPayload {
  iat: number;
  exp: number;
  nonce: string;
}

function toBase64Url(value: Buffer | string): string {
  return Buffer.from(value)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function fromBase64Url(value: string): Buffer {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (normalized.length % 4)) % 4;
  return Buffer.from(`${normalized}${'='.repeat(padding)}`, 'base64');
}

function signPayload(payload: string, secret: string): string {
  const signature = createHmac('sha256', secret).update(payload).digest();
  return toBase64Url(signature);
}

export function createSessionToken(secret: string): string {
  const now = Date.now();
  const payload: SessionPayload = {
    iat: now,
    exp: now + SESSION_TTL_MS,
    nonce: toBase64Url(randomBytes(12)),
  };

  const payloadRaw = JSON.stringify(payload);
  const payloadEncoded = toBase64Url(payloadRaw);
  const signature = signPayload(payloadEncoded, secret);

  return `${payloadEncoded}.${signature}`;
}

export function verifySessionToken(token: string, secret: string): SessionPayload | null {
  const [payloadEncoded, signature] = token.split('.');
  if (!payloadEncoded || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payloadEncoded, secret);
  const provided = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(fromBase64Url(payloadEncoded).toString('utf-8')) as SessionPayload;
    if (Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export function setSessionCookie(cookies: AstroCookies, token: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  cookies.set(CMS_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export function clearSessionCookie(cookies: AstroCookies): void {
  cookies.delete(CMS_SESSION_COOKIE, {
    path: '/',
  });
}

export function getSessionToken(cookies: AstroCookies): string | null {
  return cookies.get(CMS_SESSION_COOKIE)?.value ?? null;
}

function verifyScrypt(password: string, encoded: string): boolean {
  const parts = encoded.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') {
    return false;
  }

  const salt = Buffer.from(parts[1], 'base64');
  const storedHash = Buffer.from(parts[2], 'base64');
  const derived = scryptSync(password, salt, storedHash.length);

  return timingSafeEqual(derived, storedHash);
}

export function createScryptHash(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${derived.toString('base64')}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (!storedHash.startsWith('scrypt$')) {
    return false;
  }

  return verifyScrypt(password, storedHash);
}
