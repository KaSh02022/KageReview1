# 02 — Product Architecture

Defines how FandomVerse is built to satisfy `01_SRS_REQUIREMENTS.md` under the constraints in `00_PROJECT_CONSTITUTION.md`. Updated at the end of Phase 1 to reflect what was actually scaffolded, and again at the end of Phase 2 with the design-system layer and the confirmed dependency baseline (Director-approved, see `11_DECISION_LOG.md`). Full feature implementation (content population, chatbot logic, cinematic layer) remains scoped to later phases per `10_IMPLEMENTATION_PLAN.md`.

## 1. Stack Decision (see D-001–D-003, D-020 in `11_DECISION_LOG.md`)

| Concern | Choice | Why |
|---|---|---|
| Framework | **React 19.2 — confirmed, not provisional (D-020)** | SRS explicitly allows ReactJS (p.16); Master Directive assigns React to Claude; TypeScript catches data-shape errors across ~76 JSON-driven requirements. Latest-stable was taken over the Phase 0 draft's "React 18" (D-010); Phase 2 formally re-verified compatibility across the whole dependency graph (R3F/drei, React Router, Zustand, Testing Library, Playwright) with zero React-version-related warnings across 45 unit + 40+ E2E tests (D-020). |
| Build tool | Vite | Fast dev server, zero-backend static build output, first-class React+TS template, code-splitting out of the box. |
| Routing | React Router 7 (`HashRouter`/`createHashRouter`, data router) | SPA routing (CR-004) without requiring server rewrite rules — works on any static host or even `file://` for demo/offline review. The data-router form specifically enables `useMatches()`-driven breadcrumbs (§14). |
| 3D layer | Three.js via React Three Fiber + drei, lazy-loaded | Declarative Three.js scene composition inside React; only mounted on the landing/"Fandom Universe" route, and confirmed as a separate ~900KB chunk never loaded on other routes. |
| Global state | Zustand 5 (with `persist` middleware) | Minimal-boilerplate store for cart, bookmarks, notes, chatbot session, UI state; `persist` middleware maps cleanly to localStorage/sessionStorage per FR-036/FR-037. |
| Styling | CSS Modules + design tokens + a shared component primitive library (`src/components/ui/`) | Avoids "ready-made template" risk (AI-002); full control over the original visual language in `04_DESIGN_SYSTEM.md`. Phase 2 added the primitive library (Button, Card, Dialog, Drawer, Form controls, layout primitives) so every feature composes from the same visual/accessible building blocks instead of hand-rolling CSS per component. |
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

## 3. Canonical Route Inventory (D-019)

Implemented with `HashRouter`/`createHashRouter` (a data router, so `useMatches()` can drive the breadcrumb — see §14). Top-level category routes use their own SRS-facing slugs (`/anime`, `/gaming`, ...) rather than a single `/category/:categoryId` param, per the Director's Phase 1 route list; a shared `CategoryHub` page component is reused across all seven, parameterized internally by category id, so this is a routing-table choice, not seven separate implementations.

**Reconciliation note (D-019):** the Phase 1 completion report said the console/network audit covered "21 primary + detail routes" — that count was correct *for that specific audit's scope* (it intentionally excluded the generic `/category/:slug` alias, redundant with the 7 named category routes for a same-page audit, and the `*` Not Found route, which isn't "content"). The table below is the full, canonical inventory: **23 distinct route patterns**. All future reports should cite this table, not re-derive a count.

Every route in this app is public — FandomVerse has no real authentication (dummy Login/Signup is UI-only, FR-045) and therefore no route is gated by login state.

