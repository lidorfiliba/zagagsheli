# TODO.md

Every remaining item that requires owner input, external accounts, or ongoing content work.

## 🔴 Blocking for production launch

- **Set real secrets in `.env`** (never commit to git)
  - `AUTH_SECRET` — generate with `openssl rand -base64 32`
  - `ADMIN_PASSWORD` — change from the default `Admin1234!` before deploying
  - `LEADS_API_KEY` — generate with `openssl rand -hex 32`
- **Configure SMTP for lead email notifications** — set `SMTP_HOST/PORT/USER/PASSWORD/FROM` in `.env`. Without this, new leads are only logged server-side (they still land in the admin inbox).
- **Register the Meta Pixel and GA4 accounts** — paste IDs into `/admin/settings` → "מעקב ופרסום". `/thank-you` is the conversion target — configure that in Meta Events Manager.

## 🟡 High-value follow-ups

- **Photos owner needs to upload** via `/admin/gallery`:
  - `אמבטיונים` — no photos exist yet
  - `עבודות מיוחדות` — no photos exist yet
- **Alt text review** — every seeded image got a generic default like "מקלחון זכוכית בהתאמה אישית". Editing these to describe the specific work ("מקלחון פינתי פרזול שחור זכוכית 8 מ״מ") boosts Google Image ranking. `/admin/gallery` surfaces the field prominently.
- **Owner headshot** — the seeded About page references `/uploads/brand/86df875e6bce425dbba64f73f080387c.webp`. Confirm that's really the owner in `/admin/about`; if not, upload a better photo (e.g. via `/admin/gallery` with a custom stem, then paste path into About).
- **Testimonials consent** — 4 real reviews were auto-scraped from pro.co.il and published. If owner prefers only some or wants long-form testimonials, edit at `/admin/testimonials`. Each row links back to `pro.co.il` for provenance.
- **37 uncategorized images** in `public/images/raw/uncategorized/` — orphans from the old site that Elementor never referenced. Open `public/images/raw/_review.html` (via `npm run contact-sheet`), hand-move the good ones into category folders under `raw/`, then re-run `npm run optimize && npm run db:seed` OR just upload them via `/admin/gallery`.

## 🟢 Nice-to-have

- **Rich-text WYSIWYG editor** for the About page. Currently uses markdown textarea + live preview. Tiptap or Lexical would land in v2.
- **Drag-reorder for gallery items** — currently the admin uses a numeric "order" field. HTML5 drag-and-drop OR mobile long-press-then-drag would improve UX.
- **Bulk actions for leads** — bulk status change and bulk delete on desktop tables.
- **Additional WordPress redirects** — `next.config.ts` covers the obvious patterns but a full audit of `zagagsheli.co.il` server logs or the WP sitemap would surface long-tail URLs to preserve.
- **Owner training video/doc** — a 3-minute Loom for the owner showing how to add photos and reply to leads from his phone.
- **Google Business Profile alignment** — after launch, update GBP with the new website URL and ensure NAP (name/address/phone) matches this site exactly.
- **Automated Lighthouse in CI** — GitHub Action running `lhci` on every PR against a preview deploy.

## Ran manually / verify

- **Lighthouse audit** — not run during build (headless Chrome not available in this environment). Run against a Railway/Vercel preview:
  ```
  npx lhci autorun --collect.url=https://<preview-url>/
  ```
  Target: 95+ across all four categories on mobile with throttling. Priorities to check first:
  - LCP under 2.0s — hero image is `priority` + `fetchPriority="high"`, should hit
  - CLS — every `<Image>` sets `fill` inside an aspect-ratio container; should be zero
  - Total blocking time — server components mean minimal client JS
- **Screenshot check** — I did not visually screenshot mobile + desktop in this environment. Owner should:
  1. `npm run dev`
  2. Open `http://localhost:3000/` on phone (via LAN IP printed by Next.js)
  3. Test hero, gallery lightbox, contact form, WhatsApp button in one full pass
- **Actual form submission** — send yourself a test lead from `/` to verify the whole path: submit → server action → DB write → redirect to `/thank-you` → new-lead badge in `/admin/leads`.

## Deferred (log for future)

- **S3 / Cloudinary migration path** — `lib/storage.ts` is the single file to swap. Return the same `{ path, blurData, width, height }` shape.
- **Multi-admin support** — schema already has `role` column on `User`. Adding an `/admin/users` screen and role-based route gates is a v2 project.
- **HEIC upload path validation** — modern iPhones upload `.heic`, and sharp handles it in newer builds. If HEIC uploads fail on the deployed environment, install libheif or convert client-side first.
