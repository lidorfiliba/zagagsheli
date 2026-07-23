// prisma/seed.ts
// Idempotent seed — safe to re-run.
// Populates: admin user, categories, gallery items (from optimize manifest),
// services, FAQ, testimonials (placeholders if pro.co.il inaccessible), about
// page, site settings.
//
// Run: npm run db:seed  (calls `tsx prisma/seed.ts`)

import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const IMAGES_MANIFEST = join(__dirname, 'seed-images.json');

// Category folder in the scraped raw/ → public slug + Hebrew name
const CATEGORY_MAP: Array<{ rawKey: string; slug: string; nameHe: string; order: number }> = [
  { rawKey: 'shower',   slug: 'showers',      nameHe: 'מקלחונים',         order: 1 },
  { rawKey: 'railings', slug: 'railings',     nameHe: 'מעקות זכוכית',     order: 2 },
  { rawKey: 'mirrors',  slug: 'mirrors',      nameHe: 'מראות',            order: 3 },
  { rawKey: 'cladding', slug: 'cladding',     nameHe: 'חיפויי זכוכית',    order: 4 },
  { rawKey: 'bath',     slug: 'bath-screens', nameHe: 'אמבטיונים',        order: 5 },
  { rawKey: 'custom',   slug: 'custom',       nameHe: 'עבודות מיוחדות',   order: 6 },
];

const SERVICES: Array<{
  slug: string;
  titleHe: string;
  shortDescHe: string;
  longDescHe: string;
  seoTitle: string;
  seoDesc: string;
  order: number;
}> = [
  {
    slug: 'showers',
    titleHe: 'מקלחונים בהתאמה אישית',
    shortDescHe: 'מקלחונים לפי מידה — פרזול שחור, ניקל וסטנדרטי, זכוכית 6 או 8 מ״מ.',
    longDescHe:
      'כל מקלחון מיוצר במפעל שלנו לפי מידה מדויקת של החדר, עם פרזול איכותי בשלושה קווים — שחור מודרני, ניקל קלאסי או סטנדרטי. הזכוכית: 6 מ״מ לחדרים סטנדרטיים, 8 מ״מ לחדרי אמבט גדולים ולהתקנות פינתיות. מדידה עצמאית של המפעל, ייצור בפיקוח, התקנה מדויקת. עמידה בתקן ישראלי לזכוכית מחוסמת.',
    seoTitle: 'מקלחונים בהתאמה אישית — הזגג שלי',
    seoDesc: 'מקלחונים לפי מידה במרכז הארץ. פרזול שחור/ניקל/סטנדרטי, זכוכית 6 ו-8 מ״מ. מדידה עצמאית, ייצור במפעל, אחריות מלאה.',
    order: 1,
  },
  {
    slug: 'railings',
    titleHe: 'מעקות זכוכית',
    shortDescHe: 'מעקות זכוכית למרפסות, מדרגות ופרויקטים אדריכליים.',
    longDescHe:
      'מעקות זכוכית מחוסמת ולוחות זכוכית שקופה או פרוסטד. מותאמים לדרישות בטיחות בישראל, מותקנים על פרזול נירוסטה או אלומיניום. פתרון פרימיום למרפסות עם נוף, מדרגות פנימיות ואיזורי בריכה. מדידה חינם, אישור סטטי לפי הצורך.',
    seoTitle: 'מעקות זכוכית — הזגג שלי',
    seoDesc: 'מעקות זכוכית מחוסמת למרפסות, מדרגות ופרויקטים אדריכליים. עמידה בתקן, מדידה חינם, התקנה מדויקת.',
    order: 2,
  },
  {
    slug: 'mirrors',
    titleHe: 'מראות בהתאמה אישית',
    shortDescHe: 'מראות אמבטיה, סלון וכניסה — כל צורה, כל מסגרת, כל גמר.',
    longDescHe:
      'מראות מיוצרות לפי מידה עם או בלי מסגרת, פאזטים, תאורת LED משולבת, וציפוי אנטי-אדים לחדר אמבט. גדלים מדפי-קיר ועד קיר-שלם. מתקינים בכל חלל של הבית — כניסה, סלון, חדרי הלבשה.',
    seoTitle: 'מראות בהתאמה אישית — הזגג שלי',
    seoDesc: 'מראות זכוכית בהתאמה אישית לאמבטיה, סלון וכניסה. פאזט, LED, אנטי-אדים. במרכז הארץ.',
    order: 3,
  },
  {
    slug: 'cladding',
    titleHe: 'חיפויי זכוכית',
    shortDescHe: 'חיפויי מטבח, קירות ואמבט — צבע, מראה או שקוף.',
    longDescHe:
      'חיפוי זכוכית מודפסת או צבועה למטבח (מאחורי הכיריים), לחדר אמבט, ולקירות מבטא. עמידה בטמפרטורות גבוהות, ניקוי קל, אין דבק-מלט. אפשר להדפיס טקסטורה, דוגמה או תמונה. מגוון גימורים: מבריק, מט, פרוסטד.',
    seoTitle: 'חיפויי זכוכית למטבח ולאמבט — הזגג שלי',
    seoDesc: 'חיפויי זכוכית למטבח, אמבט וקירות מבטא. הדפסה על זכוכית, גימור מט/מבריק, התקנה במרכז הארץ.',
    order: 4,
  },
  {
    slug: 'bath-screens',
    titleHe: 'אמבטיונים',
    shortDescHe: 'דלתות זכוכית לאמבטיה שהופכות אמבטיה סטנדרטית למקלחון.',
    longDescHe:
      'אמבטיונים בהתאמה אישית — פתרון חסכוני שהופך אמבטיה קיימת גם למקלחון. זכוכית מחוסמת 6 מ״מ, פרזול נירוסטה, פתיחה מתקפלת או הזזה. התקנה תוך יום אחד.',
    seoTitle: 'אמבטיונים בהתאמה אישית — הזגג שלי',
    seoDesc: 'אמבטיונים בהתאמה אישית — זכוכית מחוסמת, פתיחה מתקפלת או הזזה, התקנה תוך יום. במרכז הארץ.',
    order: 5,
  },
  {
    slug: 'custom',
    titleHe: 'עבודות מיוחדות ותיקוני זכוכית',
    shortDescHe: 'ויטרינות, שולחנות, מדפים, ותיקוני זכוכית שבורה — מגיעים תוך 24 שעות.',
    longDescHe:
      'כל מה שלא נכנס לקטגוריה — ויטרינות לחנויות, מדפי זכוכית, זכוכית לרהיטים, קירוי משקוף, שולחנות זכוכית. וגם: תיקוני חלונות שבורים, החלפת דלתות מקלחון פגומות, שיפוץ פרזול. שירות דחוף לתיקונים תוך 24 שעות.',
    seoTitle: 'עבודות זכוכית מיוחדות ותיקונים — הזגג שלי',
    seoDesc: 'ויטרינות, שולחנות, מדפי זכוכית ותיקוני חירום של זכוכית שבורה. שירות תוך 24 שעות במרכז הארץ.',
    order: 6,
  },
];

