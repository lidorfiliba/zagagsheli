import type { MetadataRoute } from 'next';
import { prisma } from '~/lib/prisma';

const BASE = 'https://zagagsheli.co.il';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Fetch published entities that affect sitemap coverage
  const [services, faqUpdated, aboutUpdated, latestGallery] = await Promise.all([
    prisma.service.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true },
    }),
    prisma.faq.findFirst({ where: { published: true }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } }),
    prisma.aboutPage.findFirst({ select: { updatedAt: true } }),
    prisma.galleryItem.findFirst({ where: { published: true }, orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/gallery`, lastModified: latestGallery?.updatedAt ?? now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE}/about`, lastModified: aboutUpdated?.updatedAt ?? now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/faq`, lastModified: faqUpdated?.createdAt ?? now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/accessibility`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const servicePages: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${BASE}/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: 'monthly',
    priority: 0.9,
  }));

  return [...staticPages, ...servicePages];
}
