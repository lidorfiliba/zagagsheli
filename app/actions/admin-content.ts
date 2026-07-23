'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { prisma } from '~/lib/prisma';
import { requireAdmin } from '~/lib/admin-auth';

// ─── Settings ─────────────────────────────────────────────────
const settingsSchema = z.record(z.string(), z.string().max(2000));

export async function updateSettings(input: unknown) {
  await requireAdmin();
  const parsed = settingsSchema.parse(input);
  await prisma.$transaction(
    Object.entries(parsed).map(([key, value]) =>
      prisma.siteSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );
  revalidatePath('/', 'layout'); // any page reading settings gets fresh data
  return {};
}

// ─── Services ─────────────────────────────────────────────────
const serviceSchema = z.object({
  id: z.string().min(1),
  titleHe: z.string().min(2).max(200),
  shortDescHe: z.string().min(2).max(500),
  longDescHe: z.string().min(2).max(4000),
  seoTitle: z.string().max(200).optional().or(z.literal('')),
  seoDesc: z.string().max(400).optional().or(z.literal('')),
  order: z.number().int(),
  published: z.boolean(),
});

export async function updateService(input: z.infer<typeof serviceSchema>) {
  await requireAdmin();
  const p = serviceSchema.parse(input);
  await prisma.service.update({
    where: { id: p.id },
    data: {
      titleHe: p.titleHe,
      shortDescHe: p.shortDescHe,
      longDescHe: p.longDescHe,
      seoTitle: p.seoTitle || null,
      seoDesc: p.seoDesc || null,
      order: p.order,
      published: p.published,
    },
  });
  revalidatePath('/', 'layout');
  return {};
}

// ─── FAQ ──────────────────────────────────────────────────────
const faqSchema = z.object({
  id: z.string().optional(),
  questionHe: z.string().min(3).max(300),
  answerHe: z.string().min(3).max(2000),
  order: z.number().int(),
  published: z.boolean(),
  serviceSlug: z.string().max(30).optional().or(z.literal('')),
});

export async function upsertFaq(input: z.infer<typeof faqSchema>) {
  await requireAdmin();
  const p = faqSchema.parse(input);
  const data = {
    questionHe: p.questionHe,
    answerHe: p.answerHe,
    order: p.order,
    published: p.published,
    serviceSlug: p.serviceSlug || null,
  };
  if (p.id) await prisma.faq.update({ where: { id: p.id }, data });
  else await prisma.faq.create({ data });
  revalidatePath('/', 'layout');
  return {};
}

export async function deleteFaq(id: string) {
  await requireAdmin();
  await prisma.faq.delete({ where: { id } });
  revalidatePath('/', 'layout');
}

// ─── Testimonials ─────────────────────────────────────────────
const testimonialSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1).max(100),
  city: z.string().max(60).optional().or(z.literal('')),
  textHe: z.string().min(3).max(1000),
  rating: z.number().int().min(1).max(5),
  sourceUrl: z.string().url().optional().or(z.literal('')),
  order: z.number().int(),
  published: z.boolean(),
});

export async function upsertTestimonial(input: z.infer<typeof testimonialSchema>) {
  await requireAdmin();
  const p = testimonialSchema.parse(input);
  const data = {
    name: p.name,
    city: p.city || null,
    textHe: p.textHe,
    rating: p.rating,
    sourceUrl: p.sourceUrl || null,
    order: p.order,
    published: p.published,
  };
  if (p.id) await prisma.testimonial.update({ where: { id: p.id }, data });
  else await prisma.testimonial.create({ data });
  revalidatePath('/', 'layout');
  return {};
}

export async function deleteTestimonial(id: string) {
  await requireAdmin();
  await prisma.testimonial.delete({ where: { id } });
  revalidatePath('/', 'layout');
}

// ─── About ────────────────────────────────────────────────────
const aboutSchema = z.object({
  bodyHe: z.string().min(10).max(20000),
  ownerPhoto: z.string().max(500).optional().or(z.literal('')),
});

export async function updateAbout(input: z.infer<typeof aboutSchema>) {
  await requireAdmin();
  const p = aboutSchema.parse(input);
  const existing = await prisma.aboutPage.findFirst();
  if (existing) {
    await prisma.aboutPage.update({
      where: { id: existing.id },
      data: { bodyHe: p.bodyHe, ownerPhoto: p.ownerPhoto || null },
    });
  } else {
    await prisma.aboutPage.create({
      data: { bodyHe: p.bodyHe, ownerPhoto: p.ownerPhoto || null },
    });
  }
  revalidatePath('/about');
  return {};
}
