import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Phone, MessageCircle, ArrowLeft } from 'lucide-react';
import { prisma } from '~/lib/prisma';
import { getSettings } from '~/lib/settings';
import { Section } from '~/components/public/Section';
import { SectionHeader } from '~/components/public/SectionHeader';
import { FaqSection } from '~/components/public/home/FaqSection';
import { ContactForm } from '~/components/public/ContactForm';
import { BreadcrumbJsonLd, FaqJsonLd } from '~/components/public/JsonLd';
import { formatIsraeliPhone, telHref } from '~/lib/hebrew';
import { whatsappUrl } from '~/lib/whatsapp';

interface Params {
  params: Promise<{ service: string }>;
}

const SLUGS = new Set([
  'showers', 'railings', 'mirrors', 'cladding', 'bath-screens', 'custom',
]);

export async function generateStaticParams() {
  return [...SLUGS].map((service) => ({ service }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { service: slug } = await params;
  if (!SLUGS.has(slug)) return {};
  const service = await prisma.service.findUnique({ where: { slug } });
  if (!service) return {};
  return {
    title: service.seoTitle ?? service.titleHe,
    description: service.seoDesc ?? service.shortDescHe,
    alternates: { canonical: `/${slug}` },
  };
}

export default async function ServicePage({ params }: Params) {
  const { service: slug } = await params;
  if (!SLUGS.has(slug)) notFound();

  const [service, settings, gallery, faqs, allServices] = await Promise.all([
    prisma.service.findUnique({ where: { slug } }),
    getSettings(),
    prisma.galleryItem.findMany({
      where: { published: true, category: { slug } },
      include: { category: true },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: 8,
    }),
    prisma.faq.findMany({
      where: {
        published: true,
        OR: [{ serviceSlug: slug }, { serviceSlug: null }],
      },
      orderBy: { order: 'asc' },
      take: 6,
    }),
    prisma.service.findMany({ where: { published: true }, orderBy: { order: 'asc' } }),
  ]);

  if (!service) notFound();

  const mobile = settings['contact.mobile'] || '';
  const waE164 = settings['contact.whatsapp_e164'] || '';
  const waMsg = settings[`whatsapp.template.${slug}`] || settings['whatsapp.template.default'] || 'היי, הגעתי מהאתר';
  const heroImage = gallery[0];

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { name: 'הזגג שלי', url: 'https://zagagsheli.co.il/' },
          { name: service.titleHe, url: `https://zagagsheli.co.il/${slug}` },
        ]}
      />
      <FaqJsonLd faqs={faqs} />

      {/* Hero */}
      <section
        aria-label={service.titleHe}
        className="relative overflow-hidden bg-ink text-paper"
        style={{ minHeight: 'clamp(420px, 60svh, 620px)' }}
      >
        {heroImage && (
          <div className="absolute inset-0">
            <Image
              src={heroImage.imagePath}
              alt={heroImage.altHe}
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              placeholder="blur"
              blurDataURL={heroImage.blurData}
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/60 to-ink/40" aria-hidden="true" />
          </div>
        )}

        <div className="relative mx-auto max-w-[1200px] px-6 md:px-8 h-full flex items-end pb-12 md:pb-20 pt-28 md:pt-36">
          <div className="max-w-3xl">
            <nav className="mb-4 text-sm text-paper/70" aria-label="נתיב ניווט">
              <Link href="/" className="hover:text-paper transition-colors">הזגג שלי</Link>
              <span className="mx-2" aria-hidden="true">/</span>
              <span>{service.titleHe}</span>
            </nav>
            <h1 className="text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] font-extrabold tracking-tight">
              {service.titleHe}
            </h1>
            <p className="mt-5 text-lg md:text-xl text-paper/85 max-w-2xl leading-relaxed">
              {service.shortDescHe}
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a
                href={telHref(mobile)}
                className="inline-flex items-center justify-center gap-2 bg-paper text-ink px-7 py-3.5 rounded-[2px] font-semibold hover:bg-white transition-colors"
              >
                <Phone className="w-4 h-4" strokeWidth={2} />
                <span>שיחה עכשיו</span>
                <span className="ltr-num text-muted mr-1">{formatIsraeliPhone(mobile)}</span>
              </a>
              <a
                href={whatsappUrl(waE164, waMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-paper/60 text-paper px-7 py-3.5 rounded-[2px] font-semibold hover:bg-paper/10 transition-colors"
              >
                <MessageCircle className="w-4 h-4" strokeWidth={2} />
                <span>שלח וואטסאפ</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Long description */}
      <Section id="details">
        <SectionHeader eyebrow="פרטים" title={`למה ${service.titleHe.replace(/^(מקלחונים|מעקות|מראות|חיפויי|אמבטיונים|עבודות)/, (m) => m)} אצלנו`} as="h2" />
        <div className="max-w-3xl">
          <p className="text-lg text-ink leading-relaxed whitespace-pre-line">
            {service.longDescHe}
          </p>
        </div>
      </Section>

      {/* Gallery slice */}
      {gallery.length > 0 && (
        <Section id="gallery">
          <div className="flex items-end justify-between mb-12 md:mb-16 gap-6">
            <div>
              <div className="eyebrow mb-2">גלריה</div>
              <h2 className="text-[clamp(1.5rem,3vw,2rem)] leading-[1.2] font-bold text-ink tracking-tight">
                עבודות שבוצעו
              </h2>
              <span className="rule-brass" />
            </div>
            <Link
              href={`/gallery?category=${slug}`}
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-brass-strong transition-colors mb-1"
            >
              <span>עוד עבודות</span>
              <ArrowLeft className="w-4 h-4" strokeWidth={2} />
            </Link>
          </div>
          <div className="[column-count:1] sm:[column-count:2] lg:[column-count:3] [column-gap:12px] md:[column-gap:16px]">
            {gallery.map((img) => (
              <Link
                key={img.id}
                href={`/gallery?category=${slug}`}
                className="mb-3 md:mb-4 block break-inside-avoid"
                aria-label={`ראה בגלריה: ${img.altHe}`}
              >
                <div className="relative w-full overflow-hidden bg-ink/5" style={{ aspectRatio: `${img.width} / ${img.height}` }}>
                  <Image
                    src={img.imagePath}
                    alt={img.altHe}
                    fill
                    sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                    placeholder="blur"
                    blurDataURL={img.blurData}
                    loading="lazy"
                    className="object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
                  />
                </div>
              </Link>
            ))}
          </div>
        </Section>
      )}

      {/* FAQ subset */}
      {faqs.length > 0 && <FaqSection faqs={faqs} />}

      {/* Pre-filled contact form */}
      <Section id="contact" variant="surface">
        <SectionHeader
          eyebrow="בקשת הצעה"
          title={`מעוניין ב${service.titleHe.startsWith('עבודות') ? 'עבודות' : service.titleHe}?`}
          as="h2"
        />
        <div className="max-w-2xl">
          <ContactForm
            services={allServices}
            sourcePage={`/${slug}`}
            initialServiceType={slug}
          />
        </div>
      </Section>
    </>
  );
}
