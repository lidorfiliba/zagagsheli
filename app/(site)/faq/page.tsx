import type { Metadata } from 'next';
import { prisma } from '~/lib/prisma';
import { Section } from '~/components/public/Section';
import { SectionHeader } from '~/components/public/SectionHeader';
import { FaqSection } from '~/components/public/home/FaqSection';
import { FaqJsonLd } from '~/components/public/JsonLd';

export const metadata: Metadata = {
  title: 'שאלות נפוצות — הזגג שלי',
  description: 'שאלות ותשובות על מקלחונים, מעקות זכוכית, מראות, אחריות, מדידה חינם, זמני ייצור ותקנים.',
  alternates: { canonical: '/faq' },
};

export default async function FaqPage() {
  const faqs = await prisma.faq.findMany({ where: { published: true }, orderBy: { order: 'asc' } });
  return (
    <>
      <FaqJsonLd faqs={faqs} />
      <Section id="faq-full">
        <SectionHeader eyebrow="שאלות" title="שאלות נפוצות" as="h1" />
        <FaqSection faqs={faqs} />
      </Section>
    </>
  );
}
