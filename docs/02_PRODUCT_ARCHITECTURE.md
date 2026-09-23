# 02 — Product Architecture

Defines how FandomVerse is built to satisfy `01_SRS_REQUIREMENTS.md` under the constraints in `00_PROJECT_CONSTITUTION.md`. Updated at the end of Phase 1 to reflect what was actually scaffolded (Director-approved baseline, see D-001–D-009 in `11_DECISION_LOG.md`). Full feature implementation (content population, chatbot logic, cinematic layer) remains scoped to later phases per `10_IMPLEMENTATION_PLAN.md`.

## 1. Stack Decision (see D-001..D-003 in `11_DECISION_LOG.md`)

| Concern | Choice | Why |
|---|---|---|
| Framework | React 18 + TypeScript | SRS explicitly allows ReactJS (p.16); Master Directive assigns React to Claude; TypeScript catches data-shape errors across ~76 JSON-driven requirements. |
| Build tool | Vite | Fast dev server, zero-backend static build output, first-class React+TS template, code-splitting out of the box. |
| Routing | React Router (`HashRouter`) | SPA routing (CR-004) without requiring server rewrite rules — works on any static host or even `file://` for demo/offline review. |
| 3D layer | Three.js via React Three Fiber + drei | Declarative Three.js scene composition inside React; only mounted on the landing/"Fandom Universe" route. |
| Global state | Zustand (with `persist` middleware) | Minimal-boilerplate store for cart, bookmarks, chatbot session; `persist` middleware maps cleanly to localStorage/sessionStorage per FR-036/FR-037. |
| Styling | CSS Modules + design tokens (custom, not a component-template library) | Avoids "ready-made template" risk (AI-002); full control over the original visual language in `04_DESIGN_SYSTEM.md`. |
| Data | Static JSON files under `src/data/` | Matches CR-001/IR-002; loaded via static `import` (bundled) for content correctness at build time. |
| Testing | Vitest + React Testing Library (unit/integration), Playwright (+ `@axe-core/playwright`) for e2e/responsive/a11y, Lighthouse CI for performance | Covers `09_TEST_STRATEGY.md` test types without any backend test infra. |
| Package manager | npm | Already available in the environment (v11.13); no extra install needed. |

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          Browser (client)                        │
│                                                                    │
│  ┌───────────────┐   ┌────────────────────────────────────────┐  │
│  │ Cinematic      │   │              React SPA Shell            │  │
│  │ Universe entry │──▶│  Router → Layout → Page → Feature comps │  │
│  │ (R3F / Three)  │   │                                          │  │
│  └───────────────┘   │  ┌────────────┐  ┌────────────────────┐  │  │
│                        │  │ Zustand     │  │ Data layer         │  │  │
│                        │  │ stores      │  │ (static JSON       │  │  │
│                        │  │ (cart,      │  │  imports, typed)   │  │  │
│                        │  │ bookmarks,  │  │                    │  │  │
│                        │  │ chatbot,    │  └────────────────────┘  │  │
│                        │  │ visitor#)   │                          │  │
│                        │  └─────┬──────┘                          │  │
│                        │        ▼                                 │  │
│                        │  localStorage / sessionStorage            │  │
│                        └────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

No server tier exists. The only network calls the app makes at runtime are to the app's own static bundle, static JSON/media assets, an embedded YouTube player iframe (FR-015), and an embedded Google Maps iframe (FR-039) — all client-side, none requiring a private key exchange with FandomVerse infrastructure.

## 3. Routing Map

Implemented with `HashRouter` in Phase 1. Top-level category routes use their own SRS-facing slugs (`/anime`, `/gaming`, ...) rather than a single `/category/:categoryId` param, per the Director's Phase 1 route list; a shared `CategoryHub` page component is reused across all seven, parameterized internally by category id, so this is a routing-table choice, not seven separate implementations.

| Route | Page | Key Requirements | Phase 1 Status |
|---|---|---|---|
| `#/` | Cinematic entry → Home | FR-001–004 | Placeholder page |
| `#/anime`, `#/gaming`, `#/movies`, `#/tv-shows`, `#/k-pop`, `#/comics`, `#/manga` | Category Hub (shared component, 7 registered routes) | FR-005–008, FR-012–024 | Placeholder page |
| `#/category/:slug` | Category Hub, generic slug entry point (kept alongside the 7 named routes for forward-compatible/linked navigation, e.g. from search results or the chatbot) | FR-005–008 | Placeholder page |
| `#/article/:id` | Article detail | FR-017–018 | Placeholder page |
| `#/character/:id` | Character detail | FR-019–021 | Placeholder page |
| `#/event/:id` | Event detail | FR-022–024 | Placeholder page |
| `#/product/:id` | Merchandise product detail | FR-027–028 | Placeholder page |
| `#/search` | Global search results | FR-009–011 | Placeholder page |
| `#/trailers` | Cross-category trailers | FR-025–026 | Placeholder page |
| `#/events` | Cross-category event highlights | FR-022–024 | Placeholder page |
| `#/releases` | Upcoming releases calendar | data model in `05_DATA_SCHEMA.md` §9 | Placeholder page |
| `#/merchandise` | Merchandise showcase | FR-027–028 | Placeholder page |
| `#/cart` | Temporary cart (localStorage-persisted, D-005) | FR-029–031 | Placeholder page |
| `#/bookmarks` | Bookmarks + notes + export | FR-035–038 | Placeholder page |
| `#/contact` | Contact Us (map + directions + optional geolocation, D-006) | FR-039 | Placeholder page |
| `#/about` | About Us | FR-040 | Placeholder page |
| `*` (unmatched) | Not Found | — | Implemented |

Chatbot (FR-032–034) is a persistent overlay, not a route. Breadcrumbs (FR-044), header search, visitor counter (FR-041), and clock (FR-042) live in the persistent app shell (`Layout`), not per-page. Every route above renders a real, labeled placeholder page in Phase 1 — never a blank screen — so navigation, breadcrumbs, and back/forward can be verified before feature content exists.

## 3a. Project Structure (Director-specified, D-009)

```
src/
  app/          — root App component, providers, router wiring
  components/   — shared/reusable UI primitives (Header, Footer, Breadcrumb, ErrorBoundary, LoadingState, EmptyState, NotFound, etc.)
  data/         — static JSON content + typed loaders (empty/seed-only in Phase 1)
  features/     — cross-cutting feature logic that isn't a single reusable component or a route page (search index, chatbot engine — added in later phases)
  hooks/        — shared hooks (usePrefersReducedMotion, useVisitorCounter, useClock, ...)
  layouts/       — page shell layouts (RootLayout wrapping Header/Breadcrumb/main/Footer/ChatbotLauncher)
  pages/        — one file per route, thin — composes layouts/components/features
  routes/        — route table / route config (kept separate from `app/` so the route list is easy to audit against `01_SRS_REQUIREMENTS.md`)
  stores/        — Zustand stores (cartStore, bookmarksStore, chatbotStore, uiStore)
  styles/        — design tokens, global CSS, resets
  types/         — TypeScript domain types from `05_DATA_SCHEMA.md`
  utils/         — small pure helpers (storage helpers, formatters)
```

## 4. Feature Modules

- **Home module** — hero, category grid, featured showcase.
- **CategoryHub module** — catalog, filter, sort; composes Gallery, Media, Articles, Characters, Events sub-sections/sub-routes for that category.
- **Search module** — client-side index built once from all JSON datasets at startup (e.g., a flattened searchable array); filter-by-category/type layered on top of a simple string-match/fuzzy-match function. No server round-trip (FR-011).
- **Gallery component** — lightbox/carousel, reusable across all 7 categories.
- **Media module** — video/audio embeds with filter by type.
- **Articles module** — card + detail view, "related content" resolved by shared tags/category.
- **Characters module** — profile cards + detail, filter by category/franchise.
- **Events module** — event cards + detail, past/upcoming split by comparing `date` to current time.
- **Trailers module** — cross-category aggregation view over the same media dataset, filtered to `type: trailer`.
- **Merchandise + Cart module** — product cards/detail; cart is a Zustand store (`items`, `addItem`, `removeItem`, `total` selector) persisted to `localStorage` under `fandomverse.cart.v1` via Zustand's `persist` middleware (D-005); no checkout route exists by design (FR-031); UI copy near the cart always makes clear it is a temporary, browser-local list, not a real order.
- **Chatbot module** — floating widget; rule engine matches user input (typed or quick-reply) against a JSON dataset of `{ id, patterns[], response, links[], recommendCategory? }` entries; falls back to a default "I didn't understand" response with quick-reply suggestions. Entirely local, no network call (FR-033/CR-003).
- **Bookmarks module** — `localStorage`-backed store of bookmarked content refs (type + id); notes keyed by bookmark id in `sessionStorage`; export serializes the current bookmark list to a downloadable text/JSON file.
- **Contact / About pages** — static content pages. Contact Us (D-006) embeds a Google Maps `output=embed` iframe (no API key) as the base map; provides a "Get Directions" link that opens `https://www.google.com/maps/dir/?api=1&destination=...` in a new tab; optionally offers a user-initiated "Directions from my location" button that calls `navigator.geolocation.getCurrentPosition` only on click (never automatically), uses the result solely to build a from/to directions link, and never transmits or stores the coordinate anywhere (no backend exists to receive it). If geolocation is denied, unavailable, or the browser lacks support, the button is hidden/disabled with a short explanatory note and the map + manual directions link continue to work fully — geolocation is strictly a progressive enhancement.
- **UI shell features** — VisitorCounter (`localStorage` counter, incremented once per new session), Clock (interval-updated `Date`), Breadcrumb (derived from route match data), dummy Login/Signup (a modal form that only sets a local "logged in (demo)" UI state — no real auth, no persisted identity beyond the current session if at all).

## 5. Data Flow

1. Build time: JSON files under `src/data/` (`categories.json`, `articles.json`, `media.json`, `characters.json`, `events.json`, `merchandise.json`, `chatbot.json`) are statically imported and typed via TypeScript interfaces (`05_DATA_SCHEMA.md`).
2. App startup: data is composed into in-memory indexes (by category, by tag, a flattened search index) once, held in a data context or module-level constant — never mutated.
3. User interaction (filter/sort/search/bookmark/cart/chatbot) only ever derives *new views* over that immutable data plus mutable *app state* (Zustand stores), which is what gets written to `localStorage`/`sessionStorage`.
4. Nothing is ever written back into the JSON source files (CR-001) — this is enforced by construction (JSON is imported as read-only data, never targeted by a write API since none exists).

## 6. Error / Empty / Loading States

- **Loading**: since data is bundled (no network fetch for content), "loading" is effectively synchronous; only heavy media (images, video iframes, 3D assets) show skeleton/placeholder states while they load.
- **Empty states**: search with no matches, a filter combination with zero results, an empty cart, an empty bookmark list — each has a dedicated empty-state message, not a blank screen.
- **Error handling**: a top-level React error boundary catches render errors and shows a recoverable fallback (never a blank white screen); WebGL context-loss in the cinematic layer falls back to a static hero (see `09_TEST_STRATEGY.md` WebGL fallback tests).

## 7. Responsive Behavior

Defined fully in `04_DESIGN_SYSTEM.md`; architecturally, layout components (`Grid`, `CardList`, `Nav`) are breakpoint-aware via CSS rather than JS-computed layout, keeping responsive behavior declarative and testable with Playwright viewport presets.

## 8. Reduced Motion

A `usePrefersReducedMotion` hook gates: the cinematic Three.js entry sequence (swap to a static/minimal-motion hero), CSS transition durations (shortened/removed), and autoplay behavior on carousels/galleries.

## 9. Open Items Resolved at Phase 1 (previously listed here as open)

- **Cart persistence** — resolved: `localStorage`, per Director instruction (D-005).
- **Contact/Maps architecture** — resolved: embed + directions link + optional user-initiated geolocation with graceful fallback (D-006).
- **Performance baseline** — resolved: fixed measurement categories (not numeric targets yet) tracked from Phase 1, see `09_TEST_STRATEGY.md` §9 and D-008.

## 9a. Phase 1 Implementation Status

All sections above are now implemented, not just proposed: the Vite+React+TS scaffold exists, `HashRouter`/`createHashRouter` routing covers every route in §3 with a real placeholder page (never blank), the app shell (§2) is built as `RootLayout` + `Header`/`Footer`/`Breadcrumb`/`ChatbotLauncher`/`DummyAuthModal`, all Zustand stores in §4 exist with the correct persistence boundaries, error/empty/loading states (§6) are reusable components, and the cinematic entry's progressive-enhancement wiring (§8) lazy-loads a minimal placeholder R3F scene behind WebGL/reduced-motion detection with context-loss fallback. Full feature logic (search index, real chatbot rules, full content catalogs) remains out of scope until the phases that own them.

## 10. Remaining Open Items

- Confirm final choice of `HashRouter` vs. `BrowserRouter` + static-host redirect rules once the target deployment host is chosen (Phase 15) — `HashRouter` is the Phase 1 implementation and works without further configuration regardless of host.
- Confirm whether the dummy Login/Signup state should persist via `sessionStorage` (survives reload) or be purely in-memory (resets on reload) — Phase 1 implements it as in-memory (simplest, least likely to be mistaken for real auth persistence); revisit if the Director prefers `sessionStorage` for a more convincing demo.
