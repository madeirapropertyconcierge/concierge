interface EmailAddress {
  email: string;
  name?: string;
}

export interface BrevoEmailArgs {
  apiKey: string;
  from: EmailAddress;
  to: EmailAddress;
  replyTo?: EmailAddress;
  subject: string;
  htmlContent: string;
  textContent: string;
}

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

/**
 * Sends a single transactional email through Brevo (Sendinblue SAS), an EU email
 * provider with infrastructure in France and Germany. Throws on a non-2xx response.
 */
export async function sendBrevoEmail(args: BrevoEmailArgs): Promise<void> {
  const response = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: {
      'api-key': args.apiKey,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      sender: args.from,
      to: [args.to],
      replyTo: args.replyTo,
      subject: args.subject,
      htmlContent: args.htmlContent,
      textContent: args.textContent,
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Brevo email send failed (${response.status}): ${detail.slice(0, 300)}`);
  }
}
