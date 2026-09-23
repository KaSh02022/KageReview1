# 09 — Test Strategy

Defines how every requirement in `01_SRS_REQUIREMENTS.md` gets verified. No phase is reported complete without running the tests in scope for that phase (`00_PROJECT_CONSTITUTION.md` §12).

## 1. Test Types & Tooling

| Type | Tooling | Scope |
|---|---|---|
| Unit tests | Vitest + React Testing Library | Individual components/hooks/utility functions (filter logic, sort logic, search index, chatbot rule matcher, cart total calculation) |
| Integration tests | Vitest + React Testing Library | Feature modules composed together (e.g., CategoryHub filter+sort+catalog rendering; Bookmarks add/note/export flow) |
| Data-integrity tests | Vitest (schema/shape assertions over `src/data/*.json`) | Minimum-quantity checks (≥5 characters/category, ≥3 events/category), required-field presence, unique IDs, valid cross-references (`relatedIds`, chatbot `linkTo`) |
| Browser / E2E tests | Playwright | Full user flows across real browser engines: navigate categories, search, filter/sort, add to cart, bookmark + note + export, chatbot conversation, dummy login/signup |
| Responsive tests | Playwright viewport presets (mobile/tablet/desktop/wide, per `04_DESIGN_SYSTEM.md` breakpoints) | No horizontal scroll, no overlapping/clipped UI, nav collapses correctly, filter/sort drawer works on mobile |
| Accessibility tests | `@axe-core/playwright` automated scan + manual keyboard-only walkthrough | No critical/serious axe violations; full keyboard operability; screen-reader landmark/heading sanity check |
| Performance tests | Lighthouse CI (Performance, Accessibility, Best Practices, SEO categories, explicitly named in SRS p.15) | Load time, bundle size, smooth route transitions with media-rich content |
| WebGL fallback tests | Manual + Playwright (force WebGL context loss / disable WebGL) | Cinematic entry degrades to static hero without breaking navigation into the app |
| Reduced-motion tests | Playwright with `prefers-reduced-motion: reduce` emulation | Cinematic sequence and major transitions shorten/disable correctly; no forced autoplay |
| SRS acceptance tests | Manual checklist walkthrough against `01_SRS_REQUIREMENTS.md`, executed at Phase 14 | Every requirement row's Acceptance Criteria is checked off with evidence |

## 2. Test ID Convention

Every requirement ID in `01_SRS_REQUIREMENTS.md` has one Test ID of the form `T-<Requirement ID>` (e.g., `FR-019` → `T-FR-019`). A single Test ID may be backed by multiple actual test cases across the types above (e.g., `T-FR-019` = a data-integrity unit test for the ≥5-per-category count *and* an E2E test that the character list actually renders 5+ cards per hub). This keeps every SRS line traceable to at least one concrete, runnable check without inventing a second ID scheme.

## 3. Browser Compatibility Matrix (NFR-008)

| Browser | Priority | Notes |
|---|---|---|
| Chrome (latest) | Primary | Primary dev/test target |
| Edge (latest, Chromium-based) | Primary | Windows-default browser in this environment |
| Firefox (latest) | Primary | Playwright-supported |
| Safari (latest) | Secondary | Verified via Playwright WebKit engine as a proxy if a real macOS/iOS device isn't available; flagged as an assumption if untested on real Safari |

## 4. WebGL Context Loss Handling

The cinematic layer must listen for the `webglcontextlost` event and fall back to a static, non-3D hero without crashing the app shell or blocking navigation — tested by manually forcing context loss (e.g., via `WEBGL_lose_context` extension) in a Playwright/manual test during Phase 4/13.

## 5. Keyboard Navigation Checklist

- Tab order follows visual/logical order through header → breadcrumb → main content → footer.
- All interactive elements (nav links, filters, sort, cards, lightbox controls, chatbot input/send, cart add/remove, bookmark toggle, login/signup modal fields) are reachable and operable via keyboard alone.
- Modals/dialogs (chatbot, lightbox, login/signup) trap focus while open and restore focus to the trigger element on close; `Escape` closes them.
- No keyboard trap exists anywhere outside an intentional modal focus trap.

## 6. Data-Integrity Test Cases (explicit, high-value)

