import type { Testimonial } from '@prisma/client';
import { Star } from 'lucide-react';
import { Section } from '~/components/public/Section';
import { SectionHeader } from '~/components/public/SectionHeader';

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null;

  return (
    <Section id="testimonials">
      <SectionHeader eyebrow="לקוחות" title="מה הם אומרים עלינו" as="h2" />

      <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
        {testimonials.map((t) => (
          <li key={t.id} className="relative pt-6 border-t border-line">
            <div className="flex gap-0.5 mb-3" aria-label={`${t.rating} כוכבים`}>
              {[...Array(t.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-brass text-brass" strokeWidth={0} aria-hidden="true" />
              ))}
            </div>
            <blockquote className="text-lg md:text-xl leading-relaxed text-ink">
              "{t.textHe}"
            </blockquote>
            <footer className="mt-4 text-sm text-muted">
              <span className="font-semibold text-ink">{t.name}</span>
              {t.city && <span> · {t.city}</span>}
              {t.sourceUrl && (
                <>
                  <span> · </span>
                  <a
                    href={t.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-brass decoration-1 underline-offset-4 hover:text-ink transition-colors"
                  >
                    pro.co.il
                  </a>
                </>
              )}
            </footer>
          </li>
        ))}
      </ul>
    </Section>
  );
}
