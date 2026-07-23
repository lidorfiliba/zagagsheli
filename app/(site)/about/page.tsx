import type { Metadata } from 'next';
import Image from 'next/image';
import { marked } from 'marked';
import { prisma } from '~/lib/prisma';
import { getSettings } from '~/lib/settings';
import { Section } from '~/components/public/Section';
import { SectionHeader } from '~/components/public/SectionHeader';

export const metadata: Metadata = {
  title: 'אודות ליאור פיליבה — הזגג שלי',
  description: 'ליאור פיליבה — 30 שנות ניסיון בזגגות, מפעל עצמאי במרכז הארץ. מקלחונים, מעקות זכוכית, מראות בהתאמה אישית.',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const [about, settings] = await Promise.all([
    prisma.aboutPage.findFirst(),
    getSettings(),
  ]);
  const html = about ? marked.parse(about.bodyHe, { async: false }) as string : '';
  const owner = settings['contact.owner_name'] || 'ליאור פיליבה';

  return (
    <Section id="about">
      <SectionHeader eyebrow="אודות" title={owner} as="h1" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
        {about?.ownerPhoto && (
          <div className="lg:col-span-1">
            <div className="relative aspect-[3/4] bg-ink/5 border border-line">
              <Image
                src={about.ownerPhoto}
                alt={owner}
                fill
                sizes="(min-width: 1024px) 340px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          </div>
        )}
        <div className="lg:col-span-2">
          <article
            className="prose-content text-lg leading-relaxed text-ink [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-ink [&_p]:mb-4 [&_p]:text-muted [&_ul]:list-disc [&_ul]:pr-6 [&_ul]:mb-4 [&_ul]:text-muted [&_li]:mb-1 [&_strong]:text-ink [&_strong]:font-semibold"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </Section>
  );
}
