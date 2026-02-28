import type { APIRoute } from 'astro';
import { clearSessionCookie } from '../../../cms/auth';
import { errorResponse, jsonResponse } from '../../../cms/api';

export const POST: APIRoute = async ({ cookies }) => {
  try {
    clearSessionCookie(cookies);
    return jsonResponse({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
};
