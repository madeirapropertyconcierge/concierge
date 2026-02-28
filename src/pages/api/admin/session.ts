import type { APIRoute } from 'astro';
import { errorResponse, jsonResponse, refreshAdminSession } from '../../../cms/api';
import { getAuthEnv } from '../../../cms/config';
import { getSessionToken, verifySessionToken } from '../../../cms/auth';

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const auth = getAuthEnv();
    const token = getSessionToken(cookies);

    if (!token) {
      return jsonResponse({ authenticated: false });
    }

    const payload = verifySessionToken(token, auth.sessionSecret);
    if (!payload) {
      return jsonResponse({ authenticated: false });
    }

    refreshAdminSession(cookies);

    return jsonResponse({ authenticated: true });
  } catch (error) {
    return errorResponse(error);
  }
};
