import { Section } from '~/components/public/Section';
import { SectionHeader } from '~/components/public/SectionHeader';

const STEPS: Array<{ n: string; title: string; body: string }> = [
  { n: '01', title: 'מדידה בבית', body: 'תיאום מראש. מגיעים אליך למדידה מדויקת של החלל, בלי עלות ובלי התחייבות.' },
  { n: '02', title: 'הצעת מחיר', body: 'תוך יום עסקים תקבל הצעת מחיר מסודרת עם כל האופציות — סוג פרזול, עובי זכוכית, גימור.' },
  { n: '03', title: 'ייצור במפעל', body: 'המפעל שלנו — לא קבלני משנה. אנחנו חותכים, מחסמים ומרכיבים את כל הפרויקט תחת קורת גג אחת.' },
  { n: '04', title: 'התקנה מדויקת', body: 'הצוות שלנו מגיע ומתקין לפי המידה, עם ניקוי אחרי סיום. אחריות מלאה על העבודה.' },
];

export function HowItWorks() {
  return (
    <Section id="how" variant="surface">
      <SectionHeader eyebrow="איך עובדים" title="ארבעה שלבים מהמדידה עד ההתקנה" as="h2" />

      <ol className="relative grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
        {STEPS.map((s, i) => (
          <li key={s.n} className="relative">
            <div className="tnum text-brass text-sm font-bold tracking-wider">{s.n}</div>
            <h3 className="mt-3 text-lg md:text-xl font-bold text-ink">{s.title}</h3>
            <p className="mt-3 text-muted text-sm md:text-base leading-relaxed">{s.body}</p>

            {/* Connector line to next step — only between items, only desktop */}
            {i < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className="hidden md:block absolute top-2 h-px bg-line"
                style={{ insetInlineStart: 'calc(100% - 8px)', insetInlineEnd: 'auto', width: 'calc(3rem + 16px)' }}
              />
            )}
          </li>
        ))}
      </ol>
    </Section>
  );
}
