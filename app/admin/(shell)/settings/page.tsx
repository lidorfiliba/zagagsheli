import { prisma } from '~/lib/prisma';
import { SettingsForm } from '~/components/admin/SettingsForm';

export default async function SettingsPage() {
  const rows = await prisma.siteSetting.findMany({ orderBy: { key: 'asc' } });
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-extrabold text-ink mb-2">הגדרות</h1>
      <p className="text-muted text-sm mb-8">
        כל שדה כאן משפיע ישירות על מה שמופיע באתר לכל המבקרים. לחץ "שמור" כדי לפרסם שינוי.
      </p>
      <SettingsForm settings={map} />
    </>
  );
}
