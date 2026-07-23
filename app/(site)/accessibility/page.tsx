import type { Metadata } from 'next';
import { getSettings } from '~/lib/settings';
import { Section } from '~/components/public/Section';
import { SectionHeader } from '~/components/public/SectionHeader';
import { formatIsraeliPhone, telHref } from '~/lib/hebrew';

export const metadata: Metadata = {
  title: 'הצהרת נגישות — הזגג שלי',
  description: 'הצהרת נגישות לאתר הזגג שלי בהתאם לתקן ישראלי 5568 (מבוסס WCAG 2.0 ברמת AA).',
  alternates: { canonical: '/accessibility' },
};

export default async function AccessibilityPage() {
  const settings = await getSettings();
  const owner = settings['contact.owner_name'] || 'ליאור פיליבה';
  const email = settings['contact.notify_email'] || 'lior@zagagsheli.co.il';
  const phone = settings['contact.mobile'] || '';
  const businessName = settings['contact.business_name'] || 'הזגג שלי';
  const lastUpdated = new Date().toLocaleDateString('he-IL', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <Section id="a11y">
      <SectionHeader eyebrow="נגישות" title="הצהרת נגישות" as="h1" />

      <div className="max-w-3xl space-y-8 text-ink leading-relaxed">
        {/* Intro */}
        <p className="text-lg">
          "{businessName}" (להלן: "העסק" או "האתר") רואה חשיבות עליונה בהנגשת אתר האינטרנט שלו לאנשים
          עם מוגבלות, ופועל להנגשה מלאה בהתאם ל<strong>תקן ישראלי 5568</strong> המבוסס על הנחיות
          WCAG 2.0 ברמת AA של ארגון W3C.
        </p>

        {/* What we did */}
        <section>
          <h2 className="text-2xl font-bold text-ink mt-8 mb-4">התאמות נגישות באתר</h2>
          <ul className="list-disc pr-6 text-muted space-y-2">
            <li>ניגודיות טקסט של 4.5:1 לפחות מול הרקע (רמת AA)</li>
            <li>ניווט מלא במקלדת: <code className="text-ink">Tab</code>, <code className="text-ink">Shift+Tab</code>, <code className="text-ink">Enter</code>, <code className="text-ink">Escape</code></li>
            <li>סימון ברור של הפריט בפוקוס (מסגרת מודגשת) לצורכי משתמשי מקלדת</li>
            <li>טקסט חלופי (Alt) לכל תמונה משמעותית באתר</li>
            <li>מבנה כותרות היררכי סדור (H1 → H2 → H3) לצרכי קורא-מסך</li>
            <li>תמיכה מלאה בהגדלת גופן ובזום עד 200% ומעלה ללא איבוד תוכן</li>
            <li>תמיכה בהעדפת "פחות תנועה" (<code className="text-ink">prefers-reduced-motion</code>) של מערכת ההפעלה</li>
            <li>כל שדות הטפסים נקשרו לתוויות שלהם באמצעות תג <code className="text-ink">label</code></li>
            <li>הודעות שגיאה בטופס משויכות לשדות שגויים (<code className="text-ink">aria-invalid</code>, <code className="text-ink">aria-describedby</code>)</li>
            <li>שימוש בתגי HTML סמנטיים (<code className="text-ink">nav</code>, <code className="text-ink">main</code>, <code className="text-ink">section</code>, <code className="text-ink">article</code>, <code className="text-ink">footer</code>)</li>
            <li>קישור "דלג לתוכן הראשי" בראש כל דף לצורכי קורא-מסך</li>
            <li>תוויות ARIA (<code className="text-ink">aria-label</code>) לכפתורי אייקון בלבד</li>
          </ul>
        </section>

        {/* Widget */}
        <section className="bg-surface border border-line rounded-[2px] p-6 md:p-8">
          <h2 className="text-2xl font-bold text-ink mt-0 mb-4">כלי הנגישות באתר</h2>
          <p className="text-muted mb-4">
            בתחתית כל דף ניתן למצוא <strong className="text-ink">כפתור נגישות סגלגל</strong> (עם סמל אדם עם מוגבלות)
            הפותח תפריט התאמות אישיות:
          </p>
          <ul className="list-disc pr-6 text-muted space-y-2 mb-4">
            <li><strong className="text-ink">גודל טקסט</strong> — הגדלת גודל הכתב עד 140%</li>
            <li><strong className="text-ink">ניגודיות גבוהה</strong> — שחור על לבן ללא צבע רקע</li>
            <li><strong className="text-ink">ניגודיות הפוכה</strong> — טקסט לבן על רקע כהה</li>
            <li><strong className="text-ink">גווני אפור</strong> — הסרת כל הצבעים באתר</li>
            <li><strong className="text-ink">הדגשת קישורים</strong> — סימון בולט של כל הקישורים בדף</li>
            <li><strong className="text-ink">סמן גדול</strong> — הגדלת סמן העכבר לנוחות בעלי מוגבלות מוטורית</li>
            <li><strong className="text-ink">עצור אנימציות</strong> — הפסקה מלאה של תנועות ואנימציות</li>
          </ul>
          <p className="text-muted text-sm">
            ההגדרות שלך נשמרות באחסון המקומי של הדפדפן (localStorage) ויישארו בתוקף עד שתאפס אותן ידנית.
            אין שיתוף מידע כלשהו עם השרת בהקשר לנגישות.
          </p>
        </section>

        {/* Non-accessible parts */}
        <section>
          <h2 className="text-2xl font-bold text-ink mt-8 mb-4">רכיבים שאינם נגישים</h2>
          <p className="text-muted">
            למיטב ידיעתנו נכון לתאריך הצהרה זו, כל דפי האתר, הרכיבים והמידע הם נגישים בהתאם לתקן.
            במקרה שנתקלת ברכיב שאינו נגיש — נשמח שתדווח לנו כדי לתקן בהקדם.
          </p>
        </section>

        {/* Contact */}
        <section className="bg-surface border border-line rounded-[2px] p-6 md:p-8">
          <h2 className="text-2xl font-bold text-ink mt-0 mb-4">רכז/ת נגישות</h2>
          <p className="text-muted mb-4">
            לפניות בנושאי נגישות באתר או לדיווח על תקלת נגישות, ניתן ליצור קשר עם רכז הנגישות של העסק:
          </p>
          <dl className="space-y-3 text-muted">
            <div>
              <dt className="text-sm font-semibold text-ink">שם</dt>
              <dd>{owner}</dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink">טלפון</dt>
              <dd>
                <a href={telHref(phone)} className="text-ink font-semibold underline decoration-brass underline-offset-4">
                  <span className="ltr-num">{formatIsraeliPhone(phone)}</span>
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-semibold text-ink">אימייל</dt>
              <dd>
                <a href={`mailto:${email}?subject=נגישות%20אתר%20-%20${businessName}`} className="text-ink font-semibold underline decoration-brass underline-offset-4 ltr-num">
                  {email}
                </a>
              </dd>
            </div>
          </dl>
          <p className="mt-6 text-sm text-muted">
            נשתדל להשיב לפניות נגישות תוך יום עסקים. אם דחוף — בבקשה חייג ישירות.
          </p>
        </section>

        {/* Standard reference */}
        <section>
          <h2 className="text-2xl font-bold text-ink mt-8 mb-4">תקנים ואחריות</h2>
          <p className="text-muted">
            הנגשת האתר בוצעה בהתאם ל<strong className="text-ink">תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013</strong>,
            ובהתאם ל<strong className="text-ink">תקן ישראלי 5568</strong> — הנחיות לנגישות תוכן אתרי אינטרנט ברמה AA.
            הנגשת האתר מתבצעת באופן שוטף ומתעדכנת בהתאם לתיקונים ולשיפורים באתר.
          </p>
        </section>

        <p className="text-sm text-muted pt-6 border-t border-line">
          הצהרה זו עודכנה לאחרונה בתאריך <span className="ltr-num text-ink font-medium">{lastUpdated}</span>.
        </p>
      </div>
    </Section>
  );
}
