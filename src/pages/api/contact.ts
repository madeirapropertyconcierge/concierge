import type { APIRoute } from 'astro';
import { z } from 'zod';
import { assertSameOrigin, errorResponse, jsonResponse } from '../../cms/api';
import { tryGetContactEnv } from '../../cms/config';
import { sendBrevoEmail } from '../../lib/email';
import { SITE } from '../../lib/constants';

export const prerender = false;

const payloadSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  phone: z.string().trim().max(60).optional().default(''),
  propertyType: z.string().trim().max(80).optional().default(''),
  service: z.string().trim().max(80).optional().default(''),
  message: z.string().trim().min(1).max(5000),
  language: z.string().trim().max(10).optional().default('en'),
});

const MAX_SUBMISSIONS = 5;
const WINDOW_MS = 10 * 60 * 1000;
const submissions = new Map<string, { count: number; resetAt: number }>();

function getClientKey(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? 'unknown';
  }

  return 'unknown';
}

function registerAndCheckLimit(clientKey: string): boolean {
  const now = Date.now();
  const record = submissions.get(clientKey);

  if (!record || now > record.resetAt) {
    submissions.set(clientKey, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  record.count += 1;
  return record.count > MAX_SUBMISSIONS;
}

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char] ?? char);
}

export const POST: APIRoute = async (context) => {
  const { request } = context;

  try {
    assertSameOrigin(context);

    const clientKey = getClientKey(request);

    const form = await request.formData();

    // Honeypot: real users never fill this hidden field. Silently accept bots.
    const honeypot = String(form.get('company') ?? '').trim();
    if (honeypot) {
      return jsonResponse({ ok: true });
    }

    if (registerAndCheckLimit(clientKey)) {
      return jsonResponse({ error: 'Too many submissions. Please try again later.' }, 429);
    }

    const payload = payloadSchema.parse({
      name: form.get('name'),
      email: form.get('email'),
      phone: form.get('phone') ?? undefined,
      propertyType: form.get('propertyType') ?? undefined,
      service: form.get('service') ?? undefined,
      message: form.get('message'),
      language: form.get('language') ?? undefined,
    });

    const env = tryGetContactEnv();
    if (!env) {
      return jsonResponse({ error: 'The contact form is not configured yet.' }, 503);
    }

    const fromEmail = env.fromEmail ?? SITE.email;
    const fromName = env.fromName ?? `${SITE.name} website`;
    // Enquiries are delivered to the same verified address we send from.
    const toEmail = fromEmail;

    const detailRows: Array<[string, string]> = [
      ['Name', payload.name],
      ['Email', payload.email],
      ['Phone', payload.phone],
      ['Property type', payload.propertyType],
      ['Service', payload.service],
      ['Language', payload.language],
    ];
    const filledRows = detailRows.filter(([, value]) => value.length > 0);

    const subject = payload.propertyType
      ? `New enquiry from ${payload.name} · ${payload.propertyType}`
      : `New enquiry from ${payload.name}`;

    const htmlRows = filledRows
      .map(
        ([label, value]) =>
          `<tr><td style="padding:4px 12px 4px 0;color:#555;">${escapeHtml(label)}</td><td style="padding:4px 0;"><strong>${escapeHtml(value)}</strong></td></tr>`,
      )
      .join('');

    const htmlContent = `<div style="font-family:system-ui,sans-serif;font-size:15px;color:#222;">
  <h2 style="margin:0 0 12px;">New contact enquiry</h2>
  <table style="border-collapse:collapse;">${htmlRows}</table>
  <h3 style="margin:20px 0 6px;">Message</h3>
  <p style="white-space:pre-wrap;margin:0;">${escapeHtml(payload.message)}</p>
</div>`;

    const textContent = `${filledRows.map(([label, value]) => `${label}: ${value}`).join('\n')}\n\nMessage:\n${payload.message}`;

    await sendBrevoEmail({
      apiKey: env.brevoApiKey,
      from: { email: fromEmail, name: fromName },
      to: { email: toEmail },
      replyTo: { email: payload.email, name: payload.name },
      subject,
      htmlContent,
      textContent,
    });

    return jsonResponse({ ok: true });
  } catch (error) {
    return errorResponse(error);
  }
};
