# FandomVerse — Portal for Fandom World

**Status: Phase 5 (Content Foundation & Seven Fandom Hubs) complete.** The application scaffold, routing, app shell, design system, the original "Fandom Core" cinematic entry, and a full original content dataset across all seven fandom hubs exist and are verified (typecheck/lint/unit/E2E/build all passing — see Testing below). Every hub is populated with real content: 35 character profiles, 21 events, 21 articles, 28 gallery pieces, 14 trailers, 21 releases and 14 merchandise items, all original fiction with procedurally generated artwork. Search/filter/sort, the chatbot rule engine, and final cart behaviour remain later-phase scope.

FandomVerse is a browser-based, backend-free Single Page Application that brings together content — articles, image galleries, videos/audio, character profiles, event highlights, trailers, merchandise, and a rule-based chatbot — across seven fandom categories (Anime, Gaming, Movies, TV Shows, K-Pop, Comics, Manga) into one centralized, visually engaging portal. Built for the "Web Innovation Unleashed" category.

This README is kept accurate as the project progresses — it does not claim any feature is complete before it actually is.

## Project Purpose

See `docs/00_PROJECT_CONSTITUTION.md` for the full vision, goals, non-goals, and constraints. In short: a fast, accessible, responsive, entirely client-side fandom-discovery portal with an original cinematic WebGL entry experience, governed strictly by `docs/FandomVerse-Web_Innovation Unleashed_SRS.pdf` (the authoritative SRS).

## Technology Stack

- React 19 + TypeScript, built with Vite (D-001, D-010, formally confirmed D-020)
- React Router (`HashRouter`/`createHashRouter`) for SPA navigation
- Three.js via React Three Fiber, lazy-loaded, powering the original "Fandom Core" cinematic entry (`src/features/universe/`) — procedural geometry only, no external models/textures; a 2D CSS fallback (not a placeholder — the loading, reduced-motion, and no-WebGL states all use it) shares the same accessible category-navigation overlay as the WebGL path
- Zustand for cross-cutting client state (cart, bookmarks, notes, chatbot session, UI), persisted to `localStorage`/`sessionStorage` per the boundaries in `docs/05_DATA_SCHEMA.md` §13
- A shared component primitive library (`src/components/ui/`) — Button, IconButton, Badge, Card (+ Media/Header/Body/Meta/Footer), Dialog, Drawer, form controls (FormField/Input/Select/Textarea/SearchInput), layout primitives (Container/Stack/Grid/Divider), SectionHeader, Skeleton, ErrorState — all built on one canonical design-token system and one shared accessible-dialog hook (`useFocusTrap`)
- Static, versioned JSON as the entire data layer — no backend, no server-side database, nothing is ever written back to the data files at runtime. Content and its artwork are generated together by `scripts/generate-content.mjs` and guarded by a 47-assertion validation gate (`src/data/contentValidation.test.ts`) that fails the build if SRS content minimums, references, or assets regress
- A fully custom, in-repo rule-based chatbot shell (no external AI API, no Tawk.to/Tidio dependency — D-004); the rule engine itself is Phase 11
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

All of the above pass as of the Phase 5 completion report. See `docs/09_TEST_STRATEGY.md` for the full test strategy and requirement traceability, and the Phase 5 completion report for exact results.

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
  components/   — feature components (Header, Footer, Breadcrumb, ErrorBoundary, states, ChatbotLauncher, DummyAuth, BookmarkToggle, …)
  components/ui/ — shared design-system primitives (Button, Card, Dialog, Drawer, Form, Layout, Badge, Link, SectionHeader, Skeleton, ErrorState)
  data/         — static JSON content + typed loader (src/data/index.ts) + the content-validation gate
  features/     — cross-cutting feature logic (the Fandom Core cinematic entry)
  hooks/        — usePrefersReducedMotion, useWebglSupport, useClock, useVisitorCounter, useFocusTrap
  layouts/      — RootLayout (the persistent app shell)
  pages/        — one file per route
  routes/       — route table (src/routes/routes.tsx)
  stores/       — Zustand stores: cartStore, bookmarksStore, notesStore, chatbotStore, uiStore
  styles/       — design tokens (tokens.css), global reset/base styles, breakpoint constants
  types/        — TypeScript domain types (src/types/content.ts)
  utils/        — storage.ts (failure-safe localStorage/sessionStorage wrapper)
