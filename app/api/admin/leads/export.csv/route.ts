import { auth } from '~/auth';
import { prisma } from '~/lib/prisma';
import type { Prisma } from '@prisma/client';

export const runtime = 'nodejs';

/**
 * CSV export of leads matching the filters passed as query params.
 * Same filter keys as the /admin/leads UI so a filtered view is
 * exportable in one click.
 */
export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return new Response('Unauthorized', { status: 401 });

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const service = url.searchParams.get('service');
  const q = url.searchParams.get('q')?.trim() || '';

  const where: Prisma.LeadWhereInput = {
    ...(status && status !== 'all' && { status }),
    ...(service && service !== 'all' && { serviceType: service }),
    ...(q && {
      OR: [
        { name: { contains: q } },
        { phone: { contains: q } },
        { city: { contains: q } },
        { message: { contains: q } },
      ],
    }),
  };

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  const rows = [
    ['id', 'created_at', 'name', 'phone', 'email', 'city', 'service_type', 'status', 'source_page', 'message', 'notes'],
    ...leads.map((l) => [
      l.id,
      l.createdAt.toISOString(),
      l.name,
      l.phone,
      l.email || '',
      l.city || '',
      l.serviceType,
      l.status,
      l.sourcePage,
      (l.message || '').replace(/\r?\n/g, ' '),
      (l.notes || '').replace(/\r?\n/g, ' '),
    ]),
  ];

  const csv = rows.map((r) => r.map(csvEscape).join(',')).join('\r\n');
  // Prepend UTF-8 BOM so Excel opens Hebrew correctly.
  const body = '﻿' + csv;
  const filename = `leads-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}

function csvEscape(v: string): string {
  if (v == null) return '';
  const s = String(v);
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