| # | Route | Page / Component | Route Type | Key Requirements | Test Coverage | Status |
|---|---|---|---|---|---|---|
| 1 | `#/` | `RootLayout` (persistent shell) | Layout (wraps all routes below) | — | `e2e/navigation.spec.ts`, `e2e/accessibility.spec.ts`, `src/app/App.test.tsx` | Implemented |
| 2 | `#/` (index) | `HomePage` | Landing | FR-001–004 | `src/app/App.test.tsx`, `e2e/navigation.spec.ts`, `e2e/responsive.spec.ts` | Placeholder content, real routing/shell |
| 3–9 | `#/anime`, `#/gaming`, `#/movies`, `#/tv-shows`, `#/k-pop`, `#/comics`, `#/manga` | `CategoryHubPage` (shared component, 7 registered routes) | Category hub (named) | FR-005–008, FR-012–024 | `src/app/App.test.tsx`, `e2e/navigation.spec.ts`, `e2e/responsive.spec.ts` | Placeholder content, real routing |
| 10 | `#/category/:slug` | `CategoryHubPage` (generic entry) | Category hub (generic) | FR-005–008 | `src/app/App.test.tsx` | Placeholder content, real routing |
| 11 | `#/article/:id` | `ArticleDetailPage` | Detail | FR-017–018 | `src/app/App.test.tsx`, `e2e/persistence.spec.ts` (bookmark flow) | Real seed-data render, not full feature |
| 12 | `#/character/:id` | `CharacterDetailPage` | Detail | FR-019–021 | `src/app/App.test.tsx` | Real seed-data render, not full feature |
| 13 | `#/event/:id` | `EventDetailPage` | Detail | FR-022–024 | `src/app/App.test.tsx` | Real seed-data render, not full feature |
| 14 | `#/product/:id` | `ProductDetailPage` | Detail | FR-027–028 | `src/app/App.test.tsx`, `e2e/persistence.spec.ts` (cart flow) | Real add-to-cart flow, not full catalog |
| 15 | `#/search` | `SearchPage` | Feature list | FR-009–011 | `src/app/App.test.tsx` | Trivial substring match; full index is Phase 6 |
| 16 | `#/trailers` | `TrailersPage` | Feature list | FR-025–026 | `src/app/App.test.tsx` | Placeholder content, real routing |
| 17 | `#/events` | `EventsPage` | Feature list | FR-022–024 | `src/app/App.test.tsx` | Placeholder content, real routing |
| 18 | `#/releases` | `ReleasesPage` | Feature list | data model in `05_DATA_SCHEMA.md` §9 | `src/app/App.test.tsx` | Placeholder content, real routing |
| 19 | `#/merchandise` | `MerchandisePage` | Feature list | FR-027–028 | `src/app/App.test.tsx` | Placeholder content, real routing |
| 20 | `#/cart` | `CartPage` | Utility (temporary cart, D-005) | FR-029–031 | `src/app/App.test.tsx`, `src/stores/cartStore.test.ts`, `e2e/persistence.spec.ts` | Real, working add/remove/total flow |
| 21 | `#/bookmarks` | `BookmarksPage` | Utility | FR-035–038 | `src/app/App.test.tsx`, `src/stores/bookmarksStore.test.ts`, `src/stores/notesStore.test.ts`, `e2e/persistence.spec.ts` | Real, working bookmark/note/export flow |
| 22 | `#/contact` | `ContactPage` | Utility (map + directions + optional geolocation, D-006) | FR-039 | `src/app/App.test.tsx` | Real map/directions implementation |
| 23 | `#/about` | `AboutPage` | Utility | FR-040 | `src/app/App.test.tsx` | Real static content |
| 24 | `*` (unmatched) | `NotFoundPage` | Not Found | — | `src/app/App.test.tsx`, `e2e/navigation.spec.ts` | Implemented |

(24 rows because row 1 is the layout route itself, not a distinct URL — 23 distinct route *patterns* is the canonical figure cited elsewhere.)

Chatbot (FR-032–034) is a persistent overlay, not a route. Breadcrumbs (FR-044), header search, visitor counter (FR-041), and clock (FR-042) live in the persistent app shell (`RootLayout`), not per-page. Every route above renders a real, labeled page — never a blank screen — so navigation, breadcrumbs, and back/forward are verifiable end-to-end even where feature content is still seed data.

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

## 11. Dummy Authentication (resolved, D-025)

FR-045 requires Login/Signup buttons that are UI-only and perform no real authentication. The Phase 1/2 open item — in-memory vs. `localStorage`-backed state — is resolved: **in-memory only** (`src/stores/uiStore.ts`, no `persist` middleware). Rationale:

