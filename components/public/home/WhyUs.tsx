import { Section } from '~/components/public/Section';
import { SectionHeader } from '~/components/public/SectionHeader';

const POINTS: Array<{ stat: string; unit: string; text: string }> = [
  { stat: '30', unit: '+ שנים', text: 'ניסיון בתחום — מהמדידה הראשונה עד ההתקנה המורכבת ביותר' },
  { stat: '100', unit: '%', text: 'ייצור במפעל שלנו במרכז — לא מקבלנים חיצוניים' },
  { stat: 'IS 938', unit: '', text: 'תקן ישראלי לזכוכית מחוסמת — כל פרויקט' },
  { stat: '24', unit: 'שעות', text: 'זמן תגובה לתיקוני חירום של זכוכית שבורה' },
];

export function WhyUs() {
  return (
    <Section id="why-us">
      <SectionHeader eyebrow="למה אנחנו" title="עבודה שרואים ומרגישים" as="h2" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
        {POINTS.map((p, i) => (
          <div key={i} className="flex flex-col">
            <div className="flex items-baseline gap-1">
              <span className="tnum text-5xl md:text-6xl font-extrabold text-brass leading-none">{p.stat}</span>
              {p.unit && <span className="text-lg md:text-xl font-semibold text-ink">{p.unit}</span>}
            </div>
            <p className="mt-4 text-muted text-sm md:text-base leading-relaxed">{p.text}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
