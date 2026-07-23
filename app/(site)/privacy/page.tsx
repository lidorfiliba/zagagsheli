import type { Metadata } from 'next';
import { getSettings } from '~/lib/settings';
import { Section } from '~/components/public/Section';
import { SectionHeader } from '~/components/public/SectionHeader';

export const metadata: Metadata = {
  title: 'מדיניות פרטיות — הזגג שלי',
  description: 'מדיניות פרטיות של אתר הזגג שלי — איזה מידע נאסף, כיצד הוא נשמר, ואיך אפשר לפנות אלינו.',
  alternates: { canonical: '/privacy' },
};

export default async function PrivacyPage() {
  const settings = await getSettings();
  const email = settings['contact.notify_email'] || 'lior@zagagsheli.co.il';
  const business = settings['contact.business_name'] || 'הזגג שלי';

  return (
    <Section id="privacy">
      <SectionHeader eyebrow="פרטיות" title="מדיניות פרטיות" as="h1" />
      <div className="max-w-3xl space-y-6 text-ink leading-relaxed">
        <p>
          אתר "{business}" מכבד את פרטיות המשתמשים בו. מסמך זה מפרט איזה מידע נאסף,
          למה, וכיצד ניתן לפנות בעניין.
        </p>

        <h2 className="text-2xl font-bold text-ink mt-8 mb-3">מידע שנאסף</h2>
        <ul className="list-disc pr-6 text-muted space-y-2">
          <li>שם וטלפון שהוזנו על ידך בטופס יצירת קשר.</li>
          <li>שדות נוספים שבחרת למלא (עיר, אימייל, הודעה).</li>
          <li>נתונים טכניים בסיסיים (סוג דפדפן, כתובת IP) לצורכי הגנה על האתר מול פעילות זדונית ותצפית סטטיסטית.</li>
        </ul>

        <h2 className="text-2xl font-bold text-ink mt-8 mb-3">שימוש במידע</h2>
        <p className="text-muted">
          המידע נשמר במאגר פנימי של העסק ומשמש אך ורק לחזרה אליך בעניין הפנייה,
          למתן הצעת מחיר או שירות. אין העברה של המידע לצדדים שלישיים ואין שימוש
          מסחרי במידע.
        </p>

        <h2 className="text-2xl font-bold text-ink mt-8 mb-3">Cookies וניטור</h2>
        <p className="text-muted">
          האתר עשוי להשתמש בכלי ניטור (Google Analytics, פיקסל פייסבוק) לצורך
          מדידת יעילות של קמפיינים ושיפור חוויית המשתמש. אלו כלים אנונימיים ואינם
          מזהים אותך אישית. ניתן לחסום ניטור זה דרך הגדרות הדפדפן.
        </p>

        <h2 className="text-2xl font-bold text-ink mt-8 mb-3">זכויותיך</h2>
        <p className="text-muted">
          יש לך זכות לבקש עיון, תיקון או מחיקה של המידע שלך במאגר. לפניות:
          <a href={`mailto:${email}`} className="text-ink font-semibold underline decoration-brass underline-offset-4 ltr-num mr-1">{email}</a>
        </p>

        <p className="mt-8 text-sm text-muted">
          מדיניות זו עודכנה לאחרונה בתאריך {new Date().toLocaleDateString('he-IL')}.
        </p>
      </div>
    </Section>
  );
}
