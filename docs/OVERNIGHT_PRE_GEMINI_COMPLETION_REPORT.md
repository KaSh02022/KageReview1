# Overnight Pre-Gemini Preparation Run — Completion Report

**Run date:** 2026-09-24 · **Baseline:** `35dd9d4` (Phase 5B) · **Scope:** Phases 5B.1, 5C, 5D

---

## 1. Executive summary

Three phases completed: the Gemini proof-of-style batch was prepared, the real Phase 5 content was audited in a browser and its defects fixed, and the Phase 6 search architecture was specified.

The most consequential outcome was not planned work. A screenshot review found the Cart page rendering **"Requirements: FR-029, FR-030, FR-031"** to visitors, and the Contact page presenting **"Seed City, Placeholder Region"** as the project's address. Both had shipped through five approved phase gates while every test passed, because every suite asserted on what *should* appear and nothing asserted on what must *never* appear. Eleven such leaks were found and removed, and the inverse test suite now exists.

Five defect classes were found and fixed (four P1, one P2). One suspected defect was investigated and cleared rather than "fixed" — a focus ring that turned out to be a deliberate accessibility feature behaving correctly.

**Self-review verdict: `PASS_WITH_FIXES`** — everything in scope is complete and green, but FR-006 (cards must show content type and tags) remains unmet in shipped UI. It is Phase 6 scope by the Director's own boundary, and is documented rather than silently implemented.

**No image was generated. No asset was replaced. No Phase 6 code was written.**

---

## 2. Phase 5B.1 — Gemini Batch 01

**14 assets selected** — a strict subset of the 70 approved Tier B assets.

**7 category heroes** (CLASS-HERO, 16:9, 2560×1440): `GEM-hero-anime`, `-gaming`, `-movies`, `-tv-shows`, `-kpop`, `-comics`, `-manga`.

**7 character portraits** (CLASS-PORTRAIT, 1:1, 1024×1024), one canonical lead per category, chosen by a reproducible tag rule (`protagonist`, else `leader`) rather than preference:

| Category | Character | Source id | Rule |
|---|---|---|---|
| Anime | Kaida Nova | `character-anime-kaida-nova` | protagonist |
| Gaming | Kestrel Rho | `character-gaming-kestrel-rho` | protagonist |
| Movies | Det. Lena Cross | `character-movies-lena-cross` | protagonist |
| TV Shows | Dr. Elena Marsh | `character-tv-shows-elena-marsh` | protagonist |
| K-Pop | Hana | `character-kpop-hana` | leader |
| Comics | Aegis (Marcus Steele) | `character-comics-aegis` | leader |
| Manga | Yui Kurogane | `character-manga-yui-kurogane` | protagonist |

**Why these two classes.** They are the two hardest. CLASS-HERO has the most punishing crop in the system (~5:1 on desktop to ~1.2:1 on mobile); CLASS-PORTRAIT is the only asset used at two aspect ratios. If the style survives both across seven worlds, the remaining 56 are low-risk.

**Prompt count: 14**, extracted **verbatim** from `GEMINI_IMAGE_PROMPTS.md` rather than re-composed, so the batch cannot drift from the approved set. Each carries the full 14-clause global negative block, category-specific negatives, and its class crop constraint.

**Manifest validation:** `asset manifest OK`. The validator was extended to cover the batch and then **deliberately broken four ways** — removing an asset, stripping a prompt's negative block, pointing at a nonexistent character, and claiming images were generated. All four were detected. Five new unit tests enforce the same invariants in CI.

---

## 3. Phase 5C — Real content UX audit

**Pages inspected:** 29 routes — 7 category hubs, 4 character details (longest name, shortest name, longest biography, non-human), 2 event details, 2 article details, 2 product details, cart, bookmarks, trailers, events, releases, merchandise, search (empty / results / no results), contact, about, home.

**Viewports:** 375×812, 390×844, 768×1024, 1024×768, 1440×900.

