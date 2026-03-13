import { promises as fs } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import {
  cmsBlogPostSchema,
  cmsPageDocumentSchema,
  type CmsBlogPost,
  type CmsPageDocument,
} from './schema';

const CMS_ROOT = resolve(process.cwd(), 'content/cms');
const PAGE_DIR = resolve(CMS_ROOT, 'pages');
const BLOG_DIR = resolve(CMS_ROOT, 'blog/posts');

function defaultSeoLocale(canonical = '') {
  return {
    title: '',
    description: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    canonical,
  };
}

export function createDefaultPageDocument(pageId: string): CmsPageDocument {
  return {
    pageId,
    updatedAt: new Date().toISOString(),
    seo: {
      en: defaultSeoLocale(),
      pt: defaultSeoLocale(),
    },
    texts: [],
    links: [],
    images: [],
  };
}

async function ensureDirectory(path: string): Promise<void> {
  try {
    await fs.mkdir(path, { recursive: true });
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'EROFS' || code === 'EPERM' || code === 'EACCES') {
      return;
    }

    throw error;
  }
}

async function readJsonFile<T>(path: string): Promise<T | null> {
  try {
    const content = await fs.readFile(path, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }

    throw error;
  }
}

async function writeJsonFile(path: string, data: unknown): Promise<void> {
  await fs.mkdir(dirname(path), { recursive: true });
  await fs.writeFile(path, `${JSON.stringify(data, null, 2)}\n`, 'utf-8');
}

export async function ensureCmsDirectories(): Promise<void> {
  await Promise.all([
    ensureDirectory(PAGE_DIR),
    ensureDirectory(BLOG_DIR),
  ]);
}

export async function loadPageDocument(pageId: string): Promise<CmsPageDocument> {
  await ensureCmsDirectories();
  const path = resolve(PAGE_DIR, `${pageId}.json`);
  const raw = await readJsonFile<unknown>(path);

  if (!raw) {
    return createDefaultPageDocument(pageId);
  }

  return cmsPageDocumentSchema.parse(raw);
}

export async function savePageDocument(document: CmsPageDocument): Promise<void> {
  await ensureCmsDirectories();
  const parsed = cmsPageDocumentSchema.parse({
    ...document,
    updatedAt: new Date().toISOString(),
  });

  const path = resolve(PAGE_DIR, `${parsed.pageId}.json`);
  await writeJsonFile(path, parsed);
}

export async function listPageDocuments(): Promise<CmsPageDocument[]> {
  await ensureCmsDirectories();
  const entries = await fs.readdir(PAGE_DIR, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json'));

  const documents = await Promise.all(
    files.map(async (entry) => {
      const raw = await readJsonFile<unknown>(resolve(PAGE_DIR, entry.name));
      if (!raw) {
        return null;
      }

      return cmsPageDocumentSchema.parse(raw);
    }),
  );

  return documents.filter((doc): doc is CmsPageDocument => Boolean(doc));
}

export async function listBlogPosts(): Promise<CmsBlogPost[]> {
  await ensureCmsDirectories();
  const entries = await fs.readdir(BLOG_DIR, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith('.json'));

  const posts = await Promise.all(
    files.map(async (entry) => {
      const raw = await readJsonFile<unknown>(resolve(BLOG_DIR, entry.name));
      if (!raw) {
        return null;
      }

      return cmsBlogPostSchema.parse(raw);
    }),
  );

  return posts
    .filter((post): post is CmsBlogPost => Boolean(post))
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function loadBlogPostBySlug(slug: string): Promise<CmsBlogPost | null> {
  const posts = await listBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function replaceBlogPosts(posts: CmsBlogPost[]): Promise<void> {
  await ensureCmsDirectories();

  const parsed = posts.map((post) =>
    cmsBlogPostSchema.parse({
      ...post,
      updatedAt: new Date().toISOString(),
    }),
  );

  const existing = await fs.readdir(BLOG_DIR, { withFileTypes: true });
  const existingFiles = new Set(
    existing
      .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
      .map((entry) => entry.name),
  );

  for (const post of parsed) {
    const filename = `${post.id}.json`;
    await writeJsonFile(resolve(BLOG_DIR, filename), post);
    existingFiles.delete(filename);
  }

  for (const file of existingFiles) {
    await fs.unlink(resolve(BLOG_DIR, file));
  }
}

export async function listCmsFilesForPublish(): Promise<
  Array<{ path: string; content: string; encoding: 'utf-8' }>
> {
  await ensureCmsDirectories();

  const files: Array<{ path: string; content: string; encoding: 'utf-8' }> = [];

  const addDirectory = async (dirPath: string, relativeRoot: string): Promise<void> => {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const absolute = resolve(dirPath, entry.name);
      if (entry.isDirectory()) {
        await addDirectory(absolute, `${relativeRoot}/${entry.name}`);
        continue;
      }

      if (!entry.name.endsWith('.json')) {
        continue;
      }

      const content = await fs.readFile(absolute, 'utf-8');
      files.push({
        path: `${relativeRoot}/${entry.name}`,
        content,
        encoding: 'utf-8',
      });
    }
  };

  await addDirectory(PAGE_DIR, 'content/cms/pages');
  await addDirectory(BLOG_DIR, 'content/cms/blog/posts');

  return files;
}

export function getCmsAbsolutePath(relativePath: string): string {
  return resolve(process.cwd(), relativePath);
}

export function getCmsRootPath(): string {
  return CMS_ROOT;
}

export function getBlogDirectoryPath(): string {
  return BLOG_DIR;
}

export function getPageDirectoryPath(): string {
  return PAGE_DIR;
}

export function toBlogFileName(post: CmsBlogPost): string {
  return `${post.id}.json`;
}

export function fromBlogFileName(name: string): string {
  return basename(name, '.json');
}
