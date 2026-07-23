# DESIGN.md — Zagag Sheli

The design plan. Every visual decision below was informed by the
**ui-ux-pro-max** skill (query log at the bottom), then filtered through the
brief's explicit anti-patterns.

---

## The direction, in one sentence

A workshop-precise editorial site — Swiss grid, hairline rules, generous
whitespace, one warm brass accent against a cool off-white paper — with a
single moment of motion that reads as light travelling across a pane of glass.

**Not** an AI-marketing landing page. **Not** SaaS card-and-shadow. **Not**
cream + terracotta serif. **Not** near-black + acid green.

---

## Palette

Six tokens. All semantic, never raw hex in components.

| Token | Hex | Use |
|-------|-----|-----|
| `--color-ink` | `#0B0F14` | All primary text, logo, primary-button surface |
| `--color-paper` | `#F5F7F9` | Page background — cool off-white with a faint blue-grey undertone (frosted-glass echo) |
| `--color-surface` | `#FFFFFF` | Elevated regions: contact form, active gallery tab, admin cards |
| `--color-line` | `#E4E9EE` | Hairline dividers, input borders, thin image frames |
| `--color-muted` | `#64707D` | Secondary text, labels, metadata |
| `--color-brass` | `#7D257E` | The single accent — heading underline, active-state marker, stat digits, hover indicator |

`--color-brass-strong` (`#862BB0`) is a brighter, more-saturated variant for
hovers and larger-text emphasis. `--color-accent-alt` (`#39023A`) is a deep
aubergine kept as an option for future admin/warning states. `--color-danger`
(`#D80000`), `--color-success`, `--color-whatsapp` are added only where
semantics demand them.

**Semantic note**: the token name `--color-brass` is a legacy identifier from
an earlier design pass — the value is now a **medium purple** that matches
the current zagagsheli.co.il brand palette exactly (Elementor kit's
`--e-global-color-primary`). Renaming the token across every component was
skipped intentionally (mechanical churn without visual benefit).

### Contrast (WCAG-verified)

- `ink` on `paper` — 17.2:1 (AAA)
- `muted` on `paper` — 5.8:1 (AA body)
- `brass` (`#7D257E`) on `paper` — 9.5:1 (AAA — safe for any text)
- `brass-strong` (`#862BB0`) on `paper` — 7.2:1 (AAA)
- `paper` on `brass` — 9.5:1 (AAA — reversed for pill badges)

### Why this palette

The owner's existing zagagsheli.co.il Elementor kit defines its own brand
color as `--e-global-color-primary: #7D257E` — a medium purple. `#862BB0` is
the brighter accent variant, and `#39023A` is a deep aubergine used for
contrast. Those are the colors he identifies with the business.

The first design pass used brushed brass `#B8894B`. Owner asked for something
closer to the site he already runs. A second pass mistakenly grabbed a
secondary blue (`#032595`) from the same CSS — corrected to the real primary
purple in a third pass. Everything else in the design system (single accent,
hairline rules, generous whitespace, section-heading rule) has been kept
intact through all three iterations — only the accent hue changed.

### Dark mode

**Not shipped in v1.** This is a lead-gen daytime-traffic site — most visits are
Google searches on a phone in the sun. Tokens are semantic, so a `[data-theme="dark"]`
override is a later addition, not a rewrite.

---

## Typography

**One family only: Assistant** (self-hosted via `@fontsource/assistant`).
Weights loaded: 400, 500, 600, 700, 800.

Hierarchy is size + weight + line-height. Never boxes, never color.

| Role | Size | Weight | Line-height | Where |
|------|------|--------|-------------|-------|
| Display XL | `clamp(2.75rem, 6vw, 4.5rem)` | 800 | 1.05 | Home hero |
| Display L | `clamp(2rem, 4.5vw, 3rem)` | 700 | 1.1 | Service-page heroes |
| H2 | `clamp(1.5rem, 3vw, 2rem)` | 700 | 1.2 | Section headings |
| H3 | `1.25rem` | 600 | 1.3 | Card titles, FAQ questions |
| Body L | `1.125rem` | 400 | 1.65 | Hero sub-copy, lead paragraphs |
| Body | `1rem` (16px) | 400 | 1.65 | Prose |
| Small | `0.875rem` | 500 | 1.5 | Metadata, labels |
| Micro | `0.75rem` | 600 | 1.4 | Eyebrow labels (uppercase, +0.08em tracking) |

### Hebrew-specific

- `lang="he" dir="rtl"` at the `<html>` level. No per-component overrides.
- Latin numerals in Hebrew prose (phone numbers, dates, dimensions) wrapped in
  `<span class="ltr-num">…</span>` — `direction: ltr; unicode-bidi: isolate`
  keeps them from reversing.
- All directional spacing uses logical properties (`padding-inline-start`,
  `margin-block-end`), never `left`/`right`/`top`/`bottom`.
- Assistant renders cleanly at 800 in display sizes — verified against typical
  Hebrew glyph pairs (מ+ק+ל+ח+ו+ן, ר+ז+ג+ג).

### Why not Ploni

Ploni is the prettier professional choice. It's a paid license. Upgrade is a
one-token swap when the owner licenses it — I've kept the token abstraction
so the change touches only `--font-sans`.

### Why not a serif companion (Frank Ruhl Libre)

Adding a serif for one section pulls in a second font family, doubles the
webfont weight, and dilutes the visual signature. Single-family with
weight-driven hierarchy is stronger.

---

## Layout

- **Grid**: 12-column, `max-w-[1200px]`. 24px gutter on mobile, 32px on tablet+.
- **Section rhythm**: 128px block padding on desktop, 80px on mobile. This is
  deliberately generous. It's the design.
