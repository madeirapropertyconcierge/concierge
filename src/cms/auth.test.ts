import { describe, expect, it } from 'bun:test';
import { createScryptHash, createSessionToken, verifyPassword, verifySessionToken } from './auth';

describe('cms auth', () => {
  it('verifies scrypt hashes', async () => {
    const hash = createScryptHash('secret-123');
    expect(await verifyPassword('secret-123', hash)).toBe(true);
    expect(await verifyPassword('wrong-password', hash)).toBe(false);
  });

  it('creates and verifies signed session tokens', () => {
    const secret = 'test-session-secret';
    const token = createSessionToken(secret);
    const payload = verifySessionToken(token, secret);
    expect(payload).not.toBeNull();
  });

  it('rejects tampered session tokens', () => {
    const secret = 'test-session-secret';
    const token = createSessionToken(secret);
    const tampered = `${token}tampered`;
    expect(verifySessionToken(tampered, secret)).toBeNull();
  });
});
