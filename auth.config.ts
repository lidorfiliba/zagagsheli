import type { NextAuthConfig } from 'next-auth';

/**
 * Edge-safe NextAuth config — this is what middleware.ts imports.
 * It intentionally has NO providers array with Prisma/bcrypt (those are
 * Node-only). The real credentials provider is added in `auth.ts`, which
 * is imported by route handlers and server components (Node runtime).
 *
 * Splitting like this is the officially recommended NextAuth v5 pattern
 * for credential-based auth + middleware.
 */
export default {
  pages: { signIn: '/admin/login', error: '/admin/login' },
  session: { strategy: 'jwt', maxAge: 60 * 60 * 24 * 30 },
  trustHost: true,
  providers: [], // added in auth.ts
} satisfies NextAuthConfig;
