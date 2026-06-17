import { z } from 'zod';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MissingGithubConfigError } from './publish-errors';

const requiredString = z.string().min(1);

const authEnvSchema = z.object({
  ADMIN_PASSWORD_HASH: requiredString,
  ADMIN_SESSION_SECRET: requiredString,
});

const githubEnvSchema = z.object({
  GITHUB_TOKEN: requiredString,
  GITHUB_OWNER: requiredString,
  GITHUB_REPO: requiredString,
  GITHUB_BRANCH: z.string().min(1).default('main'),
});

export interface AuthEnv {
  passwordHash: string;
  sessionSecret: string;
}

export interface ContactEnv {
  brevoApiKey: string;
  fromEmail: string | null;
  fromName: string | null;
}

export interface GithubEnv {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

function readFromNodeEnv(key: string): string | undefined {
  const fromProcess = process.env[key];
  const fromDotEnv = readFromDotEnvFiles()[key];

  if (typeof fromProcess === 'string' && fromProcess.length > 0) {
    if (key === 'ADMIN_PASSWORD_HASH' && !fromProcess.startsWith('scrypt$')) {
      return fromDotEnv;
    }

    return fromProcess;
  }

  return fromDotEnv;
}

let dotEnvCache: Record<string, string> | null = null;

function parseDotEnvContent(content: string): Record<string, string> {
  const parsed: Record<string, string> = {};

  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex <= 0) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    // Keep dotenv-style escaped dollar signs literal.
    value = value.replace(/\\\$/g, '$');
    parsed[key] = value;
  }

  return parsed;
}

function readFromDotEnvFiles(): Record<string, string> {
  if (dotEnvCache) {
    return dotEnvCache;
  }

  const merged: Record<string, string> = {};
  const files = ['.env', '.env.local'];

  for (const file of files) {
    const absolutePath = resolve(process.cwd(), file);
    if (!existsSync(absolutePath)) {
      continue;
    }

    const content = readFileSync(absolutePath, 'utf-8');
    Object.assign(merged, parseDotEnvContent(content));
  }

  dotEnvCache = merged;
  return merged;
}

export function getAuthEnv(): AuthEnv {
  const parsed = authEnvSchema.parse({
    ADMIN_PASSWORD_HASH: readFromNodeEnv('ADMIN_PASSWORD_HASH'),
    ADMIN_SESSION_SECRET: readFromNodeEnv('ADMIN_SESSION_SECRET'),
  });

  return {
    passwordHash: parsed.ADMIN_PASSWORD_HASH,
    sessionSecret: parsed.ADMIN_SESSION_SECRET,
  };
}

export function getGithubEnv(): GithubEnv {
  const parsed = githubEnvSchema.safeParse({
    GITHUB_TOKEN: readFromNodeEnv('GITHUB_TOKEN'),
    GITHUB_OWNER: readFromNodeEnv('GITHUB_OWNER'),
    GITHUB_REPO: readFromNodeEnv('GITHUB_REPO'),
    GITHUB_BRANCH: readFromNodeEnv('GITHUB_BRANCH') ?? 'main',
  });

  if (!parsed.success) {
    throw new MissingGithubConfigError();
  }

  return {
    token: parsed.data.GITHUB_TOKEN,
    owner: parsed.data.GITHUB_OWNER,
    repo: parsed.data.GITHUB_REPO,
    branch: parsed.data.GITHUB_BRANCH,
  };
}

export function tryGetGithubEnv(): GithubEnv | null {
  try {
    return getGithubEnv();
  } catch {
    return null;
  }
}

export function getContactEnv(): ContactEnv {
  // Only the API key is required. Sender fields are tolerant: values are
  // trimmed, and a malformed sender email is ignored (falls back to SITE.email)
  // rather than taking down the whole contact form.
  const brevoApiKey = readFromNodeEnv('BREVO_API_KEY')?.trim();
  if (!brevoApiKey) {
    throw new Error('Missing contact email configuration (BREVO_API_KEY)');
  }

  const senderEmailRaw = readFromNodeEnv('BREVO_SENDER_EMAIL')?.trim();
  const fromEmail =
    senderEmailRaw && z.string().email().safeParse(senderEmailRaw).success
      ? senderEmailRaw
      : null;

  const fromName = readFromNodeEnv('BREVO_SENDER_NAME')?.trim() || null;

  return { brevoApiKey, fromEmail, fromName };
}

export function tryGetContactEnv(): ContactEnv | null {
  try {
    return getContactEnv();
  } catch {
    return null;
  }
}
