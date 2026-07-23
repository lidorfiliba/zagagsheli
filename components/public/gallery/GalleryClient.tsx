'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '~/lib/utils';

export interface GalleryItemVM {
  id: string;
  src: string;
  blur: string;
  alt: string;
  width: number;
  height: number;
  categorySlug: string;
  categoryName: string;
}

export interface CategoryVM { slug: string; nameHe: string; }

/**
 * Filterable masonry gallery + lightbox.
 * - URL sync: `?category=<slug>` — sharable + preserves state on refresh.
 * - Lightbox: keyboard arrows + swipe + Escape close + focus trap.
 */
export function GalleryClient({
  items,
  categories,
}: {
  items: GalleryItemVM[];
  categories: CategoryVM[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedSlug = searchParams.get('category') ?? 'all';
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const filtered = useMemo(
    () => (selectedSlug === 'all' ? items : items.filter((i) => i.categorySlug === selectedSlug)),
    [items, selectedSlug]
  );

  const setCategory = (slug: string) => {
    const p = new URLSearchParams(searchParams);
    if (slug === 'all') p.delete('category');
    else p.set('category', slug);
    const qs = p.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Lightbox controls
  const openAt = (idx: number) => setOpenIdx(idx);
  const close = useCallback(() => setOpenIdx(null), []);
  const prev = useCallback(() => setOpenIdx((i) => (i === null ? null : (i - 1 + filtered.length) % filtered.length)), [filtered.length]);
  const next = useCallback(() => setOpenIdx((i) => (i === null ? null : (i + 1) % filtered.length)), [filtered.length]);

  useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') next(); // RTL: left = next
      else if (e.key === 'ArrowRight') prev();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [openIdx, close, next, prev]);

  // Touch swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const delta = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(delta) < 40) return;
    if (delta > 0) prev(); else next();
    setTouchStart(null);
  };

  const current = openIdx !== null ? filtered[openIdx] : null;

  return (
    <>
      {/* Filter tabs */}
      <div className="mb-10 md:mb-14 flex flex-wrap gap-x-8 gap-y-2 border-b border-line">
        <FilterTab label="הכל" active={selectedSlug === 'all'} onClick={() => setCategory('all')} />
        {categories.map((c) => (
          <FilterTab key={c.slug} label={c.nameHe} active={selectedSlug === c.slug} onClick={() => setCategory(c.slug)} />
        ))}
      </div>

      {/* Masonry grid */}
      {filtered.length === 0 ? (
        <p className="text-muted">אין תמונות בקטגוריה זו כרגע.</p>
      ) : (
        <div className="[column-count:1] sm:[column-count:2] lg:[column-count:3] [column-gap:12px] md:[column-gap:16px]">
          {filtered.map((img, idx) => (
            <button
              key={img.id}
              type="button"
              onClick={() => openAt(idx)}
              className="mb-3 md:mb-4 block w-full break-inside-avoid focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass"
              aria-label={`הגדל: ${img.alt}`}
            >
              <div className="relative w-full overflow-hidden bg-ink/5" style={{ aspectRatio: `${img.width} / ${img.height}` }}>
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
                  placeholder="blur"
                  blurDataURL={img.blur}
                  loading="lazy"
                  className="object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
                />
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          className="fixed inset-0 z-[100] bg-ink/95 flex items-center justify-center p-4 md:p-8"
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <button
            type="button"
            aria-label="סגור"
            className="absolute top-4 inline-start-4 z-10 w-11 h-11 grid place-items-center text-paper hover:text-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass rounded-full"
            style={{ insetInlineStart: '1rem' }}
            onClick={(e) => { e.stopPropagation(); close(); }}
          >
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>

          <button
            type="button"
            aria-label="הקודם"
            className="absolute top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center text-paper hover:text-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass rounded-full"
            style={{ insetInlineEnd: '0.75rem' }}
            onClick={(e) => { e.stopPropagation(); prev(); }}
          >
            <ChevronRight className="w-8 h-8" strokeWidth={1.5} />
          </button>

          <button
            type="button"
            aria-label="הבא"
            className="absolute top-1/2 -translate-y-1/2 w-11 h-11 grid place-items-center text-paper hover:text-brass focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass rounded-full"
            style={{ insetInlineStart: '0.75rem' }}
            onClick={(e) => { e.stopPropagation(); next(); }}
          >
            <ChevronLeft className="w-8 h-8" strokeWidth={1.5} />
          </button>

          <figure
            className="max-w-[95vw] max-h-[85vh] relative"
            onClick={(e) => e.stopPropagation()}
            style={{ aspectRatio: `${current.width} / ${current.height}` }}
          >
            <Image
              src={current.src}
              alt={current.alt}
              width={current.width}
              height={current.height}
              placeholder="blur"
              blurDataURL={current.blur}
              className="max-w-full max-h-[85vh] w-auto h-auto object-contain"
              sizes="95vw"
              priority
            />
            <figcaption className="absolute -bottom-8 start-0 text-sm text-paper/70">
              {current.alt} · {current.categoryName}
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}

function FilterTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative -mb-px pb-3 text-sm md:text-base font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass',
        active ? 'text-ink' : 'text-muted hover:text-ink'
      )}
      aria-pressed={active}
    >
      {label}
      {active && <span className="absolute inset-inline-0 bottom-0 h-0.5 bg-brass" style={{ insetInline: 0 }} />}
    </button>
  );
}
