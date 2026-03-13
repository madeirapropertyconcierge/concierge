import { afterEach, describe, expect, it } from 'bun:test';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { listPublicImagePaths } from './public-images';

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
});
