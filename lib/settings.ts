import { cache } from 'react';
import { prisma } from './prisma';

/**
 * Fetch all site settings once per request. React `cache()` memoizes across
 * server components in the same render — components downstream can call this
 * without triggering additional DB queries.
 *
 * When the admin edits a setting, the mutation calls `revalidatePath('/', 'layout')`
 * so the layout tree re-renders with fresh data on the next request.
 */
export const getSettings = cache(async (): Promise<Record<string, string>> => {
  const rows = await prisma.siteSetting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
});

/**
 * Type-safe accessor for a single setting with a fallback.
 * Prefer `getSettings()` when you need multiple keys in the same component.
 */
export async function getSetting(key: string, fallback = ''): Promise<string> {
  const all = await getSettings();
  return all[key] ?? fallback;
}
