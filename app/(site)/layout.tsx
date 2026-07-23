import { Header } from '~/components/public/Header';
import { Footer } from '~/components/public/Footer';
import { FloatingWhatsApp } from '~/components/public/FloatingWhatsApp';
import { getSettings } from '~/lib/settings';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const business = settings['contact.business_name'] || 'הזגג שלי';
  const mobile = settings['contact.mobile'] || '';
  const waE164 = settings['contact.whatsapp_e164'] || '';
  const waMessage = settings['whatsapp.template.default'] || 'היי, הגעתי מהאתר';

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:inset-inline-start-2 focus:z-50 focus:bg-ink focus:text-paper focus:px-4 focus:py-2 focus:rounded"
      >
        דלג לתוכן הראשי
      </a>
      <Header businessName={business} mobilePhone={mobile} />
      <main id="main">{children}</main>
      <Footer settings={settings} />
      <FloatingWhatsApp phoneE164={waE164} message={waMessage} />
    </>
  );
}
