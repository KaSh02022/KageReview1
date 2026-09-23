# FandomVerse — Portal for Fandom World

**Status: Phase 1 (Architecture & Technical Foundation) complete.** The application scaffold, routing, app shell, state stores, and design tokens exist and are verified (typecheck/lint/unit/E2E/build all passing — see Testing below). Feature content (full category catalogs, chatbot logic, cinematic scene, merchandise catalog, etc.) is intentionally minimal seed data — that's Phase 5+ scope.

FandomVerse is a browser-based, backend-free Single Page Application that brings together content — articles, image galleries, videos/audio, character profiles, event highlights, trailers, merchandise, and a rule-based chatbot — across seven fandom categories (Anime, Gaming, Movies, TV Shows, K-Pop, Comics, Manga) into one centralized, visually engaging portal. Built for the "Web Innovation Unleashed" category.

This README is kept accurate as the project progresses — it does not claim any feature is complete before it actually is.

## Project Purpose

See `docs/00_PROJECT_CONSTITUTION.md` for the full vision, goals, non-goals, and constraints. In short: a fast, accessible, responsive, entirely client-side fandom-discovery portal with an original cinematic WebGL entry experience, governed strictly by `docs/FandomVerse-Web_Innovation Unleashed_SRS.pdf` (the authoritative SRS).

## Technology Stack

- React 19 + TypeScript, built with Vite (see `docs/11_DECISION_LOG.md` D-001, D-010)
- React Router (`HashRouter`/`createHashRouter`) for SPA navigation
- Three.js via React Three Fiber, lazy-loaded, scoped to the cinematic "Fandom Universe" entry layer (Phase 4 builds the real scene; Phase 1 ships the progressive-enhancement/fallback architecture only)
- Zustand for cross-cutting client state (cart, bookmarks, notes, chatbot session, UI), persisted to `localStorage`/`sessionStorage` per the boundaries in `docs/05_DATA_SCHEMA.md` §13
- Static, versioned JSON as the entire data layer — no backend, no server-side database, nothing is ever written back to the data files at runtime
- A fully custom, in-repo rule-based chatbot shell (no external AI API, no Tawk.to/Tidio dependency — see `docs/11_DECISION_LOG.md` D-004); the rule engine itself is Phase 11
- ESLint (flat config, TypeScript + React Hooks + jsx-a11y), Vitest + React Testing Library, Playwright + axe-core

Full architecture: `docs/02_PRODUCT_ARCHITECTURE.md`. Design system: `docs/04_DESIGN_SYSTEM.md`. Data schema: `docs/05_DATA_SCHEMA.md`.

## Prerequisites

- Node.js 20+ (developed against Node v24.16.0 / npm 11.13.0)
- No database, no backend service, no API keys required to run locally

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Starts the Vite dev server (default `http://localhost:5173`).

## Testing

```bash
npm run typecheck    # tsc -b --noEmit
npm run lint         # eslint .
npm test             # vitest run (unit + integration)
npm run test:watch   # vitest, watch mode
npm run test:e2e     # playwright test (builds + serves the app, runs across chromium/firefox/webkit/mobile-chrome)
```

All of the above pass as of the Phase 1 completion report. See `docs/09_TEST_STRATEGY.md` for the full test strategy and requirement traceability, and the Phase 1 completion report for exact results.

## Build

```bash
npm run build      # tsc -b && vite build -> dist/
npm run preview    # serve the production build locally
```

Output is fully static (`dist/`) — deployable to any static host, no server required.

## Architecture Overview

FandomVerse is a client-only SPA: a persistent app shell (`src/layouts/RootLayout.tsx` — skip link, header/search/nav, breadcrumb, footer, chatbot launcher, dummy-auth modal) wraps routed pages for Home, seven category hubs, search, trailers, events, releases, merchandise/cart, bookmarks, contact, and about, plus detail routes for articles/characters/events/products. All content comes from static JSON under `src/data/` imported at build time; the only runtime network activity is third-party embeds (YouTube video, Google Maps) with no FandomVerse backend involved. See `docs/02_PRODUCT_ARCHITECTURE.md` for the full diagram, route table, and module breakdown.

### Project structure

