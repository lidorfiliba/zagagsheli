import type { Faq } from '@prisma/client';
import { ChevronDown } from 'lucide-react';
import { Section } from '~/components/public/Section';
import { SectionHeader } from '~/components/public/SectionHeader';

/**
 * Uses native <details>/<summary> — accessible by default, keyboard-navigable,
 * no client-side JS overhead. The FAQPage JSON-LD is emitted separately in the
 * page's root.
 */
export function FaqSection({ faqs }: { faqs: Faq[] }) {
  return (
    <Section id="faq">
      <SectionHeader eyebrow="שאלות" title="שאלות נפוצות" as="h2" />

      <div className="max-w-3xl mx-auto">
        {faqs.map((f) => (
          <details
            key={f.id}
            className="group border-b border-line last:border-b-0"
          >
            <summary className="cursor-pointer list-none py-6 flex items-start justify-between gap-4 text-ink font-semibold text-base md:text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass focus-visible:outline-offset-2">
              <span className="flex-1">{f.questionHe}</span>
              <ChevronDown
                className="w-5 h-5 shrink-0 mt-0.5 text-muted transition-transform duration-200 group-open:rotate-180"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </summary>
            <div className="pb-6 text-muted text-base leading-relaxed">
              {f.answerHe}
            </div>
          </details>
        ))}
      </div>
    </Section>
  );
}
