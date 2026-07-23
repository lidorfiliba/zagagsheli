import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Phone, MessageCircle, ArrowRight } from 'lucide-react';
import { prisma } from '~/lib/prisma';
import { markLeadRead } from '~/app/actions/admin-leads';
import { LeadStatusChanger } from '~/components/admin/LeadStatusChanger';
import { LeadNotesEditor } from '~/components/admin/LeadNotesEditor';
import { telHref, formatIsraeliPhone } from '~/lib/hebrew';
import { whatsappUrl } from '~/lib/whatsapp';

const STATUS_LABEL: Record<string, string> = {
  NEW: 'חדש', CONTACTED: 'ניצור קשר', QUOTED: 'נשלחה הצעה', WON: 'זכייה', LOST: 'הפסד',
};
const SERVICE_LABEL: Record<string, string> = {
  showers: 'מקלחונים', railings: 'מעקות', mirrors: 'מראות',
  cladding: 'חיפויים', 'bath-screens': 'אמבטיונים', custom: 'עבודות מיוחדות',
  general: 'בירור כללי',
};

interface Params { params: Promise<{ id: string }>; }

export default async function LeadDetailPage({ params }: Params) {
  const { id } = await params;
  const lead = await prisma.lead.findUnique({
    where: { id },
    include: { statusHistory: { orderBy: { createdAt: 'desc' } } },
  });
  if (!lead) notFound();

  // Auto-mark as read on view (fire-and-forget server action)
  if (!lead.isRead) await markLeadRead(lead.id);

  const waMsg = `היי ${lead.name}, מדבר ליאור מהזגג שלי — קיבלתי את הפנייה שלך בנוגע ל${SERVICE_LABEL[lead.serviceType] || 'עבודת זכוכית'}`;

  return (
    <>
      <Link href="/admin/leads" className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink mb-4">
        <ArrowRight className="w-4 h-4" strokeWidth={1.5} /> חזרה ללידים
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink">{lead.name}</h1>
          <p className="text-sm text-muted mt-1">
            התקבל {format(lead.createdAt, 'PPPPp', { locale: he })} · מהעמוד <code className="text-ink">{lead.sourcePage}</code>
          </p>
        </div>
        <div className="flex gap-2">
          <a href={telHref(lead.phone)} className="inline-flex items-center gap-2 bg-ink text-paper px-4 py-2.5 rounded-[2px] font-semibold text-sm">
            <Phone className="w-4 h-4" strokeWidth={1.5} />
            <span className="ltr-num">{formatIsraeliPhone(lead.phone)}</span>
          </a>
          <a
            href={whatsappUrl(lead.phone.replace(/[^\d]/g, '').replace(/^0/, '972'), waMsg)}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[var(--color-whatsapp)] text-white px-4 py-2.5 rounded-[2px] font-semibold text-sm"
          >
            <MessageCircle className="w-4 h-4" strokeWidth={1.5} /> וואטסאפ
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-surface border border-line p-5 rounded-[2px]">
            <h2 className="text-sm font-semibold text-muted mb-3">פרטי הפנייה</h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <Row label="שם">{lead.name}</Row>
              <Row label="טלפון"><span className="ltr-num">{formatIsraeliPhone(lead.phone)}</span></Row>
              <Row label="אימייל">{lead.email || <em className="text-muted">לא סופק</em>}</Row>
              <Row label="עיר">{lead.city || <em className="text-muted">לא סופק</em>}</Row>
              <Row label="סוג עבודה">{SERVICE_LABEL[lead.serviceType] || lead.serviceType}</Row>
              <Row label="סטטוס נוכחי">{STATUS_LABEL[lead.status]}</Row>
            </dl>
            {lead.message && (
              <>
                <div className="mt-6 mb-2 text-sm font-semibold text-muted">הודעה</div>
                <p className="text-ink leading-relaxed whitespace-pre-line bg-paper p-4 rounded-[2px] border border-line">{lead.message}</p>
              </>
            )}
          </section>

          <section className="bg-surface border border-line p-5 rounded-[2px]">
            <h2 className="text-sm font-semibold text-muted mb-3">הערות פנימיות</h2>
            <LeadNotesEditor id={lead.id} initialNotes={lead.notes || ''} />
          </section>

          {lead.statusHistory.length > 0 && (
            <section className="bg-surface border border-line p-5 rounded-[2px]">
              <h2 className="text-sm font-semibold text-muted mb-3">היסטוריית סטטוסים</h2>
              <ul className="space-y-2 text-sm">
                {lead.statusHistory.map((h) => (
                  <li key={h.id} className="flex justify-between gap-4 border-b border-line pb-2 last:border-0">
                    <span>
                      <span className="text-muted">{STATUS_LABEL[h.fromStatus] || h.fromStatus}</span>
                      <span className="mx-2 text-muted">→</span>
                      <span className="font-semibold text-ink">{STATUS_LABEL[h.toStatus] || h.toStatus}</span>
                      {h.note && <span className="block text-xs text-muted mt-1">{h.note}</span>}
                    </span>
                    <time className="text-xs text-muted shrink-0">{format(h.createdAt, 'dd/MM/yy HH:mm')}</time>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="lg:col-span-1">
          <section className="bg-surface border border-line p-5 rounded-[2px] lg:sticky lg:top-6">
            <h2 className="text-sm font-semibold text-muted mb-3">שינוי סטטוס</h2>
            <LeadStatusChanger id={lead.id} currentStatus={lead.status} />
          </section>
        </aside>
      </div>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-ink mt-0.5">{children}</dd>
    </div>
  );
}