```
src/
  app/          — root App component + RouterProvider wiring
  components/   — shared UI primitives (Header, Footer, Breadcrumb, ErrorBoundary, states, ChatbotLauncher, DummyAuth, BookmarkToggle, …)
  data/         — static JSON content (seed data) + typed loader (src/data/index.ts)
  features/     — cross-cutting feature logic (currently: the cinematic-entry progressive-enhancement scaffold)
  hooks/        — usePrefersReducedMotion, useWebglSupport, useClock, useVisitorCounter
  layouts/      — RootLayout (the persistent app shell)
  pages/        — one file per route
  routes/       — route table (src/routes/routes.tsx)
  stores/       — Zustand stores: cartStore, bookmarksStore, notesStore, chatbotStore, uiStore
  styles/       — design tokens (tokens.css), global reset/base styles, breakpoint constants
  types/        — TypeScript domain types (src/types/content.ts)
  utils/        — storage.ts (failure-safe localStorage/sessionStorage wrapper)
e2e/            — Playwright end-to-end tests
```

## Constraints

- No backend, no server-side database, no server-side user data storage.
- No checkout, payment, or real purchasing (merchandise cart is temporary/demo only, persisted to `localStorage` on-device — see D-005).
- Chatbot is rule-based/pre-scripted; no live external AI API.
- Only original, royalty-free, or properly licensed content — tracked in `docs/08_LICENSES.md`.
- Responsive across desktop, tablet, and mobile; accessible; compatible with the latest browsers.

Full constraint list: `docs/00_PROJECT_CONSTITUTION.md` §4.

## AI Usage

Claude (Sonnet 5) is the primary implementation agent (architecture, React/TypeScript, Three.js, tests, docs). Gemini is used for visual asset generation. ChatGPT serves as an external architecture/QA reviewer. Full, living usage log: `docs/07_AI_USAGE.md`. AI-generated assets are tracked with license status in `docs/08_LICENSES.md`. AI-assisted output is never treated as automatically production-ready — every change is checked against real typecheck/lint/test/build results before being reported as done.

## License Policy

Every non-original asset must be verified and logged in `docs/08_LICENSES.md` before use — nothing is used on the assumption that it's "probably fine." See `docs/00_PROJECT_CONSTITUTION.md` §10. No production/copyrighted assets have been added yet (Phase 1 ships zero images).

## Current Status

- **Phase 0 — complete.** Repository audited, SRS extracted and mapped into a 76-item requirement matrix, full documentation set produced under `docs/`.
- **Phase 1 — complete.** See the Phase 1 completion report (delivered to the Project Director) for the full breakdown: git initialized, Vite+React+TS app scaffolded, `HashRouter`-based routing with placeholders for every primary + detail route, reusable app shell, Zustand stores with the correct persistence boundaries, TypeScript domain types + seed data, design-token foundation, accessibility foundation (skip link, focus states, accessible dialogs, `aria-current` nav, keyboard-operable chatbot/auth modals), error/loading/empty/not-found states, ESLint/Vitest/Playwright configured with passing tests, and a clean production build.
- **Phases 2–15 — not started.** Awaiting Project Director review and go-ahead per the phase-gate process (`docs/00_PROJECT_CONSTITUTION.md` §13).

## Document Index

| Doc | Purpose |
|---|---|
| `docs/00_PROJECT_CONSTITUTION.md` | Vision, constraints, principles, governance rules |
| `docs/01_SRS_REQUIREMENTS.md` | Full SRS requirement matrix (76 items, traced to source pages) |
| `docs/02_PRODUCT_ARCHITECTURE.md` | Technical architecture and stack decisions |
| `docs/03_UX_ARCHITECTURE.md` | Sitemap, navigation, page-level UX |
| `docs/04_DESIGN_SYSTEM.md` | Visual language, tokens, components |
| `docs/05_DATA_SCHEMA.md` | JSON schemas for all content types |
| `docs/06_ASSET_BIBLE.md` | Asset conventions, standards, and Gemini prompts |
| `docs/07_AI_USAGE.md` | AI tool usage log and role definitions |
| `docs/08_LICENSES.md` | Asset/license register |
| `docs/09_TEST_STRATEGY.md` | Test types, tooling, and requirement traceability |
| `docs/10_IMPLEMENTATION_PLAN.md` | Phase-by-phase task roadmap |
| `docs/11_DECISION_LOG.md` | Record of major technical/product decisions |
