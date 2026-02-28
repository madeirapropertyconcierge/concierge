import { z } from 'zod';

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

export interface GithubEnv {
  token: string;
  owner: string;
  repo: string;
  branch: string;
}

function readFromNodeEnv(key: string): string | undefined {
  return process.env[key];
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
  const parsed = githubEnvSchema.parse({
    GITHUB_TOKEN: readFromNodeEnv('GITHUB_TOKEN'),
    GITHUB_OWNER: readFromNodeEnv('GITHUB_OWNER'),
    GITHUB_REPO: readFromNodeEnv('GITHUB_REPO'),
    GITHUB_BRANCH: readFromNodeEnv('GITHUB_BRANCH') ?? 'main',
  });

  return {
    token: parsed.GITHUB_TOKEN,
    owner: parsed.GITHUB_OWNER,
    repo: parsed.GITHUB_REPO,
    branch: parsed.GITHUB_BRANCH,
  };
}

export function tryGetGithubEnv(): GithubEnv | null {
  try {
    return getGithubEnv();
  } catch {
    return null;
  }
}