**Screenshots:** full-page captures at 375 and 1440 for every route, plus a post-fix re-shoot of all 14 changed pages to check for regressions introduced by the fixes.

### Defects found and fixed

| # | Severity | Defect | Fix |
|---|---|---|---|
| D1 | P1 | Heading skip h1→h3 on `/trailers`, `/releases`, `/merchandise`, `/events` | Card headings → h2 |
| D2 | P1 | Heading skip h1→h3→h4 on `/search` when results render | Group headings → h2, cards → h3 |
| D3 | P1 | SRS requirement ids rendered to visitors in 11 places | `requirementIds`/`phase` props removed from `PagePlaceholder` entirely; 11 strings rewritten in plain language |
| D4 | P1 | "Seed City, Placeholder Region" shown as the project's address | Honest statement of what is true + illustrative map note |
| D5 | P2 | Touch targets at 21px, below the WCAG 2.2 24px minimum | `min-height: 24px` on related-content and contact links |

**Investigated, not a defect (I1).** A focus ring around the entire `<main>` appeared in screenshots. Measuring all four navigation paths showed it fires only for keyboard navigation (correct and desirable) and for programmatic `page.goto` (a harness artifact), and is suppressed on mouse click. Had it been "fixed" on sight, a deliberate Phase 3 accessibility feature would have been removed.

**A defect nearly missed by the audit itself.** D2 exists only when `/search` renders results. The first pass tested `/search` with no query and reported it clean. It surfaced only after `?q=a` and `?q=zzzznomatch` were added — a page's defect can live entirely in a state the audit never enters.

### Accessibility findings

Landmarks, heading outlines (after D1/D2), accessible names on every link and button, alt text on every image, keyboard operability, visible focus, dialog/drawer focus trapping, and no colour-only information. axe reports no serious/critical issues. Two heading-skip classes and two undersized-target classes fixed.

### Navigation findings

No dead ends. All flows verified: hub → character/event/article/product, detail → related content, detail → back-to-hub, product → cart, breadcrumb → parent, and all 7 Fandom Core nodes → their hubs. All 23 document titles correct and item-specific.

### Content honesty findings

After D3/D4: no real-world claims, no real brands, franchises or people (a scan for ~40 real properties across all content returns zero hits), no ambiguous simulated events, no misleading merchandise, no TODO/lorem-ipsum/test content. Events carry a visible "Simulated fan event" badge; merchandise, cart, trailers and dummy auth all state their limits in plain language.

### Unresolved

| # | Issue | Severity | Why |
|---|---|---|---|
| R1 | No real contact details; fictional map query renders a whole-world view | P2 | Director decision — the misleading presentation is fixed; choosing an address asserts something about the project |
| R2 | `PagePlaceholder` still named for its Phase 1 role | P3 | Cosmetic rename across 9 files |
| R3 | Merchandise tags contain SVG glyph names | P2 | Only matters once a tag filter exists (gap G3) |
| R4 | **FR-006 unmet — cards lack type badge and tags** | P1 (requirement) | Phase 6 card work by the Director's scope boundary (gap G1) |
| R5 | FR-016 expects 4 media types; only `trailer` exists | P2 | Needs new content — a Director decision (gap G2) |

---

## 4. Phase 5D — Search / filter / sort architecture

**Specification only. Nothing implemented.**

**Search model.** 161 documents across 8 content types. Normalisation is NFD + combining-mark strip + **explicit `đ`/`Đ` handling** (the Vietnamese case NFD does not cover — omitting it is the classic `dien` ≠ `điện` bug), lowercase, punctuation-to-space. Token AND semantics, substring matching, 1-character minimum. Diacritic-insensitivity is symmetric in both directions.

**Ranking.** Additive scoring — title-exact 100, title-prefix 60, title-contains 40, tag-exact 30, secondary 20, body 10, featured +5 — with a four-level tie-break (score → type order → title → `id`) giving a **total, reproducible order**.

