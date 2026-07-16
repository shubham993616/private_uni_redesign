# Vidyarthi Mitra — Professional Redesign Frontend

The production-ready, redesigned frontend for the Vidyarthi Mitra university-discovery
platform, implementing the **"Counsel" design system** — a calm, intelligent education
marketplace (one brand orange, ink surfaces, tabular data typography, CMS-ready modular
sections). This project is fully standalone: everything needed to run it lives in this
folder.

## Overview

Vidyarthi Mitra helps students discover, compare and select universities:

- **Discover** — searchable directory of 500+ private/deemed/foreign/twinning universities
  with filters for state, budget, type and NAAC grade
- **Evaluate** — deep university profiles: courses & fees, admissions (with deadline
  countdowns), placements, campus & gallery, scholarships, community Q&A
- **Compare** — sticky compare tray (collect up to 4 from any listing) feeding a
  server-computed side-by-side report with highlighted winners
- **Decide** — student dashboard (shortlist, ratings & notes, application & deadline
  trackers, recommendations, map view), rank predictor, brochure PDF generator
- **Guidance** — AI counsellor chat (English / हिंदी / मराठी, voice in/out)
- **Monetization intact** — sponsored placements (labeled), 6-position banner ad system
  with impression/click tracking, lead-gated Apply & Brochure flows, full 21-screen
  admin console

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 (SPA) |
| Routing | react-router-dom 6 |
| Styling | Tailwind CSS 3.4 + design tokens (`src/styles/`) |
| Motion | framer-motion (sanctioned micro-interactions only) |
| Icons | lucide-react |
| Data | axios → REST backend at `/api/v1` |
| Charts / maps | recharts · react-leaflet |
| Documents | jsPDF (+autotable) brochures · SheetJS (xlsx) imports/exports |
| SEO | react-helmet-async + Vercel bot-prerender function (`api/render.js`) |

## Installation

Requires **Node 18+**.

```bash
npm install
```

## Environment setup

```bash
cp .env.example .env   # optional for local dev
```

No variables are required for local development — the dev server proxies `/api/v1`
to `http://localhost:5001` (the existing Express backend). See `.env.example` for
production values (`VITE_API_URL`, `VITE_SITE_URL`, `SEO_API_URL`).

**Backend required:** this frontend consumes the Vidyarthi Mitra Express/MongoDB API
(the `backend/` folder of the main project, or the deployed Render instance). Start it
locally on port 5001, or set `VITE_API_URL` to a deployed API.

## Commands

```bash
npm run dev       # start the Vite dev server (http://localhost:5173)
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

## Project structure

```
professional-redesign-frontend/
├── src/
│   ├── styles/            Design tokens · typography scale · globals (theme source of truth)
│   ├── config/            homepageSections.js — the CMS-shaped section list
│   ├── components/
│   │   ├── ui/            Primitives: Button, Input, Badge, Modal (focus-trapped), Tabs,
│   │   │                  Dropdown, Empty/Error states, Skeletons
│   │   ├── layout/        Navbar, Footer, MobileNav, Container, PageSection,
│   │   │                  accessibility & feedback widgets
│   │   ├── cards/         UniversityCard, CourseCard, ReviewCard, ScholarshipCard,
│   │   │                  NewsCard, StatCard
│   │   ├── search/        SearchBar, FilterPanel, SortControl, CompareTray
│   │   ├── sections/      CMS modules + SectionRenderer (the page-builder seam)
│   │   ├── ads/           Tracked banner system (hero/sidebar/sponsored/sticky)
│   │   ├── common/        Seo, AI chat widget, logos, skeletons, route guards
│   │   ├── profile/       Student-dashboard tab components
│   │   └── university/    LeadCaptureModal (conversion gate)
│   ├── pages/             Route components (public pages + admin/ console)
│   ├── hooks/             useCompareTray, useAdBanners, useClickOutside, useRole
│   ├── context/           Auth · Theme (dark mode) · AI chat
│   ├── utils/             api client, SEO builders, fit score, brochure generator, cache
│   └── assets/            Logo, state imagery, campus photography
├── public/                favicon, robots.txt
├── api/                   Vercel serverless SEO prerender (bot detection)
├── docs/                  Implementation guide · component API · CMS module structure
├── index.html             (contains the SEO-START/END prerender marker — do not remove)
├── tailwind.config.js     Design tokens (colors/type/radius/shadows)
├── vite.config.js         Dev proxy + vendor chunking
└── vercel.json            SPA rewrites + prerender routing + sitemap proxy
```

## Design system rules (binding)

Documented fully in `docs/`. The short version: colors from tokens only (no raw hex);
type from the scale classes with tabular figures on data; 4/8px spacing grid; radius map
6/10/16/full; hover darkens (never scales/glows); one primary button per region; every
component ships default/hover/focus/loading/empty/error/dark states; Sponsored/Ad labels
are not removable; modules never fetch their own data.

## Editing the homepage (CMS-ready)

The homepage is a data-driven list of section modules — edit
`src/config/homepageSections.js` to change copy, reorder sections, or disable a band
(`enabled: false`). See `docs/CMS_MODULE_STRUCTURE.md` for the module catalogue and how
to connect an admin page-builder later (the renderer needs zero changes).

## Known notes & limitations

- **Backend dependency:** all data comes from the Vidyarthi Mitra API; without it the
  UI renders designed empty/error states.
- Google OAuth, Gemini AI chat, translations and email/OTP features depend on the
  backend's configured credentials; the UI degrades gracefully when they're absent.
- Admin console screens are functional and reskinned via the token layer; their deeper
  UX upgrades (sortable tables, drawer forms, unified import wizard) are the documented
  next phase (`docs/IMPLEMENTATION_GUIDE.md` §6).
- No ESLint config ships with the original project; add your team's standard if desired.