- Every `categoryId` referenced anywhere resolves to one of the 7 valid categories.
- Every category has ≥5 `Character` entries (FR-019) and ≥3 `EventItem` entries (FR-022).
- Every `AssetRef` has non-empty `alt` (unless explicitly marked decorative).
- Every `id` is unique within its collection.
- Every cross-reference (`Article.relatedIds`, `ChatbotRule.linkTo`) resolves to an existing entry — no dangling references.

## 7. Test Data

Test data is the same static JSON dataset used by the app (per SRS p.17 "Test Data Used in the Project" deliverable) — since there is no backend/mocked API layer, unit/integration tests import fixtures derived from (or identical to) `src/data/*.json`, keeping test data and real content in sync rather than maintaining a parallel mock dataset that could drift.

## 8. Phase-Gate Test Requirements

| Phase | Minimum tests run before STOP |
|---|---|
| 1 (architecture/foundation) | Build succeeds, lint/typecheck clean, empty-shell smoke test |
| 2 (design system) | Visual token contrast checks, component Storybook/isolated render smoke tests (if a component catalog is set up) |
| 3 (app shell/routing) | Route navigation unit/E2E tests, breadcrumb correctness |
| 4 (cinematic/WebGL) | WebGL fallback test, reduced-motion test, performance smoke check |
| 5 (7 category hubs) | Data-integrity tests, hub render tests for all 7 categories |
| 6 (content/search/filter/sort) | Search/filter/sort unit + integration tests |
| 7 (media/galleries/trailers/events) | Gallery/lightbox, media filter, trailers, events E2E tests |
| 8 (characters/releases) | Character/franchise filter tests, releases data tests |
| 9 (merchandise/cart) | Cart add/remove/total unit tests, no-checkout-route assertion |
| 10 (bookmarks/notes/export) | Bookmark persistence, session-note, export E2E tests |
| 11 (chatbot) | Chatbot rule-matching unit tests, quick-reply/link E2E test, no-network-call assertion |
| 12 (responsive/mobile/a11y) | Full responsive matrix, axe scan, keyboard walkthrough |
| 13 (performance) | Lighthouse CI run against target thresholds |
| 14 (QA/SRS audit) | Full SRS acceptance checklist across all 76 requirement rows |
| 15 (documentation/submission) | Final doc completeness check, installation-instructions dry run, demo video coverage check against FR list |

## 9. Performance Baseline — Measurement Categories (D-008)

Per Director instruction: Phase 1 establishes *what gets measured*, not final numeric targets — inventing precise thresholds before a real build/Lighthouse run exists would be fabricated data. Each category below gets a real baseline measurement starting in Phase 1 (via `npm run build` output + a manual Lighthouse pass on the scaffold) and a tuned numeric target confirmed in Phase 13 once real content/3D assets exist.

