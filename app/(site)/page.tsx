import type { Metadata } from 'next';
import { prisma } from '~/lib/prisma';
import { getSettings } from '~/lib/settings';
import { HomeHero } from '~/components/public/home/HomeHero';
import { ServicesGrid } from '~/components/public/home/ServicesGrid';
import { GallerySection } from '~/components/public/home/GallerySection';
import { WhyUs } from '~/components/public/home/WhyUs';
import { HowItWorks } from '~/components/public/home/HowItWorks';
import { Testimonials } from '~/components/public/home/Testimonials';
import { FaqSection } from '~/components/public/home/FaqSection';
import { ContactSection } from '~/components/public/home/ContactSection';
import { LocalBusinessJsonLd, FaqJsonLd } from '~/components/public/JsonLd';

export const metadata: Metadata = {
  title: 'הזגג שלי — מקלחונים, מעקות ומראות בהתאמה אישית במרכז הארץ',
  description:
    'זגגות בהתאמה אישית במרכז הארץ. מקלחונים, מעקות זכוכית, מראות וחיפויי זכוכית — מפעל עצמאי, 30 שנות ניסיון, אחריות מלאה. מדידה חינם.',
};

export default async function HomePage() {
  const [settings, services, allImages, testimonials, faqs] = await Promise.all([
    getSettings(),
    prisma.service.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
    // Fetch a broad slice: enough to (a) pick one image per category for the
    // service cards, (b) fill 12 featured slots for the gallery preview,
    // (c) find a shower for the hero.
    prisma.galleryItem.findMany({
      where: { published: true },
      include: { category: true },
      orderBy: [{ featured: 'desc' }, { order: 'asc' }, { createdAt: 'desc' }],
      take: 60,
    }),
    prisma.testimonial.findMany({ where: { published: true }, orderBy: { order: 'asc' }, take: 4 }),
    prisma.faq.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
  ]);

  // Pick hero: prefer the top profit driver (showers), then any featured, then any image
  const heroImage =
    allImages.find((i) => i.category.slug === 'showers' && i.featured) ??
    allImages.find((i) => i.category.slug === 'showers') ??
    allImages.find((i) => i.featured) ??
    allImages[0];

  // Featured images for gallery preview — diverse across categories
  const featuredImages = allImages.filter((i) => i.featured).slice(0, 12);

  return (
    <>
      <LocalBusinessJsonLd settings={settings} />
      <FaqJsonLd faqs={faqs} />

      <HomeHero
        settings={settings}
        heroImage={heroImage ? { src: heroImage.imagePath, blur: heroImage.blurData, alt: heroImage.altHe, width: heroImage.width, height: heroImage.height } : null}
      />
      <ServicesGrid services={services} images={allImages} />
      <GallerySection images={featuredImages} />
      <WhyUs />
      <HowItWorks />
      <Testimonials testimonials={testimonials} />
      <FaqSection faqs={faqs} />
      <ContactSection settings={settings} services={services} />
    </>
  );
}
