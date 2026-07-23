import { prisma } from '~/lib/prisma';
import { ServicesEditor } from '~/components/admin/ServicesEditor';

export default async function ServicesAdminPage() {
  const services = await prisma.service.findMany({ orderBy: { order: 'asc' } });
  return (
    <>
      <h1 className="text-2xl md:text-3xl font-extrabold text-ink mb-2">שירותים</h1>
      <p className="text-muted text-sm mb-8">
        עריכת שמות, תיאורים ופרטי SEO של 6 השירותים. הסלאגים לא ניתנים לשינוי (חשוב לסדר בגוגל).
      </p>
      <ServicesEditor
        services={services.map((s) => ({
          id: s.id, slug: s.slug, titleHe: s.titleHe,
          shortDescHe: s.shortDescHe, longDescHe: s.longDescHe,
          seoTitle: s.seoTitle, seoDesc: s.seoDesc,
          order: s.order, published: s.published,
        }))}
      />
    </>
  );
}