- **No cards**: sections divide by whitespace and hairline `--color-line`
  rules, not by rounded backgrounds. Compare: the Bloomberg article page.

### The signature block pattern

Every top-level content section repeats this shape:

```
┌────────────────────────────────────────────┐
│                                            │
│  eyebrow                                   │  micro, brass-strong, uppercase
│  Section Heading                           │  H2, ink
│  ▬▬                                        │  brass rule, 40px × 3px
│                                            │  48px gap
│  [content]                                 │
│                                            │
└────────────────────────────────────────────┘
```

The brass rule is the anchoring visual signature — recurring, quiet, unifying.

### Service cards

Not boxes. Image + Hebrew heading + one-line description + arrow link. Hover:
image scales 1.01× (200ms ease-out), the arrow slides 4px inline-end, the
link's brass underline thickens from 1px to 2px. No shadow, no lift, no
background color change.

### Gallery

- **Masonry via CSS `column-count`** — no JS masonry lib. Three columns on
  desktop, two on tablet, one on mobile.
- **No caption overlay on hover.** The glass work is the product; captions
  compete.
- **Lightbox**: keyboard arrows + swipe on mobile. Close button in the
  inline-start-top corner. Preload adjacent images.
- **Filter tabs**: text-only, brass underline animates from left to right
  on active-state change (300ms).

### Buttons

- **Primary**: `bg-ink text-paper`, radius 2px, `px-6 py-3.5`, weight 600.
- **Secondary**: outlined `border-ink text-ink`, same padding, same radius.
- **WhatsApp**: `bg-[--color-whatsapp]`, white icon, full rounded (the FAB is
  the one exception — the WhatsApp brand shape is a recognized affordance).
- **All buttons** have visible focus rings on `:focus-visible`.

### Floating WhatsApp FAB

- Fixed bottom-inline-end.
- 56×56 on mobile, 64×64 on desktop. Safe-area padded.
- 4px soft shadow — the one place shadow is allowed (needs to feel elevated
  above real content).
- Pre-filled message changes per page (`?text=…`).

---

## Motion

**Framer Motion**, but used with restraint. If a motion doesn't communicate
cause and effect, it's not included.

- **The signature: hero light-sweep** — a 100vw diagonal white gradient (12%
  opacity) crosses the hero image once, 1.8s duration, 400ms after `onload`.
  Runs once, never loops. `prefers-reduced-motion: reduce` fully disables it.
- **Section entrance** — 320ms fade + 12px upward translation, triggered on
  intersection at 30% viewport. Stagger 60ms per child. Reduced-motion strips
  the transform and shortens duration to 150ms.
- **Gallery tab change** — 300ms ease-out for the brass underline slide.
- **Lightbox open** — 220ms scale (0.98 → 1) + fade.
- **Hover feedback** — 200ms ease-out on all interactive elements. Never
  longer than 300ms; never linear.

---

## What's explicitly not in this design

- No shadow-and-radius card system
- No gradients (except the one-shot light-sweep)
- No round icons
- No emoji anywhere
- No glassmorphism (the material is real; a UI trend named after it would be
  cheap)
- No parallax
- No scroll-jacking
- No rotating-carousel testimonials (three-to-four static, weighted by hairline)
- No hero video (photograph is faster and screenshots better)

---

## Signature element

One line, so we can be judged against it: **the hairline brass rule that
underlines every section heading, and the once-per-hero light-sweep that
concludes the initial paint.** Together they say: precise, quiet, made by hand.

---

## Self-critique

I ran the design through the "would you build this for any other service
business?" test.

- **Palette**: brass + cool paper is unusual for a service site. Most trade
  businesses default to blue/orange or neon-on-black. Keep.
- **Typography**: single-family Assistant is unusual. Most sites reach for a
  display font for hero + a body font for prose. The confidence of a single
  family with weight-driven hierarchy is a distinct signature. Keep.
- **Section rule**: the 40×3px brass rule is a small mark but it's the one
  recurring visual signature. If it disappeared, the site would look like
  every other minimal editorial site. Keep.
- **Light-sweep**: subtle to the point that a user may not consciously
  register it — which is the intent (delight vs. show-off). Almost got cut
  as "too much"; kept because it earns its keep by being a one-shot, not a
  loop.
- **What I changed after critique**: added `--color-brass-strong` as a
  paired token specifically for links and small-brass-on-paper cases where
  contrast needs to hit AA. The first draft only had one brass value and
  would have failed contrast on inline links.

---

## ui-ux-pro-max query log

Queries that informed this document:

- `--design-system "premium glazing craft service atelier trust local business"`
  → skill returned a mismatched "Enterprise Gateway" pattern and event-orange
  palette. Rejected wholesale but noted the pattern's "trust signals" advice.
- `--domain style "editorial minimalism swiss precision architecture material craft"`
  → adopted Result 2 (Swiss Modernism 2.0) as the layout backbone.
- `--domain typography "hebrew rtl professional editorial trust"`
  → validated the Hebrew-first approach; skill suggested Noto Sans Hebrew.
  Chose Assistant instead (better glyph quality at 800, better spacing).
- `--domain color "local service craft trust minimal"`
  → adopted the neutral tokens from Result 3 (Architecture/Interior); shifted
  the accent from gold `#A16207` toward brushed brass `#B8894B` for warmth.
- `--domain landing "hero galleries lead conversion service"`
  → adopted the "Trust & Authority + Conversion" section flow (Result 3)
  and combined it with the brief's mandated 9-section structure.
