import { prisma } from '~/lib/prisma';

export const runtime = 'nodejs';

/**
 * Read-only leads JSON API — keyed by LEADS_API_KEY in the `x-api-key` header.
 * Owner's separate workflow (CRM / notification service) can poll this
 * endpoint on a schedule.
 *
 * Query params:
 *   status=NEW|CONTACTED|QUOTED|WON|LOST
 *   since=<ISO date>   — only leads created after this timestamp
 *   limit=<1..500>     — default 100
 */
export async function GET(req: Request) {
  const key = req.headers.get('x-api-key');
  const expected = process.env.LEADS_API_KEY;
  if (!expected) return jsonErr('LEADS_API_KEY not configured', 500);
  if (!key || key !== expected) return jsonErr('Unauthorized', 401);

  const url = new URL(req.url);
  const status = url.searchParams.get('status');
  const since = url.searchParams.get('since');
  const limit = Math.min(500, Math.max(1, Number(url.searchParams.get('limit') || '100')));

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (since) {
    const d = new Date(since);
    if (!Number.isNaN(d.getTime())) where.createdAt = { gte: d };
  }

  const leads = await prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return new Response(JSON.stringify({ count: leads.length, leads }, null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function jsonErr(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
