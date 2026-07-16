# IMPLEMENTATION GUIDE
## Vidyarthi Mitra — "Counsel" Frontend Redesign

This guide explains what was implemented, how the new architecture works, and how to continue building on it. Companion docs: `FRONTEND_IMPLEMENTATION_PLAN.md` (audit + plan), `COMPONENT_DOCUMENTATION.md` (component API reference), `CMS_MODULE_STRUCTURE.md` (section/module system).

---

## 1. What changed

### Design system (`src/styles/`, `tailwind.config.js`, `index.html`)
- **`styles/tokens.css`** — CSS custom properties for the full "Counsel" palette (one brand orange `#EA580C`, hover/text `#C2410C`, ink surfaces, amber = commerce channel, semantic set), radius map (6/10/16/24), the three sanctioned shadows, and motion durations — light and dark themes.
- **`styles/typography.css`** — the documented type scale as utility classes (`.text-display`, `.text-h1/h2/h3`, `.text-card-title`, `.text-body`, `.text-support`, `.text-eyebrow`, `.text-label`, `.text-caption`, `.text-stat`, `.text-data` with tabular figures, `.prose-measure`).
- **`styles/globals.css`** — the **legacy class names preserved but restyled** (`.card`, `.btn-primary/outline/accent`, `.badge*`, `.input-field`, `.skeleton`, `.glass`, `.text-gradient`…): every untouched screen (all 21 admin pages, auth, profile suite, exams, foreign, courses) automatically adopts the new design with zero code changes. Also: neutral shimmer, amber focus ring, safe-area utility, accessibility-widget classes, `prefers-reduced-motion` collapse.
- **`tailwind.config.js`** — token names preserved, values remapped (primary DEFAULT is now `#EA580C`; `link` stays the accessible orange text; `info` added; Devanagari font fallbacks; `btn` radius 10px; `max-w-content` 1280px).
- **`index.html`** — theme-color → ink `#0F172A`; fonts trimmed to Plus Jakarta Sans (400–800) + Playfair Display 700 + Noto Sans Devanagari. **The `<!--SEO-START/END-->` marker block is untouched** (the Vercel bot-prerender contract).

### Component library (`src/components/`)
- **`ui/`** upgraded, back-compatible: Button (5 variants × 3 sizes + `loading`), Modal (**focus trap + return focus**), plus new Tabs, Dropdown, ErrorState, Skeleton primitives. All previous exports/props unchanged so untouched pages keep compiling.
- **`layout/`**: new `Container` (single 1280px width) and `PageSection` (the module frame: backgrounds, 96/64/48 rhythm, standard header). `Navbar`, `Footer`, `MobileNav` rewritten (see §3).
- **`cards/`** (new): `UniversityCard` (default/featured/compact; fixed badge positions; flip removed for touch parity), `CourseCard`, `ReviewCard`, `ScholarshipCard`, `NewsCard`, `StatCard` (count-up, reduced-motion aware).
- **`search/`** (new): `SearchBar` (the one search pattern — debounced dual-source suggestions, keyboard navigation; used by navbar + hero + mobile), `FilterPanel` (priority-ordered facets incl. the **newly exposed budget bands**, searchable multi-state, mobile sheet with result-count apply), `SortControl` (full API sort vocabulary), `CompareTray` (sticky cross-page compare collection).
- **`sections/`** (new): 12 CMS-shaped modules + `SectionRenderer` — see `CMS_MODULE_STRUCTURE.md`.

### Pages
- **Home** — now ~120 lines: loads live data (session-cached 5 min), wires save/compare, renders `config/homepageSections.js` through `SectionRenderer`. Zero hardcoded sections. The dead newsletter card is now a working CTA module; FAQs get their first public surface; testimonial fallback arrays are gone (moderated content only).
- **Universities (listing)** — filter rail + applied-filter chips + live count line ("Featured partners appear first" labels the sponsored-first order honestly), full sort menu, budget facet, multi-state, load-more with progress ("Showing 24 of 214"), new cards with save/apply/brochure/compare, skeleton/empty/error states. All URL params (`?search/state/city`) preserved.
- **University Detail** — Airbnb-pattern rebuild: breadcrumbs (visible now, matching the JSON-LD), identity band with updated-stamp, 6-stat strip, **sticky scroll-spy section nav** over 8 anchored sections (all former tab content preserved and now crawlable), **sticky admissions panel** (fees · application fee · deadline with days-left · Apply · Brochure · consent microcopy) with a mobile bottom conversion bar, campus **gallery + virtual tour** (previously unrendered data), styled delete confirmation, admin inline edit on form primitives. All side effects preserved (view counter, `vm_recent`, save/track/share, lead gates, deep-link `location.state.activeTab`).
- **Comparison** — gains `?ids=` deep-linking so the CompareTray can pre-fill the bench; the rest of the page (server compare, winners, drag reorder, recent searches) reskins via tokens.
- **App shell** — CompareTray mounted in the public layout; everything else (ads, chat, accessibility, social buttons, skip link) untouched.

## 2. Compatibility contract (why nothing broke)

Two rules made a safe incremental redesign possible:

1. **Token names kept, values changed** — every `text-link`, `bg-primary`, `dark:bg-dark-card` in the 60+ untouched files now resolves to the new palette.
2. **Legacy global classes kept, styles changed** — every `.btn-primary`, `.card`, `.input-field`, `.badge-green` in the admin console and old pages now renders the new design (10px button radius, darken-on-hover, no glows).

New code must use the component library; legacy classes exist for compatibility, not for new work.

## 3. Navigation changes (deliberate, documented)

- Navbar: single-color active indicator replaces the tri-color bar; "Comparison" renamed "Compare"; mobile hamburger search **works** now; auth dropdown moved onto the Dropdown primitive.
- MobileNav bottom tabs: `Home · Colleges · Compare · Courses · Profile` — Compare is now thumb-reachable (was desktop-only); Abroad remains in the navbar/footer.
- Footer: ink surface (footer-scale orange retired), same links + working newsletter.

## 4. How to run

```bash
cd frontend
npm install
npm run dev        # Vite dev server (proxies /api/v1 per vite.config.js)
npm run build      # production build
```

No new dependencies were added; the redesign uses the existing stack (React 18, Tailwind 3.4, framer-motion where it already existed, lucide-react).

## 5. Extending the system

- **New page section?** Add a component in `components/sections/`, register it in `SECTION_REGISTRY`, add an entry to the page's section config. Never hardcode a section into a page.
- **New card type?** Follow the anatomy in `components/cards/UniversityCard.jsx` (identity → metadata → data → actions, ≤2 badges, all states).
- **New color?** Don't. Extend `styles/tokens.css` + `tailwind.config.js` together only with a design-doc update.
- **Admin builder (next phase):** replace the `homepageSections` import with `GET /api/v1/pages/home/sections` returning the same shape; `SectionRenderer` needs zero changes. The backend `Section` entity spec is in `MODULAR_UI_ARCHITECTURE_AND_ADMIN_CONTROL_STRATEGY.md` §9.

## 6. Not in this pass (unchanged and functional)

Admin screens' internal layouts (reskinned via classes), profile tab components' logic, auth flow logic, AI chat / accessibility / ads widget internals, brochure PDF palette, backend. Recommended next passes: dashboard overview honesty fixes (render the real profile score, remove mock charts), admin DataTable sorting + numbered pagination, unified import wizard, brochure brand alignment.
