import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://zagagsheli.co.il'),
  title: {
    default: 'הזגג שלי — זגג במרכז הארץ, מקלחונים ומעקות זכוכית בהתאמה אישית',
    template: '%s | הזגג שלי',
  },
  description:
    'הזגג שלי — ליאור פיליבה. זגגות בהתאמה אישית במרכז הארץ. מקלחונים, מעקות זכוכית, מראות, חיפויי זכוכית. 30 שנות ניסיון, מפעל עצמאי, אחריות מלאה.',
  applicationName: 'הזגג שלי',
  authors: [{ name: 'ליאור פיליבה' }],
  keywords: [
    'זגג', 'זגגות', 'מקלחונים בהתאמה אישית', 'מעקות זכוכית',
    'מראות', 'תיקון זכוכית', 'חיפויי זכוכית', 'זגג במרכז',
    'זגג ראשון לציון', 'זגג רחובות', 'זגג ראש העין',
  ],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'he_IL',
    url: 'https://zagagsheli.co.il',
    siteName: 'הזגג שלי',
  },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = {
  themeColor: '#0B0F14',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
