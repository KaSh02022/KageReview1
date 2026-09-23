# Overnight Pre-Gemini Run — Adversarial Self-Review

Reviewed as if the work had been submitted by another engineer. A green test suite was treated as insufficient evidence throughout.

Labels used: **FACT** (verified by command output or direct inspection) · **OBSERVATION** (seen, interpretation may vary) · **RISK** (could go wrong) · **RECOMMENDATION** (proposed, not done).

---

## 1. Implementation summary

**FACT.** Three phases completed: 5B.1 (Gemini Batch 01 preparation), 5C (real-content UX audit + fixes), 5D (Phase 6 search architecture). No image generated, no asset replaced, no Phase 6 code written.

| Area | Output |
|---|---|
| 5B.1 | 14-asset batch (7 heroes + 7 lead portraits), manifest (JSON + MD), execution guide, review sheet, validator extension, 5 new tests |
| 5C | 5 defect classes found and fixed; 1 suspected defect investigated and cleared; 29-test content-honesty suite added |
| 5D | Search/filter/sort specification + test matrix (~120 defined cases), 5 documented gaps |

---

## 2. Self-review verdict

### `SELF_REVIEW_VERDICT: PASS_WITH_FIXES`

**FACT — why not a clean PASS.** Everything in scope for this run is complete, fixed and green. But one **mandatory SRS requirement is currently unmet in shipped UI**: FR-006 requires every content card to show content type and tags, and the cards show neither (gap G1). That is not a defect introduced by this run, and closing it is Phase 6 card work by the Director's own scope boundary — but declaring a clean PASS would understate an unmet mandatory requirement.

**FACT — why not BLOCK.** No P0. No unfixed P1 *defect*. No accessibility serious/critical. No broken navigation. No misleading content presentation remaining. No documentation inconsistency found. No architecture gap blocking Phase 6 — the specification is complete enough to implement from.

---

## 3. Findings

### 3.1 Review of Phase 5B.1 (§14.1)

**FACT.** All checks verified programmatically, not by eye:

| Check | Result |
|---|---|
| Exactly 14 assets | ✅ |
| Exactly 7 category heroes, one per category | ✅ |
| Exactly 7 character portraits, one per category | ✅ |
| Every source id exists in the live dataset | ✅ |
| Every prompt maps to exactly one asset | ✅ (duplicate-heading check in the extractor) |
| Every prompt contains the full IP negative block | ✅ (6 required clauses asserted per asset) |
| Every prompt contains its crop constraint | ✅ |
| No real IP / real person / named-artist imitation | ✅ (scan of 40 real properties → 0 hits) |
| No duplicate filenames or asset ids | ✅ |
| Manifest ↔ markdown ↔ execution ↔ review ↔ prompts agree | ✅ (cross-checked: 14/14/14/14) |
| No image generated | ✅ `images_generated: 0` |
| No runtime integration | ✅ no `.webp` in any data file |

**FACT — validator broken deliberately, four ways.** Each invalid state was detected:

| Injected fault | Detected |
|---|---|
| Removed one asset (13 of 14) | ✅ two errors — count and portrait count |
| Stripped a prompt's negative block | ✅ named the asset |
| Pointed an asset at a nonexistent character | ✅ named asset and missing id |
| Set `images_generated: 14` | ✅ "must be 0 in this phase" |

**OBSERVATION.** Prompts are *extracted verbatim* from the approved document rather than re-composed, and the validator asserts the extracted text appears in that document. The batch therefore cannot silently diverge from the reviewed prompt set.

### 3.2 Review of Phase 5C (§14.2)

**FACT.** Re-reviewed after fixes, not trusting the first pass. 29 routes × 5 viewports: **0 findings**. Console errors `[]`, page errors `[]`, failed requests `[]` at every viewport.

**FACT — a defect was nearly missed by the audit itself.** The first pass tested `/search` with no query, which renders no result sections and therefore no heading skip. D2 only surfaced after `?q=a` and `?q=zzzznomatch` were added. A page's defect can live entirely in a state the audit never enters.

**FACT — no regressions introduced by the fixes.** Post-fix screenshots of all 14 changed pages at desktop and mobile show correct rendering. Full E2E: 681 passed, 3 skipped, 0 failed, 0 flaky.

