'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '~/lib/prisma';
import { requireAdmin } from '~/lib/admin-auth';
import { leadStatusEnum } from '~/lib/validation';

export async function markLeadRead(id: string) {
  await requireAdmin();
  await prisma.lead.update({ where: { id }, data: { isRead: true } });
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  revalidatePath(`/admin/leads/${id}`);
}

const updateStatusSchema = z.object({
  id: z.string().min(1),
  status: leadStatusEnum,
  note: z.string().max(500).optional(),
});

export async function updateLeadStatus(input: z.infer<typeof updateStatusSchema>) {
  await requireAdmin();
  const parsed = updateStatusSchema.parse(input);
  const lead = await prisma.lead.findUnique({ where: { id: parsed.id } });
  if (!lead) return { error: 'ליד לא נמצא' };
  if (lead.status === parsed.status) return { error: 'הסטטוס כבר בעדכון זה' };

  await prisma.$transaction([
    prisma.lead.update({
      where: { id: parsed.id },
      data: { status: parsed.status, isRead: true },
    }),
    prisma.leadStatusChange.create({
      data: {
        leadId: parsed.id,
        fromStatus: lead.status,
        toStatus: parsed.status,
        note: parsed.note,
      },
    }),
  ]);
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
  revalidatePath(`/admin/leads/${parsed.id}`);
  return {};
}

const updateNotesSchema = z.object({
  id: z.string().min(1),
  notes: z.string().max(4000),
});

export async function updateLeadNotes(input: z.infer<typeof updateNotesSchema>) {
  await requireAdmin();
  const parsed = updateNotesSchema.parse(input);
  await prisma.lead.update({
    where: { id: parsed.id },
    data: { notes: parsed.notes },
  });
  revalidatePath(`/admin/leads/${parsed.id}`);
  return {};
}

export async function deleteLead(id: string) {
  await requireAdmin();
  await prisma.lead.delete({ where: { id } });
  revalidatePath('/admin');
  revalidatePath('/admin/leads');
}
