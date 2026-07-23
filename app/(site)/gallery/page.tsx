import type { Metadata } from 'next';
import { Suspense } from 'react';
import { prisma } from '~/lib/prisma';
import { Section } from '~/components/public/Section';
import { SectionHeader } from '~/components/public/SectionHeader';
import { GalleryClient } from '~/components/public/gallery/GalleryClient';

export const metadata: Metadata = {
  title: 'גלריית עבודות — הזגג שלי',
  description: 'גלריה מלאה של עבודות זכוכית: מקלחונים, מעקות, מראות, חיפויים. סנן לפי קטגוריה ולחץ להגדלה.',
  alternates: { canonical: '/gallery' },
};

export default async function GalleryPage() {
  const [images, categories] = await Promise.all([
    prisma.galleryItem.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.category.findMany({ orderBy: { order: 'asc' } }),
  ]);

  // Only surface categories that actually have images
  const populatedSlugs = new Set(images.map((i) => i.category.slug));
  const visibleCategories = categories.filter((c) => populatedSlugs.has(c.slug));

  const items = images.map((i) => ({
    id: i.id,
    src: i.imagePath,
    blur: i.blurData,
    alt: i.altHe,
    width: i.width,
    height: i.height,
    categorySlug: i.category.slug,
    categoryName: i.category.nameHe,
  }));

  return (
    <Section id="gallery-full">
      <SectionHeader eyebrow="גלריה" title="עבודות מהמפעל" as="h1" />
      <Suspense fallback={<div className="text-muted">טוען…</div>}>
        <GalleryClient items={items} categories={visibleCategories} />
      </Suspense>
    </Section>
  );
}
