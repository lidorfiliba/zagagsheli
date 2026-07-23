import type { Metadata } from 'next';
import { getSettings } from '~/lib/settings';
import { Section } from '~/components/public/Section';
import { SectionHeader } from '~/components/public/SectionHeader';
import { formatIsraeliPhone, telHref } from '~/lib/hebrew';

export const metadata: Metadata = {
  title: 'הצהרת נגישות — הזגג שלי',
  description: 'הצהרת נגישות לאתר הזגג שלי בהתאם לתקן ישראלי 5568 ו-WCAG 2.0 AA.',
  alternates: { canonical: '/accessibility' },
};

export default async function AccessibilityPage() {
  const settings = await getSettings();
  const owner = settings['contact.owner_name'] || 'ליאור פיליבה';
  const email = settings['contact.notify_email'] || 'lior@zagagsheli.co.il';
  const phone = settings['contact.mobile'] || '';

  return (
    <Section id="a11y">
      <SectionHeader eyebrow="נגישות" title="הצהרת נגישות" as="h1" />
      <div className="max-w-3xl space-y-6 text-ink leading-relaxed">
        <p>
          עסק "הזגג שלי" רואה בחשיבות עליונה את הנגשת אתר האינטרנט שלו לאנשים עם מוגבלות,
          ופועל בהתאם לתקן ישראלי 5568 המבוסס על הנחיות WCAG 2.0 ברמת AA של ארגון W3C.
        </p>

        <h2 className="text-2xl font-bold text-ink mt-8 mb-3">התאמות נגישות</h2>
        <ul className="list-disc pr-6 text-muted space-y-2">
          <li>ניגודיות טקסט של 4.5:1 לפחות מול הרקע</li>
          <li>ניווט מלא במקלדת (Tab, Shift+Tab, Enter, Escape)</li>
          <li>סימון ברור של הפריט שבפוקוס לצרכי משתמשי מקלדת</li>
          <li>טקסט חלופי (alt) לכל תמונה משמעותית באתר</li>
          <li>מבנה כותרות היררכי (H1 → H2 → H3)</li>
          <li>תמיכה מלאה בהגדלת גופן ובזום עד 200%</li>
          <li>תמיכה בהעדפת "פחות תנועה" (prefers-reduced-motion)</li>
          <li>כל תגי טפסים נקשרו לשדותיהם עם label</li>
          <li>שימוש בתגי HTML סמנטיים (nav, main, section, article, footer)</li>
        </ul>

        <h2 className="text-2xl font-bold text-ink mt-8 mb-3">רכיבים שאינם נגישים</h2>
        <p className="text-muted">
          למיטב ידיעתנו אין ברגע זה רכיבים שאינם נגישים. אם נתקלת בבעיית נגישות באתר,
          נשמח שתעדכן אותנו כדי שנוכל לתקן.
        </p>

        <h2 className="text-2xl font-bold text-ink mt-8 mb-3">רכז נגישות</h2>
        <p className="text-muted">
          {owner} — לפניות בנושאי נגישות ולתיקון תקלות נגישות:
        </p>
        <ul className="text-muted space-y-1">
          <li>
            טלפון: <a href={telHref(phone)} className="text-ink font-semibold underline decoration-brass underline-offset-4">
              <span className="ltr-num">{formatIsraeliPhone(phone)}</span>
            </a>
          </li>
          <li>
            אימייל: <a href={`mailto:${email}`} className="text-ink font-semibold underline decoration-brass underline-offset-4 ltr-num">{email}</a>
          </li>
        </ul>

        <p className="mt-8 text-sm text-muted">
          הצהרה זו עודכנה לאחרונה בתאריך {new Date().toLocaleDateString('he-IL')}.
        </p>
      </div>
    </Section>
  );
}
