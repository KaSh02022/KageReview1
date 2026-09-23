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
| Initial document load | Time to first byte / first contentful paint of the base HTML+shell | Lighthouse, browser DevTools Network/Performance panel | **Captured 2026-09-24** (desktop, unthrottled, local preview server): FCP 2.3s, LCP 3.0s, Speed Index 2.3s |
| JS bundle size | Total and per-route JS shipped to the client | `vite build` output stats | **Captured 2026-09-24:** main bundle 352.61 kB (109.90 kB gzip); cinematic-layer chunk (Three.js/R3F, lazy-loaded, not in main bundle) 907.51 kB (240.27 kB gzip) |
| CSS size | Total CSS shipped | `vite build` output stats | **Captured 2026-09-24:** 14.26 kB (3.24 kB gzip) |
| Image payload | Total image bytes per representative page | Lighthouse "resource summary", manual audit | Not applicable yet — Phase 1 renders no images (seed data intentionally omits image rendering to avoid broken-asset requests before real assets exist); tracked from Phase 2/5+ |
| Media payload | Video/audio embed weight (embeds only, not self-hosted, per `06_ASSET_BIBLE.md`) | Manual audit of embed strategy | Tracked from Phase 7 |
| WebGL initialization cost | Time from cinematic route mount to first rendered frame; fallback trigger latency | Manual profiling + Playwright timing assertions | Lazy-load confirmed (separate 907.51 kB chunk, never loaded until the Home route mounts, confirmed via the build output above); precise init timing + explicit Playwright timing assertions tracked from Phase 4 |
| Route transition responsiveness | Time between navigation trigger and new route's main content painted | React Profiler / Performance API marks | Functionally verified via Playwright navigation tests (this phase, all routes); explicit timing instrumentation tracked from Phase 13 |
| Lighthouse Performance | Overall Lighthouse Performance score | Lighthouse (`npx lighthouse`, desktop/unthrottled local preview server — not yet the mobile-throttled profile) | **Captured 2026-09-24: 78/100.** First run (before two Phase 1 fixes below) was 59/100 |
| Lighthouse Accessibility | Overall Lighthouse Accessibility score | Lighthouse | **Captured 2026-09-24: 100/100** |
| Lighthouse SEO | Overall Lighthouse SEO score | Lighthouse | **Captured 2026-09-24: 100/100** (91/100 before adding `public/robots.txt`) |
| Long tasks | Count/duration of main-thread tasks >50ms | Chrome DevTools Performance panel / Performance API `longtask` entries | Total Blocking Time captured as a proxy: 530ms (down from 660ms after a fix below). Per-task breakdown tracked from Phase 4/13 |
| Layout shift | Cumulative Layout Shift (CLS) | Lighthouse / Performance API `layout-shift` entries | **Captured 2026-09-24: CLS 0** (was 0.313 before a fix — the lazy-loaded cinematic Suspense fallback wasn't reserving the same height as the loaded content; fixed in `src/features/universe/CinematicEntry.tsx` by giving the fallback the same `.hero` footprint) |
| Mobile behavior | Functional + performance check specifically on emulated/real mobile viewports and throttled network/CPU | Lighthouse mobile profile, Playwright mobile viewport emulation | Functional check only this phase: `playwright.config.ts` includes a `mobile-chrome` (Pixel 7) project, passing. A genuine Lighthouse mobile-throttled run is deferred to Phase 13 |

Numeric targets (e.g., "Performance ≥ 85") are deliberately not restated here as committed thresholds until Phase 13, when real content/3D/mobile-throttled data exists to tune against. The desktop/unthrottled 78/100 above is a Phase 1 scaffold baseline (React 19 + Zustand + React Router, minimal content) — expected to move in both directions as real content, images, and the full cinematic scene are added; it is reported as-measured, not smoothed or rounded up. Two real findings surfaced by this Lighthouse pass were fixed immediately since they were cheap and clearly in-scope (the CLS-causing Suspense fallback and the missing `robots.txt`); the 22-point performance-score gap (privately dominated by First Contentful Paint/Largest Contentful Paint/Total Blocking Time on an unoptimized dev-grade build) is left for Phase 13, per the Director's instruction not to prematurely optimize in Phase 1.
