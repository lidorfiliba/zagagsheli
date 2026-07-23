'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { Phone, MessageCircle } from 'lucide-react';
import { formatIsraeliPhone, telHref } from '~/lib/hebrew';
import { whatsappUrl } from '~/lib/whatsapp';

interface HeroImage {
  src: string;
  blur: string;
  alt: string;
  width: number;
  height: number;
}

export function HomeHero({
  settings,
  heroImage,
}: {
  settings: Record<string, string>;
  heroImage: HeroImage | null;
}) {
  const reduce = useReducedMotion();
  const mobile = settings['contact.mobile'] || '';
  const waE164 = settings['contact.whatsapp_e164'] || '';
  const waMsg = settings['whatsapp.template.default'] || 'היי, הגעתי מהאתר';

  return (
    <section
      aria-label="ראשי"
      className="relative overflow-hidden bg-ink text-paper"
      style={{ minHeight: 'clamp(560px, 78svh, 800px)' }}
    >
      {/* Background image — full-bleed, dimmed. Uses the first featured gallery
          image (usually a shower enclosure — the profit-driver). */}
      {heroImage && (
        <div className="absolute inset-0">
          <Image
            src={heroImage.src}
            alt={heroImage.alt}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            placeholder="blur"
            blurDataURL={heroImage.blur}
            className="object-cover object-center"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/60 to-ink/40"
          />
        </div>
      )}

      {/* Signature: one-shot diagonal light-sweep across the pane.
          Wrapped in an extra clipping div — even though the parent has
          overflow-hidden, some mobile browsers still measure the animated
          transform for scrollable width. Explicit inner clip stops that. */}
      {!reduce && heroImage && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <motion.div
            className="absolute inset-0"
            initial={{ x: '-120%', opacity: 0 }}
            animate={{ x: '120%', opacity: [0, 0.35, 0] }}
            transition={{ duration: 1.8, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
            style={{
              background:
                'linear-gradient(115deg, transparent 42%, rgba(255,255,255,0.28) 50%, transparent 58%)',
              mixBlendMode: 'overlay',
              willChange: 'transform, opacity',
            }}
          />
        </div>
      )}

      <div className="relative mx-auto max-w-[1200px] px-6 md:px-8 h-full flex items-end pb-16 md:pb-24 pt-32 md:pt-40">
        <motion.div
          initial={reduce ? {} : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <div className="eyebrow text-brass mb-4">
            {settings['content.hero.eyebrow'] || '30 שנות ניסיון · מרכז הארץ'}
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] leading-[1.05] font-extrabold tracking-tight">
            {settings['content.hero.title_line1'] || 'זכוכית בהתאמה אישית —'}<br />
            <span className="text-brass">
              {settings['content.hero.title_line2'] || 'מקלחונים, מעקות ומראות.'}
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-paper/85 max-w-2xl leading-relaxed">
            {settings['content.hero.subtitle'] || 'מפעל עצמאי, מדידה חינם, אחריות מלאה. עבודה עם קבלנים, אדריכלים ולקוחות פרטיים במרכז הארץ.'}
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <a
              href={telHref(mobile)}
              className="inline-flex items-center justify-center gap-2 bg-paper text-ink px-7 py-3.5 rounded-[2px] font-semibold text-base hover:bg-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass focus-visible:outline-offset-2"
            >
              <Phone className="w-4 h-4" strokeWidth={2} />
              <span>{settings['content.hero.cta_primary'] || 'שיחה עכשיו'}</span>
              <span className="ltr-num text-muted mr-1">{formatIsraeliPhone(mobile)}</span>
            </a>
            <a
              href={whatsappUrl(waE164, waMsg)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 border border-paper/60 text-paper px-7 py-3.5 rounded-[2px] font-semibold text-base hover:bg-paper/10 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brass focus-visible:outline-offset-2"
            >
              <MessageCircle className="w-4 h-4" strokeWidth={2} />
              <span>{settings['content.hero.cta_secondary'] || 'שלח וואטסאפ'}</span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scroll hint (visible only when hero is at top) */}
      <div aria-hidden="true" className="absolute bottom-4 left-1/2 -translate-x-1/2 text-paper/40 text-xs hidden md:block">
        גלול למטה
      </div>
    </section>
  );
}