const FAQS: Array<{ questionHe: string; answerHe: string; order: number; serviceSlug?: string }> = [
  {
    questionHe: 'כמה זמן לוקח לייצר ולהתקין מקלחון בהתאמה אישית?',
    answerHe: 'כשבועיים מרגע המדידה ועד ההתקנה. במקרים דחופים אפשר להאיץ ל-10 ימי עסקים. ההתקנה עצמה אורכת חצי יום עד יום עבודה אחד.',
    order: 1, serviceSlug: 'showers',
  },
  {
    questionHe: 'מה ההבדל בין זכוכית 6 מ״מ לזכוכית 8 מ״מ במקלחון?',
    answerHe: 'זכוכית 6 מ״מ מתאימה לרוב חדרי האמבט הסטנדרטיים. 8 מ״מ מומלצת לחדרים גדולים, למקלחונים פינתיים ללא פרופיל מלא, ולפתחים רחבים במיוחד — היא נוקשה יותר, פחות רוטטת, ומרגישה יוקרתית יותר.',
    order: 2, serviceSlug: 'showers',
  },
  { questionHe: 'האם יש אחריות על העבודה?',
    answerHe: 'כן — אחריות מלאה של שנתיים על הפרזול והתקנה, ואחריות יצרן על הזכוכית עצמה. במקרה של בעיה — מגיעים לתיקון ללא עלות בתקופת האחריות.',
    order: 3 },
  { questionHe: 'האם המדידה בבית הלקוח בחינם?',
    answerHe: 'כן, המדידה חינם וללא התחייבות. מגיעים בתיאום מראש, מודדים במקצועיות ומוציאים הצעת מחיר מסודרת תוך יום עסקים.',
    order: 4 },
  { questionHe: 'כמה עולה מעקה זכוכית למרפסת?',
    answerHe: 'המחיר תלוי באורך המעקה, בסוג הפרזול (נירוסטה או אלומיניום) ובעובי הזכוכית. אחרי מדידה נשלח הצעת מחיר מדויקת. לרוב מעקות למרפסת קטנה מתחילים באזור אלף שקלים למטר רץ; פרויקטים גדולים יורדים במחיר למטר.',
    order: 5, serviceSlug: 'railings' },
  { questionHe: 'האם עובדים עם קבלנים ופרויקטים גדולים?',
    answerHe: 'בהחלט. עובדים באופן שוטף עם קבלני שיפוצים, אדריכלים, ומעצבי פנים. יש לנו ניסיון בפרויקטים של בניינים שלמים ומגדלי מגורים. הצעות מחיר לפרויקטים גדולים ניתן להוציא לפי תוכנית אדריכלית לפני מדידה.',
    order: 6 },
  { questionHe: 'כמה זמן לוקח לתקן זכוכית שבורה?',
    answerHe: 'לתיקוני חירום (חלון שבור, דלת מקלחון פגומה) מגיעים תוך 24 שעות, לרוב באותו יום. החלפה מלאה של זכוכית מיוצרת לפי מידה — בין 3 ל-7 ימים תלוי בסוג הזכוכית ובזמינות במפעל.',
    order: 7, serviceSlug: 'custom' },
  { questionHe: 'האם הזכוכית עומדת בתקן הישראלי?',
    answerHe: 'כן. אנחנו עובדים אך ורק עם זכוכית מחוסמת שעומדת בתקן ישראלי 938 ובתקנים בינלאומיים מקבילים. לכל פרויקט ניתן לקבל אישור תקן ותעודת אחריות של יצרן הזכוכית.',
    order: 8 },
];

