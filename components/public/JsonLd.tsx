import type { Faq } from '@prisma/client';

/**
 * LocalBusiness JSON-LD — the single most valuable SEO artifact for a local
 * service business. Feeds Google's rich results (name, phone, hours, area).
 */
export function LocalBusinessJsonLd({ settings }: { settings: Record<string, string> }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'GlassManufacturer',
    '@id': 'https://zagagsheli.co.il/#business',
    name: settings['contact.business_name'] || 'הזגג שלי',
    alternateName: 'Zagag Sheli',
    description:
      'זגגות בהתאמה אישית במרכז הארץ — מקלחונים, מעקות זכוכית, מראות, חיפויי זכוכית. מפעל עצמאי, 30 שנות ניסיון.',
    url: 'https://zagagsheli.co.il',
    telephone: settings['contact.mobile_tel'] || '+972503024060',
    email: settings['contact.notify_email'] || undefined,
    founder: { '@type': 'Person', name: settings['contact.owner_name'] || 'ליאור פיליבה' },
    address: { '@type': 'PostalAddress', addressCountry: 'IL', addressRegion: 'מרכז' },
    areaServed: [
      { '@type': 'City', name: 'תל אביב' },
      { '@type': 'City', name: 'רמת גן' },
      { '@type': 'City', name: 'ראשון לציון' },
      { '@type': 'City', name: 'רחובות' },
      { '@type': 'City', name: 'הרצליה' },
      { '@type': 'City', name: 'פתח תקווה' },
      { '@type': 'City', name: 'כפר סבא' },
      { '@type': 'City', name: 'ראש העין' },
    ],
    openingHoursSpecification: buildHours(settings),
    sameAs: [settings['social.facebook'], settings['social.tiktok'], settings['social.reviews']].filter(Boolean),
    priceRange: '₪₪',
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function buildHours(settings: Record<string, string>) {
  const days: Array<[string, string]> = [
    ['sunday', 'Sunday'], ['monday', 'Monday'], ['tuesday', 'Tuesday'],
    ['wednesday', 'Wednesday'], ['thursday', 'Thursday'],
    ['friday', 'Friday'], ['saturday', 'Saturday'],
  ];
  return days
    .map(([k, en]) => {
      const v = settings[`hours.${k}`] || 'closed';
      if (v === 'closed') return null;
      const [open, close] = v.split('-');
      return {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: en,
        opens: open,
        closes: close,
      };
    })
    .filter(Boolean);
}

/**
 * FAQPage schema — enables rich accordion snippets in Google results.
 */
export function FaqJsonLd({ faqs }: { faqs: Faq[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.questionHe,
      acceptedAnswer: { '@type': 'Answer', text: f.answerHe },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/**
 * BreadcrumbList — used on service pages.
 */
export function BreadcrumbJsonLd({ trail }: { trail: Array<{ name: string; url: string }> }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
