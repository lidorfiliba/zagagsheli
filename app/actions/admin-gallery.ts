'use server';

import { revalidatePath } from 'next/cache';
import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';
import { prisma } from '~/lib/prisma';
import { requireAdmin } from '~/lib/admin-auth';
import { processAndStoreImage } from '~/lib/storage';

const DEFAULT_ALT: Record<string, string> = {
  showers: 'מקלחון זכוכית בהתאמה אישית',
  railings: 'מעקה זכוכית',
  mirrors: 'מראה זכוכית בהתאמה אישית',
  cladding: 'חיפוי זכוכית',
  'bath-screens': 'אמבטיון זכוכית',
  custom: 'עבודת זכוכית מיוחדת',
};

/**
 * Multi-file gallery upload. Each file gets sharp-processed and stored.
 * Order starts at 1000+ so admin-uploaded images sit after seeded ones
 * (which use 0..999).
 */
export async function uploadGalleryImages(formData: FormData): Promise<{ ok: number; failed: number; errors: string[] }> {
  await requireAdmin();
  const categorySlug = String(formData.get('categorySlug') || '');
  if (!categorySlug) return { ok: 0, failed: 0, errors: ['לא נבחרה קטגוריה'] };

  const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
  if (!category) return { ok: 0, failed: 0, errors: ['קטגוריה לא נמצאה'] };

  const files = formData.getAll('files').filter((f): f is File => f instanceof File);
  if (files.length === 0) return { ok: 0, failed: 0, errors: ['לא נבחרו קבצים'] };

  const currentMax = await prisma.galleryItem.aggregate({
    where: { categoryId: category.id },
    _max: { order: true },
  });
  let nextOrder = Math.max(1000, (currentMax._max.order ?? 0) + 1);

  const errors: string[] = [];
  let ok = 0;
  for (const file of files) {
    try {
      const stored = await processAndStoreImage(file, categorySlug);
      await prisma.galleryItem.create({
        data: {
          categoryId: category.id,
          imagePath: stored.path,
          blurData: stored.blurData,
          altHe: DEFAULT_ALT[categorySlug] || 'עבודת זכוכית',
          width: stored.width,
          height: stored.height,
          order: nextOrder++,
          published: true,
        },
      });
      ok++;
    } catch (e) {
      errors.push(`${file.name}: ${(e as Error).message}`);
    }
  }

  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
  revalidatePath('/');
  return { ok, failed: files.length - ok, errors };
}

const updateSchema = z.object({
  id: z.string().min(1),
  altHe: z.string().min(2).max(200).optional(),
  title: z.string().max(200).optional().or(z.literal('')),
  categoryId: z.string().min(1).optional(),
  order: z.number().int().optional(),
  featured: z.boolean().optional(),
  published: z.boolean().optional(),
});

export async function updateGalleryItem(input: z.infer<typeof updateSchema>) {
  await requireAdmin();
  const parsed = updateSchema.parse(input);
  const { id, ...data } = parsed;
  const cleaned: Record<string, unknown> = { ...data };
  if (cleaned.title === '') cleaned.title = null;
  await prisma.galleryItem.update({ where: { id }, data: cleaned as never });
  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
  revalidatePath('/');
  return {};
}

export async function deleteGalleryItem(id: string) {
  await requireAdmin();
  const item = await prisma.galleryItem.findUnique({ where: { id } });
  if (!item) return;
  await prisma.galleryItem.delete({ where: { id } });
  // Delete the underlying file — best effort, don't fail if missing
  try {
    if (item.imagePath.startsWith('/uploads/')) {
      const abs = join(process.cwd(), 'public', item.imagePath.slice(1));
      await unlink(abs);
    }
  } catch { /* ignore */ }
  revalidatePath('/admin/gallery');
  revalidatePath('/gallery');
  revalidatePath('/');
}