// Scraped from https://www.pro.co.il/glazier/business-id-14381 during Phase 0.
// All 5-star; TODO for owner: confirm public display consent and/or replace
// with longer reviews as they come in.
const TESTIMONIAL_PLACEHOLDERS: Array<{ name: string; city?: string; textHe: string; rating: number; sourceUrl?: string }> = [
  {
    name: 'דורון',
    city: 'פתח תקווה',
    textHe: 'ליאור מקצוען!! גבה מחיר הוגן. מומלץ בחום.',
    rating: 5,
    sourceUrl: 'https://www.pro.co.il/glazier/business-id-14381',
  },
  {
    name: 'רן',
    city: 'כפר סבא',
    textHe: 'אחלה ליאור, עשה עבודה טובה בזמנים ובעלות שקבענו.',
    rating: 5,
    sourceUrl: 'https://www.pro.co.il/glazier/business-id-14381',
  },
  {
    name: 'יגאל מירון',
    city: 'כפר סבא',
    textHe: 'מוצר איכותי ביותר.',
    rating: 5,
    sourceUrl: 'https://www.pro.co.il/glazier/business-id-14381',
  },
  {
    name: 'רינת',
    city: 'פתח תקווה',
    textHe: 'היה שירות טוב ומקצועי.',
    rating: 5,
    sourceUrl: 'https://www.pro.co.il/glazier/business-id-14381',
  },
];

