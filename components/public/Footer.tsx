import Link from 'next/link';
import { Facebook, Music2 } from 'lucide-react';
import { formatIsraeliPhone, telHref } from '~/lib/hebrew';

const DAY_ORDER: Array<[string, string]> = [
  ['sunday', 'ראשון'],
  ['monday', 'שני'],
  ['tuesday', 'שלישי'],
  ['wednesday', 'רביעי'],
  ['thursday', 'חמישי'],
  ['friday', 'שישי'],
  ['saturday', 'שבת'],
];

export function Footer({ settings }: { settings: Record<string, string> }) {
  const year = new Date().getFullYear();
  const mobile = settings['contact.mobile'] || '';
  const office = settings['contact.office'] || '';
  const business = settings['contact.business_name'] || 'הזגג שלי';
  const owner = settings['contact.owner_name'] || '';
  const area = settings['contact.service_area'] || 'מרכז הארץ';
  const facebook = settings['social.facebook'] || '';
  const tiktok = settings['social.tiktok'] || '';

  return (
    <footer className="mt-32 border-t border-line bg-paper">
      <div className="mx-auto max-w-[1200px] px-6 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="text-xl font-extrabold text-ink">{business}</div>
            <p className="mt-2 text-sm text-muted">{owner}</p>
            <p className="mt-4 text-sm text-muted">אזור שירות: {area}</p>
          </div>

          {/* Services */}
          <nav className="md:col-span-1" aria-label="שירותים">
            <h3 className="text-sm font-semibold text-ink mb-4">שירותים</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li><Link href="/showers" className="hover:text-ink transition-colors">מקלחונים</Link></li>
              <li><Link href="/railings" className="hover:text-ink transition-colors">מעקות זכוכית</Link></li>
              <li><Link href="/mirrors" className="hover:text-ink transition-colors">מראות</Link></li>
              <li><Link href="/cladding" className="hover:text-ink transition-colors">חיפויי זכוכית</Link></li>
              <li><Link href="/bath-screens" className="hover:text-ink transition-colors">אמבטיונים</Link></li>
              <li><Link href="/custom" className="hover:text-ink transition-colors">עבודות מיוחדות ותיקונים</Link></li>
            </ul>
          </nav>

          {/* Contact */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-ink mb-4">יצירת קשר</h3>
            <ul className="space-y-2 text-sm text-muted">
              {mobile && (
                <li>
                  <div className="text-xs text-muted mb-0.5">נייד</div>
                  <a href={telHref(mobile)} className="text-ink font-medium hover:text-brass-strong transition-colors">
                    <span className="ltr-num">{formatIsraeliPhone(mobile)}</span>
                  </a>
                </li>
              )}
              {office && (
                <li className="pt-2">
                  <div className="text-xs text-muted mb-0.5">משרד</div>
                  <a href={telHref(office)} className="text-ink font-medium hover:text-brass-strong transition-colors">
                    <span className="ltr-num">{formatIsraeliPhone(office)}</span>
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Hours */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-ink mb-4">שעות פעילות</h3>
            <ul className="space-y-1.5 text-sm text-muted">
              {DAY_ORDER.map(([key, label]) => {
                const value = settings[`hours.${key}`] || 'closed';
                const display = value === 'closed' ? 'סגור' : value;
                return (
                  <li key={key} className="flex justify-between gap-4">
                    <span>{label}</span>
                    <span className={value === 'closed' ? '' : 'ltr-num text-ink'}>{display}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-muted">
          <div>© {year} {business}. כל הזכויות שמורות.</div>
          <div className="flex items-center gap-4">
            <Link href="/accessibility" className="hover:text-ink transition-colors">הצהרת נגישות</Link>
            <span aria-hidden="true">·</span>
            <Link href="/privacy" className="hover:text-ink transition-colors">מדיניות פרטיות</Link>
            {facebook && (
              <>
                <span aria-hidden="true">·</span>
                <a href={facebook} rel="noopener noreferrer" target="_blank" className="hover:text-ink transition-colors inline-flex items-center gap-1.5" aria-label="פייסבוק">
                  <Facebook className="w-4 h-4" strokeWidth={1.5} />
                </a>
              </>
            )}
            {tiktok && (
              <a href={tiktok} rel="noopener noreferrer" target="_blank" className="hover:text-ink transition-colors inline-flex items-center gap-1.5" aria-label="טיקטוק">
                <Music2 className="w-4 h-4" strokeWidth={1.5} />
              </a>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
