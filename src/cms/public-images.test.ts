import { afterEach, describe, expect, it } from 'bun:test';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { listPublicImagePaths, resolvePublicImageAsset } from './public-images';

const originalCwd = process.cwd();
let tempDir = '';

afterEach(async () => {
  process.chdir(originalCwd);

  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
    tempDir = '';
  }
});

describe('public image scanning', () => {
  it('scans public recursively and ignores non-image files', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'concierge-public-images-'));

    await mkdir(join(tempDir, 'public/images/about'), { recursive: true });
    await writeFile(join(tempDir, 'public/images/about/team-photo.jpg'), 'jpg');
    await writeFile(join(tempDir, 'public/hero.webp'), 'webp');
    await writeFile(join(tempDir, 'public/favicon.svg'), 'svg');
    await writeFile(join(tempDir, 'public/readme.txt'), 'txt');

    process.chdir(tempDir);

    expect(await listPublicImagePaths()).toEqual([
      '/hero.webp',
      '/images/about/team-photo.jpg',
    ]);
  });

  it('resolves safe public image asset paths', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'concierge-public-images-'));
    process.chdir(tempDir);

    const asset = resolvePublicImageAsset('/images/about/team-photo.jpg');
    expect(asset?.publicPath).toBe('/images/about/team-photo.jpg');
    expect(asset?.repoPath).toBe('public/images/about/team-photo.jpg');
    expect(asset?.absolutePath.endsWith('/public/images/about/team-photo.jpg')).toBe(true);
  });

  it('rejects invalid public image asset paths', async () => {
    tempDir = await mkdtemp(join(tmpdir(), 'concierge-public-images-'));
    process.chdir(tempDir);

    expect(resolvePublicImageAsset('https://example.com/image.jpg')).toBeNull();
    expect(resolvePublicImageAsset('/../../secrets.txt')).toBeNull();
    expect(resolvePublicImageAsset('/images/about/readme.txt')).toBeNull();
  });
});
