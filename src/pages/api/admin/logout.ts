import type { APIRoute } from 'astro';
import { clearSessionCookie } from '../../../cms/auth';
import { assertSameOrigin, errorResponse, jsonResponse } from '../../../cms/api';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    assertSameOrigin({ request, url: new URL(request.url) });
    clearSessionCookie(cookies);
    return jsonResponse({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
};
