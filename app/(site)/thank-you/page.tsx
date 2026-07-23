import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'תודה על פנייתך',
  description: 'הבקשה נשלחה — נחזור אליך תוך יום עסקים.',
  robots: { index: false, follow: true }, // conversion page, don't index
};

/**
 * Post-submission page. This URL is the Meta Pixel / GA4 conversion goal —
 * do not change the path without updating those events.
 */
export default function ThankYouPage() {
  return (
    <section className="mx-auto max-w-2xl px-6 md:px-8 py-24 md:py-40 text-center">
      <CheckCircle2 className="w-14 h-14 mx-auto text-brass" strokeWidth={1.5} aria-hidden="true" />
      <h1 className="mt-6 text-3xl md:text-4xl font-extrabold text-ink tracking-tight">תודה — הבקשה נקלטה</h1>
      <p className="mt-4 text-lg text-muted leading-relaxed">
        נחזור אליך תוך יום עסקים. אם זה דחוף — התקשר או שלח וואטסאפ.
      </p>
      <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/"
          className="inline-flex items-center justify-center bg-ink text-paper px-7 py-3.5 rounded-[2px] font-semibold hover:opacity-95 transition-opacity"
        >
          חזרה לעמוד הבית
        </Link>
        <Link
          href="/gallery"
          className="inline-flex items-center justify-center border border-ink text-ink px-7 py-3.5 rounded-[2px] font-semibold hover:bg-ink hover:text-paper transition-colors"
        >
          לגלריה
        </Link>
      </div>
    </section>
  );
}
