import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { randomBytes } from 'node:crypto';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';

const UPLOAD_ROOT = join(process.cwd(), 'public', 'uploads');
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/heic', 'image/heif']);
const MAX_BYTES = 15 * 1024 * 1024; // 15MB per file — plenty for phone photos

export interface StoredImage {
  path: string;         // public URL relative to /
  blurData: string;     // base64 data URI
  width: number;
  height: number;
}

/**
 * Take a raw uploaded image buffer, verify its type, sanitize it (EXIF strip,
 * auto-orient, resize to max 1600w), encode as WebP, save to disk, and
 * generate a tiny blur placeholder.
 *
 * Called from admin server actions. When the site moves to S3 / Cloudinary,
 * replace only the two `writeFile` calls at the bottom of this function.
 */
export async function processAndStoreImage(
  file: File,
  category: string
): Promise<StoredImage> {
  if (file.size > MAX_BYTES) throw new Error('קובץ גדול מדי (מקסימום 15MB)');
  if (file.size === 0) throw new Error('קובץ ריק');

  const raw = Buffer.from(await file.arrayBuffer());

  // Magic-byte check — trust bytes, not headers
  const detected = await fileTypeFromBuffer(raw);
  if (!detected || !ALLOWED.has(detected.mime)) {
    throw new Error(`סוג קובץ לא נתמך${detected ? `: ${detected.mime}` : ''}`);
  }

  const pipeline = sharp(raw, { failOn: 'none' }).rotate(); // EXIF orient
  const meta = await pipeline.metadata();
  if (!meta.width || !meta.height) throw new Error('לא ניתן לקרוא מידות התמונה');

  const targetW = Math.min(meta.width, 1600);
  const targetH = Math.round((meta.height * targetW) / meta.width);

  const webpBuf = await sharp(raw, { failOn: 'none' })
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();

  const blurBuf = await sharp(raw, { failOn: 'none' })
    .rotate()
    .resize({ width: 20 })
    .webp({ quality: 40 })
    .toBuffer();
  const blurData = `data:image/webp;base64,${blurBuf.toString('base64')}`;

  const safeCat = category.replace(/[^a-z0-9_-]/gi, '') || 'misc';
  const stem = randomBytes(6).toString('hex');
  const dir = join(UPLOAD_ROOT, safeCat);
  await mkdir(dir, { recursive: true });
  const filePath = join(dir, `${stem}.webp`);
  await writeFile(filePath, webpBuf);

  return {
    path: `/uploads/${safeCat}/${stem}.webp`,
    blurData,
    width: targetW,
    height: targetH,
  };
}
