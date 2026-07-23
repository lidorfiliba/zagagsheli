import { prisma } from '~/lib/prisma';
import { GalleryManager } from '~/components/admin/GalleryManager';

export default async function GalleryAdminPage() {
  const [categories, items] = await Promise.all([
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
    prisma.galleryItem.findMany({
      include: { category: true },
      orderBy: [{ category: { order: 'asc' } }, { order: 'asc' }],
    }),
  ]);

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-extrabold text-ink mb-2">גלריה</h1>
      <p className="text-muted text-sm mb-8">
        העלה תמונות מהמפעל או מהאתר, ערוך את תיאור הנגישות (חשוב ל-Google!), וסמן מה מוצג בעמוד הבית.
      </p>
      <GalleryManager
        categories={categories.map((c) => ({ id: c.id, slug: c.slug, nameHe: c.nameHe }))}
        items={items.map((i) => ({
          id: i.id,
          imagePath: i.imagePath,
          blurData: i.blurData,
          altHe: i.altHe,
          title: i.title,
          width: i.width,
          height: i.height,
          featured: i.featured,
          published: i.published,
          categoryId: i.categoryId,
          categorySlug: i.category.slug,
          categoryName: i.category.nameHe,
          order: i.order,
        }))}
      />
    </>
  );
}
