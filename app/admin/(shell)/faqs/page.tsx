import { prisma } from '~/lib/prisma';
import { FaqsEditor } from '~/components/admin/FaqsEditor';

export default async function FaqsAdminPage() {
  const faqs = await prisma.faq.findMany({ orderBy: { order: 'asc' } });
  return (
    <>
      <h1 className="text-2xl md:text-3xl font-extrabold text-ink mb-2">שאלות נפוצות</h1>
      <p className="text-muted text-sm mb-8">
        נהל את השאלות והתשובות שמופיעות בעמוד הבית וב-/faq. סדר קטן = למעלה. הפרסום עוצר תצוגה בציבור.
      </p>
      <FaqsEditor
        initial={faqs.map((f) => ({
          id: f.id, questionHe: f.questionHe, answerHe: f.answerHe,
          order: f.order, published: f.published, serviceSlug: f.serviceSlug,
        }))}
      />
    </>
  );
}
