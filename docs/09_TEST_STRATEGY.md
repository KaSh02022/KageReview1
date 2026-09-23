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
| Initial document load | Time to first byte / first contentful paint of the base HTML+shell | Lighthouse, browser DevTools Network/Performance panel | Phase 1: FCP 2.3s, LCP 3.0s. Phase 2: FCP 2.3s, LCP 3.1s. **Phase 3 (2026-09-26):** FCP 2.3s, LCP 3.1s — stable |
| JS bundle size | Total and per-route JS shipped to the client | `vite build` output stats | Phase 1: 352.61 kB (109.90 kB gzip). Phase 2: 363.60 kB (113.06 kB gzip). **Phase 3: 364.46 kB (113.28 kB gzip)** — +0.86 kB for `DocumentTitle`/`useRouteTransitionEffects` (no route-level code splitting yet, D-028); cinematic-layer chunk unchanged at 907.51 kB (240.27 kB gzip), still lazy |
| CSS size | Total CSS shipped | `vite build` output stats | Phase 1: 14.26 kB. Phase 2: 22.30 kB. **Phase 3: 22.33 kB** — effectively unchanged (no new component styles, only hardening of existing ones) |
| Image payload | Total image bytes per representative page | Lighthouse "resource summary", manual audit | Still not applicable — Phase 3 renders no images either (no content-population scope this phase); tracked from Phase 5+ |
| Media payload | Video/audio embed weight (embeds only, not self-hosted, per `06_ASSET_BIBLE.md`) | Manual audit of embed strategy | Tracked from Phase 7 |
| Cinematic lazy chunk size | Size of the Three.js/R3F chunk, confirmed separate from the main bundle | `vite build` output stats | **Stable across all 3 phases: 907.51 kB (240.27 kB gzip)**, never loaded outside the Home route |
| WebGL initialization cost | Time from cinematic route mount to first rendered frame; fallback trigger latency | Manual profiling + Playwright timing assertions | Lazy-load re-confirmed in the Phase 3 build; precise init timing tracked from Phase 4 |
| Route transition responsiveness | Time between navigation trigger and new route's main content painted | React Profiler / Performance API marks | Functionally verified via Playwright across all 23 routes; **Phase 3 adds explicit scroll/focus timing verification** (`src/app/RouteTransitions.test.tsx`, D-027). Frame-level timing instrumentation tracked from Phase 13 |
| Lighthouse Performance | Overall Lighthouse Performance score | Lighthouse (`npx lighthouse`, desktop/unthrottled local preview server — not yet the mobile-throttled profile) | Phase 1: 78/100. Phase 2: 74/100. **Phase 3: 76/100** — within normal run-to-run noise for an unthrottled local pass; still desktop/pre-content, not yet meaningful to chase (Phase 13 scope) |
| Lighthouse Accessibility | Overall Lighthouse Accessibility score | Lighthouse | Phase 1: 100/100. Phase 2: 100/100. **Phase 3: 100/100** — held steady through the route-transition/title/dialog-architecture hardening |
| Lighthouse Best Practices | Overall Lighthouse Best Practices score | Lighthouse | Phase 2: 100/100. **Phase 3: 100/100** |
| Lighthouse SEO | Overall Lighthouse SEO score | Lighthouse | Phase 1: 100/100. Phase 2: 100/100. **Phase 3: 100/100** — the per-route document titles (D-026) are also an SEO-adjacent improvement, though not the reason this phase's work was done |
| Long tasks | Count/duration of main-thread tasks >50ms | Chrome DevTools Performance panel / Performance API `longtask` entries | Total Blocking Time as a proxy — Phase 1: 530ms. Phase 2: 680ms. **Phase 3: 610ms** — within normal run-to-run noise |
| Layout shift | Cumulative Layout Shift (CLS) | Lighthouse / Performance API `layout-shift` entries | Phase 1: 0. Phase 2: 0. **Phase 3: 0** — held steady; the new instant (non-smooth) scroll-to-top on navigation is intentionally not an animated/layout-affecting scroll |
| Mobile behavior | Functional + performance check specifically on emulated/real mobile viewports and throttled network/CPU | Lighthouse mobile profile, Playwright mobile viewport emulation | Phase 2: full responsive audit (80+ checks). **Phase 3: re-verified all 80+ checks still pass** after the route-transition/title changes, plus new deep-link and keyboard-walkthrough coverage on mobile viewports. A genuine Lighthouse mobile-throttled score remains deferred to Phase 13 |

**Phase 3 baseline summary (explicitly recorded per the Director's Phase 3 §13, alongside the Phase 2 baseline it must not overwrite):**

| | Phase 2 | Phase 3 |
|---|---|---|
| Performance | 74 | 76 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 100 | 100 |
| CLS | 0 | 0 |
| TBT | 680ms | 610ms |
| Main JS | 363.60 kB (113.06 kB gzip) | 364.46 kB (113.28 kB gzip) |
| CSS | 22.30 kB (5.35 kB gzip) | 22.33 kB (5.35 kB gzip) |
| Cinematic lazy chunk | 907.51 kB (240.27 kB gzip) | 907.51 kB (240.27 kB gzip) |

Performance optimization remains explicitly out of scope for Phase 3 (as for Phase 1/2) — reserved for Phase 13, per the Director's repeated instruction. No functionality was removed or degraded to produce these numbers.

Numeric targets (e.g., "Performance ≥ 85") are deliberately not restated here as committed thresholds until Phase 13, when real content/3D/mobile-throttled data exists to tune against. Both phases' Performance scores are pre-content scaffold baselines (React 19 + Zustand + React Router + design-system primitives, no real images/video/3D scene yet) — expected to move further as real content is added; every number above is reported as-measured, not smoothed or rounded up. Phase 2's one real functional regression this pass surfaced — the Header horizontal-overflow bug (D-023) — was a correctness bug (content literally didn't fit on screen), not a performance-tuning question, and was fixed immediately; the small Performance-score dip from added CSS/JS is left for Phase 13, consistent with the Director's repeated instruction not to prematurely optimize.

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
