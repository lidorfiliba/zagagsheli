import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { Phone, MessageCircle, ArrowLeft } from 'lucide-react';
import { prisma } from '~/lib/prisma';
import { getSettings } from '~/lib/settings';
import { whatsappUrl } from '~/lib/whatsapp';
import { formatIsraeliPhone, telHref } from '~/lib/hebrew';

export default async function AdminDashboard() {
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const [
    newThisWeek,
    unreadCount,
    totalByStatus,
    mostRequested,
    recentLeads,
    settings,
  ] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: oneWeekAgo } } }),
    prisma.lead.count({ where: { isRead: false } }),
    prisma.lead.groupBy({ by: ['status'], _count: true }),
    prisma.lead.groupBy({
      by: ['serviceType'],
      _count: true,
      orderBy: { _count: { serviceType: 'desc' } },
      take: 1,
    }),
    prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
    getSettings(),
  ]);

  const total = totalByStatus.reduce((s, r) => s + r._count, 0);
  const topService = mostRequested[0]?.serviceType;
  const waE164 = settings['contact.whatsapp_e164'] || '';

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-extrabold text-ink mb-1">שלום, ליאור</h1>
      <p className="text-muted mb-8">להלן תמונת מצב של הפניות האחרונות.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-10">
        <StatCard label="לידים חדשים השבוע" value={newThisWeek} />
        <StatCard label="לא נקראו" value={unreadCount} accent />
        <StatCard label="סה״כ פניות" value={total} />
        <StatCard label="שירות מבוקש" value={topService ? serviceLabel(topService) : '—'} small />
      </div>

      <section aria-labelledby="recent-leads-h">
        <div className="flex items-end justify-between mb-4">
          <h2 id="recent-leads-h" className="text-lg font-bold text-ink">פניות אחרונות</h2>
          <Link href="/admin/leads" className="inline-flex items-center gap-1 text-sm font-semibold text-ink hover:text-brass-strong transition-colors">
            <span>לכל הלידים</span>
            <ArrowLeft className="w-4 h-4" strokeWidth={2} />
          </Link>
        </div>

        {recentLeads.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-line rounded-[2px] text-muted">
            אין פניות עדיין. כשהראשונה תיכנס — תופיע כאן.
          </div>
        ) : (
          <ul className="space-y-3">
            {recentLeads.map((lead) => (
              <li key={lead.id} className="bg-surface border border-line p-4 md:p-5 rounded-[2px]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/leads/${lead.id}`} className="font-semibold text-ink hover:text-brass-strong transition-colors">
                        {lead.name}
                      </Link>
                      {!lead.isRead && <span className="inline-block w-2 h-2 rounded-full bg-brass" aria-label="לא נקרא" />}
                      <StatusBadge status={lead.status} />
                    </div>
                    <div className="text-xs text-muted mt-0.5">
                      {serviceLabel(lead.serviceType)} · {formatDistanceToNow(lead.createdAt, { addSuffix: true, locale: he })}
                    </div>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    <a href={telHref(lead.phone)} aria-label="חייג" className="w-10 h-10 grid place-items-center border border-line rounded-[2px] hover:bg-ink hover:text-paper transition-colors">
                      <Phone className="w-4 h-4" strokeWidth={1.5} />
                    </a>
                    <a
                      href={whatsappUrl(lead.phone.replace(/[^\d]/g, '').replace(/^0/, '972'), `היי ${lead.name}, מדבר ליאור מהזגג שלי — קיבלתי את הפנייה שלך`)}
                      target="_blank" rel="noopener noreferrer"
                      aria-label="וואטסאפ"
                      className="w-10 h-10 grid place-items-center border border-line rounded-[2px] text-[var(--color-whatsapp)] hover:bg-[var(--color-whatsapp)] hover:text-paper hover:border-[var(--color-whatsapp)] transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                    </a>
                  </div>
                </div>
                {lead.message && (
                  <p className="mt-3 text-sm text-muted line-clamp-2">{lead.message}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}

function StatCard({ label, value, accent = false, small = false }: { label: string; value: string | number; accent?: boolean; small?: boolean }) {
  return (
    <div className="bg-surface border border-line p-4 md:p-5 rounded-[2px]">
      <div className="text-xs text-muted mb-1">{label}</div>
      <div className={`tnum font-extrabold ${small ? 'text-lg md:text-xl' : 'text-3xl md:text-4xl'} ${accent ? 'text-brass' : 'text-ink'}`}>
        {value}
      </div>
    </div>
  );
}

const STATUS_LABEL: Record<string, string> = {
  NEW: 'חדש', CONTACTED: 'ניצור קשר', QUOTED: 'נשלחה הצעה', WON: 'זכייה', LOST: 'הפסד',
};
function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-[2px] ${status === 'NEW' ? 'bg-brass text-paper' : status === 'WON' ? 'bg-[var(--color-success)] text-paper' : status === 'LOST' ? 'bg-[var(--color-danger)] text-paper' : 'bg-line text-ink'}`}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}

const SERVICE_LABEL: Record<string, string> = {
  showers: 'מקלחונים', railings: 'מעקות', mirrors: 'מראות',
  cladding: 'חיפויים', 'bath-screens': 'אמבטיונים', custom: 'עבודות מיוחדות',
  general: 'בירור כללי',
};
function serviceLabel(slug: string) { return SERVICE_LABEL[slug] || slug; }