- The SRS asks only that the buttons exist and not authenticate anyone (p.14) — nothing requires the "logged in" state to survive a reload.
- Director's Phase 3 instruction explicitly asks for "the simplest architecture consistent with the SRS," and in-memory is strictly simpler than adding a `persist`-backed store key for state that carries no real identity.
- `localStorage` persistence would make the demo state survive a reload and a browser restart — behaviorally indistinguishable from a *real* remembered session to an observer, which risks being mistaken for actual authentication despite the UI-only disclaimer in the dialog (`DummyAuthModal.module.css`'s `.notice`). In-memory avoids that ambiguity entirely: reloading always returns to a logged-out state, reinforcing that nothing was really "signed in."
- No credentials are ever read from the form fields into state — the email/password inputs are purely presentational (`DummyAuthModal.tsx`'s `handleSubmit` never reads `event.target` values), so there is nothing sensitive to protect or accidentally persist.

No code change was needed — this was already Phase 1's implementation; Phase 3 formally closes the open question rather than changes the behavior.

## 12. Route Transition UX (Phase 3, D-026/D-027)

Two real gaps found in the Phase 3 audit, both fixed via one shared mechanism:

- **Page titles**: every route previously showed the same static `index.html` title. `src/components/DocumentTitle/DocumentTitle.tsx` now sets `document.title` per route from `handle.title` in `src/routes/routes.tsx`, via the same `useMatches()` pattern already proven for `Breadcrumb` — one source of truth, not hand-maintained per page. Convention: `FandomVerse — Portal for Fandom World` on Home, `FandomVerse — <Page>` everywhere else (e.g. `FandomVerse — Anime`, `FandomVerse — Search`, `FandomVerse — Page Not Found`). The router's `errorElement` (`RouteErrorFallback`) replaces the entire root route tree on a render error, so `DocumentTitle` never mounts in that case — it sets its own title directly.
- **Scroll restoration + focus management**: `src/hooks/useRouteTransitionEffects.ts`, used once in `RootLayout`, scrolls to the top and moves focus to `#main-content` on every route change *except* the initial page load (so it doesn't fight the browser's own initial-focus behavior) and *except* same-page query-string changes (e.g. a search query update doesn't reset scroll/focus, only an actual route change does). This closes a real accessibility gap: previously nothing indicated to screen-reader users that navigation had occurred, and scroll position leaked from the previous page.

## 13. Route-Level Code Splitting (audited, deferred — D-028)

The Phase 3 architecture audit (§1) checked for route-level `Suspense`/lazy boundaries: **none exist yet** — all 17 page components are bundled into the single main JS chunk (only the cinematic layer's Three.js/R3F code is lazy-loaded, per Phase 1). This is a deliberate, documented deferral, not an oversight: code-splitting is a performance-optimization technique, and both this phase's and Phase 1's instructions explicitly reserve performance optimization for Phase 13. The current main bundle (363KB / 113KB gzip) doesn't yet warrant the added complexity of restructuring `CategoryHubPage`'s prop-based category selection (currently passed from the route config, which doesn't compose cleanly with React Router's `route.lazy` API) — that refactor is better done once, in Phase 13, alongside the rest of the bundle-size work.

## 14. Page Title Convention

| Route pattern | Title |
|---|---|
| `/` (Home) | `FandomVerse — Portal for Fandom World` |
| `/anime`, `/gaming`, … (7 category hubs) | `FandomVerse — <Category Name>` (e.g. `FandomVerse — Anime`) |
| `/category/:slug` | `FandomVerse — Category` |
| `/article/:id`, `/character/:id`, `/event/:id`, `/product/:id` | `FandomVerse — Article` / `— Character` / `— Event` / `— Product` (generic per-type title; dynamic per-item titles using the actual content name are a Phase 5+ enhancement once real content exists) |
| `/search`, `/trailers`, `/events`, `/merchandise`, `/cart`, `/bookmarks`, `/contact`, `/about` | `FandomVerse — <Page Name>` |
| `/releases` | `FandomVerse — Upcoming Releases` |
| Unmatched route | `FandomVerse — Page Not Found` |
| Render error (`errorElement`) | `FandomVerse — Something Went Wrong` |

## 15. The Fandom Core (Phase 4 cinematic entry, D-031)

`src/features/universe/` implements one original cinematic entry — not seven separate 3D worlds, per the Director's explicit Phase 4 scope. Replaces Phase 1's placeholder `MinimalScene`/`StaticHeroFallback` (removed this phase).

**Layered architecture, always progressive enhancement:**

1. **Heading** (`CinematicEntry.tsx`) — the page's `<h1>FandomVerse</h1>` + tagline render above the visual, never overlaid on it. The orbit's first node sits at exactly top-center by construction (`fandomCoreNodes.ts`'s angle math starts at -90°), so overlaying text risked colliding with a node at some viewport width; heading-above-art sidesteps that entirely and keeps the h1 unconditionally present regardless of which visual path renders underneath.
2. **`FandomCoreFallback`** — the base visual layer, ALWAYS mounted: a CSS radial-gradient glow + a ring + the one real interaction surface (`FandomCoreOverlay`, below). This single component simultaneously serves as the loading state (visible immediately, before any WebGL chunk arrives), the `prefers-reduced-motion: reduce` state, and the no-WebGL state — there is never a moment with nothing to look at or interact with.
3. **`FandomCoreScene`** (lazy-loaded, `~912KB` chunk, confirmed separate from the main bundle in every build) — the real WebGL canvas, layered on top of the fallback only when `useWebglSupport() && !prefersReducedMotion`. Wrapped in `CanvasErrorBoundary`: a runtime error or failed chunk load silently leaves the already-visible 2D fallback as the final result, never a broken canvas or blank page.
4. **`FandomCoreOverlay`** — the seven real, keyboard-reachable category links, positioned in a ring via CSS `cos()`/`sin()` trig functions (not JavaScript/3D-projection math). Rendered exactly once, inside `FandomCoreFallback`, regardless of whether the canvas is present — accessibility never depends on which rendering path is active (D-031).

**Fandom Core visual composition** (`FandomCoreScene.tsx`):
- **Core**: two nested procedural icosahedra (inner solid + outer wireframe, opposite slow rotation) + one point light — the original central focal object, entirely code-generated, no external model.
- **Seven category fragments**: small octahedra at `FRAGMENT_RADIUS` (inner orbit), tinted with each category's existing design-system accent color (read from the live CSS custom property at runtime via `useCategoryAccentColors`, not a second color system), bobbing gently and brightening on hover — atmospheric depth cues, not the interactive layer (D-035).
- **Orbit ring**: a thin torus at `RING_RADIUS` (outer), visually marking the HTML overlay's ring.
- **Starfield**: `@react-three/drei`'s `<Stars>`, bounded to 250 (mobile) / 500 (desktop) points.
- **Camera**: fixed initial position (`[0, 0, 5.5]`, 50° FOV), subtle pointer-parallax rotation of the whole rig via a pure, unit-tested function (`computeParallaxRotation.ts`) — deterministic, bounded (±0.18 rad desktop, ±0.08 rad mobile), zeroed under reduced motion, smoothed with `MathUtils.damp` (never an instant snap).

**Performance guardrails** (Phase 4 §13, not final optimization): DPR capped at `[1, 1.5]` desktop / `[1, 1.25]` mobile; 10 total meshes with low-poly procedural geometry; no post-processing/bloom effect stack (the "glow" is emissive materials + a CSS layer, not `EffectComposer`); no texture loading (nothing to leak on unmount — R3F disposes its own managed geometries/materials); starfield count reduced on mobile; parallax strength reduced on mobile. See `09_TEST_STRATEGY.md` §13 for the measured Phase 4 baseline and Phase 13 follow-up note.

**Kage inspiration boundary**: the orbit/ring/starfield/parallax *technique* is a documented area where Kage-style cinematic entries provided general inspiration (scroll/pointer-driven depth, layered motion) — no Kage code, artwork, textures, models, scene layout, or branding was copied; the Core's geometry, the seven-node concept, the color palette, and the "Fandom Core" narrative are original to this project (Master Directive Kage Reference Policy; `00_PROJECT_CONSTITUTION.md` §11).

**No external/generated assets this phase** — see D-033; `06_ASSET_BIBLE.md` and `08_LICENSES.md` both confirm zero new asset rows.

## 16. Category Hub Architecture (Phase 5)

### One template, seven worlds

All seven hubs are the **same component** — `src/pages/CategoryHubPage.tsx` — mounted once per category route. There is no per-category layout, no per-category stylesheet, and no branching on category id anywhere in the render path. A hub differs from its siblings only in:

1. its accent colour (`Category.accentColor` → the existing `--color-accent-*` token, passed to `Card` as `accent`),
2. its content (everything is a `categoryId` filter over the shared dataset),
3. its hero art and `visualMotif` copy.

This is what makes the "one universe, seven worlds" requirement structural rather than stylistic: adding an eighth category would require a data entry and a route entry, and no new UI code. `CategoryHubPage.test.tsx` asserts this directly by rendering all seven and requiring the identical section set in each.

### Section order

Hero → Start here → Articles → Merchandise → Explore another world.

**Simplified in two passes, both 2026-09-25**
(docs/FANDOMVERSE_KAGE_LANDING_WORKLOG.md). The original nine-section order
was Hero → Featured → Articles → Gallery → Characters → Events → Trailers →
Upcoming Releases → Merchandise → Explore another world.

1. **"Category Hub Visual Simplification"** removed Gallery, Trailers and
   Upcoming Releases; all three rendered only procedural placeholder art
   with no real per-item imagery, and Trailers/Releases duplicated the
   dedicated `/trailers` and `/releases` Explore pages that already exist
   site-wide. Merchandise was restructured to carry real product
   photography (42 assets, 6 per category) and render as the page's visual
   centerpiece: one spotlighted hero item, then the five products in a
   larger grid than the other sections use.
2. **"Category Hub Content Image Integration"** removed Characters and
   Events once Featured (renamed "Start here") and Articles gained real
   dedicated photography (21 assets, 3 per category, under
   `public/assets/generated/content/`) instead of the same procedural
   gradient-circle SVG generator every removed section shared — the extra
   sections were no longer needed to fill the page.

None of the five removed sections' datasets (`galleries.json`, trailer
`media.json` entries, `releases.json`, `characters.json`, `events.json`)
were touched by either pass, and character/event detail pages and routes
still work — only this template's rendering of them changed. Coverage for
those detail pages now lives in `e2e/deep-links.spec.ts` and
`e2e/content-honesty.spec.ts` instead of this hub's own suite.

Each section is a landmark `<section aria-labelledby>` pointing at its `SectionHeader` heading, so the hub is navigable by heading/landmark in a screen reader. Headings run h1 (category) → h2 (section) → h3 (card), with no skipped levels — asserted by an E2E test rather than by inspection, after the first implementation skipped h3 entirely.

### Content resolution

| Concern | Source of truth |
|---|---|
| Which categories exist, and their routes | `src/routes/categoryRoutes.ts` (`CATEGORY_ROUTES`) — unchanged from Phase 4, still the only route registry |
| Category identity/metadata | `src/data/categories.json` → `Category` |
| Everything else | filtered from the shared collections by `categoryId` |

`CATEGORY_ROUTES` and `categories.json` are kept in sync by a validation test (one route per category, one category per route, and `Category.slug === route.path`) rather than by convention — necessary because K-Pop's id (`kpop`) and route path (`k-pop`) legitimately differ. The generic `/category/:slug` route resolves through `getCategoryByIdOrSlug()` so either form works.

### Detail pages

`ArticleDetailPage`, `CharacterDetailPage`, `EventDetailPage` and `ProductDetailPage` share a layout shell (`DetailPage.module.css`) and each provide: category context (accent badge), a "← Back to \<Category\>" link, the item's imagery and metadata, a bookmark/cart action, and resolved related content. Related ids are heterogeneous (an article may relate to characters and events), so they resolve through `resolveRelatedContent()` in `src/data/index.ts`, which maps any id to its `{title, path}` regardless of collection.

Document titles on detail routes come from `useDynamicDocumentTitle()`, which overrides the route-level generic title ("Article") with the item's own name. Route-level `handle.title` still supplies the fallback, so the Phase 3 title architecture is extended, not replaced.

### Fandom Core integration (unchanged)

Phase 4's Fandom Core is untouched. Its seven nodes derive from the same `CATEGORY_ROUTES` registry and remain plain semantic `<a>` links — no category interaction moved into WebGL. An E2E test now clicks each of the seven nodes and asserts it lands on the matching hub.
