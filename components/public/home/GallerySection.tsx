import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import type { GalleryItem, Category } from '@prisma/client';
import { Section } from '~/components/public/Section';
import { SectionHeader } from '~/components/public/SectionHeader';

type ImageWithCategory = GalleryItem & { category: Category };

/**
 * Home gallery — quick masonry preview using CSS `column-count`. Tapping any
 * image navigates to /gallery (full filterable gallery with lightbox lives
 * there, keeps this section lean).
 */
export function GallerySection({ images }: { images: ImageWithCategory[] }) {
  if (images.length === 0) {
    return (
      <Section id="gallery">
        <SectionHeader eyebrow="גלריה" title="עבודות מהמפעל" as="h2" />
        <p className="text-muted">גלריה תיטען בקרוב.</p>
      </Section>
    );
  }

  return (
    <Section id="gallery">
      <div className="flex items-end justify-between mb-12 md:mb-16 gap-6">
        <div>
          <div className="eyebrow mb-2">גלריה</div>
          <h2 className="text-[clamp(1.5rem,3vw,2rem)] leading-[1.2] font-bold text-ink tracking-tight">
            עבודות מהמפעל
          </h2>
          <span className="rule-brass" />
        </div>
        <Link
          href="/gallery"
          className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-brass-strong transition-colors mb-1"
        >
          <span>לגלריה המלאה</span>
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        </Link>
      </div>

      <div className="[column-count:1] sm:[column-count:2] lg:[column-count:3] [column-gap:12px] md:[column-gap:16px]">
        {images.slice(0, 9).map((img) => (
          <Link
            key={img.id}
            href="/gallery"
            className="mb-3 md:mb-4 block break-inside-avoid focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
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

      <div className="mt-10 md:hidden text-center">
        <Link
          href="/gallery"
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink border-b-2 border-brass pb-0.5"
        >
          <span>לגלריה המלאה</span>
          <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        </Link>
      </div>
    </Section>
  );
}
