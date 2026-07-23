'use client';

import { useState, useTransition } from 'react';
import { Loader2, Check } from 'lucide-react';
import { updateSettings } from '~/app/actions/admin-content';
import { cn } from '~/lib/utils';

type Group = {
  title: string;
  description?: string;
  fields: Array<{ key: string; label: string; type?: 'text' | 'tel' | 'url' | 'email' | 'textarea'; hint?: string }>;
};

const GROUPS: Group[] = [
  {
    title: 'עמוד הבית — כותרת ראשית',
    description: 'הטקסטים שמופיעים על תמונת הפתיחה בעמוד הבית.',
    fields: [
      { key: 'content.hero.eyebrow', label: 'שורת עיטור מעל הכותרת', hint: 'למשל: "30 שנות ניסיון · מרכז הארץ"' },
      { key: 'content.hero.title_line1', label: 'כותרת — שורה ראשונה' },
      { key: 'content.hero.title_line2', label: 'כותרת — שורה שנייה (בכחול)' },
      { key: 'content.hero.subtitle', label: 'תת-כותרת', type: 'textarea' },
      { key: 'content.hero.cta_primary', label: 'טקסט כפתור ראשי (שיחה)' },
      { key: 'content.hero.cta_secondary', label: 'טקסט כפתור משני (וואטסאפ)' },
    ],
  },
  {
    title: 'פרטי קשר',
    description: 'מספר, אימייל וכתובת שמופיעים לאורך האתר.',
    fields: [
      { key: 'contact.business_name', label: 'שם העסק' },
      { key: 'contact.owner_name', label: 'שם הבעלים' },
      { key: 'contact.mobile', label: 'טלפון נייד (לתצוגה)', type: 'tel', hint: 'דוגמה: 050-3024060' },
      { key: 'contact.mobile_tel', label: 'טלפון נייד (E.164 ל-tel:)', type: 'tel', hint: 'דוגמה: +972503024060' },
      { key: 'contact.office', label: 'טלפון משרד' },
      { key: 'contact.office_tel', label: 'טלפון משרד (E.164)' },
      { key: 'contact.whatsapp_e164', label: 'וואטסאפ (E.164, ללא +)', hint: 'דוגמה: 972503024060' },
      { key: 'contact.notify_email', label: 'אימייל להתראות על לידים', type: 'email' },
      { key: 'contact.service_area', label: 'אזור שירות' },
    ],
  },
  {
    title: 'שעות פעילות',
    description: 'פורמט: HH:MM-HH:MM (למשל 07:00-18:00). אם סגור — הקלד "closed".',
    fields: [
      { key: 'hours.sunday', label: 'ראשון' },
      { key: 'hours.monday', label: 'שני' },
      { key: 'hours.tuesday', label: 'שלישי' },
      { key: 'hours.wednesday', label: 'רביעי' },
      { key: 'hours.thursday', label: 'חמישי' },
      { key: 'hours.friday', label: 'שישי' },
      { key: 'hours.saturday', label: 'שבת' },
    ],
  },
  {
    title: 'הודעות וואטסאפ',
    description: 'ההודעה שנפתחת בוואטסאפ כאשר לקוח לוחץ על הכפתור. משתנה לפי הדף.',
    fields: [
      { key: 'whatsapp.template.default', label: 'ברירת מחדל', type: 'textarea' },
      { key: 'whatsapp.template.showers', label: 'מקלחונים', type: 'textarea' },
      { key: 'whatsapp.template.railings', label: 'מעקות', type: 'textarea' },
      { key: 'whatsapp.template.mirrors', label: 'מראות', type: 'textarea' },
      { key: 'whatsapp.template.cladding', label: 'חיפויים', type: 'textarea' },
      { key: 'whatsapp.template.bath-screens', label: 'אמבטיונים', type: 'textarea' },
      { key: 'whatsapp.template.custom', label: 'עבודות מיוחדות', type: 'textarea' },
    ],
  },
  {
    title: 'רשתות חברתיות',
    fields: [
      { key: 'social.facebook', label: 'פייסבוק', type: 'url' },
      { key: 'social.tiktok', label: 'טיקטוק', type: 'url' },
      { key: 'social.reviews', label: 'קישור חוות דעת', type: 'url' },
    ],
  },
  {
    title: 'מעקב ופרסום',
    description: 'הדבק את ה-ID של הפיקסל / GA4. השאר ריק כדי לכבות.',
    fields: [
      { key: 'analytics.meta_pixel_id', label: 'Meta Pixel ID' },
      { key: 'analytics.ga4_id', label: 'Google Analytics 4 ID' },
    ],
  },
];

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const [values, setValues] = useState<Record<string, string>>(settings);
  const [pending, startTransition] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const setValue = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));
  const dirty = Object.keys(values).some((k) => values[k] !== (settings[k] || ''));

  const save = () => {
    setErr(null);
    startTransition(async () => {
      try {
        await updateSettings(values);
        setSavedAt(new Date());
      } catch (e) {
        setErr((e as Error).message);
      }
    });
  };

  const inputClass = 'w-full bg-paper border border-line px-3 py-2 text-sm text-ink rounded-[2px] focus:outline focus:outline-2 focus:outline-brass focus:border-brass';

  return (
    <div className="space-y-10 pb-32">
      {GROUPS.map((group) => (
        <section key={group.title} className="bg-surface border border-line p-5 md:p-7 rounded-[2px]">
          <h2 className="text-lg font-bold text-ink">{group.title}</h2>
          {group.description && <p className="text-sm text-muted mt-1 mb-5">{group.description}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {group.fields.map((f) => (
              <label key={f.key} className={cn(f.type === 'textarea' && 'md:col-span-2')}>
                <span className="block text-xs font-semibold text-muted mb-1">{f.label}</span>
                {f.type === 'textarea' ? (
                  <textarea
                    value={values[f.key] || ''}
                    onChange={(e) => setValue(f.key, e.target.value)}
                    rows={2}
                    className={inputClass + ' resize-y'}
                  />
                ) : (
                  <input
                    type={f.type || 'text'}
                    value={values[f.key] || ''}
                    onChange={(e) => setValue(f.key, e.target.value)}
                    dir={f.type === 'tel' || f.type === 'email' || f.type === 'url' ? 'ltr' : undefined}
                    className={inputClass + ((f.type === 'tel' || f.type === 'email' || f.type === 'url') ? ' text-start' : '')}
                  />
                )}
                {f.hint && <span className="text-xs text-muted mt-1 block">{f.hint}</span>}
              </label>
            ))}
          </div>
        </section>
      ))}

      {/* Sticky save bar */}
      <div className="fixed md:static bottom-16 md:bottom-auto inset-inline-0 md:inset-inline-auto z-20 bg-paper/95 md:bg-transparent backdrop-blur md:backdrop-blur-none border-t md:border-0 border-line p-3 md:p-0" style={{ insetInline: 0 }}>
        <div className="max-w-[1200px] mx-auto px-4 md:px-0 flex items-center justify-between gap-3">
          <div className="text-xs text-muted">
            {err ? <span className="text-[var(--color-danger)]">{err}</span>
              : savedAt ? <span className="text-[var(--color-success)] inline-flex items-center gap-1"><Check className="w-3.5 h-3.5" /> נשמר {savedAt.toLocaleTimeString('he-IL')}</span>
              : dirty ? 'יש שינויים לא שמורים' : ''}
          </div>
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className="inline-flex items-center gap-2 bg-ink text-paper px-6 py-2.5 rounded-[2px] font-semibold disabled:opacity-40"
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            {pending ? 'שומר…' : 'שמור שינויים'}
          </button>
        </div>
      </div>
    </div>
  );
}
