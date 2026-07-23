'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  LayoutDashboard, Inbox, Images, Wrench, MessageSquareQuote,
  HelpCircle, User, Settings, LogOut,
} from 'lucide-react';
import { cn } from '~/lib/utils';

const NAV = [
  { href: '/admin', label: 'לוח', icon: LayoutDashboard, exact: true },
  { href: '/admin/leads', label: 'לידים', icon: Inbox },
  { href: '/admin/gallery', label: 'גלריה', icon: Images },
  { href: '/admin/services', label: 'שירותים', icon: Wrench },
  { href: '/admin/faqs', label: 'שאלות', icon: HelpCircle },
  { href: '/admin/testimonials', label: 'המלצות', icon: MessageSquareQuote },
  { href: '/admin/about', label: 'אודות', icon: User },
  { href: '/admin/settings', label: 'הגדרות', icon: Settings },
];

// Bottom-nav on mobile shows only the top 4 destinations (owner uses these
// most; rest are one tap into a "more" screen — the /admin dashboard).
const MOBILE_NAV = NAV.slice(0, 4);

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-svh bg-paper text-ink">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-inline-start-0 top-0 h-svh w-64 border-e border-line bg-surface flex-col">
        <div className="px-6 py-6 border-b border-line">
          <div className="text-lg font-extrabold">הזגג שלי</div>
          <div className="text-xs text-muted">ניהול אתר</div>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.exact);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-[2px] text-sm font-medium transition-colors',
                      active
                        ? 'bg-ink text-paper'
                        : 'text-ink hover:bg-line'
                    )}
                  >
                    <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="p-3 border-t border-line">
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-[2px] text-sm font-medium text-muted hover:text-ink hover:bg-line transition-colors"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} /> התנתק
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden sticky top-0 z-30 border-b border-line bg-surface">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/admin" className="font-extrabold text-lg">הזגג שלי · מנהל</Link>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="text-muted p-2 -m-2"
            aria-label="התנתק"
          >
            <LogOut className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="md:pe-64 pb-24 md:pb-0">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 inset-inline-0 z-30 border-t border-line bg-surface"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0)', insetInline: 0 }}
        aria-label="ניווט מנהל"
      >
        <ul className="grid grid-cols-4">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-semibold',
                    active ? 'text-ink' : 'text-muted'
                  )}
                >
                  <Icon className={cn('w-6 h-6', active && 'text-brass')} strokeWidth={1.5} />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
