import { prisma } from '~/lib/prisma';
import { TestimonialsEditor } from '~/components/admin/TestimonialsEditor';

export default async function TestimonialsAdminPage() {
  const items = await prisma.testimonial.findMany({ orderBy: { order: 'asc' } });
  return (
    <>
      <h1 className="text-2xl md:text-3xl font-extrabold text-ink mb-2">המלצות</h1>
      <p className="text-muted text-sm mb-8">
        חוות דעת המוצגות בעמוד הבית. אפשר להוסיף המלצות ידניות או להטעין מפרו.
      </p>
      <TestimonialsEditor
        initial={items.map((t) => ({
          id: t.id, name: t.name, city: t.city, textHe: t.textHe, rating: t.rating,
          sourceUrl: t.sourceUrl, order: t.order, published: t.published,
        }))}
      />
    </>
  );
}
