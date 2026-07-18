# Vidyarthi Mitra — "Counsel" Design System
### The homepage design language, extracted and codified (Phase 2)

The homepage is the gold standard for the whole product. This document is the
complete audit of its design language and the contract every other page must
follow. Nothing here is aspirational — every value below is already live on
`/` and defined in `src/styles/tokens.css`, `src/styles/typography.css`,
`src/styles/globals.css` and `tailwind.config.js`.

---

## 1 · Typography

**Families** (loaded in `index.html`, mapped in `tailwind.config.js`):

| Role | Stack | Usage |
|---|---|---|
| `font-sans` | Plus Jakarta Sans → Noto Sans Devanagari → Inter | Everything by default |
| `font-serif` | Playfair Display → Noto Serif Devanagari | Marketing display headings only (hero H1, centered section titles) |

**Scale** — modular 1.25 ratio on a 16px base. Use the classes, never ad-hoc `text-*` stacks:

| Class | Size / line | Weight | Where the homepage uses it |
|---|---|---|---|
| `.text-display` / `.text-display-serif` | 32/40 → 48/56 md | 800 / serif 700 | Hero H1 (one per page, max) |
| `.text-h1` | 26/34 → 32/40 md | 700, tracking −0.015em | Page titles (listing pages) |
| `.text-h2` | 20/28 → 24/32 md | 700, tracking −0.01em | Section headings ("Featured Partner Universities") |
| `.text-h3` | 18/28 | 600 | Card groups, modal titles, sidebar headers |
| `.text-card-title` | 16/24 | 600 | Card titles everywhere |
| `.text-body` | 16/26 | 400 | Reading content |
| `.text-support` | 14/22 | 400, muted | Metadata, helper text, card sublines |
| `.text-eyebrow` | 12/16 | 600, uppercase, tracking 0.06em | Eyebrow labels above headings |
| `.text-label` | 14/20 | 500 | Form labels (sentence case, never uppercase) |
| `.text-caption` | 12/18 | 400, muted | 12px is the absolute floor |
| `.text-stat` / `.text-stat-sm` | 28/34 · 18/24 | 700, `tabular-nums` | Stat tiles, KPI numbers |
| `.text-data` | inherit | 600, `tabular-nums` | Data values in cards/tables |

Rules the homepage obeys, so every page must:
- Max **three type levels per viewport**.
- **Tabular figures on all data** (fees, packages, ranks, counts).
- Buttons are **never uppercase**; eyebrows are the only uppercase text.
- Long-form prose capped at `max-w-prose` (70ch).

## 2 · Color

One brand orange, rationed. Amber is the commerce channel. Slate/ink is structure.
All values come from `styles/tokens.css` — **no raw hex in components.**

| Token | Value | Role |
|---|---|---|
| `primary` (brand-500) | `#F97316` | THE action color: primary buttons, active states, accents |
| `primary-dark` / `primary-hover` (brand-600) | `#EA580C` | Hover/pressed states |
| `primary-light` (brand-400) | `#FB923C` | Graphic accents only — never text on white |
| `primary-surface` (brand-50) | `#FFF7ED` | Very light orange — background highlights, soft CTA panels |
| `primary-tint` (brand-100) | `#FFEDD5` | Light orange — card headers. Pair with **ink headings**, never orange text |
| `primary-border` (brand-200) | `#FED7AA` | Light orange borders/dividers on tinted surfaces |
| `link` / `primary-text` (brand-700) | `#C2410C` | The only orange allowed as small text on white (≥4.5:1) |
| `accent` (amber-500) | `#F59E0B` | Commerce channel: Sponsored, tiers, rating stars. **Never CTAs** |
| `ink` 900/800/700 | `#0F172A / #1E293B / #334155` | Headings and dark statement panels |

**Card-header recipe** (Admission Updates, Latest News, Feedback, Stay Ahead,
Need Help Choosing…): `bg-primary-100`/`bg-primary-50` surface + `border-primary-200`
+ bold ink heading + slate-600 support text + one orange CTA. Dark-orange panels
with white or dark text are retired — headings must be the focal point.
| Neutrals | slate 50–500 ramp | Surfaces `#F8FAFC`, borders `#E2E8F0`, muted text `#64748B` (minimum on white) |
| Semantic | success `#10B981` · warning `#F59E0B` · error `#EF4444` · info `#3B82F6` | Each with `-text` and `-tint` pairs for badges |
| Dark theme | page `#020817`, card `#0F172A`, border `#1E293B` | Class-based (`.dark`), full parity required |

Budget: orange ≈ 5% of any viewport. If a section feels orange, it's wrong.

## 3 · Spacing

4px base grid. The homepage rhythm:

- **Page container**: `max-w-content` (1280px) + `px-4 md:px-6` → use `<Container>`.
- **Section spacing**: `py-12` for content sections, `py-16` for marketing sections; section heading margin `mb-8` (`SectionHeading`) or `mb-12` (centered marketing headings).
- **Card grids**: `gap-6` (24px). Compact rails: `gap-4`. Mosaic tiles: `gap-3`.
- **Card padding**: `p-6` default, `p-8` featured/marketing, `p-4`/`p-5` compact.
- **Form fields**: vertical `space-y-4`/`gap-5`; label→control gap 6px (`space-y-1.5`).
- **Sidebar stack**: `space-y-6`.
- Never invent margins — every gap is one of 12 / 16 / 24 / 32 / 48 / 64px.

## 4 · Shape, elevation & motion

| Token | Value | Role |
|---|---|---|
| `rounded-btn` | 10px | Buttons, inputs, small controls |
| `rounded-xl` | 12px | Inner tiles, logo boxes |
| `rounded-card` / `rounded-2xl` | 16px | Cards, modals, panels — the homepage card radius |
| `rounded-full` | pill | Badges, chips, slide dots |
| `shadow-card` | 0 1 3 / 8% | Resting cards |
| `shadow-card-hover` | 0 10 30 −10 / 15% | Hover elevation (with `-translate-y-0.5` or `whileHover={{ y: -4..6 }}`) |
| `shadow-modal` | 0 24 60 −12 / 30% | Overlays only |

The only three shadows. Motion: state changes 150ms, movement/elevation 250ms,
overlays 400ms, ease `cubic-bezier(0.4,0,0.2,1)`. Cards lift on hover
(translate + shadow) — they never scale, glow or flip. Sections stagger in with
`containerVariants`/`itemVariants` (opacity + y:20, stagger 0.08).
`prefers-reduced-motion` collapses everything to instant fades (global).

## 5 · Components (one family, used everywhere)

- **Buttons** → `ui/Button`: primary / secondary / outline / ghost / danger.
  Heights 32/40/48, `rounded-btn`, semibold, hover **darkens** (never scales
  or glows), press `active:scale-[0.98]`, loading locks width with a spinner,
  disabled 50% + pointer-events-none. One primary per view region.
- **Inputs** → `ui/Input`, `Textarea`, `Select`, plus `Checkbox`, `Radio`,
  `Switch`, `RangeSlider`, `FilterChip`, `Rating` (Phase 2 additions).
  Height 44px (`h-11`), `rounded-btn`, border `light-border`, focus =
  2px primary ring, error = error border + message below. Labels via `text-label`.
- **Cards** → `ui/Card` surface + card family in `components/cards/*`
  (University, Course, News, Scholarship, Review, Stat, Sponsored).
  Fixed anatomy: identity → decision data (tabular) → actions. Sponsored badge
  top-left (amber), save top-right. Whole card clickable, inner actions are
  separate stops.
- **Section headers** → `SectionHeading` (accent bar + `text-h2` + optional
  action link) or `CenteredHeading` (orange eyebrow + serif title) for
  marketing sections. Both come from the homepage.
- **Modals** → `ui/Modal`: 16px radius, `shadow-modal`, `bg-black/60 backdrop-blur`
  overlay, focus trap, ESC/overlay close, scroll lock.
- **Badges** → `ui/Badge` semantic variants. Amber = sponsored only.
- **Empty / error / loading** → `EmptyState`, `ErrorState`, `Skeleton`
  (neutral shimmer). Every async view has all three states.

## 6 · Visual hierarchy (how the homepage guides attention)

1. **First**: one display heading + one primary search action (hero).
2. **Second**: decision data — stat strip, card grids with tabular figures.
3. **Actions**: exactly one orange primary CTA per region; secondary actions
   are ink/outline; tertiary are ghost/text links with chevrons.
4. **De-emphasis**: metadata in `text-support`/`text-caption` muted slate.
5. **Commerce isolation**: sponsored content is amber-marked and labelled
   ("Sponsored", "Ad", "Featured Partner") so editorial trust is preserved.
6. Dark ink panels (`bg-primary-dark`) isolate high-intent CTAs ("Need help
   choosing?", newsletter) from the white editorial flow.

## 7 · Accessibility contract

- Focus visible everywhere: global 2px amber `:focus-visible` outline.
- Touch targets ≥ 40px (icon buttons `w-10 h-10`).
- Text on white ≥ slate-500; orange text on white only `#C2410C`. Headings on
  light-orange surfaces are always ink (`slate-900`) — never orange-on-orange.
- All interactive icons have `aria-label`s; decorative icons `aria-hidden`.
- Dark mode is first-class: every surface/border/text pairs a `dark:` value.