e2e/            — Playwright end-to-end tests (navigation, category hubs, persistence, accessibility, responsive, console audit)
scripts/        — content + asset generation (generate-content.mjs)
```

## Constraints

- No backend, no server-side database, no server-side user data storage.
- No checkout, payment, or real purchasing (merchandise cart is temporary/demo only, persisted to `localStorage` on-device — see D-005).
- Chatbot is rule-based/pre-scripted; no live external AI API.
- Only original, royalty-free, or properly licensed content — tracked in `docs/08_LICENSES.md`.
- Responsive across desktop, tablet, and mobile; accessible; compatible with the latest browsers.

Full constraint list: `docs/00_PROJECT_CONSTITUTION.md` §4.

## AI Usage

Claude is the primary implementation agent (architecture, React/TypeScript, Three.js, tests, docs, and the Phase 5 content dataset). No AI image generation has been used to date — all 161 visual assets are procedural SVG drawn from code (D-036); Gemini remains an approved-but-unused option for later visual work, and ChatGPT is available as an external architecture/QA reviewer. Full, living usage log: `docs/07_AI_USAGE.md`. AI-generated assets are tracked with license status in `docs/08_LICENSES.md`. AI-assisted output is never treated as automatically production-ready — every change is checked against real typecheck/lint/test/build results before being reported as done.

## License Policy

Every non-original asset must be verified and logged in `docs/08_LICENSES.md` before use — nothing is used on the assumption that it's "probably fine." See `docs/00_PROJECT_CONSTITUTION.md` §10. As of Phase 5 the project ships 161 images, **all of them original procedural SVG generated by this repository's own script** — no stock imagery, no scraped artwork, no AI image generation, and no third-party license obligations. All seven fandoms are original fictional properties; no real franchise, character, logo or title appears anywhere in the content.

## Current Status

- **Phase 0 — complete.** Repository audited, SRS extracted and mapped into a 76-item requirement matrix, full documentation set produced under `docs/`.
- **Phase 1 — complete.** Git initialized, Vite+React+TS app scaffolded, `HashRouter`-based routing with placeholders for every primary + detail route, reusable app shell, Zustand stores with the correct persistence boundaries, TypeScript domain types + seed data, design-token foundation, accessibility foundation, error/loading/empty/not-found states, ESLint/Vitest/Playwright configured with passing tests.
- **Phase 2 — complete.** Canonical breakpoint system (reconciled the Header's Phase 1 arbitrary 767px to the tablet/desktop boundary), React 19 formally confirmed as the baseline, canonical route inventory documented, full design-token system (color/typography/spacing/radius/shadow/motion/layout), and a shared component primitive library (Button, Card, Dialog, Drawer, forms, layout) with a real focus-trap hook shared by every dialog/drawer. Fixed 3 real bugs this phase — all caught by new automated tests, not by inspection.
- **Phase 3 — complete.** Per-route document titles, scroll/focus-on-navigation, a formally-resolved dummy-auth decision (in-memory) and dark-only theme reconfirmation, a canonical 23-route inventory, and real DOM-level verification that the Dialog/Drawer background-inertness architecture is correct. A real keyboard-only walkthrough and full HashRouter deep-link/refresh verification across all 23 routes.
- **Phase 4 — complete.** The "Fandom Core" cinematic entry: an original central object with seven orbiting category nodes, procedural (no external assets), with a real accessible HTML interaction layer shared identically between the WebGL and 2D-fallback paths. Found and fixed a **serious pre-existing bug** dating to Phase 1 (the skip-to-content link could corrupt `HashRouter`'s route state and throw users onto the 404 page) plus two real visual/architecture issues, all via genuine testing rather than inspection alone.
- **Phase 5 — complete.** The real content foundation: seven original flagship franchises (one per hub), 35 character profiles, 21 events, 21 articles, 7 galleries, 14 trailers, 21 releases and 14 merchandise items, plus 161 procedurally generated SVG assets with documented provenance and zero third-party licensing exposure. Category hubs and all four detail pages rebuilt on the shared design system. Added an executable SRS content gate (verified to actually fail when minimums are broken) and found a latent WCAG AA contrast defect in the Phase 2 Badge component.
- **Phases 6–15 — not started.** Awaiting Project Director review and go-ahead per the phase-gate process (`docs/00_PROJECT_CONSTITUTION.md` §13).

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
