import type { APIRoute } from 'astro';
import { promises as fs } from 'node:fs';
import { resolve, extname } from 'node:path';
import {
  assertAdminSession,
  assertSameOrigin,
  errorResponse,
  jsonResponse,
} from '../../../cms/api';
import { commitFiles } from '../../../cms/github-publisher';
import { tryGetGithubEnv } from '../../../cms/config';
import { getPublishErrorResponse } from '../../../cms/publish-errors';

function slugifyName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function detectExtension(fileName: string, mimeType: string): string {
  const fromName = extname(fileName);
  if (fromName) {
    return fromName;
  }

  if (mimeType === 'image/png') return '.png';
  if (mimeType === 'image/webp') return '.webp';
  if (mimeType === 'image/gif') return '.gif';

  return '.jpg';
}

export const POST: APIRoute = async (context) => {
  try {
    assertSameOrigin(context);
    assertAdminSession(context);

    const form = await context.request.formData();
    const file = form.get('file');

    if (!(file instanceof File)) {
      return jsonResponse({ error: 'Missing file' }, 400);
    }

    if (!file.type.startsWith('image/')) {
      return jsonResponse({ error: 'Only image uploads are supported' }, 400);
    }

    const nameBase = slugifyName(file.name.replace(/\.[^.]+$/, '')) || 'image';
    const extension = detectExtension(file.name, file.type);
    const filename = `${Date.now()}-${nameBase}${extension}`;
    const relativePath = `/images/library/${filename}`;

    const bytes = Buffer.from(await file.arrayBuffer());

    const absolutePath = resolve(process.cwd(), `public${relativePath}`);
    try {
      await fs.mkdir(resolve(process.cwd(), 'public/images/library'), { recursive: true });
      await fs.writeFile(absolutePath, bytes);
    } catch {
      // Ignore read-only filesystem failures in serverless runtime.
    }

    const githubEnv = tryGetGithubEnv();
    let commitSha: string | null = null;

    if (githubEnv) {
      commitSha = await commitFiles({
        config: githubEnv,
        files: [
          {
            path: `public${relativePath}`,
            content: bytes.toString('base64'),
            encoding: 'base64',
          },
        ],
        message: `cms: media upload ${filename}`,
      });
    }

    return jsonResponse({ ok: true, src: relativePath, commitSha });
  } catch (error) {
    const publishError = getPublishErrorResponse(error);
    if (publishError) {
      return jsonResponse({ error: publishError.message }, publishError.status);
    }

    return errorResponse(error);
  }
};