**OBSERVATION — I1 was investigated rather than "fixed".** A focus ring around the whole `<main>` appeared in screenshots. Measuring all four navigation paths showed it appears only for keyboard navigation (correct and desirable) and for programmatic `page.goto` (a harness artifact); it is suppressed on mouse click and never fires on initial load. Had I "fixed" this on sight, I would have removed a deliberate Phase 3 accessibility feature.

### 3.3 Review of Phase 6 specification (§14.3)

Reviewed as if implementing it tomorrow.

| Question | Answer |
|---|---|
| All SRS search requirements covered? | **FACT** — FR-009/010/011 mapped to components and tests |
| All filter requirements covered? | **FACT** — FR-007/010/016/021/026 mapped; G2 flags that FR-016 lacks data |
| All sort requirements covered? | **FACT** — FR-008 mapped; "popularity" explicitly mapped to `featured` (D-050) because no popularity signal exists |
| Works with the actual dataset? | **FACT** — every count verified against the live data; two wrong counts found during review and corrected |
| Vietnamese text / diacritics? | **FACT** — NFD + combining-mark strip **plus explicit `đ`/`Đ` handling**, which NFD does not cover; symmetry asserted both directions |
| Partial matching defined? | **FACT** — substring, 1-char minimum |
| Ranking deterministic? | **FACT** — 4-level tie-break ending in `id`, giving a total order |
| Combined search + filter + sort defined? | **FACT** — OR-within-facet, AND-across-facets, order-independent |
| URL state defined, HashRouter safe? | **FACT** — §6, with three guard rules including the D-032 trap |
| Empty / no-result states? | **FACT** — distinguished; empty query shows browse, not "no results" |
| Mobile behaviour? | **FACT** — filters in the existing focus-trapped Drawer |
| Accessibility defined? | **FACT** — §8, 13 concerns |
| Tests measurable? | **FACT** — 22 acceptance criteria, each with a measurement |
| Unnecessary complexity? | **OBSERVATION** — deliberately rejected fuzzy matching, synonyms, stemming, pagination and an inverted index; 161 documents do not justify them |
| Hidden backend assumption? | **FACT** — none; index built from static imports, and A16 asserts zero network requests |
| Duplicate source of truth? | **FACT** — none; `CATEGORY_ROUTES` and `categories.json` remain the only registries, and state lives only in the URL |

**FACT — two errors found and corrected during this review.** The matrix claimed 7 protagonist-tagged characters (actually 5 — K-Pop and Comics leads use `leader`) and 77 undated documents (actually 84). A third claim ("all 7 Starlit Ronin documents") was unverifiable as stated and was rewritten to describe the behaviour instead of asserting a number.

### 3.4 SRS traceability (§14.4)

| Requirement | Before | This run | Evidence | Remaining gap |
|---|---|---|---|---|
| FR-006 card shows type + tags | Partially met | No change | Gap G1 in spec | **OPEN — mandatory, unmet in UI** |
| FR-007 filter by type/tags | Not implemented | Specified | Spec §4, matrix §4 | OPEN — Phase 6 |
| FR-008 sort A-Z/newest/popularity | Not implemented | Specified | Spec §5, D-050 | OPEN — Phase 6 |
| FR-009 global search bar | Bar present, stub engine | No change | Existing E2E | PARTIAL — engine is Phase 6 |
| FR-010 results filterable | Not implemented | Specified | Spec §4 | OPEN — Phase 6 |
| FR-011 client-side, no network | Stub is client-side | No change | A16 test defined | PARTIAL — engine is Phase 6 |
| FR-016 media type filter | Not implemented | Specified | Gap G2 | OPEN — data gap |
| FR-021 character series filter | Not implemented | Specified | Spec §4 | OPEN — Phase 6 |
| FR-026 trailer status filter | Not implemented | Specified | Spec §4 | OPEN — Phase 6 |
| FR-039 contact location/map | Met | Honesty fix | content-honesty test | MET — real details are a Director decision |
| NFR-002 accessible | Met | 2 heading-skip classes + 2 target-size fixes | axe clean; 29 routes × 5 viewports | MET for audited scope |
| NFR-005 performance | Baseline tracked | No regression | Build comparison | MET |

