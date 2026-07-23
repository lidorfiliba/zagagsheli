import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import type { Service, GalleryItem, Category } from '@prisma/client';
import { Section } from '~/components/public/Section';
import { SectionHeader } from '~/components/public/SectionHeader';

type ImageWithCategory = GalleryItem & { category: Category };

// Visual-similarity fallback: when a service has no gallery photos yet,
// borrow one from a related category so the card still looks complete.
// The owner uploads real photos via /admin/gallery to replace these.
const IMAGE_FALLBACK: Record<string, string[]> = {
  'bath-screens': ['showers', 'railings'],       // glass enclosures / doors
  custom: ['cladding', 'mirrors', 'railings'],   // misc glass work
};

/**
 * Six-service grid. Top three (showers, railings, mirrors) get the full-width
 * top row on desktop (2 columns each) → visual weight matches business priority.
 * Bottom three share the second row.
 */
export function ServicesGrid({
  services,
  images,
}: {
  services: Service[];
  images: ImageWithCategory[];
}) {
  // Pick the first available image per service slug, with fallback to related
  // categories for slugs that have no photos yet.
  const imageFor = (slug: string): ImageWithCategory | null => {
    const own = images.find((i) => i.category.slug === slug);
    if (own) return own;
    const fallbacks = IMAGE_FALLBACK[slug] ?? [];
    for (const fb of fallbacks) {
      const img = images.find((i) => i.category.slug === fb);
      if (img) return img;
    }
    return null;
  };

  const priority = new Set(['showers', 'railings', 'mirrors']);
  const top = services.filter((s) => priority.has(s.slug));
  const rest = services.filter((s) => !priority.has(s.slug));

  return (
    <Section id="services">
      <SectionHeader eyebrow="שירותים" title="מה אנחנו עושים" as="h2" />

      {/* Top row: 3 priority services */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {top.map((s) => (
          <ServiceCard key={s.id} service={s} image={imageFor(s.slug)} large />
        ))}
      </div>

      {/* Bottom row: remaining 3 */}
      <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {rest.map((s) => (
          <ServiceCard key={s.id} service={s} image={imageFor(s.slug)} />
        ))}
      </div>
    </Section>
  );
}

function ServiceCard({
  service,
  image,
  large = false,
}: {
  service: Service;
  image: ImageWithCategory | null;
  large?: boolean;
}) {
  return (
    <Link
      href={`/${service.slug}`}
      className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass focus-visible:outline-offset-4"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink/5 border border-line">
        {image ? (
          <Image
            src={image.imagePath}
            alt={image.altHe}
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 768px) 340px, 100vw"
            placeholder="blur"
            blurDataURL={image.blurData}
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-muted text-sm">
            תמונות בקרוב
          </div>
        )}
      </div>
      <div className="mt-5 flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3
            className={
              (large ? 'text-xl md:text-2xl' : 'text-lg md:text-xl') +
              ' font-bold text-ink leading-tight'
            }
          >
            {service.titleHe}
          </h3>
          <p className="mt-2 text-muted text-sm md:text-base leading-relaxed">
            {service.shortDescHe}
          </p>
        </div>
        <span
          aria-hidden="true"
          className="mt-1 shrink-0 text-brass transition-transform duration-200 group-hover:-translate-x-1"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={1.5} />
        </span>
      </div>
      <span className="mt-3 block h-px w-full bg-line group-hover:bg-brass transition-colors duration-200" />
    </Link>
  );
}
