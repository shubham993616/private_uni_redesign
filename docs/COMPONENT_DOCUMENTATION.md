# COMPONENT DOCUMENTATION
## Vidyarthi Mitra — "Counsel" Component Library

API reference for every component in the design system. Layer rules: **tokens → ui primitives → layout/cards/search patterns → sections (modules) → pages**. Dependencies point downward only. A component used twice becomes a documented pattern — never copy-paste.

---

## 1. UI Primitives (`src/components/ui/`)

### Button
`<Button variant size as href loading disabled className>`
- **variant:** `primary` (brand orange — max ONE per view region) · `secondary` (ink) · `outline` · `ghost` · `danger` (alias `destructive`)
- **size:** `sm` 32px · `md` 40px (default) · `lg` 48px (hero CTAs, mobile primary, form submits)
- **loading:** locks width, swaps a spinner, sets `aria-busy`
- **as / href:** render as router `Link` / anchor
- Rules: hover darkens (never scales/glows) · press compresses 0.98 · verb labels · never uppercase · 10px radius.

### Card
`<Card interactive as className>` — white/dark-card surface, 16px radius, 1px border, `shadow-card`; `interactive` adds hover elevation. Static info cards never lift.

### Badge
`<Badge variant>` — `neutral · brand · success · warning · error · info`, all dark-aware pills. Max 2 badges per card at fixed positions (tier/sponsored top-left, save top-right).

### Input / Textarea / Select
`<Input label help error id …/>` — 44px controls, visible labels above, `aria-invalid` + inline error text, focus ring. `Select` accepts `options=[{value,label}]` or children. Single-column forms; 20px between fields; 32px between sections.

### Modal
`<Modal open onClose title size>` — sizes sm 448 / md 672 / lg 896; scrim + blur; ESC/backdrop close; scroll lock; **focus trap + return-focus**; `role=dialog`. Every overlay in the product uses it (incl. confirmations — no `window.confirm` in new code).

### Tabs
`<Tabs tabs=[{id,label,icon}] active onChange variant>` — `underline` (default) or `pills`; WAI-ARIA tabs with ←/→ keyboard movement; 44px targets. For parallel alternatives only — long-page content uses anchored section nav (see UniversityDetail).

### Dropdown
`<Dropdown trigger align width>` + `<Dropdown.Item icon as>` — click-triggered menu (hover menus fail touch), outside-click/ESC close, `aria-haspopup/expanded`, 40px items.

### EmptyState / ErrorState
`<EmptyState icon title description action>` · `<ErrorState title description onRetry>` — the only "no data" and "failed to load" surfaces. Error copy = cause + next step, never codes.

### Skeleton primitives
`Skeleton`, `SkeletonText lines`, `UniversityCardSkeleton`, `UniversityGridSkeleton count` — skeletons MUST mirror the true layout they replace. (`components/common/LoadingSkeleton` remains for legacy pages.)

### SectionHeader
`<SectionHeader eyebrow title description action>` — the standard section heading (eyebrow 12px uppercase `link` color → title → description → right-aligned action).

---

## 2. Layout (`src/components/layout/`)

- **Container** — `max-w-content` (1280px) + standard page padding. The only container.
- **PageSection** — module frame: `background` (`page · subtle · ink · brand-tint · amber-tint`), `spacing` (`default` = 96/64/48 rhythm · `compact`), optional `header` (SectionHeader shape), `bleed`. Every section module renders inside it — this is how admin-composed pages keep the design rhythm.
- **Navbar** — sticky trust header: brand-underline active states, SearchBar, theme toggle, AccessibilityWidget, auth Dropdown, role-aware Admin link, working mobile search panel.
- **Footer** — ink surface: brand + AI-counsellor CTA, 3 link columns, connect column, working newsletter, legal bar.
- **MobileNav** — bottom tabs `Home · Colleges · Compare · Courses · Profile`, safe-area padded, brand-tint active chips. Pages add `pb-20 md:pb-0` to clear it.

---

## 3. Cards (`src/components/cards/`)

