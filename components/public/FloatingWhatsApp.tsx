'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { whatsappUrl } from '~/lib/whatsapp';

/**
 * Fixed WhatsApp FAB. Appears after 400px of scroll so it doesn't compete with
 * the hero CTAs. Message text is resolved server-side from SiteSetting.
 */
export function FloatingWhatsApp({
  phoneE164,
  message,
}: {
  phoneE164: string;
  message: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <a
      href={whatsappUrl(phoneE164, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="שלח וואטסאפ"
      className={
        `fixed z-50 inline-flex items-center justify-center ` +
        `w-14 h-14 md:w-16 md:h-16 rounded-full bg-[var(--color-whatsapp)] text-white ` +
        `shadow-[0_6px_20px_-4px_rgba(0,0,0,0.25)] transition-all duration-300 ease-out ` +
        `hover:scale-[1.06] focus-visible:scale-[1.06] ` +
        (visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none')
      }
      style={{
        bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))',
        insetInlineEnd: 'max(1rem, env(safe-area-inset-right, 1rem))',
      }}
    >
      <MessageCircle className="w-7 h-7 md:w-8 md:h-8" strokeWidth={1.5} />
    </a>
  );
}
