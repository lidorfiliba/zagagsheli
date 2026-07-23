// scripts/prepare-runtime.mjs
// Runs at server boot, before Prisma migrate / seed / next start.
//
// Responsibilities:
//   1. Ensure the runtime directories exist (Railway volume mounts empty; we
//      need `public/uploads/` and the DB parent dir).
//   2. If `public/uploads/<cat>/` is empty (fresh volume), copy seed images
//      from the repo-bundled `public/_seed/uploads/<cat>/` — this is what
//      fills the home gallery on first deploy.
//   3. If DATABASE_URL points at a subpath (e.g. persistence/db/prod.db),
//      make sure that parent directory exists so Prisma can create the DB.
//
// Idempotent: safe to run on every boot. Second run is a no-op.

import { readdirSync, mkdirSync, cpSync, existsSync } from 'node:fs';
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
  const parent = dirname(abs);
  mkdirSync(parent, { recursive: true });
  log(`db parent dir ready: ${parent}`);
}

// ---- 2. Ensure uploads dir exists ----
const uploadsDir = join(ROOT, 'public', 'uploads');
mkdirSync(uploadsDir, { recursive: true });

// ---- 3. Seed uploads on first boot ----
const seedDir = join(ROOT, 'public', '_seed', 'uploads');
if (!existsSync(seedDir)) {
  log('no _seed/uploads/ in repo — skipping seed copy');
} else {
  // Consider a category "empty" if its target dir is missing or has no files.
  // Copy per-category, only where target is empty — never overwrite
  // admin-uploaded content.
  const categories = readdirSync(seedDir, { withFileTypes: true }).filter((d) => d.isDirectory());
  let copied = 0;
  for (const cat of categories) {
    const src = join(seedDir, cat.name);
    const dst = join(uploadsDir, cat.name);
    const dstExists = existsSync(dst);
    const dstEmpty = !dstExists || readdirSync(dst).length === 0;
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