const SITE_SETTINGS: Array<[string, string]> = [
  // Homepage hero — every string here is admin-editable via /admin/settings
  ['content.hero.eyebrow', '30 שנות ניסיון · מרכז הארץ'],
  ['content.hero.title_line1', 'זכוכית בהתאמה אישית —'],
  ['content.hero.title_line2', 'מקלחונים, מעקות ומראות.'],
  ['content.hero.subtitle', 'מפעל עצמאי, מדידה חינם, אחריות מלאה. עבודה עם קבלנים, אדריכלים ולקוחות פרטיים במרכז הארץ.'],
  ['content.hero.cta_primary', 'שיחה עכשיו'],
  ['content.hero.cta_secondary', 'שלח וואטסאפ'],

  // Contact — read by every page's header/footer/form
  ['contact.business_name', 'הזגג שלי'],
  ['contact.owner_name', 'ליאור פיליבה'],
  ['contact.mobile', '050-3024060'],
  ['contact.mobile_tel', '+972503024060'],
  ['contact.office', '077-4123186'],
  ['contact.office_tel', '+9720774123186'],
  ['contact.whatsapp_e164', '972503024060'],
  ['contact.notify_email', process.env.LEAD_NOTIFY_EMAIL || 'lior@zagagsheli.co.il'],
  ['contact.service_area', 'מרכז הארץ'],

  // Hours (day → "07:00-18:00" | "closed")
  ['hours.sunday', '07:00-18:00'],
  ['hours.monday', '07:00-18:00'],
  ['hours.tuesday', '07:00-18:00'],
  ['hours.wednesday', '07:00-18:00'],
  ['hours.thursday', '07:00-18:00'],
  ['hours.friday', '07:00-13:30'],
  ['hours.saturday', 'closed'],

  // WhatsApp templates per page — {{name}} is replaced client-side if a name is known
  ['whatsapp.template.default', 'היי, הגעתי מהאתר ומעוניין בהצעת מחיר'],
  ['whatsapp.template.showers', 'היי, הגעתי מהאתר ומעוניין בהצעת מחיר למקלחון'],
  ['whatsapp.template.railings', 'היי, הגעתי מהאתר ומעוניין בהצעת מחיר למעקה זכוכית'],
  ['whatsapp.template.mirrors', 'היי, הגעתי מהאתר ומעוניין בהצעת מחיר למראה'],
  ['whatsapp.template.cladding', 'היי, הגעתי מהאתר ומעוניין בהצעת מחיר לחיפוי זכוכית'],
  ['whatsapp.template.bath-screens', 'היי, הגעתי מהאתר ומעוניין בהצעת מחיר לאמבטיון'],
  ['whatsapp.template.custom', 'היי, הגעתי מהאתר ומעוניין בהצעת מחיר לעבודת זכוכית מיוחדת'],

  // Social
  ['social.facebook', 'https://www.facebook.com/profile.php?id=100049104323575'],
  ['social.tiktok', 'https://www.tiktok.com/@liorfiliba55'],
  ['social.reviews', 'https://www.pro.co.il/glazier/business-id-14381'],

  // Analytics — empty by default; admin fills in from admin settings screen
  ['analytics.meta_pixel_id', process.env.NEXT_PUBLIC_META_PIXEL_ID || ''],
  ['analytics.ga4_id', process.env.NEXT_PUBLIC_GA4_ID || ''],

  // Meta / SEO defaults
  ['meta.default_og_image', '/uploads/brand/logo_old_full_compresed.png'],
];

const ABOUT_MD = `## על ליאור פיליבה

אני ליאור פיליבה, מנכ״ל של "הזגג שלי". למעלה מ-30 שנה אני עובד בזכוכית — התחלתי כשוליה, פתחתי מפעל, ולאורך השנים הפכתי אותו לאחד המובילים במרכז הארץ בזכוכית בהתאמה אישית.

## המפעל

המפעל שלנו מצויד בציוד מתקדם לחיתוך, חיסום ועיבוד זכוכית. כל העבודה — מהמדידה ועד ההתקנה — נעשית תחת גג אחד, מה שמאפשר לנו לשמור על איכות עקבית ולעמוד בלוחות זמנים.

## עם מי אנחנו עובדים

- **לקוחות פרטיים** — מקלחונים, מעקות ומראות בהתאמה לבית
- **קבלנים ומעצבי פנים** — פרויקטים מלאים ופתרונות מותאמים
- **אדריכלים** — התייעצות בשלב התכנון, ייצור לפי מפרט
- **מוסדות ועסקים** — ויטרינות, קירות זכוכית וחיפויים בטיחותיים

## למה בוחרים בנו

עמידה בזמנים, אחריות מלאה על כל עבודה, שירות אישי מהמדידה הראשונה ועד ההתקנה, וזכוכית שעומדת בכל התקנים הישראליים והבינלאומיים.
`;

// ────────────────────────────────────────────────────────────
// Main
// ────────────────────────────────────────────────────────────

async function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || 'admin@zagagsheli.co.il').toLowerCase();
  const password = process.env.ADMIN_PASSWORD || 'Admin1234!';
  const name = process.env.ADMIN_NAME || 'Lior Filiba';

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { passwordHash, name, role: 'admin' },
    create: { email, passwordHash, name, role: 'admin' },
  });
  console.log(`  admin user: ${email}`);
}

async function seedCategories() {
  for (const c of CATEGORY_MAP) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { nameHe: c.nameHe, order: c.order },
      create: { slug: c.slug, nameHe: c.nameHe, order: c.order },
    });
  }
  console.log(`  categories: ${CATEGORY_MAP.length}`);
}

