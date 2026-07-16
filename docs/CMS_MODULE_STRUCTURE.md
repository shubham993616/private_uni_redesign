# CMS MODULE STRUCTURE
## Vidyarthi Mitra — Section/Module System (Frontend Implementation)

The frontend implementation of the modular architecture defined in
`MODULAR_UI_ARCHITECTURE_AND_ADMIN_CONTROL_STRATEGY.md`. A page is **an
ordered list of configured module instances**, not a bespoke layout.

---

## 1. The three pieces

```
config/homepageSections.js      ← the section LIST (CMS-shaped data)
components/sections/SectionRenderer.jsx  ← registry + renderer
components/sections/*.jsx       ← the module components
```

### Section entry shape

```
{
  id: "browse-states",          // stable key (admin builder row id later)
  type: "states",               // module type — must exist in SECTION_REGISTRY
  enabled: true,                // admin on/off switch
  audience: "all",              // "all" | "logged-in" | "logged-out"
  props: { …module config… }    // validated content/config for this instance
}
```

### Rendering contract

- `SectionRenderer` filters `enabled === false` and audience mismatches, maps
  `type` through `SECTION_REGISTRY`, and passes each module its `props` plus a
  shared **`ctx`** (live data + user actions resolved by the page loader).
- **Unknown module types render nothing** (dev-mode warning) — retired or
  future section types can never crash a page.
- Modules NEVER fetch their own data and NEVER know which page they're on.
  Pages load data; modules present it. This is what makes every module
  reusable on any future builder page (state landing pages, campaign pages).

### ctx (provided by the page loader)

`user · loading · universities · uniTotal · news · questions · testimonials ·
stateCounts · faqs · liveStats {universities, states} · savedIds ·
onToggleSave(u) · compareHas(id) · onToggleCompare(u)`

## 2. Module registry (implemented types)

| type | Component | Config (props) | Live data used (ctx) | Empty behavior |
|---|---|---|---|---|
| `hero` | HeroSection | headline, highlight, subheadline, image, quickLinks[{label,to,icon}] | — (search built-in, `/ask` opens chat) | always renders |
| `stats` | StatsSection | stats[{source:"live:key"\|manual, value, suffix, label, icon}] | liveStats | falls back to manual values |
| `states` | StatesSection | header, states[{name,image}] | stateCounts (live counts + all-states modal) | renders without counts |
| `streams` | StreamsSection | header, streams[{label,icon,to}] — label→DB mapping is DATA | — | — |
| `tools` | ToolsSection | header, tools[{label,description,icon,to}] (`/ask` → chat) | — | — |
| `university-carousel` | UniversityCarousel | header, count | universities, loading, savedIds, save/compare handlers | skeleton grid → designed empty state |
| `testimonials` | TestimonialSection | header, count | testimonials (approved only) | **auto-hides** (no fake fallbacks) + "Share your experience" → moderation queue |
| `news` | NewsSection | header | news, questions (tap → AI chat) | auto-hides empty columns / whole section |
| `faq` | FAQSection | header, count | faqs (admin-managed collection — first public surface) | auto-hides |
| `cta` | CTASection | headline, text, form:"newsletter"\|"none", primary, secondary | — (newsletter POSTs `/newsletter/subscribe`) | — |
| `how-it-works` | HowItWorksSection | header, steps[{icon,title,text}] | — | — |
| `ads` | AdsSection | variant:"hero-slider"\|"sponsored"\|"sidebar", page | — (existing tracked Banner components: impressions on fetch, UTM click redirects, admin-scheduled) | renders nothing without active banners |

## 3. Editing the homepage today (no deployment concepts needed)

Everything an admin will later do in the page builder is already a data edit
in `config/homepageSections.js`:

- **Change a headline / CTA / image:** edit the entry's `props`.
- **Reorder sections:** move entries in the array.
- **Disable a section:** `enabled: false` (kept, not deleted).
- **Target an audience:** `audience: "logged-in"` (e.g. a future
  "Continue your journey" module).
- **Add a section:** append an entry using an existing `type`.

## 4. Connecting the admin builder (next phase)

1. Backend: add the `Section` entity (Doc 3 §9) + `GET /api/v1/pages/:slug/sections` returning exactly the entry shape above (the seeded homepage = the current config file).
2. Frontend: in `pages/Home.jsx`, replace the `homepageSections` import with that fetch (session-cache it like the data payload). **`SectionRenderer` and every module need zero changes.**
3. Admin: a builder screen (list rows = sections; drag to reorder; toggle = `enabled`; Edit = schema-generated form for `props`; module gallery = `SECTION_REGISTRY` keys).
4. New module types: build the component → register in `SECTION_REGISTRY` → it appears in the gallery. Old pages are untouched; unknown types degrade silently by design.

## 5. Rules (binding)

- No page may hardcode section markup that exists as a module.
- Modules render inside `PageSection` (rhythm), compose ui/cards/search
  components (anatomy), and reference tokens (appearance) — a page assembled
  from modules is on-system by construction.
- Honesty labels inside modules (the ads module's "Sponsored"/"Ad" chips, the
  testimonial moderation note) are **not** configurable props.
- A module with no real data hides itself; it never renders placeholder or
  fabricated content.
