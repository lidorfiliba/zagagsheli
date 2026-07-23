# DECISIONS.md

Autonomous choices made without explicit user approval, per the v2 brief's
"make the most defensible decision, note it, continue" mandate.

Format: one line per decision. `**decision** — reasoning.`

---

## Framework & runtime

- **Next.js 16.x (App Router) with React 19** — v2 brief says "Next.js 15+". Sister project (Shani Swisa) is already on 16; keeping stack alignment across the owner's projects reduces context-switching cost.
- **Tailwind CSS v4 with CSS-first `@theme` tokens** — no `tailwind.config.js`. Matches sister project and the current recommended v4 usage. Font `@import`s go before `@import "tailwindcss"` (v4 parser is strict about order).
- **Prisma v7 with `prisma.config.ts` and `@prisma/adapter-better-sqlite3`** — v7 removed `url` from `schema.prisma`. Config file is now the single source of truth for connection + adapter.
- **NextAuth v5 (Auth.js)** — the App Router-native auth path. `next-auth@beta` is the stable v5 line at time of writing.
- **Zod v3** — v4 removed `errorMap`. Sticking with v3 for API stability; migration is a small mechanical change if needed later.
- **React Hook Form + `@hookform/resolvers/zod`** — same schema is imported client-side (validation) and server-side (Zod parse). No duplication.

## Content model

- **Six explicit `Category` rows seeded from the brief** — using `slug` as the stable public URL segment (`showers`, `railings`, `mirrors`, `cladding`, `bath-screens`, `custom`). `nameHe` is the display label. The admin cannot rename slugs (breaks SEO); it can rename `nameHe`.
- **`GalleryItem` stores both `imagePath` (WebP) and `imageAvif`** — precomputed at optimize time. `next/image` handles further responsive variants on request.
- **`blurData` is a base64 data-URI, not a blurhash string** — data-URI works with `next/image`'s `placeholder="blur"` + `blurDataURL={...}` out of the box, no client decode.
- **`Lead.status` enum stored as string** — Prisma has no native enum on SQLite. Enum discipline enforced at the Zod boundary.
- **`SiteSetting` is a flat key/value store** — dot-namespaced keys (`contact.mobile`, `hours.sunday`, `whatsapp.template.showers`). Cheaper to add a setting than to migrate a wide table row every time.
- **`AboutPage` is a singleton table** — one row created by seed, admin edits that row. Simpler than a full CMS block model.

## Design (see DESIGN.md for the full argument)

- **Brass `#B8894B` as the sole accent color** — owner-approved earlier in-session. Warm hardware-echo against a cool off-white, avoids the AI-cliché purple/blue and the terracotta-cream pattern the v2 brief explicitly rejects.
- **Assistant is the only font family** — self-hosted via `@fontsource/assistant`. Owner-approved. Ploni would be prettier but is paid; upgrade is a one-token swap if the owner later licenses it.
- **Signature moment: one-shot diagonal light-sweep on hero** — owner-approved. Framer Motion `motion.div` with a diagonal gradient and one keyframe, honors `prefers-reduced-motion`.
- **Masonry gallery via CSS `column-count`** — owner-approved. Not a JS lib; cheaper, works with SSR, no CLS.
- **Radius zero on primary buttons (except WhatsApp FAB, which is a circle)** — matches the editorial-precision direction. Rounded pill buttons would push the design toward "generic SaaS marketing".

## Admin panel

- **Rich text editor for About page: server-rendered markdown via `marked`, no client WYSIWYG in v1** — a TipTap WYSIWYG editor adds ~90KB gzipped for one page. Markdown textarea + live preview is enough for owner's use case (short "about us" copy, updated rarely). Real WYSIWYG in `TODO.md` if requested.
- **Leads inbox pagination server-side, 25/page** — mobile-first admin cannot afford to load 500 leads client-side.
- **CSV export streams from the server, not from a client-side lib** — keeps the admin bundle lean and works with large lead volumes.
- **JSON leads API secured by `x-api-key` header, keyed off `LEADS_API_KEY` env var** — simplest external-integration primitive. If the owner needs OAuth later, wrap the same endpoint.
- **Bulk actions (status change, delete) on desktop only** — inspired by mobile-first HIG: bulk actions on a phone are dangerous with fat fingers. Desktop table view keeps them.
- **Gallery drag-reorder uses HTML5 native drag-and-drop, not a JS lib** — good enough on desktop; on mobile a long-press-then-drag UX with `pointerdown`/`pointermove` handlers.
- **Image upload MIME check is magic-byte via `file-type`, not the `Content-Type` header** — browsers can (and do) lie in headers.

## SEO & Hebrew URLs

- **Route slugs are English (`/showers`, `/mirrors`) — Hebrew page names shown only in `<h1>` and meta** — a Hebrew URL like `/מקלחונים` triggers URL-encoding, mixed link-sharing behavior, and edge-case bugs across social platforms. English slugs preserve accumulated crawl efficiency and are just as ranked when the on-page content is Hebrew.
- **301 redirects from every legacy WP URL live in `next.config.ts`, not middleware** — Next.js compiles them into the routing table at build time (faster) and they respond before any React runs.

## Deployment

- **Default target: Railway or a VPS (Hetzner / Contabo class)** — SQLite requires a persistent filesystem, ruled out by Vercel serverless. README documents the Postgres switch as a one-file change if the owner outgrows single-server hosting.
- **Uploads go to `/public/uploads` on disk, behind a `storage.ts` abstraction** — S3 / Cloudinary swap is a one-file change. Kept simple for launch.
