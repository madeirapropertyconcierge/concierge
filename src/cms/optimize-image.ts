import sharp from 'sharp';

const MAX_WIDTH = 1920;
const WEBP_QUALITY = 80;

export async function optimizeImage(input: Buffer): Promise<Buffer> {
  return sharp(input)
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
}

export function toWebpFilename(filename: string): string {
  return filename.replace(/\.[^.]+$/, '.webp');
}