| Category | What it measures | How it's measured | Status |
|---|---|---|---|
| Initial document load | Time to first byte / first contentful paint of the base HTML+shell | Lighthouse, browser DevTools Network/Performance panel | Phase 1–3: FCP 2.3s, LCP ~3.0–3.1s. **Phase 4 (2026-09-27):** FCP 2.3s, LCP 3.0s — stable |
| JS bundle size | Total and per-route JS shipped to the client | `vite build` output stats | Phase 3: 364.46 kB (113.28 kB gzip). **Phase 4: 367.26 kB (114.10 kB gzip)** — +2.8 kB for the Fandom Core's shared data/hooks (`fandomCoreNodes.ts`, `useCategoryAccentColors.ts`, `computeParallaxRotation.ts`, `useIsMobileViewport.ts`) that live in the main bundle; the scene itself stays in the lazy chunk |
| CSS size | Total CSS shipped | `vite build` output stats | Phase 3: 22.33 kB. **Phase 4: 24.76 kB (5.84 kB gzip)** — `FandomCoreOverlay`/`FandomCoreFallback`/`CinematicEntry` styles |
| Image payload | Total image bytes per representative page | Lighthouse "resource summary", manual audit | Still not applicable — the Fandom Core is procedural (no textures/images, D-033); tracked from Phase 5+ |
| Media payload | Video/audio embed weight (embeds only, not self-hosted, per `06_ASSET_BIBLE.md`) | Manual audit of embed strategy | Tracked from Phase 7 |
| Cinematic lazy chunk size | Size of the Three.js/R3F chunk, confirmed separate from the main bundle | `vite build` output stats | Phase 1–3: 907.51 kB (240.27 kB gzip, placeholder scene). **Phase 4: 912.41 kB (242.07 kB gzip)** — +4.9 kB for the real Fandom Core scene (Core/fragments/ring/starfield/parallax) replacing the placeholder rotating icosahedron; still never loaded outside the Home route |
| WebGL initialization cost | Time from cinematic route mount to first rendered frame; fallback trigger latency | Manual profiling + Playwright timing assertions | **Phase 4: functionally verified** — `e2e/fandom-core.spec.ts` confirms the canvas becomes visible within 10s (typically <1s in practice) when WebGL is supported, and confirms the fallback renders immediately (no loading gap) when it isn't. Frame-level timing instrumentation remains Phase 13 scope |
| Route transition responsiveness | Time between navigation trigger and new route's main content painted | React Profiler / Performance API marks | Unchanged this phase — see Phase 3 entry |
| Lighthouse Performance | Overall Lighthouse Performance score | Lighthouse (`npx lighthouse`, desktop/unthrottled local preview server — not yet the mobile-throttled profile) | Phase 3: 76/100. **Phase 4: 68/100** — a real, expected drop: the Home page now runs a continuous WebGL render loop (Core rotation, fragment bob, starfield, camera parallax damping) during the Lighthouse trace, which Phase 1–3's placeholder scene never did. Flagged for Phase 13, not addressed now (Director's explicit "do not optimize prematurely") |
| Lighthouse Accessibility | Overall Lighthouse Accessibility score | Lighthouse | Phase 3: 100/100. **Phase 4: 100/100** — held steady despite the new canvas + 7 overlay links |
| Lighthouse Best Practices | Overall Lighthouse Best Practices score | Lighthouse | Phase 3: 100/100. **Phase 4: 100/100** |
| Lighthouse SEO | Overall Lighthouse SEO score | Lighthouse | Phase 3: 100/100. **Phase 4: 100/100** |
| Long tasks | Count/duration of main-thread tasks >50ms | Chrome DevTools Performance panel / Performance API `longtask` entries | Total Blocking Time as a proxy — Phase 3: 610ms. **Phase 4: 1,140ms** — directly attributable to the active WebGL render loop during the trace window (see Performance note above); a concrete Phase 13 candidate (e.g. `frameloop="demand"` when the tab/section isn't visible, or reducing per-frame work) |
| Layout shift | Cumulative Layout Shift (CLS) | Lighthouse / Performance API `layout-shift` entries | Phase 3: 0. **Phase 4: 0** — held steady; the Fandom Core's fixed-height hero container (`CinematicEntry.module.css` `.hero`) reserves its footprint before the canvas or fallback paints, the same anti-CLS pattern established in Phase 1 (D-011) |
| Mobile behavior | Functional + performance check specifically on emulated/real mobile viewports and throttled network/CPU | Lighthouse mobile profile, Playwright mobile viewport emulation | **Phase 4: real mobile-specific guardrails added** — starfield count (500→250), parallax strength (0.18→0.08 rad), and DPR cap (1.5→1.25) all reduced on the canonical mobile tier (`useIsMobileViewport`); verified visually via required screenshot QA at 375×812/390×844/768×1024, and functionally via `mobile-chrome` E2E runs. A genuine Lighthouse mobile-throttled score remains deferred to Phase 13 |

**Phase 4 baseline summary (explicitly recorded per the Director's Phase 4 §13/§23, alongside the Phase 1–3 baselines it must not overwrite):**

| | Phase 3 | Phase 4 |
|---|---|---|
| Performance | 76 | 68 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |
| CLS | 0 | 0 |
| TBT | 610ms | 1,140ms |
| Main JS | 364.46 kB (113.28 kB gzip) | 367.26 kB (114.10 kB gzip) |
| CSS | 22.33 kB (5.35 kB gzip) | 24.76 kB (5.84 kB gzip) |
| Cinematic lazy chunk | 907.51 kB (240.27 kB gzip, placeholder) | 912.41 kB (242.07 kB gzip, real scene) |

Performance optimization remains explicitly out of scope for Phase 4 — reserved for Phase 13, per the Director's repeated instruction, and explicitly restated in the Phase 4 brief ("Phase 4 is NOT final performance optimization... do NOT optimize by destroying visual quality prematurely"). The Performance-score/TBT movement this phase is the expected, honest cost of replacing a placeholder scene with the real, continuously-animated Fandom Core — not a regression introduced by carelessness, and not smoothed over: it is the first phase where the app does real, ongoing WebGL rendering work, so a real performance cost was always going to appear the moment that happened. Two concrete Phase 13 candidates are noted in the table above for when that phase begins.

Numeric targets (e.g., "Performance ≥ 85") remain deliberately unset as committed thresholds until Phase 13. Every number above is reported as-measured, not smoothed or rounded up.

## 10. Phase 3 Architecture & Shell Audit

Audit performed against the running application (not just the source), per the Director's Phase 3 §1 checklist.

| Area | Current State | SRS Requirement | Status | Action |
|---|---|---|---|---|
| Routing architecture | `createHashRouter` (data router), 23 canonical route patterns, `02_PRODUCT_ARCHITECTURE.md` §3 | SPA routing, no backend (CR-004) | ✅ Matches | None |
| Root layout | `RootLayout` wraps every route: skip link, header, breadcrumb, main, footer, chatbot launcher, dummy-auth modal | Persistent shell (SRS p.6) | ✅ Matches | None |
| Header | Desktop inline nav / mobile+tablet Drawer at the canonical breakpoint, search, counters, auth trigger | Nav, search reachable everywhere (SRS p.6) | ✅ Matches (D-023 overflow fix verified holding) | None |
| Footer | Nav links (About/Contact/Bookmarks), copyright, AI/license note | Reachable info pages | ✅ Matches | None |
| Breadcrumb | `useMatches()`-derived, hidden on Home (1 crumb), truncates on mobile | Breadcrumb nav (FR-044) | ✅ Matches | None |
| ErrorBoundary | Render-time class boundary wrapping `<Outlet>`, uses `ErrorState` primitive | Recoverable fallback, never blank | ✅ Matches | None |
| Global search entry | `GlobalSearchBar` (header) → `SearchInput` primitive → `/search?q=` | Global search bar (FR-009) | ✅ Matches | None |
| Chatbot launcher | Floating `IconButton` → `Dialog` (Phase 11 owns the rule engine) | Floating launcher (FR-004) | ✅ Matches (shell only) | None |
| Dummy auth entry | Header `Button` → `Dialog` with UI-only form | UI-only Login/Signup (FR-045) | ✅ Matches | Persistence formally resolved: in-memory (D-025) |
| Loading states | `LoadingState` (spinner) + `Skeleton` primitive | — | ✅ Exists | None |
| Error states | `ErrorState` primitive, used by `ErrorBoundary`, `NotFoundPage`, `RouteErrorFallback` | — | ✅ Exists, now consistent | Hardened this phase (was inline-styled) |
| Empty states | `EmptyState` component, used across Cart/Bookmarks/Search/etc. | — | ✅ Exists | None |
| Route-level Suspense/lazy | None — all pages in one bundle; only the cinematic R3F layer is lazy | — (not an SRS requirement) | ⚠️ Not implemented | Deferred to Phase 13 (D-028) |
| 404 handling | Wildcard `*` route → `NotFoundPage` (now on `ErrorState`), own document title | Deterministic 404 | ✅ Matches | None |
| Navigation state | `NavLink` `aria-current="page"` on active links | — | ✅ Matches | None |
| Scroll restoration | None existed pre-Phase-3 | — (general SPA UX expectation) | ⚠️ Was missing | **Fixed** (D-027, `useRouteTransitionEffects`) |
| Focus on route transition | None existed pre-Phase-3 | Accessible navigation (NFR-002) | ⚠️ Was missing | **Fixed** (D-027) |
| Mobile navigation drawer | `Drawer` primitive, closes on link click and Escape | Mobile menu (SRS p.6) | ✅ Matches | None |
| Desktop navigation | Inline bar, `aria-current` active state | — | ✅ Matches | None |
| Skip link | First focusable element, `<a href="#main-content">` | Accessible navigation | ✅ Matches | None |
| Global a11y semantics | Landmarks (`header`/`nav`/`main`/`footer`), `lang="en"`, heading hierarchy | NFR-002 | ✅ Matches | None |
| Document title per route | None existed pre-Phase-3 (static `index.html` title everywhere) | — (usability/SEO-adjacent) | ⚠️ Was missing | **Fixed** (D-026, `DocumentTitle`) |
| Dialog/Drawer background inertness | Portaled to `document.body` (sibling of `#root`); `aria-hidden` applied to `#root` only | Accessible dialogs | ✅ Verified correct via real DOM inspection | None (see §12 below) |

## 11. Route + Shell Regression Test Matrix (Phase 3)

Representative routes, not one row per identical page — every route shares the same shell (Header/Footer/Breadcrumb/DocumentTitle), so the shell-level checks below apply uniformly once verified on a representative sample; content-specific checks (data rendering) are covered per-route in `src/app/App.test.tsx`.

| Route | Desktop | Tablet | Mobile | Keyboard | Console | Network | Page Title | Breadcrumb | Expected Result |
|---|---|---|---|---|---|---|---|---|---|
| `/` (Home) | ✅ | ✅ | ✅ | ✅ | ✅ clean | ✅ clean | `FandomVerse — Portal for Fandom World` | Hidden (1 crumb) | Cinematic hero + category grid, no overflow |
| `/anime` (category hub) | ✅ | ✅ | ✅ | ✅ | ✅ clean | ✅ clean | `FandomVerse — Anime` | `Home / Anime` | Seed content sections render |
| `/article/:id` (detail) | ✅ | — | — | ✅ | ✅ clean | ✅ clean | `FandomVerse — Article` | `Home / Article` | Article + bookmark toggle |
| `/search` | ✅ | — | — | ✅ | ✅ clean | ✅ clean | `FandomVerse — Search` | `Home / Search` | Query preserved on deep link/reload |
| `/cart` | ✅ | ✅ | ✅ | ✅ | ✅ clean | ✅ clean | `FandomVerse — Cart` | `Home / Cart` | Persists via localStorage (D-005) |
| `/bookmarks` | ✅ | ✅ | ✅ | ✅ | ✅ clean | ✅ clean | `FandomVerse — Bookmarks` | `Home / Bookmarks` | Favorites + session notes |
| `/contact` | ✅ | ✅ | ✅ | ✅ | ✅ clean | ✅ clean | `FandomVerse — Contact Us` | `Home / Contact Us` | Map + directions (D-006) |
| `/this-does-not-exist` (404) | ✅ | — | — | ✅ | ✅ clean | ✅ clean | `FandomVerse — Page Not Found` | `Home / Not Found` | Deterministic `ErrorState`, "Return home" link |

Legend: ✅ = covered and passing (`e2e/navigation.spec.ts`, `e2e/responsive.spec.ts`, `e2e/deep-links.spec.ts`, `e2e/keyboard-walkthrough.spec.ts`, `e2e/console-audit.spec.ts`, `src/app/RouteTransitions.test.tsx`); `—` = not independently re-verified for this route since it shares the identical shell already verified on the representative rows (no route-specific risk identified). All 23 canonical routes are covered by `e2e/deep-links.spec.ts` (direct navigation + reload) and `e2e/console-audit.spec.ts` (console/network) individually, even though this matrix only tables a representative subset.

## 12. Dialog/Drawer Accessibility Verification (Phase 3, required)

Verified via **real DOM inspection**, not just source-reading (`e2e/dialog-architecture.spec.ts`):

- Both `Dialog` and `Drawer` render via `createPortal(..., document.body)` — confirmed the resulting DOM node is a **sibling** of `#root`, not a descendant (`root.contains(dialog) === false`).
- `useFocusTrap` sets `aria-hidden="true"` on `#root` specifically while any dialog/drawer is open — confirmed via `document.getElementById('root').getAttribute('aria-hidden') === 'true'`.
- Confirmed the dialog itself has **no** `aria-hidden="true"` ancestor (`dialog.closest('[aria-hidden="true"]') === null`) — i.e., hiding the background does not accidentally hide the dialog, which would be the defect this check exists to catch.
- Confirmed `aria-hidden` is removed from `#root` again after the dialog closes (module-level open-dialog counter in `useFocusTrap`, so sequential dialogs don't fight over the attribute).
- Focus trap (Tab/Shift+Tab cycling), initial focus, Escape-to-close, and focus restoration were already covered by `Dialog.test.tsx`/`ChatbotLauncher.test.tsx` (Phase 2) and re-verified this phase via the real keyboard walkthrough (`e2e/keyboard-walkthrough.spec.ts`).
- Accessible name: `aria-labelledby` → dialog title (`h2`); accessible description: `aria-describedby` → optional description paragraph, only wired when a description is actually passed.
- Nested/sequential interaction: the open-dialog counter handles the case of one dialog closing while another remains open without prematurely un-hiding the background (though no current UI opens two simultaneously).
- Reduced motion: `Dialog`/`Drawer` entrance animations use the token-driven `--duration-normal`, which zeroes under `prefers-reduced-motion: reduce` at the token layer.

## 13. Fandom Core Test Coverage (Phase 4)

**Unit** (`src/features/universe/*.test.ts(x)`, all in jsdom — WebGL is unavailable there by construction, so these cover the logic layer, not GPU rendering):
- `fandomCoreNodes.test.ts` — 7 nodes exist, each maps to a real `CATEGORY_ROUTES` entry (navigation mapping), angles are distinct and evenly spaced, accent variables match the design-token naming convention, labels match the shared route list exactly.
- `computeParallaxRotation.test.ts` — the pure camera-parallax function (Director's "camera behavior where practical"): zero rotation under reduced motion, deterministic output for a centered pointer, correct desktop/mobile strength scaling, and a bound-check across the full `[-1, 1]` pointer input range confirming rotation is never unbounded ("no uncontrolled camera movement").
- `FandomCoreOverlay.test.tsx` — all 7 links render with correct `aria-label`/`href`, are reachable via `Tab`, and report hover state via both mouse (`hover`/`unhover`) and keyboard (`focus`/`blur`) — hover/selected state must be keyboard-reachable, not mouse-only.
- `FandomCoreFallback.test.tsx` — renders with no canvas dependency, still exposes all 7 category links (the fallback must never lose navigation).
- `CinematicEntry.test.tsx` — the `h1` renders unconditionally; in jsdom (WebGL always unavailable) the fallback path renders with 7 links and no canvas; a dedicated case forces the reduced-motion media query to confirm that path independently; the skip-intro control moves focus to a stand-in target.

**E2E** (`e2e/fandom-core.spec.ts`, real browsers): Home loads with the Fandom Core visible; the WebGL canvas becomes visible when supported; the 2D fallback renders (with all 7 links) when WebGL is force-disabled via a `canvas.getContext` override; the same under `prefers-reduced-motion: reduce`; all 7 category controls have correct `href`s; pointer/tap activation navigates; keyboard (Tab+Enter) activation navigates; the skip-intro control works without leaving the page; zero console errors and zero unexpected failed requests while the canvas is active (covers pointer-move/hover interaction, not just a static load). Run across chromium/firefox/webkit/mobile-chrome via the standard project matrix.

**A real bug found via this testing, not by inspection (D-032):** writing `e2e/fandom-core.spec.ts`'s skip-intro test surfaced that the *existing* `SkipLink` (present since Phase 1) had the same defect — a plain `href="#id"` anchor, when followed natively in a `HashRouter` app, corrupts the router's hash-based route state and silently replaces the page with Not Found. Fixed in both places; regression tests added to both `e2e/accessibility.spec.ts` (non-root-route case, the general pattern) and `e2e/fandom-core.spec.ts` (the Fandom Core's own skip control).

**Visual QA (required, not screenshot-diff-based per the Director's instruction):** manually reviewed real screenshots at 1440×900, 1024×768, 768×1024, 390×844, and 375×812, plus hover-state, focus-state, and reduced-motion states. Found and fixed one real defect (D-035): the 3D category fragments and the HTML overlay's nodes were both drawn at nearly the same radius, producing two visibly separate, misaligned rings of seven marks — invisible to every automated check (typecheck/lint/unit/E2E/axe all passed throughout), only visible in an actual rendered screenshot.
