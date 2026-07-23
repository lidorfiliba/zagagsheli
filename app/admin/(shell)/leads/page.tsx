import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';
import { Phone, MessageCircle, Search, Download } from 'lucide-react';
import type { Prisma } from '@prisma/client';
import { prisma } from '~/lib/prisma';
import { whatsappUrl } from '~/lib/whatsapp';
import { telHref, formatIsraeliPhone } from '~/lib/hebrew';

const STATUS_LABEL: Record<string, string> = {
  NEW: 'חדש', CONTACTED: 'ניצור קשר', QUOTED: 'נשלחה הצעה', WON: 'זכייה', LOST: 'הפסד',
};
const SERVICE_LABEL: Record<string, string> = {
  showers: 'מקלחונים', railings: 'מעקות', mirrors: 'מראות',
  cladding: 'חיפויים', 'bath-screens': 'אמבטיונים', custom: 'עבודות מיוחדות',
  general: 'בירור כללי',
};

interface Params {
  searchParams: Promise<{ status?: string; service?: string; q?: string; page?: string }>;
}

const PAGE_SIZE = 25;

export default async function LeadsPage({ searchParams }: Params) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page || '1'));
  const status = sp.status && sp.status !== 'all' ? sp.status : undefined;
  const service = sp.service && sp.service !== 'all' ? sp.service : undefined;
  const q = sp.q?.trim() || '';

  const where: Prisma.LeadWhereInput = {
    ...(status && { status }),
    ...(service && { serviceType: service }),
    ...(q && {
      OR: [
        { name: { contains: q } },
        { phone: { contains: q } },
        { city: { contains: q } },
        { message: { contains: q } },
      ],
    }),
  };

  const [leads, total, statusCounts] = await Promise.all([
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.lead.count({ where }),
    prisma.lead.groupBy({ by: ['status'], _count: true }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const countsByStatus: Record<string, number> = Object.fromEntries(
    statusCounts.map((s) => [s.status, s._count])
  );

  const qsBase = new URLSearchParams();
  if (status) qsBase.set('status', status);
  if (service) qsBase.set('service', service);
  if (q) qsBase.set('q', q);

  const linkWith = (overrides: Record<string, string | undefined>) => {
    const p = new URLSearchParams(qsBase);
    for (const [k, v] of Object.entries(overrides)) {
      if (v === undefined || v === '') p.delete(k);
      else p.set(k, v);
    }
    const qs = p.toString();
    return qs ? `/admin/leads?${qs}` : '/admin/leads';
  };

  return (
    <>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-ink">לידים</h1>
          <p className="text-muted text-sm mt-1">{total} פניות סה״כ</p>
        </div>
        <a
          href={`/api/admin/leads/export.csv?${qsBase.toString()}`}
          className="inline-flex items-center gap-2 border border-line px-4 py-2 rounded-[2px] text-sm font-semibold text-ink hover:bg-ink hover:text-paper transition-colors"
        >
          <Download className="w-4 h-4" strokeWidth={1.5} /> ייצוא CSV
        </a>
      </div>

      {/* Filters */}
      <form action="/admin/leads" method="get" className="bg-surface border border-line p-4 rounded-[2px] mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <label className="relative">
          <span className="sr-only">חיפוש</span>
          <Search className="absolute top-1/2 -translate-y-1/2 inline-start-3 w-4 h-4 text-muted" strokeWidth={1.5} style={{ insetInlineStart: '0.75rem' }} />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="חיפוש שם, טלפון, עיר…"
            className="w-full bg-paper border border-line ps-10 pe-3 py-2.5 text-sm text-ink rounded-[2px] focus:outline focus:outline-2 focus:outline-brass focus:border-brass"
            style={{ paddingInlineStart: '2.5rem' }}
          />
        </label>
        <select name="status" defaultValue={status || 'all'} className="bg-paper border border-line px-3 py-2.5 text-sm text-ink rounded-[2px] focus:outline focus:outline-2 focus:outline-brass focus:border-brass">
          <option value="all">כל הסטטוסים</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v} ({countsByStatus[k] ?? 0})</option>
          ))}
        </select>
        <select name="service" defaultValue={service || 'all'} className="bg-paper border border-line px-3 py-2.5 text-sm text-ink rounded-[2px] focus:outline focus:outline-2 focus:outline-brass focus:border-brass">
          <option value="all">כל השירותים</option>
          {Object.entries(SERVICE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <button type="submit" className="bg-ink text-paper px-4 py-2.5 text-sm font-semibold rounded-[2px] hover:opacity-95">סנן</button>
      </form>

      {leads.length === 0 ? (
        <div className="p-10 text-center border border-dashed border-line rounded-[2px] text-muted">
          לא נמצאו פניות התואמות לחיפוש.
        </div>
      ) : (
        <ul className="space-y-2">
          {leads.map((lead) => (
            <li key={lead.id} className="bg-surface border border-line p-4 rounded-[2px]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/leads/${lead.id}`} className="inline-flex items-center gap-2 font-semibold text-ink hover:text-brass-strong">
                    {!lead.isRead && <span className="inline-block w-2 h-2 rounded-full bg-brass" aria-label="לא נקרא" />}
                    {lead.name}
                  </Link>
                  <div className="text-xs text-muted mt-0.5">
                    {SERVICE_LABEL[lead.serviceType] || lead.serviceType}
                    {lead.city && ` · ${lead.city}`}
                    {' · '}
                    {formatDistanceToNow(lead.createdAt, { addSuffix: true, locale: he })}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <StatusBadge status={lead.status} />
                  <a href={telHref(lead.phone)} aria-label="חייג" className="w-9 h-9 grid place-items-center border border-line rounded-[2px] hover:bg-ink hover:text-paper transition-colors">
                    <Phone className="w-4 h-4" strokeWidth={1.5} />
                  </a>
                  <a
                    href={whatsappUrl(lead.phone.replace(/[^\d]/g, '').replace(/^0/, '972'), `היי ${lead.name}, מדבר ליאור מהזגג שלי`)}
                    target="_blank" rel="noopener noreferrer"
                    aria-label="וואטסאפ"
                    className="w-9 h-9 grid place-items-center border border-line rounded-[2px] text-[var(--color-whatsapp)] hover:bg-[var(--color-whatsapp)] hover:text-paper hover:border-[var(--color-whatsapp)] transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                  </a>
                </div>
              </div>
              {lead.message && <p className="mt-2 text-sm text-muted line-clamp-2">{lead.message}</p>}
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="mt-8 flex justify-center gap-2" aria-label="עמודים">
          {page > 1 && (
            <Link href={linkWith({ page: String(page - 1) })} className="px-3 py-2 border border-line rounded-[2px] text-sm hover:bg-line">הבא</Link>
          )}
          <span className="px-3 py-2 text-sm text-muted">{page} מתוך {totalPages}</span>
          {page < totalPages && (
            <Link href={linkWith({ page: String(page + 1) })} className="px-3 py-2 border border-line rounded-[2px] text-sm hover:bg-line">הקודם</Link>
          )}
        </nav>
      )}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block px-2 py-0.5 text-[10px] font-semibold rounded-[2px] ${status === 'NEW' ? 'bg-brass text-paper' : status === 'WON' ? 'bg-[var(--color-success)] text-paper' : status === 'LOST' ? 'bg-[var(--color-danger)] text-paper' : 'bg-line text-ink'}`}>
      {STATUS_LABEL[status] || status}
    </span>
  );
}
