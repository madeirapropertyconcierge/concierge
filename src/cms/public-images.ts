import { promises as fs } from 'node:fs';
import { extname, resolve, sep } from 'node:path';

const IMAGE_EXTENSIONS = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png', '.webp']);

function toPublicSrc(path: string): string {
  return `/${path.replace(/\\/g, '/')}`;
}

function isImageFile(path: string): boolean {
  return IMAGE_EXTENSIONS.has(extname(path).toLowerCase());
}

function getPublicRoot(): string {
  return resolve(process.cwd(), 'public');
}

async function walkPublicDirectory(directory: string, prefix = ''): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const paths: string[] = [];

  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolutePath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      paths.push(...await walkPublicDirectory(absolutePath, relativePath));
      continue;
    }

    if (entry.isFile() && isImageFile(relativePath)) {
      paths.push(toPublicSrc(relativePath));
    }
  }

  return paths;
}

export async function listPublicImagePaths(): Promise<string[]> {
  try {
    return (await walkPublicDirectory(getPublicRoot())).sort((a, b) => a.localeCompare(b));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }

    throw error;
  }
}

export function resolvePublicImageAsset(src: string): {
  absolutePath: string;
  publicPath: string;
  repoPath: string;
} | null {
  const trimmed = src.trim();
  if (!trimmed.startsWith('/') || trimmed.includes('://') || trimmed.includes('?') || trimmed.includes('#')) {
    return null;
  }

  const publicPath = toPublicSrc(trimmed.replace(/^\/+/, ''));
  if (!publicPath || publicPath === '/' || !isImageFile(publicPath)) {
    return null;
  }

  const publicRoot = getPublicRoot();
  const absolutePath = resolve(publicRoot, `.${publicPath}`);
  const publicRootWithSep = `${publicRoot}${sep}`;
  if (absolutePath !== publicRoot && !absolutePath.startsWith(publicRootWithSep)) {
    return null;
  }

  return {
    absolutePath,
    publicPath,
    repoPath: `public${publicPath}`,
  };
}
