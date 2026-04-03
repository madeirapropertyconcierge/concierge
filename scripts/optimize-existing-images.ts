import { promises as fs } from 'node:fs';
import { resolve, extname, relative } from 'node:path';
import { optimizeImage, toWebpFilename } from '../src/cms/optimize-image';

const PUBLIC_DIR = resolve(import.meta.dir, '..', 'public');
const IMAGE_DIRS = ['images/library', 'images/madeira', 'images/about'];
const CONVERTIBLE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png']);
const PROJECT_ROOT = resolve(import.meta.dir, '..');

async function findImages(): Promise<string[]> {
  const images: string[] = [];
  for (const dir of IMAGE_DIRS) {
    const absDir = resolve(PUBLIC_DIR, dir);
    try {
      const entries = await fs.readdir(absDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && CONVERTIBLE_EXTENSIONS.has(extname(entry.name).toLowerCase())) {
          images.push(resolve(absDir, entry.name));
        }
      }
    } catch {
      // Directory may not exist
    }
  }
  return images;
}

async function findReferencingFiles(): Promise<string[]> {
  const globs = [
    new Bun.Glob('src/**/*.ts'),
    new Bun.Glob('src/**/*.astro'),
    new Bun.Glob('content/**/*.json'),
  ];
  const files: string[] = [];
  for (const g of globs) {
    for await (const path of g.scan({ cwd: PROJECT_ROOT })) {
      files.push(resolve(PROJECT_ROOT, path));
    }
  }
  return files;
}

async function updateReferences(oldPath: string, newPath: string, files: string[]): Promise<number> {
  let count = 0;
  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    if (content.includes(oldPath)) {
      await fs.writeFile(file, content.replaceAll(oldPath, newPath));
      count++;
    }
  }
  return count;
}

async function main() {
  const images = await findImages();
  if (images.length === 0) {
    console.log('No images to optimize.');
    return;
  }

  console.log(`Found ${images.length} images to optimize.\n`);

  const referencingFiles = await findReferencingFiles();
  let totalSaved = 0;

  for (const imagePath of images) {
    const webpPath = toWebpFilename(imagePath);
    const relativeOld = `/${relative(PUBLIC_DIR, imagePath)}`;
    const relativeNew = `/${relative(PUBLIC_DIR, webpPath)}`;

    const raw = await fs.readFile(imagePath);
    const optimized = await optimizeImage(raw);

    const originalSize = raw.byteLength;
    const newSize = optimized.byteLength;
    const saved = originalSize - newSize;
    totalSaved += saved;

    await fs.writeFile(webpPath, optimized);

    const updatedFiles = await updateReferences(relativeOld, relativeNew, referencingFiles);

    await fs.unlink(imagePath);

    const pct = ((saved / originalSize) * 100).toFixed(0);
    console.log(
      `${relativeOld} → ${relativeNew}  ` +
      `${(originalSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB  ` +
      `(-${pct}%)` +
      (updatedFiles > 0 ? `  [${updatedFiles} refs updated]` : '')
    );
  }

  console.log(`\nTotal saved: ${(totalSaved / 1024 / 1024).toFixed(1)} MB`);
}

main().catch((error) => {
  console.error('Optimization failed:', error);
  process.exit(1);
});