async function seedServices() {
  for (const s of SERVICES) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {
        titleHe: s.titleHe, shortDescHe: s.shortDescHe, longDescHe: s.longDescHe,
        seoTitle: s.seoTitle, seoDesc: s.seoDesc, order: s.order,
      },
      create: {
        slug: s.slug, titleHe: s.titleHe, shortDescHe: s.shortDescHe,
        longDescHe: s.longDescHe, seoTitle: s.seoTitle, seoDesc: s.seoDesc,
        order: s.order,
      },
    });
  }
  console.log(`  services: ${SERVICES.length}`);
}

async function seedFaqs() {
  // Delete existing FAQs then re-insert — order matters and updates are easier
  await prisma.faq.deleteMany({});
  for (const f of FAQS) {
    await prisma.faq.create({
      data: { questionHe: f.questionHe, answerHe: f.answerHe, order: f.order, serviceSlug: f.serviceSlug },
    });
  }
  console.log(`  faqs: ${FAQS.length}`);
}

async function seedTestimonials() {
  const existing = await prisma.testimonial.count();
  if (existing === 0) {
    for (let i = 0; i < TESTIMONIAL_PLACEHOLDERS.length; i++) {
      const t = TESTIMONIAL_PLACEHOLDERS[i];
      await prisma.testimonial.create({
        data: {
          name: t.name, city: t.city, textHe: t.textHe, rating: t.rating,
          sourceUrl: t.sourceUrl, order: i + 1, published: true,
        },
      });
    }
    console.log(`  testimonials: ${TESTIMONIAL_PLACEHOLDERS.length} (scraped from pro.co.il)`);
  } else {
    console.log(`  testimonials: ${existing} already seeded — leaving alone`);
  }
}

async function seedAbout() {
  const existing = await prisma.aboutPage.findFirst();
  if (existing) {
    console.log('  about: already exists, leaving alone');
    return;
  }
  await prisma.aboutPage.create({
    data: { bodyHe: ABOUT_MD, ownerPhoto: '/uploads/brand/86df875e6bce425dbba64f73f080387c.webp' },
  });
  console.log('  about: created');
}

async function seedSettings() {
  for (const [key, value] of SITE_SETTINGS) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  console.log(`  settings: ${SITE_SETTINGS.length}`);
}

async function seedGallery() {
  let manifest: Array<{
    category: string; stem: string; imagePath: string; blurData: string;
    width: number; height: number; altHe: string;
  }>;
  try {
    manifest = JSON.parse(await readFile(IMAGES_MANIFEST, 'utf8'));
  } catch {
    console.log('  gallery: no seed-images.json — run `npm run optimize` first. Skipping.');
    return;
  }

  const categoriesBySlug = new Map(
    (await prisma.category.findMany()).map((c) => [c.slug, c])
  );
  const rawToSlug = new Map(CATEGORY_MAP.map((c) => [c.rawKey, c.slug]));

  // Wipe existing DB-managed images that came from the seed manifest so re-runs
  // don't accumulate duplicates. Admin-uploaded images (order >= 1000 convention)
  // are preserved.
  await prisma.galleryItem.deleteMany({ where: { order: { lt: 1000 } } });

  // Feature up to N images PER category so the home gallery preview is
  // diverse (not all six from whichever category sorts first).
  const FEATURED_PER_CAT = 3;
  const featuredCount: Record<string, number> = {};

  let inserted = 0;
  for (const row of manifest) {
    const slug = rawToSlug.get(row.category);
    if (!slug) continue;
    const category = categoriesBySlug.get(slug);
    if (!category) continue;
    const currentCount = featuredCount[slug] ?? 0;
    const featured = currentCount < FEATURED_PER_CAT;
    if (featured) featuredCount[slug] = currentCount + 1;
    await prisma.galleryItem.create({
      data: {
        categoryId: category.id,
        imagePath: row.imagePath,
        blurData: row.blurData,
        altHe: row.altHe,
        width: row.width,
        height: row.height,
        order: inserted, // 0..N — well below the 1000 admin-managed threshold
        featured,
        published: true,
      },
    });
    inserted++;
  }
  console.log(`  gallery: ${inserted} images from manifest (${Object.values(featuredCount).reduce((a, b) => a + b, 0)} featured)`);
}

async function main() {
  console.log('▸ Seeding database…');
  await seedAdmin();
  await seedCategories();
  await seedServices();
  await seedFaqs();
  await seedTestimonials();
  await seedAbout();
  await seedSettings();
  await seedGallery();
  console.log('✓ Done');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
