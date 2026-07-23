import { prisma } from '~/lib/prisma';
import { AboutEditor } from '~/components/admin/AboutEditor';

export default async function AboutAdminPage() {
  const about = await prisma.aboutPage.findFirst();
  return (
    <>
      <h1 className="text-2xl md:text-3xl font-extrabold text-ink mb-2">אודות</h1>
      <p className="text-muted text-sm mb-8">
        עריכת תוכן עמוד "אודות". תמיכה ב-Markdown: **מודגש**, ## כותרות, ורשימות עם -.
      </p>
      <AboutEditor initialBody={about?.bodyHe || ''} initialPhoto={about?.ownerPhoto || ''} />
    </>
  );
}
