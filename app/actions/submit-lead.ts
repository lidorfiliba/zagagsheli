'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '~/lib/prisma';
import { leadSchema, type LeadInput } from '~/lib/validation';
import { rateLimit } from '~/lib/rate-limit';

/**
 * Public form → Lead row. Called from `<ContactForm>` via useTransition.
 * Returns `{ error }` for client-side display, or redirects to /thank-you on success.
 */
export async function submitLead(input: LeadInput): Promise<{ error?: string }> {
  const parsed = leadSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message ?? 'שדות שגויים';
    return { error: first };
  }
  const { honeypot, ...data } = parsed.data;
  if (honeypot && honeypot.length > 0) {
    // silent success — bot thinks it worked
    return {};
  }

  const h = await headers();
  const ip = (h.get('x-forwarded-for') || h.get('x-real-ip') || 'unknown').split(',')[0].trim();
  if (!rateLimit(`lead:${ip}`, 5, 60_000)) {
    return { error: 'יותר מדי בקשות בזמן קצר. נסה שוב בעוד דקה.' };
  }
  const ua = h.get('user-agent') || undefined;

  const lead = await prisma.lead.create({
    data: {
      name: data.name.trim(),
      phone: data.phone.trim(),
      email: data.email && data.email.length > 0 ? data.email : null,
      city: data.city && data.city.length > 0 ? data.city : null,
      serviceType: data.serviceType || 'general',
      message: data.message && data.message.length > 0 ? data.message : null,
      sourcePage: data.sourcePage.slice(0, 200),
      userAgent: ua?.slice(0, 400),
      ipAddress: ip.slice(0, 45),
      status: 'NEW',
    },
  });

  // Notify owner. SMTP is optional — fall back to server log so a leak-free
  // signal reaches the owner via server monitoring even without email setup.
  await notifyOwner(lead.id);

  redirect('/thank-you');
}

async function notifyOwner(leadId: string): Promise<void> {
  // Placeholder — real SMTP wiring lives in TODO. Logging surfaces the event
  // in production logs so nothing is silently lost.
  console.log(`[lead:new] id=${leadId}`);
}
