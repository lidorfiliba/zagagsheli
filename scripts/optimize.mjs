// scripts/optimize.mjs
// Convert every scraped image to a single 1600w WebP + a base64 blur placeholder,
// output into /public/uploads/gallery/{category}/, and emit a manifest.json that
// the Prisma seed will read to populate the GalleryItem table.
//
// Design decision: we produce ONE optimized source per image (not multi-width
// variants). next/image handles responsive srcset generation at request time,
// which keeps this pipeline simple and lets the admin re-optimize on upload
// without having to regenerate a whole width ladder.

import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { join, dirname, basename, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const RAW = join(ROOT, 'public', 'images', 'raw');
const OUT = join(ROOT, 'public', 'uploads');
const MANIFEST = join(ROOT, 'prisma', 'seed-images.json');

const MAX_WIDTH = 1600;
const WEBP_QUALITY = 82;
const BLUR_WIDTH = 20;

const GALLERY_CATEGORIES = new Set(['shower', 'mirrors', 'railings', 'cladding', 'bath', 'custom']);
const SKIP_EXT = new Set(['.svg', '.gif']);

function normalizeStem(name) {
  return basename(name, extname(name))
    .replace(/-scaled$/i, '')
    .replace(/-e\d{10,}$/i, '')
    .replace(/-\d+x\d+$/i, '')
    .replace(/[^a-z0-9_-]/gi, '_')
    .replace(/_+/g, '_')
    .toLowerCase()
    .slice(0, 80);
}

async function walk(root) {
  const dirs = await readdir(root, { withFileTypes: true });
  const items = [];
  for (const d of dirs) {
    if (!d.isDirectory()) continue;
    const files = await readdir(join(root, d.name));
    for (const f of files) {
      if (f.startsWith('_')) continue;
      const ext = extname(f).toLowerCase();
      if (SKIP_EXT.has(ext)) continue;
      const full = join(root, d.name, f);
      const s = await stat(full);
      items.push({ category: d.name, filename: f, path: full, size: s.size, stem: normalizeStem(f) });
    }
  }
  return items;
}

// Group by (category, stem); prefer the largest source in each group (the
// pre-scaled full-size, not the WP thumbnail crop).
function dedupe(items) {
  const groups = new Map();
  for (const it of items) {
    const key = `${it.category}/${it.stem}`;
    const existing = groups.get(key);
    if (!existing || it.size > existing.size) groups.set(key, it);
  }
  return [...groups.values()];
}

// Sensible default alt text so no image ships to production with alt="".
// Owner edits these in the admin.
const DEFAULT_ALT = {
  shower: 'מקלחון זכוכית בהתאמה אישית',
  railings: 'מעקה זכוכית',
  mirrors: 'מראה זכוכית בהתאמה אישית',
  cladding: 'חיפוי זכוכית',
  bath: 'אמבטיון זכוכית',
  custom: 'עבודת זכוכית מיוחדת',
  brand: 'הזגג שלי',
  uncategorized: 'עבודת זכוכית',
};

async function optimizeOne(item, outRoot) {
  const outDir = join(outRoot, item.category);
  await mkdir(outDir, { recursive: true });
  const outPath = join(outDir, `${item.stem}.webp`);
  const publicPath = `/uploads/${item.category}/${item.stem}.webp`;

  // Main image: EXIF-orient, resize to max 1600w, WebP quality 82.
  const pipeline = sharp(item.path, { failOn: 'none' }).rotate();
  const meta = await pipeline.metadata();
  if (!meta.width || !meta.height) throw new Error('no dimensions');

  const targetW = Math.min(meta.width, MAX_WIDTH);
  // Aspect-correct height after resize (Sharp handles this; we compute for the DB row)
  const targetH = Math.round((meta.height * targetW) / meta.width);

  await sharp(item.path, { failOn: 'none' })
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toFile(outPath);

  // Blur placeholder as base64 data URI — feeds into <Image blurDataURL={...}>
  const blurBuf = await sharp(item.path, { failOn: 'none' })
    .rotate()
    .resize({ width: BLUR_WIDTH })
    .webp({ quality: 40 })
    .toBuffer();
  const blurData = `data:image/webp;base64,${blurBuf.toString('base64')}`;

  return {
    category: item.category,
    stem: item.stem,
    imagePath: publicPath,
    blurData,
    width: targetW,
    height: targetH,
    altHe: DEFAULT_ALT[item.category] || DEFAULT_ALT.uncategorized,
  };
}

async function main() {
  const all = await walk(RAW);
  const gallery = dedupe(all.filter(it => GALLERY_CATEGORIES.has(it.category)));
  const brand = dedupe(all.filter(it => it.category === 'brand'));

  process.stdout.write(`▸ Optimizing ${gallery.length} gallery images + ${brand.length} brand assets\n`);
  await mkdir(OUT, { recursive: true });

  const galleryRecords = [];
  let ok = 0, fail = 0;
  for (const it of gallery) {
    try {
      galleryRecords.push(await optimizeOne(it, OUT));
      ok++;
      if (ok % 10 === 0) process.stdout.write(`  ${ok}/${gallery.length}\n`);
    } catch (e) {
      fail++;
      process.stdout.write(`  ! ${it.category}/${it.filename}: ${e.message}\n`);
    }
  }

  // Brand assets — separate output folder, single copy each (no seeding needed
  // since they're referenced by explicit path in the header/footer components).
  for (const it of brand) {
    try {
      const outDir = join(OUT, 'brand');
      await mkdir(outDir, { recursive: true });
      const ext = extname(it.filename).toLowerCase();
      // Keep PNGs (logos have transparency) — WebP conversion done inline below.
      if (ext === '.png') {
        await sharp(it.path).rotate().png({ quality: 90, compressionLevel: 9 }).toFile(join(outDir, `${it.stem}.png`));
        // also emit a webp companion
        await sharp(it.path).rotate().webp({ quality: 90 }).toFile(join(outDir, `${it.stem}.webp`));
      } else {
        await sharp(it.path).rotate().resize({ width: 800, withoutEnlargement: true }).webp({ quality: 85 }).toFile(join(outDir, `${it.stem}.webp`));
      }
    } catch (e) {
      process.stdout.write(`  ! brand/${it.filename}: ${e.message}\n`);
    }
  }

  // Sort so seed inserts them in a stable order
  galleryRecords.sort((a, b) => (a.category + a.stem).localeCompare(b.category + b.stem));

  await mkdir(dirname(MANIFEST), { recursive: true });
  await writeFile(MANIFEST, JSON.stringify(galleryRecords, null, 2), 'utf8');

  process.stdout.write(`\n▸ Done: ${ok} ok, ${fail} failed\n`);
  process.stdout.write(`▸ Manifest → ${MANIFEST}\n`);
  const byCat = galleryRecords.reduce((acc, r) => ((acc[r.category] = (acc[r.category] || 0) + 1), acc), {});
  process.stdout.write(`\nBy category:\n`);
  for (const [c, n] of Object.entries(byCat)) process.stdout.write(`  ${c.padEnd(12)} ${n}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