**FACT.** No requirement is claimed complete without evidence. FR-009 and FR-011 are marked PARTIAL, not met, because the engine behind the bar is still the Phase 1 stub.

### 3.5 Security / data integrity (§14.5)

**FACT.** All clean:

| Check | Result |
|---|---|
| Secrets / API keys | None (only false positives in fictional prose about characters keeping secrets) |
| External runtime dependency added | None |
| `fetch` / `axios` / WebSocket in src | None |
| External URLs | Only the pre-existing Google Maps embed (D-006) |
| Backend / database | None |
| Runtime writes to content JSON | None |
| `dangerouslySetInnerHTML` / `innerHTML` | None |
| Tracking / analytics | None |
| Third-party assets added | None — still 161 own-script SVGs |
| `package.json` / lockfile changes | **Zero** |

### 3.6 Performance (§14.6)

**FACT.** Main JS 482.56 kB raw / 132.25 kB gzip, versus the Phase 5 baseline of 482.63 / 132.25 — a 0.07 kB decrease (removing the rendered metadata block). CSS 27.37 kB (+0.29 kB) from the new touch-target and map-note rules. `FandomCoreScene` byte-identical at 912.41 kB / 242.07 kB. Build 471ms.

**FACT — no blockers.** This run added documentation and tests; runtime code net shrank.

**Phase 13 technical debt (unchanged, not introduced here):** the full content dataset is statically bundled into the main chunk; the WebGL chunk is 912 kB; TBT was 1,140ms at the Phase 4 measurement.

**RISK.** The 70 planned Gemini assets are a future payload risk: at the 300 kB hero / 80 kB card budgets, 70 assets could add several MB. Mitigated in the Asset Bible by per-class budgets, WebP, responsive `srcset` and lazy loading — but it is a budget to enforce at acceptance, not to assume.

### 3.7 Documentation consistency (§14.7)

**FACT — cross-checked against reality, not against other documents:**

| Claim | Verified |
|---|---|
| 161 content items | ✅ counted from data |
| 161 manifest entries | ✅ |
| 161 SVG files on disk | ✅ `find` count |
| 70 + 56 + 35 = 161 | ✅ |
| 14 batch assets, 0 images generated | ✅ |
| No `.webp` in runtime data | ✅ |
| Dates use the actual execution date (2026-09-24) | ✅ D-047–D-050 |
| "Planned" vs "completed" wording | ✅ every Gemini document states PLANNED / no image generated |

**FACT.** Two inaccurate counts in my own Phase 6 matrix were found and corrected during this review (§3.3).

### 3.8 Git / release (§14.8)

**FACT.** Working tree contains only intended changes: 18 modified (1 doc, 1 script, 16 source), 9 added (7 docs, 1 test, 1 script). Both temporary harnesses (`zz-audit.spec.ts`, `zz-focusring.spec.ts`, `zz-reshot.spec.ts`) removed. No scratch files, no logs, no screenshots, no secrets, no environment files committed.

---

## 4. Fixes applied

| # | Defect | Severity | Fix |
|---|---|---|---|
| D1 | h1→h3 skip on 4 aggregate pages | P1 | Card headings → h2 |
| D2 | h1→h3→h4 skip on Search with results | P1 | Group headings → h2, cards → h3 |
| D3 | SRS requirement ids rendered to visitors (11 places) | P1 | Props removed from `PagePlaceholder`; 11 strings rewritten in plain language |
| D4 | "Seed City, Placeholder Region" as the project address | P1 | Honest statement + illustrative map note |
| D5 | Touch targets at 21px (< WCAG 24px) | P2 | `min-height: 24px` on related and contact links |
| — | Prompt copy referenced an internal doc path | P3 | Rewritten for visitors |

---

## 5. Remaining issues

| # | Issue | Severity | Status |
|---|---|---|---|
| R1 | Contact has no real details; fictional query makes the map render the whole world | P2 | **Director decision** — misleading presentation fixed; choosing an address is not mine to make |
| R2 | `PagePlaceholder` still named for its Phase 1 role | P3 | Deferred — cosmetic rename across 9 files |
| R3 | Merchandise tags contain SVG glyph names (`shirt`, `pin`, `disc`) | P2 | Documented as G3; matters only once a tag filter exists |
| R4 | **FR-006 unmet — cards lack type badge and tags** | P1 (requirement) | Documented as G1; Phase 6 card work by the Director's scope boundary |
| R5 | FR-016 expects 4 media types; only `trailer` exists | P2 | Documented as G2 — needs content, a Director decision |

