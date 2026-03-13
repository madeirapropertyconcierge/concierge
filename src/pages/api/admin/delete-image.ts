import type { APIRoute } from 'astro';
import { promises as fs } from 'node:fs';
import { basename } from 'node:path';
import { z } from 'zod';
import {
  ApiError,
  assertAdminSession,
  assertSameOrigin,
  errorResponse,
  jsonResponse,
} from '../../../cms/api';
import { tryGetGithubEnv } from '../../../cms/config';
import { commitFiles } from '../../../cms/github-publisher';
import { getImageUsageLabels } from '../../../cms/image-gallery';
import { getPublishErrorResponse } from '../../../cms/publish-errors';
import { resolvePublicImageAsset } from '../../../cms/public-images';

const requestSchema = z.object({
  src: z.string().min(1),
});

export const POST: APIRoute = async (context) => {
  try {
    assertSameOrigin(context);
    assertAdminSession(context);

    const { src } = requestSchema.parse(await context.request.json());
    const asset = resolvePublicImageAsset(src);
    if (!asset) {
      throw new ApiError(400, 'Invalid public image path');
    }

    const usageLabels = await getImageUsageLabels(asset.publicPath);
    if (usageLabels.length > 0) {
      throw new ApiError(409, `Image is still used by ${usageLabels.join(' • ')}`);
    }

    try {
      await fs.unlink(asset.absolutePath);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (code !== 'ENOENT' && code !== 'EROFS' && code !== 'EPERM' && code !== 'EACCES') {
        throw error;
      }
    }

    const githubEnv = tryGetGithubEnv();
    let commitSha: string | null = null;

    if (githubEnv) {
      commitSha = await commitFiles({
        config: githubEnv,
        files: [
          {
            path: asset.repoPath,
            delete: true,
          },
        ],
        message: `cms: delete image ${basename(asset.publicPath)}`,
      });
    }

    return jsonResponse({
      ok: true,
      src: asset.publicPath,
      commitSha,
    });
  } catch (error) {
    const publishError = getPublishErrorResponse(error);
    if (publishError) {
      return jsonResponse({ error: publishError.message }, publishError.status);
    }

    return errorResponse(error);
  }
};
