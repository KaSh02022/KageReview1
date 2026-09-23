# 10 — Implementation Plan

A phase-by-phase task roadmap. This is a planning document for Phases 1–15; no tasks are executed yet under Phase 0. Task IDs are `T<phase>.<n>`.

## Phase 1 — Architecture & Technical Foundation

| Task ID | Objective | Files | Dependencies | Acceptance Criteria | Test | Risk |
|---|---|---|---|---|---|---|
| T1.1 | Initialize git repository | `.git/`, `.gitignore` | none | `git status` clean, `.gitignore` excludes `node_modules`, build output | `git status` review | Low |
| T1.2 | Scaffold Vite + React + TypeScript project | `package.json`, `vite.config.ts`, `tsconfig.json`, `src/main.tsx` | T1.1 | `npm run dev` serves a blank app | Manual smoke run | Low |
| T1.3 | Configure ESLint + Prettier + strict TS | `.eslintrc`, `tsconfig.json` | T1.2 | `npm run lint`/`typecheck` pass on scaffold | Lint/typecheck run | Low |
| T1.4 | Set up Vitest + React Testing Library | `vitest.config.ts`, `src/setupTests.ts` | T1.2 | Sample test passes | `npm test` | Low |
| T1.5 | Set up Playwright | `playwright.config.ts` | T1.2 | Sample E2E test passes headless | `npx playwright test` | Medium (Windows env config) |
| T1.6 | Install React Router, Zustand, React Three Fiber + drei, three | `package.json` | T1.2 | Packages resolve, no version conflicts | Build passes | Low |
| T1.7 | Define TypeScript data types from `05_DATA_SCHEMA.md` | `src/types/content.ts` | T1.2 | Types compile, match schema doc | Typecheck | Low |
| T1.8 | App shell skeleton (Router, Layout, error boundary) | `src/App.tsx`, `src/components/Layout/` | T1.6 | Empty routes render without crash | Smoke test | Low |

## Phase 2 — Design System & Visual Language

| Task ID | Objective | Files | Dependencies | Acceptance Criteria | Test | Risk |
|---|---|---|---|---|---|---|
| T2.1 | Finalize color tokens with verified AA contrast | `src/styles/tokens.css` | Phase 1 | All token pairs pass contrast check | Automated contrast check | Medium |
| T2.2 | Typography scale + font loading | `src/styles/typography.css` | T2.1 | Fonts load, scale applied | Visual review | Low |
| T2.3 | Core component library (Button, Card, Badge, Modal, Drawer) | `src/components/ui/` | T2.1, T2.2 | Components render in isolation, pass a11y smoke check | Unit + axe smoke test | Medium |
| T2.4 | Responsive grid/breakpoint utilities | `src/styles/layout.css` | T2.1 | Verified at 4 breakpoints | Playwright viewport test | Low |
| T2.5 | Motion tokens + `usePrefersReducedMotion` hook | `src/hooks/usePrefersReducedMotion.ts` | T2.1 | Hook correctly detects OS setting | Unit test | Low |

## Phase 3 — Application Shell & Routing

| Task ID | Objective | Files | Dependencies | Acceptance Criteria | Test | Risk |
|---|---|---|---|---|---|---|
| T3.1 | Full route map implementation | `src/App.tsx`, `src/pages/` | Phase 1, 2 | All routes in `02_PRODUCT_ARCHITECTURE.md` §3 resolve | E2E nav test | Low |
| T3.2 | Header (logo, category nav, search bar, counter, clock, cart/bookmark icons) | `src/components/Header/` | T3.1 | All elements present/functional on every route | E2E + unit | Low |
| T3.3 | Breadcrumb component | `src/components/Breadcrumb/` | T3.1 | Correct trail on category/detail routes | Unit test | Low |
| T3.4 | Footer | `src/components/Footer/` | T3.1 | Links present, responsive | Manual/E2E | Low |
| T3.5 | Global error boundary + empty/loading state primitives | `src/components/ErrorBoundary/`, `src/components/EmptyState/` | T3.1 | Simulated render error shows fallback, not blank screen | Unit test | Low |

## Phase 4 — Cinematic WebGL / Fandom Universe Experience