---

## 6. Adversarial questions (§14.9)

**1. What could still be broken despite all tests passing?**
Anything in a *state* the audit never entered — exactly how D2 nearly escaped. Dialog and drawer states, the bookmarks page with saved items, and the cart with items were checked only in their empty states. Long-content behaviour was tested against the longest *current* content, which is modest (579-char article body); genuinely long content is untested.

**2. Which defects did visual inspection find that automation missed?**
D3 and D4 — both P1. "Requirements: FR-029, FR-030, FR-031" on the Cart page and "Seed City, Placeholder Region" on Contact were visible in screenshots while every test passed. No assertion existed for what must *never* appear. That inverse suite now exists.

**3. Which requirements remain unverified?**
FR-006 (unmet), FR-007/008/010/016/021/026 (specified, not built), FR-009/011 (bar present, engine is a stub). Requirements outside this run's scope — chatbot, bookmarks/export, visitor counter — were not verified.

**4. Which decisions require Director approval?**
(a) Whether to run the Gemini generation pass at all; (b) real contact details or authorisation to point the map at a neutral landmark; (c) whether to add interview/podcast/fan-content media for FR-016; (d) whether accepted Gemini assets may enter the repository under the honest-but-unadjudicated licence wording (D-045).

**5. What assumptions did I make?**
That "one canonical character per category" means the narrative lead, implemented as `protagonist` → else `leader`. That FR-008's "popularity" maps to `featured`, since no popularity signal exists. That code comments containing requirement ids are acceptable while rendered strings are not. That 24px is the right target-size floor (WCAG 2.2 AA).

**6. What did I deliberately NOT change?**
The Fandom Core (untouched). Any content JSON. The 161 SVGs. The search algorithm. The map destination constant. Any test assertion — no test was weakened, deleted, or adjusted to pass; the two counts I corrected were in my own new documentation, not in assertions.

**7. Largest remaining technical risk?**
FR-006 (R4). It is mandatory, unmet in shipped UI, and easy to keep deferring because nothing fails when it is missing. It should be an explicit Phase 6 exit criterion.

**8. What could go wrong when Gemini images are generated?**
Most likely: hero compositions that look good at 16:9 but lose their subject to the ~5:1 desktop band — the reason the batch is 14 images and not 70. Also plausible: accidental text (models add signage), style drift across seven prompts producing seven unrelated looks, portraits framed too high for the 4:3 card crop, and payload weight (a 250 kB hero replacing a 1 kB SVG must earn it). Provenance is the non-visual risk: if terms are not read *on the generation date*, the asset must be Blocked.

**9. What could cause Phase 6 rework?**
Tag cleanup (G3) done after the filter UI rather than before. The FR-016 data decision arriving late. Discovering that AND-semantics feels too strict with real users — cheap to change early, expensive after the UI is built. And ignoring the HashRouter guard rules in §6, which is the D-032 defect class.

**10. What would I warn another engineer about?**
Four things. **(a)** Never write a raw `#fragment` or read `window.location.search` — under HashRouter that corrupts routing (D-032). **(b)** A green suite proves nothing about what must *never* appear; look at screenshots. **(c)** `generate-content.mjs` and `generate-asset-plan.mjs` own their outputs — hand-edits to `src/data/*.json` or the prompt docs get overwritten. **(d)** Verify a gate fails before trusting it; every gate in this repository has been deliberately broken at least once.

---

## 7. Recommended next action

**RECOMMENDATION.** Review this run, then decide the four items in Q4 above. If the Gemini pass is authorised, run Batch 01 (14 images) and review before any further generation. If it is not, Phase 6 can begin immediately from the specification — the two are independent.

**This review does not decide whether Gemini images should be accepted.** That is the Director's call, and the acceptance machinery (`ASSET_PROVENANCE.md`, `AI_ASSET_REVIEW_CHECKLIST.md`, `GEMINI_BATCH_01_REVIEW.md`) exists to support it rather than to pre-empt it.
