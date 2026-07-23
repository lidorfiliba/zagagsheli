import 'dotenv/config';
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { defineConfig } from 'prisma/config';

// Prisma v7: connection URL + driver adapter live here, not in schema.prisma.
// - `datasource.url` is what `prisma migrate` and `prisma generate` read.
// - `adapter()` is what the runtime `PrismaClient` uses.
const DATABASE_URL = process.env.DATABASE_URL || 'file:./prisma/dev.db';

// Ensure the DB's parent directory exists (Railway volume mounts /app/data
// but nested subdirs like /app/data/prisma don't exist until first write).
const rel = DATABASE_URL.startsWith('file:') ? DATABASE_URL.slice('file:'.length) : DATABASE_URL;
const abs = path.isAbsolute(rel) ? rel : path.resolve(process.cwd(), rel);
try { mkdirSync(path.dirname(abs), { recursive: true }); } catch { /* ignore */ }

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: { path: path.join('prisma', 'migrations') },
  datasource: { url: DATABASE_URL },
  async adapter() {
    const { PrismaBetterSqlite3 } = await import('@prisma/adapter-better-sqlite3');
    // better-sqlite3 wants a filesystem path, not a `file:` URL.
    const filePath = DATABASE_URL.startsWith('file:') ? DATABASE_URL.slice('file:'.length) : DATABASE_URL;
    return new PrismaBetterSqlite3({ url: filePath });
  },
});