**Filter model.** Five facets: category, content type, tag, series (FR-021), status. OR within a facet, AND across facets. Counts shown per option; zero-count options disabled rather than hidden. Deliberately excluded: price, duration, and `fictional` (constant across the dataset).

**Sort model.** Relevance, newest, oldest, A–Z, Z–A, featured-first. "Popularity" (FR-008) is explicitly mapped to `featured` because no popularity signal exists; 84 undated documents sort last rather than being hidden or given invented dates (D-050).

**State / URL model.** All state in URL query params via `useSearchParams` — shareable, deep-linkable, survives reload and back/forward, no second source of truth. Three HashRouter guard rules recorded, the critical one being never to write a raw `#fragment` (the D-032 defect class).

**Selectors.** Six pure functions — `normalise`, `buildIndex`, `searchDocuments`, `applyFilters`, `applySort`, `deriveFacets` — plus one stateful `useSearchState`. Steps 1–4 of the implementation order are fully testable before any UI exists.

**Test matrix.** ~120 cases across 12 sections: normalisation (12, including Vietnamese), matching (18), ranking (7), filters (16), sort (10), combined (8), URL/state (12), accessibility (15), responsive (8), performance (6), boundaries (12), regression guards (10).

**Acceptance criteria.** 22 objective, measurable criteria (A1–A22), each with a stated measurement.

**Five gaps documented rather than papered over:** G1 FR-006 unmet · G2 FR-016 lacks media types · G3 tag data polluted with category ids and glyph names · G4 no popularity signal · G5 84 documents undated.

---

## 5. Regression

| Check | Result |
|---|---|
| **Unit tests** | **142 passed / 142** (21 files; +5 batch tests this run) |
| **E2E** | **681 passed, 3 skipped, 0 failed, 0 flaky** (chromium/firefox/webkit/mobile-chrome) |
| **axe** | No serious/critical on hubs, detail pages, and search states |
| **Typecheck** | 0 errors |
| **Lint** | 0 errors |
| **Build** | Succeeds, 471ms |
| **Console** | `[]` at all 5 viewports across 29 routes |
| **Page errors** | `[]` |
| **Failed requests** | `[]` |
| **Responsive** | No overflow at 375/390/768/1024/1440 |

The 3 skips are the documented WebKit Full-Keyboard-Access platform limitation (D-015).

**Known regression areas re-verified:** D-032 skip-link/HashRouter, D-039 badge contrast, D-040 card/title defects, D-041 mobile hub height, Phase 3 route transitions, dialog/drawer `aria-hidden`, Fandom Core node mapping, `CATEGORY_ROUTES` integrity — all still pass.

---

## 6. Performance

| Metric | Phase 5 baseline | Now | Delta |
|---|---|---|---|
| Main JS raw | 482.63 kB | **482.56 kB** | −0.07 kB |
| Main JS gzip | 132.26 kB | **132.25 kB** | −0.01 kB |
| `FandomCoreScene` raw | 912.41 kB | **912.41 kB** | unchanged |
| `FandomCoreScene` gzip | 242.07 kB | **242.07 kB** | unchanged |
| CSS raw | 27.08 kB | **27.37 kB** | +0.29 kB |
| Build duration | ~465ms | **471ms** | — |

**No regression.** Runtime code net shrank (the rendered metadata block was removed); the CSS increase is the touch-target and map-note rules. No Phase 13 optimisation was performed.

**Observation — future image payload.** The 70 planned Gemini assets are the real payload risk ahead. At the per-class budgets (hero ≤300 kB, card ≤80 kB) a full pass could add several MB. Mitigations are specified (WebP, responsive `srcset`, lazy loading, per-class budgets) but must be enforced at acceptance rather than assumed.

---

## 7. Documentation