### UniversityCard — the signature component
`<UniversityCard university variant isSaved onToggleSave inCompare onToggleCompare onApply onBrochure downloading fitScore>`
- **variant:** `default` (grids) · `featured` (larger padding/logo) · `compact` (identity-only rail card)
- **Anatomy (fixed):** logo tile → name (2-line clamp, links to detail) → location · type → optional fit-score chip → 3 decision stats (avg package · avg fees · NAAC/NIRF, tabular figures) → action row (View details [ink] · Apply now [orange, sponsored only] · brochure icon · compare toggle)
- **Sponsored treatment:** amber border tint + fixed top-left `Sponsored` chip (never editable, never orange — amber is the commerce channel)
- Save button: top-right, 40px, `aria-pressed`; whole card never traps inner actions (separate tab stops). Flip interaction removed (touch parity) — descriptions live on the detail page.

### CourseCard
`variant="grouped"` (explorer: base course, college count, specialization/exam chips, View colleges link) · `variant="in-university"` (detail page: fee badge, duration, exam chips).

### ReviewCard
`review {name role university content rating imageUrl}`, `variant standard|spotlight` — stars (amber), clamped quote, attribution with initials fallback. Moderation-sourced content only.

### ScholarshipCard
Value badge + urgency-aware deadline chip (expired red / ≤7d amber / open blue) + external link.

### NewsCard
`variant="row"` (dot-marker list row) · `variant="standard"` (4:3 media card with category/date).

### StatCard
`value` (number → count-up on first view, honors reduced-motion; string → verbatim) + `suffix label icon`, `variant strip|tile`. Stat Display type, tabular figures. Missing data renders "—", never a fake value.

---

## 4. Search (`src/components/search/`)

### SearchBar
`<SearchBar size="md|lg" placeholder includeCourses autoFocus>` — 300ms debounce, ≥2 chars, universities + courses grouped suggestions (course rows deep-link to the parent university's Courses section), ↑↓/Enter/Esc keyboard support, Enter submits to `/universities?search=`. `lg` = 56px hero variant with embedded submit button.

### FilterPanel
`<FilterPanel filters onChange onReset open onClose resultCount>` with `filters = { states:[], type:'both'|'private'|'deemed', naacGrades:[], feeBand:'', city:'' }`.
Facets in decision order: searchable multi-State → Budget bands (maps to API `minFees/maxFees` — exports `FEE_BANDS`, `INDIAN_STATES`) → Type radios → NAAC checkboxes. Desktop: recessive sticky rail. Mobile: bottom sheet with "Show N universities" apply button.

### SortControl
`<SortControl value onChange options>` — exports `UNIVERSITY_SORTS` (the full API vocabulary: ranking, name A–Z/Z–A, fees ↑↓, package, established).

### CompareTray (+ `hooks/useCompareTray`)
Sticky bottom bar collecting ≤4 universities from any page (localStorage `vm_compare_tray`, event-synced across components). `useCompareTray()` → `{ items, toggle, remove, clear, has, max }`. Compare CTA navigates to `/compare-universities?ids=…` which pre-fills the bench.

---

## 5. Sections (modules) — see `CMS_MODULE_STRUCTURE.md`

`hero · stats · states · streams · tools · university-carousel · testimonials · news · faq · cta · how-it-works · ads` — all render inside PageSection, take config via props and live data via `ctx`, and ship designed loading/empty behavior (sections with no data auto-hide rather than showing placeholders).

---

## 6. Conventions checklist (for every new component)

- [ ] Colors from tokens only (no raw hex) · dark variant included
- [ ] Type from the scale classes · tabular figures on data
- [ ] Spacing on the 4/8 grid · radius from the map (6/10/16/full)
- [ ] All states: default/hover/focus-visible/active/disabled/loading/empty/error
- [ ] Hover = darken or 2px lift only · motion 150/250/400ms · reduced-motion safe
- [ ] Keyboard + SR support: labels on icon buttons, `aria-pressed/expanded/current`, focus visible
- [ ] Touch targets ≥44px · no hover-only or drag-only functionality
- [ ] Honesty labels where applicable (Sponsored/Ad/Estimate) — not removable via props
