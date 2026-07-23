// Prisma v7 requires a driver adapter. We use better-sqlite3 for dev + VPS.
// Migrating to Postgres: change `provider` in schema.prisma → "postgresql",
// swap this adapter for @prisma/adapter-pg, set DATABASE_URL. Everything
// else stays the same.
import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const raw = process.env.DATABASE_URL ?? 'file:./prisma/dev.db';
// Prisma URLs use "file:./…" (relative to project root). better-sqlite3 wants
// a filesystem path — resolve to absolute so it works regardless of process.cwd.
const relative = raw.startsWith('file:') ? raw.slice('file:'.length) : raw;
const filePath = path.isAbsolute(relative) ? relative : path.resolve(process.cwd(), relative);

// Ensure the DB's parent directory exists — critical on Railway where the
// volume mounts at /app/data but the nested /app/data/prisma/ dir doesn't
// exist yet on first boot. Without this, `prisma migrate deploy` fails.
try { mkdirSync(path.dirname(filePath), { recursive: true }); } catch { /* ignore */ }

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: filePath }),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