**Created (7):** `GEMINI_BATCH_01_MANIFEST.json` · `GEMINI_BATCH_01_MANIFEST.md` · `GEMINI_BATCH_01_EXECUTION.md` · `GEMINI_BATCH_01_REVIEW.md` · `PHASE_5C_CONTENT_UX_AUDIT.md` · `PHASE_6_SEARCH_FILTER_SORT_SPEC.md` · `PHASE_6_TEST_MATRIX.md` (plus this report and `OVERNIGHT_PRE_GEMINI_REVIEW.md`).

**Updated (1):** `11_DECISION_LOG.md` — D-047 (no dev scaffolding in the UI), D-048 (batch-01 rationale), D-049 (URL-based search state), D-050 (popularity→featured, undated-last).

**Code created (3):** `scripts/generate-batch-01.mjs` · `e2e/content-honesty.spec.ts` (29 tests) · batch tests in `src/data/assetManifest.test.ts`.

**Code modified (16):** `scripts/validate-asset-manifest.mjs` (batch validation) and 15 source files for the D1–D5 fixes.

All dates use the actual execution date. Every Gemini document states PLANNED and that no image has been generated.

---

## 8. Git

**Commit:** `8517511` — `phase: prepare pre-gemini ux and search architecture`
**Working tree:** clean. No scratch files, logs, screenshots, secrets or environment files. Three temporary harnesses removed. `package.json` and the lockfile are unchanged.

---

## 9. Remaining risks

1. **FR-006 unmet (R4/G1)** — mandatory, invisible when missing, easy to keep deferring. Should be an explicit Phase 6 exit criterion.
2. **Hero crop is the likeliest Gemini failure** — a 16:9 composition can lose its subject entirely to the ~5:1 desktop band. This is precisely why Batch 01 is 14 images, not 70.
3. **Provenance discipline** — if platform terms are not read *on the generation date*, the asset must be Blocked. The workflow says so; the risk is someone skipping the step.
4. **Tag cleanup ordering (G3)** — doing it after the filter UI is built means rework.
5. **Untested states** — dialogs, the cart with items, and bookmarks with saved items were audited only in their empty states.
6. **Phase 13 debt (pre-existing)** — content bundled into the main chunk; 912 kB WebGL chunk; TBT 1,140ms.

---

## 10. Explicit scope confirmation

- **Gemini images NOT generated** — `images_generated: 0`, enforced by the validator and a unit test.
- **Existing SVG assets NOT replaced** — 161 SVGs on disk, all still referenced; no `.webp` appears in any data file.
- **Phase 6 implementation NOT started** — specification and test matrix only; `SearchPage` still runs the Phase 1 stub.
- **Fandom Core NOT changed** — untouched; its node→hub mapping re-verified.
- **Backend NOT added.**
- **Database NOT added.**
- **External AI runtime NOT added** — no `fetch`/`axios`/WebSocket anywhere in `src`; the only external URL remains the pre-existing Google Maps embed.
- **No test weakened, deleted, or adjusted to pass.** The only corrections were to two inaccurate counts in my own new documentation.

---

## 11. Recommended next actions

1. **Review the five Phase 5C fixes**, particularly D3/D4 — they changed user-facing copy on 11 surfaces.
2. **Decide on the Gemini pass.** If authorised, run Batch 01 (14 images) and review before generating anything further. If not, Phase 6 can start immediately — the two are independent.
3. **Decide the three content questions:** real contact details or authorisation to point the map at a neutral landmark (R1); whether to add interview/podcast/fan-content media for FR-016 (G2); whether to clean merchandise tags before the filter UI (G3).
4. **Make FR-006 an explicit Phase 6 exit criterion** so the card gap closes rather than deferring again.
5. **Confirm the provenance wording (D-045)** is acceptable before any generated asset enters the repository.

**This report does not decide whether Gemini images should be accepted.** The acceptance machinery exists to support that decision, not to pre-empt it.
