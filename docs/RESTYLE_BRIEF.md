# Phase-2 page restyle brief (for all page-consistency passes)

Read `docs/DESIGN_SYSTEM.md` first — it is the contract. Then restyle the
assigned pages so they look like the homepage designed them. Preserve ALL
functionality, routes, API calls, props and state logic — this is a visual
and structural consistency pass, not a rewrite.

## Hard rules
1. Typography: use the scale classes (`text-h1/h2/h3`, `text-card-title`,
   `text-body`, `text-support`, `text-eyebrow`, `text-label`, `text-caption`,
   `text-stat`, `text-data`). Kill ad-hoc combos like
   `text-3xl font-serif font-bold`, `text-[10px] uppercase tracking-widest`
   (replace with `text-eyebrow`), `text-xs font-bold` metadata (→ `text-caption`
   or `text-support`). Page H1 = `text-h1` (or `text-display-serif` only for a
   marketing hero). Serif only for marketing display headings.
2. Color: tokens only. `bg-primary`, `hover:bg-primary-dark`, `text-link`,
   `bg-primary-dark` (ink panels), semantic `success/warning/error/info` +
   `-tint`/`-text`. Replace `orange-500/600` raw utilities with primary tokens
   (`bg-orange-500` → `bg-primary`, `hover:bg-orange-600` → `hover:bg-primary-dark`,
   `text-orange-500` as text → `text-link`; as icon accent → `text-primary`).
   Amber/accent ONLY for sponsored/ratings. Never new colors.
3. Surfaces: cards are `card` class or `<Card>` — white/dark-card bg,
   `border-light-border dark:border-dark-border`, `rounded-card`,
   `shadow-card`, hover `shadow-card-hover` + `-translate-y-0.5` (only if
   clickable). Replace `rounded-3xl`, `rounded-[2rem]`, ad-hoc shadows
   (`shadow-lg shadow-orange-500/20`, glows) with the system. Buttons/inputs
   are `rounded-btn` (10px), cards/modals `rounded-card` (16px).
4. Buttons: use `<Button>` from `components/ui` (variants primary/secondary/
   outline/ghost/danger, sizes sm/md/lg) or the exact same classes. Hover
   darkens; no scale-ups, no glow shadows, no uppercase labels.
5. Inputs: use `<Input>/<Select>/<Textarea>` from `components/ui` (h-11,
   rounded-btn, focus ring-2 ring-primary) or `.input-field`. Labels =
   `text-label` (sentence case), never uppercase-tracking-widest.
6. Layout: page wrapper = `<Container>` (`components/layout/Container`) +
   `py-8` (directory pages) or `py-12/16` (marketing). Section headings via
   `SectionHeader` (ui) with eyebrow, or `text-h2` + `mb-6/8`. Grid gaps
   `gap-6` for card grids, `gap-4` compact, sidebar `space-y-6`.
7. States: async views need loading (Skeleton), empty (`EmptyState`),
   error (`ErrorState`) where they already exist — keep them, restyle if odd.
   Focus states are global; don't remove outlines. Keep `dark:` parity on every
   surface/text/border you touch.
8. Icons: lucide, `w-4 h-4` inline / `w-5 h-5` headers, `aria-hidden` when
   decorative.
9. Do NOT touch: routing, data fetching, form logic, validation, analytics,
   context usage, exported names, file locations. Do not run npm or builds.
10. Keep diffs surgical — restyle className/JSX structure, not logic. When a
    page already matches the system, leave it alone.
