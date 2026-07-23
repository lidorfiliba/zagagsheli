# DEPLOY.md — Railway + box.co.il

Step-by-step deployment guide for `zagagsheli.co.il` on Railway with the
`.co.il` domain managed at box.co.il.

Estimated time: **~45 minutes** first time (mostly waiting for DNS to
propagate); ~5 minutes for future code updates.

---

## Phase 0 — Pre-flight (do this once, in advance)

Nothing here touches the live site.

### 0.1 Generate real production secrets

Open PowerShell (or any terminal) and run these three commands. Copy the
output of each to a safe place — you'll paste them into Railway later.

```powershell
# AUTH_SECRET — signs your admin session cookies
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# LEADS_API_KEY — protects the read-only leads JSON API
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ADMIN_PASSWORD — pick your own; must be strong (mixed case + digits + symbol)
# Example generator (or write your own):
node -e "console.log(require('crypto').randomBytes(12).toString('base64'))"
```

Never commit these to git. Never send them over WhatsApp/email.

### 0.2 Sign up for the accounts you'll need

- **Railway** — https://railway.app (sign up with GitHub for smoothest flow)
- **GitHub** — you probably have this; if not, https://github.com
- **SMTP provider** — free tier of any works. Options in order of ease:
  - Resend (https://resend.com) — 100 emails/day free, cleanest setup
  - Postmark — 100/month free
  - Gmail app password — free but flaky at volume
  - You need: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`
- **Meta Pixel + GA4** — optional, add later; not blocking launch

### 0.3 Decide the domain layout

Two variants people use. Pick one:

- **Apex only:** `zagagsheli.co.il` (recommended for short & memorable)
- **www variant:** `www.zagagsheli.co.il` (some old visitors type this)

Best practice: pick one as canonical, redirect the other to it.
Recommendation for you: **canonical = `zagagsheli.co.il`**, redirect
`www.` → apex. This matches your current setup on the old WordPress site.

---

## Phase 1 — Push code to GitHub

```bash
cd C:\Users\lidor\zagag-sheli

# Initialize + first commit
git init
git add .
git commit -m "Initial commit: zagag sheli full-stack site + admin"

# Create a PRIVATE repo on github.com/new (name it "zagag-sheli"),
# then link it:
git remote add origin https://github.com/<your-username>/zagag-sheli.git
git branch -M main
git push -u origin main
```

⚠️ **The `.gitignore` is already set up to keep secrets out.** But double-check
before pushing:

```bash
git status | grep -E '\.env|dev\.db'
```

If either shows up, STOP — the .gitignore isn't matching for some reason. Ping
me before pushing.

---

## Phase 2 — Deploy to Railway

### 2.1 Create the project

1. Log in at https://railway.app
2. Click **New Project** → **Deploy from GitHub repo**
3. Grant Railway access to your `zagag-sheli` repo (Railway asks the first time)
4. Select the repo → Railway auto-detects Next.js and starts the first build

The first build will **fail** — expected. It fails because there's no
`DATABASE_URL` yet and no persistent volume. Fix that in the next steps.

### 2.2 Pick the region

1. Click your service → **Settings** tab → **Region**
2. Select **EU-West (Amsterdam)** — closest to Israeli users (~50ms latency)

### 2.3 Add a persistent volume

**This is the most important step. Without it, all uploads and the database
disappear on every redeploy.**

1. In your service → **Settings** → **Volumes** → **New Volume**
2. Mount path: `/app/public/uploads`
3. Size: 1 GB is plenty for years of growth (photos are ~200KB each optimized)
4. Save

The volume persists across restarts and redeploys. Uploaded photos go there
directly. On first mount, the boot script (`scripts/prepare-runtime.mjs`)
copies the initial seed images from `public/_seed/uploads/` in the repo — so
the site launches with all the scraped work already visible.

For the database, we use a **second** small volume (or a subpath of the same
volume system — Railway supports both):

1. Add another volume → mount path `/app/persistence`
2. Size: 100 MB (SQLite DB is tiny)

### 2.4 Set environment variables

Service → **Variables** tab → paste all of these (replace `<...>` with your
real values from Phase 0.1):

```
NODE_ENV=production
DATABASE_URL=file:./persistence/prod.db
AUTH_SECRET=<paste your generated AUTH_SECRET>
AUTH_URL=https://<your-domain-goes-here>
AUTH_TRUST_HOST=true
ADMIN_EMAIL=admin@zagagsheli.co.il
ADMIN_PASSWORD=<paste your generated ADMIN_PASSWORD>
ADMIN_NAME=Lior Filiba
LEADS_API_KEY=<paste your generated LEADS_API_KEY>
LEAD_NOTIFY_EMAIL=lior@zagagsheli.co.il

# SMTP — fill these once you've picked a provider
SMTP_HOST=<from provider>
SMTP_PORT=587
SMTP_USER=<from provider>
SMTP_PASSWORD=<from provider>
SMTP_FROM=הזגג שלי <no-reply@zagagsheli.co.il>

# Optional analytics — leave empty for now; add from /admin/settings later
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_GA4_ID=
```

Notes:
- `AUTH_URL` should be the Railway URL for now (something like
  `https://zagag-sheli-production.up.railway.app`). Change it to
  `https://zagagsheli.co.il` after the DNS switch in Phase 5.
- `DATABASE_URL=file:./persistence/prod.db` puts the DB inside the mounted
  volume. **Do not change this path** — if you change it after seeding, your
  data is stranded.

### 2.5 Configure build + start commands

Service → **Settings** → **Deploy** section:

- **Build Command:** `npm run build`
- **Start Command:** `npm run start`  *(this is the default — no need to override)*

The `npm run start` script does everything in order:
1. `prepare-runtime.mjs` — ensures dirs exist, seeds uploads if volume is empty
2. `prisma migrate deploy` — applies any new schema migrations
3. `npm run db:seed` — populates DB on first deploy (idempotent — safe to re-run)
4. `next start` — starts the Next.js server

All four steps are idempotent, so redeploying causes no data loss.

### 2.6 Redeploy

Trigger a redeploy: **Deployments** tab → **⋮** on the latest → **Redeploy**.

Watch the deploy logs — you should see:
```
✔ Generated Prisma Client
Applying migration `20260723130120_init`
Your database is now in sync
▸ Seeding database…
  admin user: admin@zagagsheli.co.il
  ...
▸ Ready
```

If it fails, take a screenshot of the last ~30 log lines and send them to me.

### 2.7 Get your temporary Railway URL

Service → **Settings** → **Networking** → **Generate Domain**

Railway gives you something like `zagag-sheli-production.up.railway.app`.
Copy it — this is your temporary URL for testing before DNS switchover.

---

## Phase 3 — Test on the Railway URL

**Do everything real users would do, on your phone.**

1. Visit `https://<your-railway-url>/` — homepage should load, hero shows a
   shower photo, all 6 service cards have photos
2. `/admin/login` → sign in with `ADMIN_EMAIL` + `ADMIN_PASSWORD`
3. From your phone: `/admin/gallery` → upload a real photo from camera roll →
   check it appears on `/gallery` and on the relevant service page
4. From an incognito window: submit a lead via the homepage contact form →
   verify it appears in `/admin/leads` AND that you receive the email
5. Change your mobile number in `/admin/settings` → visit `/` on the phone →
   confirm the header shows the updated number

**Only proceed to Phase 4 if everything on this list works.** DNS switchover
is annoying to reverse.

---

## Phase 4 — Custom domain: Railway side

1. Service → **Settings** → **Networking** → **Custom Domain**
2. Add `zagagsheli.co.il` → Railway shows DNS records you need to add. There
   will be **two rows**, typically:
   - For the apex: an `A` record (or CNAME with target `xxx.up.railway.app`
     if Railway supports "CNAME flattening" — they do at time of writing)
   - Optionally, a second row for `www.zagagsheli.co.il`
3. **Do NOT click "Verify" yet** — you haven't added the DNS records at
   box.co.il. Leave this tab open. Copy the exact record values.

Also add `www.zagagsheli.co.il` → Railway → **Redirect to apex**. This
consolidates SEO to one canonical URL.

---

## Phase 5 — Custom domain: box.co.il side

⚠️ **Point of no return.** The moment you save DNS changes, browsers start
switching to the new site over the next ~24 hours (usually much faster —
often minutes to an hour, but plan for a full day for straggler ISPs).

### 5.1 Sign in and find DNS management

1. Log in at https://box.co.il
2. Find `zagagsheli.co.il` in your domain list
3. Look for "עריכת רשומות DNS" / "ניהול DNS" / "DNS Management" /
   "עריכת רשומות שם" — the exact label varies

If you can't find it or the option is missing, box.co.il may still require
DNS changes via a support ticket for `.co.il` domains. If so:
- Open a support ticket with box.co.il
- Attach the exact Railway record values from Phase 4
- Ask them to update the records for `zagagsheli.co.il`
- Turnaround is usually same-day during business hours

### 5.2 Add the records Railway gave you

Add exactly what Railway showed in Phase 4. Typically:

- **Type:** A (or CNAME/ALIAS if apex CNAME is supported)
  **Name/Host:** `@` (means the apex, `zagagsheli.co.il`)
  **Value:** the Railway target (`xxx.xxx.xxx.xxx` IP or `xxx.up.railway.app`)
  **TTL:** 3600 (or the default; smaller = faster propagation but more DNS queries)

- **Type:** CNAME
  **Name:** `www`
  **Value:** `xxx.up.railway.app` (from Railway)
  **TTL:** 3600

**Important:** if box.co.il has existing records for `@` or `www` pointing at
the old WordPress host, **delete those first** — otherwise you'll have
conflicting records.

Save the changes.

### 5.3 Wait, then verify propagation

Check with a free tool:

- https://www.whatsmydns.net/#A/zagagsheli.co.il
- Should show the new Railway IP in most locations within 30 minutes to a few hours

Once you see the new records in Israel + US locations, go back to Railway
(Phase 4 tab) → click **Verify Domain**. Railway will provision a Let's
Encrypt HTTPS certificate automatically. Takes 1-2 minutes.

### 5.4 Update `AUTH_URL`

In Railway → **Variables** → change:

```
AUTH_URL=https://zagagsheli.co.il
```

Redeploy. Admin login now works from the real domain.

---

## Phase 6 — Post-launch (do all of this)

### 6.1 Test one more time

From your phone, on cellular (not Wi-Fi — you want to verify DNS from outside
your home network):
- `https://zagagsheli.co.il/` loads
- Padlock shows (HTTPS working)
- `/admin/login` works
- Submit a test lead — verify email arrives

### 6.2 Google Search Console

1. https://search.google.com/search-console — sign in with the Google account
   that owns the business
2. **Add property** → `https://zagagsheli.co.il`
3. Verify ownership (fastest: DNS TXT record via box.co.il — Google walks you
   through it)
4. Once verified: **Sitemaps** → submit `https://zagagsheli.co.il/sitemap.xml`
5. **URL Inspection** → paste the homepage URL → click **Request Indexing**
6. Repeat step 5 for the 6 service pages and `/gallery`

Google usually picks up the 301 redirects from the old WordPress URLs within
1-2 weeks. Your accumulated rankings should transfer.

### 6.3 Update Google Business Profile

If you manage a Google Business Profile for the business (the panel that
shows up on the right when someone searches "הזגג שלי"):

1. Log in at https://business.google.com
2. Edit the website field → `https://zagagsheli.co.il`
3. Save

### 6.4 Meta / Facebook Pixel

If you want to run Facebook ads:
1. https://business.facebook.com → Events Manager
2. Create Pixel → copy the ID
3. In `/admin/settings` → paste under **Meta Pixel ID** → Save
4. Add a **Custom Conversion** in Events Manager pointing at
   `https://zagagsheli.co.il/thank-you` — this becomes your "lead generated" event

### 6.5 Google Analytics 4

Same idea:
1. https://analytics.google.com → create GA4 property → copy Measurement ID
   (looks like `G-XXXXXXXXXX`)
2. `/admin/settings` → paste under **Google Analytics 4 ID** → Save
3. Configure `/thank-you` as a conversion event in GA4

---

## Phase 7 — Backups (set up in the first week)

The database file `prisma/prod.db` on the Railway volume is your entire
business data. If it disappears, so does everything the owner has entered.

### Simple weekly backup via Railway Cron

1. In Railway → **New** → **Cron Job** (separate service in the same project)
2. Command: `sqlite3 /app/data/prisma/prod.db ".backup /app/data/prisma/backup-$(date +\%Y-\%m-\%d).db"`
3. Schedule: `0 3 * * 0` (every Sunday at 03:00)

This keeps the last few backups on the volume. Manually download one via
Railway shell every month or so and keep it on OneDrive as an off-site copy.

### Better: automated off-site backup to Backblaze B2

Backblaze B2 costs ~$0.005/GB/month (a full backup of your DB + uploads is
under 1 GB; monthly cost = negligible). Ping me when you want to set this up
and I'll write the cron script.

---

## Phase 8 — Ongoing updates

Any time I make code changes for you:

1. I push new commits to the GitHub repo
2. Railway detects the push and auto-deploys within ~2 minutes
3. Zero downtime — Railway builds the new version, then swaps traffic

No manual deploy step. You don't have to do anything except approve any
change I ask you to review.

---

## Troubleshooting

### Deploy log shows `EACCES` or `permission denied` for `./data/`

The volume isn't mounted or is mounted at the wrong path. Recheck Phase 2.3 —
the mount path must be exactly `/app/data`.

### Site loads but images 404

`DATABASE_URL` isn't pointing inside the volume. The DB got created outside
the volume and the seed inserted rows referencing `/uploads/...` paths that
don't exist. Fix: verify `DATABASE_URL=file:./persistence/prod.db` in
Variables, delete the current data volume, redeploy.

### Uploads succeed but disappear after next deploy

Same root cause — volume not mounted or wrong path.

### `AUTH_URL` mismatch warning in logs

You changed the domain but didn't update `AUTH_URL`. Set it to your final
public URL (including `https://`) and redeploy.

### Search Console shows old WordPress URLs as errors

Normal for the first week. Google is re-crawling. As long as our 301
redirects are working (test with `curl -I https://zagagsheli.co.il/examples`
— should return `301` → `/gallery`), the rankings transfer automatically.

### box.co.il says they can't add A records for the apex

Some Israeli registrars restrict this for `.co.il`. Two workarounds:
1. Ask box.co.il to add an ALIAS/ANAME record instead (same effect as
   apex CNAME)
2. Use Cloudflare as a DNS-only proxy (free) — change nameservers at
   box.co.il to Cloudflare's, then manage all DNS at Cloudflare (which
   supports apex CNAME "flattening"). This is what most Israeli
   agencies do.

---

## Quick reference

| Thing | Where |
|-------|-------|
| Live site | https://zagagsheli.co.il |
| Admin login | https://zagagsheli.co.il/admin/login |
| Railway dashboard | https://railway.app |
| box.co.il control panel | https://box.co.il |
| Google Search Console | https://search.google.com/search-console |
| Meta Events Manager | https://business.facebook.com |
| GA4 | https://analytics.google.com |
| Backups | Railway volume (weekly cron) |
| DB backups off-site | (TODO — see Phase 7) |
