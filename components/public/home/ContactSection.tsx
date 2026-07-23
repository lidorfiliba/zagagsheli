import type { Service } from '@prisma/client';
import { Phone, MessageCircle, Clock, MapPin } from 'lucide-react';
import { Section } from '~/components/public/Section';
import { SectionHeader } from '~/components/public/SectionHeader';
import { ContactForm } from '~/components/public/ContactForm';
import { formatIsraeliPhone, telHref } from '~/lib/hebrew';
import { whatsappUrl } from '~/lib/whatsapp';

const DAY_ORDER: Array<[string, string]> = [
  ['sunday', 'ראשון'], ['monday', 'שני'], ['tuesday', 'שלישי'],
  ['wednesday', 'רביעי'], ['thursday', 'חמישי'],
  ['friday', 'שישי'], ['saturday', 'שבת'],
];

export function ContactSection({
  settings,
  services,
}: {
  settings: Record<string, string>;
  services: Service[];
}) {
  const mobile = settings['contact.mobile'] || '';
  const office = settings['contact.office'] || '';
  const waE164 = settings['contact.whatsapp_e164'] || '';
  const waMsg = settings['whatsapp.template.default'] || 'היי, הגעתי מהאתר';
  const area = settings['contact.service_area'] || 'מרכז הארץ';

  return (
    <Section id="contact" variant="surface">
      <SectionHeader eyebrow="יצירת קשר" title="בואו נתחיל" as="h2" />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
        <div className="lg:col-span-3">
          <ContactForm services={services} sourcePage="/" />
        </div>

        <aside className="lg:col-span-2 space-y-8">
          <div>
            <h3 className="text-sm font-semibold text-ink mb-4">חייג ישירות</h3>
            <div className="space-y-3">
              <a href={telHref(mobile)} className="flex items-center gap-3 text-ink hover:text-brass-strong transition-colors">
                <Phone className="w-5 h-5 text-brass shrink-0" strokeWidth={1.5} />
                <div>
                  <div className="text-xs text-muted">נייד</div>
                  <div className="font-semibold ltr-num">{formatIsraeliPhone(mobile)}</div>
                </div>
              </a>
              {office && (
                <a href={telHref(office)} className="flex items-center gap-3 text-ink hover:text-brass-strong transition-colors">
                  <Phone className="w-5 h-5 text-brass shrink-0" strokeWidth={1.5} />
                  <div>
                    <div className="text-xs text-muted">משרד</div>
                    <div className="font-semibold ltr-num">{formatIsraeliPhone(office)}</div>
                  </div>
                </a>
              )}
              <a
                href={whatsappUrl(waE164, waMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-ink hover:text-brass-strong transition-colors"
              >
                <MessageCircle className="w-5 h-5 text-brass shrink-0" strokeWidth={1.5} />
                <div>
                  <div className="text-xs text-muted">וואטסאפ</div>
                  <div className="font-semibold">שלח הודעה</div>
                </div>
              </a>
            </div>
          </div>

          <div className="pt-8 border-t border-line">
            <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brass" strokeWidth={1.5} /> שעות פעילות
            </h3>
            <ul className="space-y-1.5 text-sm text-muted">
              {DAY_ORDER.map(([key, label]) => {
                const value = settings[`hours.${key}`] || 'closed';
                const display = value === 'closed' ? 'סגור' : value;
                return (
                  <li key={key} className="flex justify-between">
                    <span>{label}</span>
                    <span className={value === 'closed' ? '' : 'ltr-num text-ink font-medium'}>{display}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="pt-8 border-t border-line">
            <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brass" strokeWidth={1.5} /> אזור שירות
            </h3>
            <p className="text-muted text-sm">{area} — תל אביב, רמת גן, פתח תקווה, כפר סבא, הרצליה, רחובות, ראשון לציון, ראש העין וסביבתן.</p>
          </div>
        </aside>
      </div>
    </Section>
  );
}
