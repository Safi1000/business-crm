# TechxServe Business Platform — Frontend

A complete, frontend-only business platform: **Admin Panel**, **Client Portal**, and **Employee Portal**, built to a screen-by-screen specification. No backend — everything runs against a typed, swappable mock-API over seeded, cross-linked **PKR-first** fixtures.

## Stack

React 18 + TypeScript (strict) · Vite · Tailwind CSS (token-driven) · React Router v6 · TanStack Query · Zustand · Framer Motion · Recharts · react-hook-form + zod · lucide-react · Vitest + Testing Library.

## Getting started

```bash
npm install
npm run dev        # start the dev server
npm run build      # typecheck + production build
npm run lint       # eslint (max-warnings 0)
npm test           # vitest
```

## Where to look

- `/login` — sign in with any credentials. Footer links jump to the portals and the component gallery.
- `/` — Admin Panel (sidebar nav, ⌘K command palette, AI assistant, light/dark, currency switcher).
- `/portal` — Client Portal · `/me` — Employee Portal.
- `/dev/components` — living design-system gallery (every component, every state).

## Architecture

```
src/
├─ design-system/   # tokens, primitives, feedback, data-display, charts, overlays, motion
├─ layouts/         # AdminShell, PortalShell, AuthLayout
├─ panels/          # one folder per admin panel (overview, clients-sales, work, workforce, finance, inventory, compliance, admin)
├─ client-portal/   # Client Portal pages
├─ employee-portal/ # Employee Portal pages
├─ floating/        # AI Assistant
├─ data/            # mock-api (swap seam = transport.ts), fixtures, query-keys
├─ config/          # routes, nav, phases (P0–P3 gating), country packs
├─ lib/             # formatters, fx, url-filter hook, cn
└─ shared/          # cross-panel scaffolds (PageHeader, KpiStrip, FilterBar)
```

**Rules:** panels never import each other — anything shared is promoted to `design-system/`, `lib/`, or accessed via `@/data/mock-api`. Phase gating (`config/phases.tsx`) controls which screens ship. Swapping to a real backend is a one-file change in `data/mock-api/transport.ts`.

Currency defaults to PKR; the top-bar switcher converts all totals via `lib/fx.ts`. Country pack = Pakistan (CNIC, EOBI, NTN/STRN, filer status) behind `config/countryPacks.ts`.
