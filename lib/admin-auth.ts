import { redirect } from 'next/navigation';
import { auth } from '~/auth';

/**
 * Server-side auth gate for admin route handlers and server actions.
 * Redirects to /admin/login if unauthenticated.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');
  return session;
}
