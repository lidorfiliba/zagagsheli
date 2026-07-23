'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Phone } from 'lucide-react';
import { cn } from '~/lib/utils';
import { formatIsraeliPhone, telHref } from '~/lib/hebrew';

interface NavItem { href: string; label: string; }

const NAV: NavItem[] = [
  { href: '/showers', label: 'מקלחונים' },
  { href: '/railings', label: 'מעקות' },
  { href: '/mirrors', label: 'מראות' },
  { href: '/gallery', label: 'גלריה' },
  { href: '/about', label: 'אודות' },
  { href: '/#contact', label: 'צור קשר' },
];

export function Header({
  businessName,
  mobilePhone,
}: {
  businessName: string;
  mobilePhone: string;
}) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu when route changes (rough proxy: navigation)
  useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    window.addEventListener('hashchange', close);
    return () => window.removeEventListener('hashchange', close);
  }, [open]);

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-200',
        scrolled
          ? 'bg-paper/85 border-b border-line backdrop-blur'
          : 'bg-paper border-b border-transparent'
      )}
    >
      <div className="mx-auto max-w-[1200px] px-6 md:px-8">
        <div className="flex items-center justify-between gap-6 h-16 md:h-20">
          <Link
            href="/"
            className="text-xl md:text-2xl font-extrabold tracking-tight text-ink"
            aria-label={`${businessName} — עמוד בית`}
          >
            {businessName}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8" aria-label="ניווט ראשי">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-ink hover:text-brass-strong transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Desktop call button */}
          <a
            href={telHref(mobilePhone)}
            className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-ink hover:text-brass-strong transition-colors"
            aria-label={`התקשר עכשיו: ${formatIsraeliPhone(mobilePhone)}`}
          >
            <Phone className="w-4 h-4" strokeWidth={1.5} />
            <span className="ltr-num">{formatIsraeliPhone(mobilePhone)}</span>
          </a>

          {/* Mobile menu toggle */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center w-11 h-11 -mx-2 text-ink"
            aria-label={open ? 'סגור תפריט' : 'פתח תפריט'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="w-6 h-6" strokeWidth={1.5} /> : <Menu className="w-6 h-6" strokeWidth={1.5} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <nav
            id="mobile-menu"
            className="md:hidden pb-6 border-t border-line pt-4 -mx-6 px-6"
            aria-label="ניווט ראשי"
          >
            <ul className="flex flex-col gap-1">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block py-3 text-base font-medium text-ink"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="mt-3 pt-3 border-t border-line">
                <a
                  href={telHref(mobilePhone)}
                  className="flex items-center gap-2 py-3 text-base font-semibold text-ink"
                >
                  <Phone className="w-5 h-5" strokeWidth={1.5} />
                  <span className="ltr-num">{formatIsraeliPhone(mobilePhone)}</span>
                </a>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
