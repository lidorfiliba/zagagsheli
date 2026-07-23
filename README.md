# הזגג שלי — Full-stack lead-generation site + admin panel

Production-grade replacement for the legacy WordPress site at
[zagagsheli.co.il](https://zagagsheli.co.il/). Public marketing site (Hebrew, RTL)
plus a mobile-first admin panel the owner uses from his phone on job sites.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind v4 · Prisma v7 +
SQLite (Postgres-portable) · NextAuth v5 · Framer Motion · sharp · Zod +
React Hook Form.

## Quick start

```bash
# 1. Install
npm install

# 2. Copy env template and fill in
cp .env.example .env.local

# 3. Set up the database (creates prisma/dev.db)
npx prisma migrate dev --name init

# 4. Scrape assets from the legacy site + optimize + seed
npm run scrape              # downloads originals to public/images/raw/
npm run recategorize        # improves category classification via alt-text scraping
npm run optimize            # converts to WebP + generates blur placeholders
npm run db:seed             # populates admin user, categories, services, FAQ, testimonials, settings, gallery

# 5. Run
npm run dev
# → open http://localhost:3000
```

## Admin panel

**URL:** `http://localhost:3000/admin/login`

**Default credentials (change in `.env.local` before deploying):**
- Email: `admin@zagagsheli.co.il`
- Password: `Admin1234!`

The admin panel is fully mobile-optimized — the owner manages leads, gallery
photos, and content from a phone. Sidebar collapses to a bottom-nav on
narrow viewports.

Admin sections:
- `/admin` — dashboard (new leads, quick call/WhatsApp)
- `/admin/leads` — full inbox with filters, status changer, notes, CSV export
- `/admin/gallery` — multi-file upload, alt-text editor, featured/publish toggles
- `/admin/services` — service copy + SEO metadata editor
- `/admin/faqs` — FAQ CRUD with per-service scoping
- `/admin/testimonials` — testimonial CRUD with 5-star rating editor
- `/admin/about` — About page markdown editor with live preview
- `/admin/settings` — grouped key/value editor (contact info, hours, WhatsApp templates, pixel IDs)

## External integrations

Set these in `.env.local`:

| Variable | Purpose | Where to get |
|----------|---------|-------------|
| `AUTH_SECRET` | Session signing key | `openssl rand -base64 32` |
| `SMTP_*` | Email notifications for new leads | Any SMTP provider (Postmark, Resend, SES, Gmail app-password) |
| `LEADS_API_KEY` | Read-only JSON API auth | `openssl rand -hex 32` |
| `NEXT_PUBLIC_META_PIXEL_ID` | Meta/Facebook Pixel | Meta Events Manager (also editable from `/admin/settings`) |
| `NEXT_PUBLIC_GA4_ID` | Google Analytics 4 | GA4 → Admin → Data Streams |

The pixel and GA4 IDs are read from `SiteSetting` in the DB — the env vars are
just seed values, so the owner can update them without redeploying.

### Read-only leads API

External automation can pull new leads:

```bash
curl -H "x-api-key: $LEADS_API_KEY" \
     "https://zagagsheli.co.il/api/leads?status=NEW&since=2026-07-01"
```

## Deployment

### Recommended: Railway (or any Node.js VPS)

SQLite requires a persistent filesystem — Vercel serverless functions don't
have one. Railway / Render / a small Hetzner VPS all work.

```bash
# On the server:
git clone <repo> && cd zagag-sheli
npm ci
cp .env.example .env
# Edit .env — set AUTH_SECRET, DATABASE_URL, ADMIN_*, SMTP_*
npx prisma migrate deploy
npm run db:seed     # first deploy only
npm run build
npm run start
```

### Switching to Postgres

If you outgrow single-server hosting, migrate to Postgres in three steps:

1. Change `provider = "sqlite"` → `"postgresql"` in `prisma/schema.prisma`
2. Change `PrismaBetterSqlite3` → `PrismaPg` in `lib/prisma.ts` and `prisma.config.ts`
   (install `@prisma/adapter-pg` and `pg`)
3. Set `DATABASE_URL="postgresql://..."` in `.env`

Then: `npx prisma migrate deploy` on a fresh Postgres DB, followed by
`npm run db:seed` if you're starting empty (or migrate data with a dump script).

### Hosting the uploads directory

`public/uploads/` grows over time as the owner adds gallery photos. On
Railway/Render, this is on the persistent volume. On S3/Cloudinary, replace
`lib/storage.ts` (single-file swap — the return shape stays identical).

## Project layout

```
app/
  (site)/              Public marketing pages (route group — has header/footer/WhatsApp chrome)
    page.tsx           Homepage (9 sections)
    [service]/         Dynamic service landing pages
    gallery/           Full filterable gallery with lightbox
    about, faq, thank-you, accessibility, privacy
  admin/
    layout.tsx         Bare pass-through (no chrome — needed for login)
    login/             Login page
    (shell)/           Admin route group with sidebar/bottom-nav chrome
      page.tsx         Dashboard
      leads/           Leads inbox + detail
      gallery/         Photo manager
      services, faqs, testimonials, about, settings
  api/
    auth/[...nextauth]/  NextAuth handlers
    leads/               Public JSON API (x-api-key)
    admin/leads/export.csv
  actions/               Server actions grouped by domain
    submit-lead.ts       Public form → DB
    admin-leads.ts       Status + notes mutations
    admin-gallery.ts     Upload + edit + delete
    admin-content.ts     Services / FAQ / Testimonials / About / Settings

components/
  public/                Public site components
  admin/                 Admin panel components

lib/
  prisma.ts              Prisma client with better-sqlite3 adapter
  settings.ts            SiteSetting reads (React cache())
  admin-auth.ts          requireAdmin() gate
  storage.ts             Image upload + sharp pipeline (swap this for S3)
  validation.ts          Shared Zod schemas
  rate-limit.ts          In-memory rate limiter
  hebrew.ts              Phone formatting, bidi helpers
  whatsapp.ts            wa.me URL builder
  utils.ts               cn() classname combiner

prisma/
  schema.prisma          Full data model
  seed.ts                Populates DB from scraped manifest + curated content
  seed-images.json       Generated by optimize.mjs

scripts/
  scrape.mjs             Phase 0 crawler
  recategorize.mjs       Category refinement via Elementor filter classes
  contact-sheet.mjs      Local HTML review sheet generator
  optimize.mjs           Sharp pipeline for scraped assets

auth.ts                  Full NextAuth config (Node runtime)
auth.config.ts           Edge-safe base config (imported by middleware)
middleware.ts            Route guard (Edge)
next.config.ts           Redirects (301s from WordPress URLs) + security headers
```

## Design system

See `DESIGN.md` for the full argument. Summary:
- Palette: `--color-ink #0B0F14`, `--color-paper #F5F7F9`, `--color-brass #B8894B` (single accent)
- Font: Assistant only (self-hosted `@fontsource/assistant`), weights 400/500/600/700/800
- Layout: Swiss/editorial 12-column, 128px section rhythm, hairline dividers
- Signature: brass rule under section headings + one-shot diagonal light-sweep on hero

## Related files to read

- `DEPLOY.md` — step-by-step Railway + box.co.il deployment guide
- `SCRAPE-REPORT.md` — what came out of the Phase 0 crawl
- `DESIGN.md` — visual system rationale (with self-critique)
- `DECISIONS.md` — autonomous choices made without owner approval + reasoning
- `TODO.md` — real remaining work (missing photos, blocking secrets, follow-ups)

## Common commands

```bash
npm run dev              # Dev server
npm run build            # Production build (runs prisma generate first)
npm run start            # Production server
npm run db:seed          # Re-seed database (idempotent for admin/categories/services/settings)
npm run db:reset         # DESTRUCTIVE — resets DB + reseeds
npx prisma studio        # Open Prisma Studio to inspect the DB
npm run scrape           # Re-scrape legacy site (only if URLs change)
npm run optimize         # Re-run image pipeline
```
