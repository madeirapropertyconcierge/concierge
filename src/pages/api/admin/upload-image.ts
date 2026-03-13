import type { APIRoute } from 'astro';
import { promises as fs } from 'node:fs';
import { resolve, extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  assertAdminSession,
  assertSameOrigin,
  errorResponse,
  jsonResponse,
} from '../../../cms/api';
import { commitFiles } from '../../../cms/github-publisher';
import { tryGetGithubEnv } from '../../../cms/config';
import { loadMediaLibrary, saveMediaLibrary } from '../../../cms/content-loader';
import { getPublishErrorResponse } from '../../../cms/publish-errors';
import { cmsMediaItemSchema } from '../../../cms/schema';

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

    const mediaLibrary = await loadMediaLibrary();

    const item = cmsMediaItemSchema.parse({
      id: randomUUID(),
      src: relativePath,
      alt: {
        en: String(form.get('altEn') ?? ''),
        pt: String(form.get('altPt') ?? ''),
      },
      attributionName: String(form.get('attributionName') ?? ''),
      attributionUrl: String(form.get('attributionUrl') ?? ''),
      licenseUrl: String(form.get('licenseUrl') ?? ''),
      caption: {
        en: String(form.get('captionEn') ?? ''),
        pt: String(form.get('captionPt') ?? ''),
      },
    });

    mediaLibrary.items.unshift(item);
    mediaLibrary.updatedAt = new Date().toISOString();

    const absolutePath = resolve(process.cwd(), `public${relativePath}`);
    try {
      await fs.mkdir(resolve(process.cwd(), 'public/images/library'), { recursive: true });
      await fs.writeFile(absolutePath, bytes);
      await saveMediaLibrary(mediaLibrary);
    } catch {
      // Ignore read-only filesystem failures in serverless runtime.
    }

    const githubEnv = tryGetGithubEnv();
    let commitSha: string | null = null;

    if (githubEnv) {
      const mediaContent = JSON.stringify(mediaLibrary, null, 2) + '\n';
      commitSha = await commitFiles({
        config: githubEnv,
        files: [
          {
            path: `public${relativePath}`,
            content: bytes.toString('base64'),
            encoding: 'base64',
          },
          {
            path: 'content/cms/media/library.json',
            content: mediaContent,
            encoding: 'utf-8',
          },
        ],
        message: `cms: media upload ${filename}`,
      });
    }

    return jsonResponse({ ok: true, item, commitSha });
  } catch (error) {
    const publishError = getPublishErrorResponse(error);
    if (publishError) {
      return jsonResponse({ error: publishError.message }, publishError.status);
    }

    return errorResponse(error);
  }
};