| Task ID | Objective | Files | Dependencies | Acceptance Criteria | Test | Risk |
|---|---|---|---|---|---|---|
| T4.1 | Original "Fandom Universe" concept art direction (not Kage's temple/night-walk) | `06_ASSET_BIBLE.md` prompts executed, `docs/11_DECISION_LOG.md` entry | Phase 2, Gemini assets | Concept documented and distinct from Kage | Director review | Medium |
| T4.2 | R3F scene setup with skip control | `src/features/universe/` | T1.6, T4.1 | Scene renders, skip works, never blocks reaching Home | E2E test | High (WebGL complexity) |
| T4.3 | WebGL-unavailable / reduced-motion fallback | `src/features/universe/Fallback.tsx` | T4.2 | Static hero shown correctly under both conditions | Playwright emulation test | Medium |
| T4.4 | Performance budget pass for 3D payload | assets under `src/assets/3d/` | T4.2 | ≤5MB initial payload target met or documented deviation | Lighthouse/manual profiling | Medium |

## Phase 5 — Seven Fandom Category Hubs

| Task ID | Objective | Files | Dependencies | Acceptance Criteria | Test | Risk |
|---|---|---|---|---|---|---|
| T5.1 | `categories.json` + 7 category data entries | `src/data/categories.json` | Phase 1 | 7 valid entries per schema | Data-integrity test | Low |
| T5.2 | CategoryHub page + catalog grid | `src/pages/CategoryHub/` | T5.1, Phase 2/3 | Hub renders per-category content | E2E test (×7) | Low |
| T5.3 | Per-category accent theming | `src/styles/tokens.css` | T2.1 | Each hub visually distinct via accent token | Visual review | Low |

## Phase 6 — Content System, Search, Filtering, Sorting

| Task ID | Objective | Files | Dependencies | Acceptance Criteria | Test | Risk |
|---|---|---|---|---|---|---|
| T6.1 | Build client-side search index over all datasets | `src/features/search/index.ts` | Phase 5 data | Index built once at startup, no network call | Unit test | Medium |
| T6.2 | Global search UI + results page | `src/pages/Search/` | T6.1 | Cross-category results with category/type filters | E2E test | Low |
| T6.3 | Category-hub filter (type + sub-tag) | `src/features/catalog/filter.ts` | T5.2 | Correct narrowing for all combinations | Unit + E2E | Low |
| T6.4 | Category-hub sort (alpha/newest/popularity) | `src/features/catalog/sort.ts` | T5.2 | Correct ordering for all 3 modes | Unit test | Low |

## Phase 7 — Media, Galleries, Trailers, Events

| Task ID | Objective | Files | Dependencies | Acceptance Criteria | Test | Risk |
|---|---|---|---|---|---|---|
| T7.1 | Gallery component with lightbox/carousel | `src/components/Gallery/` | Phase 2 | Opens/closes in-page, keyboard accessible | E2E + axe | Medium |
| T7.2 | `galleries.json` + `media.json` data + media embeds | `src/data/galleries.json`, `src/data/media.json`, `src/features/media/` | Phase 5 | ≥1 gallery + media items per category, filterable | Data-integrity + E2E | Low |
| T7.3 | Cross-category Trailers page | `src/pages/Trailers/` | T7.2 | Aggregates trailers, filters by category/status | E2E test | Low |
| T7.4 | `events.json` (≥3/category) + Events UI + detail page | `src/data/events.json`, `src/pages/EventDetail/` | Phase 5 | ≥21 total events, past/upcoming split correct | Data-integrity + E2E | Low |

## Phase 8 — Characters and Releases

| Task ID | Objective | Files | Dependencies | Acceptance Criteria | Test | Risk |
|---|---|---|---|---|---|---|
| T8.1 | `characters.json` (≥5/category) | `src/data/characters.json` | Phase 5 | ≥35 total, all required fields | Data-integrity test | Low |
| T8.2 | Character card + detail page + franchise filter | `src/pages/CharacterDetail/`, `src/features/characters/` | T8.1 | Detail shows all fields, filter works | E2E test | Low |
| T8.3 | `releases.json` + Upcoming Releases view | `src/data/releases.json`, `src/features/releases/` | Phase 5 | Releases listed, chronologically sortable | Unit + E2E | Low |
| T8.4 | Articles module (cards + detail + related content) | `src/data/articles.json`, `src/pages/ArticleDetail/` | Phase 5 | Detail view + related section render | E2E test | Low |

## Phase 9 — Merchandise and Temporary Cart

| Task ID | Objective | Files | Dependencies | Acceptance Criteria | Test | Risk |
|---|---|---|---|---|---|---|
| T9.1 | `merchandise.json` + product grid/detail | `src/data/merchandise.json`, `src/pages/Merchandise/` | Phase 5 | Cards show required fields | Data-integrity + E2E | Low |
| T9.2 | Zustand cart store (add/remove/total) | `src/stores/cartStore.ts` | T1.6 | Total calculates correctly, persists per decision D-005 | Unit test | Low |
| T9.3 | Cart UI (drawer/page) with no-checkout messaging | `src/pages/Cart/` | T9.2 | No checkout/payment control exists anywhere | E2E scope-boundary test | Low |

## Phase 10 — Bookmarks, Notes, Export, Visitor Features

| Task ID | Objective | Files | Dependencies | Acceptance Criteria | Test | Risk |
|---|---|---|---|---|---|---|
| T10.1 | Zustand bookmarks store (localStorage-persisted) | `src/stores/bookmarksStore.ts` | T1.6 | Survives reload | Unit + E2E | Low |
| T10.2 | Session notes store (sessionStorage) | `src/stores/notesStore.ts` | T10.1 | Cleared on session end, present within session | Unit test | Low |
| T10.3 | Bookmarks page + export action | `src/pages/Bookmarks/` | T10.1, T10.2 | Export produces formatted list file | E2E test | Low |
| T10.4 | Visitor counter (localStorage) | `src/features/visitorCounter/` | T1.6 | Increments correctly per new session | Unit test | Low |
| T10.5 | Real-time clock component | `src/components/Clock/` | Phase 3 | Updates live, correct local time | Unit test | Low |
| T10.6 | Dummy Login/Signup modal | `src/features/authUi/` | Phase 2/3 | No real auth performed | E2E test | Low |

## Phase 11 — Rule-Based Chatbot

| Task ID | Objective | Files | Dependencies | Acceptance Criteria | Test | Risk |
|---|---|---|---|---|---|---|
| T11.1 | `chatbot.json` dataset (FAQs + recommendation rules) | `src/data/chatbot.json` | Phase 5–9 data available for links | Covers key FAQs + at least one rule per category | Data-integrity test | Medium |
| T11.2 | Chatbot rule-matching engine | `src/features/chatbot/engine.ts` | T11.1 | Correct match/fallback behavior, no network call | Unit test | Medium |
| T11.3 | Chatbot widget UI (launcher, panel, quick replies) | `src/features/chatbot/ChatWidget.tsx` | T11.2, Phase 2 | Accessible dialog, works from every route | E2E + axe | Medium |

## Phase 12 — Responsive / Mobile / Accessibility

| Task ID | Objective | Files | Dependencies | Acceptance Criteria | Test | Risk |
|---|---|---|---|---|---|---|
| T12.1 | Full responsive QA pass across all pages | various | Phases 1–11 complete | No breakpoint failures per `09_TEST_STRATEGY.md` §1 | Playwright viewport matrix | Medium |
| T12.2 | Full accessibility audit + fixes | various | Phases 1–11 complete | No critical/serious axe issues, full keyboard pass | axe + manual keyboard walkthrough | Medium |
| T12.3 | Mobile nav drawer + filter/sort drawer polish | `src/components/Header/`, `src/features/catalog/` | T12.1 | Usable one-handed on mobile widths | Manual/E2E | Low |

## Phase 13 — Performance Optimization

| Task ID | Objective | Files | Dependencies | Acceptance Criteria | Test | Risk |
|---|---|---|---|---|---|---|
| T13.1 | Code-splitting per route + lazy-load 3D/media | `vite.config.ts`, route definitions | Phases 1–12 | Bundle targets met per `09_TEST_STRATEGY.md` §9 | Bundle analysis | Medium |
| T13.2 | Image/asset compression pass | `src/assets/` | Phase 5–8 assets finalized | Compression targets met per `06_ASSET_BIBLE.md` | Manual audit | Low |
| T13.3 | Lighthouse CI run + fixes | CI config or manual run | T13.1, T13.2 | Targets met or documented deviation | Lighthouse CI | Medium |

## Phase 14 — Comprehensive QA and SRS Compliance Audit

| Task ID | Objective | Files | Dependencies | Acceptance Criteria | Test | Risk |
|---|---|---|---|---|---|---|
| T14.1 | Full SRS acceptance checklist walkthrough | `01_SRS_REQUIREMENTS.md` (status column updated) | All prior phases | All 76 requirement rows marked with verified status + evidence | Manual checklist | Low |
| T14.2 | Cross-browser compatibility pass | — | T14.1 | Verified per `09_TEST_STRATEGY.md` §3 matrix | Manual + Playwright multi-engine | Medium |
| T14.3 | Regression pass on core flows | — | T14.1 | No functional regression from earlier phases | Full E2E suite run | Low |

## Phase 15 — Competition Documentation and Submission Package

| Task ID | Objective | Files | Dependencies | Acceptance Criteria | Test | Risk |
|---|---|---|---|---|---|---|
| T15.1 | Project report (problem definition, design specs, flowcharts, DFDs, test data) | project report doc | Phase 14 complete | Matches DR-001–003 | Manual review | Low |
| T15.2 | Installation instructions | `README.md` | Phase 14 complete | Clean-install dry run succeeds | Manual dry run | Low |
| T15.3 | Source ZIP + ReadMe.doc with assumptions | release artifact | T15.1, T15.2 | Matches DR-006 | Manual review | Low |
| T15.4 | MP4 demo video covering all functionalities | release artifact | Phase 14 complete | Covers every FR in `01_SRS_REQUIREMENTS.md` | Manual coverage checklist against FR list | Medium |
| T15.5 | Optional live hosting | deployment | T15.1–15.4 | If chosen, URL recorded | Manual verification | Low |

## Cross-Phase Risk Register (summary)

| Risk | Phases Affected | Mitigation |
|---|---|---|
| WebGL complexity/performance on low-end devices | 4, 13 | Fallback path (T4.3), payload budget (T4.4, T13.1) |
| 76-requirement scope is large for a no-backend project timeline | All | Strict phase gating, no scope creep beyond SRS + approved originals |
| Asset licensing gaps | 2, 5–8 | `08_LICENSES.md` gate before any asset use |
| Kage-similarity risk in cinematic layer | 4 | Explicit original-concept requirement (T4.1), Director review |
| Real Safari device unavailable for testing | 12, 14 | WebKit-engine Playwright as proxy, flagged as assumption |
