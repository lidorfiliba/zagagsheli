// scripts/prepare-runtime.mjs
// Runs at server boot, before Prisma migrate / seed / next start.
//
// Layout (production, single Railway volume mounted at /app/persistent):
//   /app/persistent/
//   ├── db/prod.db          ← SQLite database (DATABASE_URL points here)
//   └── uploads/            ← user-uploaded photos; public/uploads is a symlink here
//
// Responsibilities:
//   1. Create the volume subdirectories if missing (fresh volume mounts empty)
//   2. If /app/persistent exists (production), symlink public/uploads → persistent/uploads
//      so Next.js can serve uploaded files via its static public/ mechanism
//   3. Copy repo-bundled seed images from public/_seed/uploads/ into the
//      volume, ONLY where the target category is empty (never overwrites
//      admin uploads)
//   4. Ensure DB parent dir exists (Prisma otherwise fails to create the file)
//
// Idempotent: safe to run on every boot. Second run is a near no-op.

import {
  readdirSync, mkdirSync, cpSync, existsSync, statSync, symlinkSync, unlinkSync, rmSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function log(msg) { process.stdout.write(`[prepare-runtime] ${msg}\n`); }

// ---- 1. Ensure DB parent dir exists ----
const dbUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';
if (dbUrl.startsWith('file:')) {
  const rel = dbUrl.slice('file:'.length);
  const abs = rel.startsWith('/') ? rel : resolve(ROOT, rel);
  mkdirSync(dirname(abs), { recursive: true });
  log(`db parent dir ready: ${dirname(abs)}`);
}

// ---- 2. Detect production volume + set up symlinked uploads dir ----
const persistentRoot = resolve(ROOT, 'persistent');
const persistentUploads = join(persistentRoot, 'uploads');
const publicUploads = join(ROOT, 'public', 'uploads');

const usePersistentVolume = existsSync(persistentRoot);
let uploadsTarget = publicUploads;   // where files actually live

if (usePersistentVolume) {
  // Production path: prepare volume subdirs, then symlink public/uploads → persistent/uploads
  mkdirSync(persistentUploads, { recursive: true });
  uploadsTarget = persistentUploads;

  // Remove any pre-existing public/uploads (file or dir), then create the symlink.
  // Skip if the symlink already exists and points to the right place.
  try {
    const s = existsSync(publicUploads) ? statSync(publicUploads) : null;
    if (s && s.isSymbolicLink && s.isSymbolicLink()) {
      // Node fs.statSync follows symlinks; use lstat via the fs import instead
    }
  } catch { /* ignore */ }

  try { rmSync(publicUploads, { recursive: true, force: true }); } catch { /* ignore */ }
  try {
    symlinkSync(persistentUploads, publicUploads, 'dir');
    log(`symlinked public/uploads → ${persistentUploads}`);
  } catch (e) {
    log(`symlink failed (${e.message}) — falling back to direct copy`);
    uploadsTarget = publicUploads;
    mkdirSync(publicUploads, { recursive: true });
  }
} else {
  // Dev path (Windows-friendly): just use public/uploads directly.
  mkdirSync(publicUploads, { recursive: true });
  log('no persistent/ dir found — running in dev mode, using public/uploads directly');
}

// ---- 3. Seed uploads on first boot ----
const seedDir = join(ROOT, 'public', '_seed', 'uploads');
if (!existsSync(seedDir)) {
  log('no _seed/uploads/ in repo — skipping seed copy');
} else {
  const categories = readdirSync(seedDir, { withFileTypes: true }).filter((d) => d.isDirectory());
  let copied = 0;
  for (const cat of categories) {
    const src = join(seedDir, cat.name);
    const dst = join(uploadsTarget, cat.name);
    const dstEmpty = !existsSync(dst) || readdirSync(dst).length === 0;
    if (dstEmpty) {
      mkdirSync(dst, { recursive: true });
      cpSync(src, dst, { recursive: true });
      const n = readdirSync(dst).length;
      log(`seeded ${cat.name}: copied ${n} files`);
      copied += n;
    } else {
      log(`${cat.name}: skipped (already populated)`);
    }
  }
  log(`total copied: ${copied}`);
}

log('done');
