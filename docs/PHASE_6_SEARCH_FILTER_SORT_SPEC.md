# Phase 6 — Search / Filter / Sort Technical Specification

**Status: SPECIFICATION ONLY. Nothing in this document is implemented.** Phase 5D produced the design; Phase 6 builds it. The current `SearchPage` is still the Phase 1 substring stub over article titles and character names.

Companion: `PHASE_6_TEST_MATRIX.md`.

---

## 1. Requirements mapping

Every SRS requirement this phase must satisfy, with where it lands.

| Req | Requirement | Where it is satisfied |
|---|---|---|
| **FR-005** | Category hub shows a catalog of that category's content | Already shipped (Phase 5). Phase 6 adds filter/sort controls *on top* of the existing sections. |
| **FR-006** | Each card shows title, thumbnail, short description, content type, tags | **Partially shipped — gap.** Cards currently show title, thumbnail and description. **Content type and tags are not rendered on most cards.** Phase 6 must add a type badge and tag chips to the shared card. See §11 Gap G1. |
| **FR-007** | Content filterable by type (articles, galleries, videos, audio, character profiles, events, merchandise, releases) and by category sub-tags | `FilterBar` on the category hub + search results. §4. |
| **FR-008** | Content sortable alphabetically, by newest, and by popularity/featured status | `SortControl`. §5. |
| **FR-009** | Global search bar on all pages, searching all categories and content types | `GlobalSearchBar` already exists on every route; Phase 6 replaces the stub engine behind it. §3. |
| **FR-010** | Search results filterable by category and content type | Same `FilterBar`, mounted on `/search`. §4. |
| **FR-011** | Search runs client-side over the JSON dataset, no network | `searchIndex` module, built at import time from `src/data`. §7. Asserted by a network-activity test. |
| **FR-016** | Media filterable by category and media type (trailer, interview, podcast, fan content) | Type facet on media. **Data gap:** only `trailer` exists today. See §11 Gap G2. |
| **FR-021** | Characters filterable by category and franchise/series | `series` facet, active only for characters. §4. |
| **FR-026** | Trailers filterable by category and release status (upcoming / recently released) | `releaseStatus` facet. §4. |
| **NFR-002** | Accessible | §8. |
| **NFR-005** | Performance | §7. |

---

## 2. Data model — every field mapped to a purpose

The index is built from the existing collections in `src/data/index.ts`. **No new content file, and no second category registry** — `CATEGORY_ROUTES` remains the only route registry and `categories.json` the only category registry.

### 2.1 Indexed entity shape

```ts
interface SearchDocument {
  id: string                  // the entity's existing stable id
  type: ContentKind           // 'article' | 'character' | 'event' | 'trailer'
                              // | 'release' | 'merchandise' | 'gallery' | 'category'
  categoryId: CategoryId
  title: string               // display title (name/title, per type)
  description: string         // short display text (summary/description/caption)
  path: string                // in-app route, e.g. /character/<id>
  thumbnail: AssetRef
  tags: string[]              // normalised, see §2.3
  date?: string               // ISO date where the type has one
  featured: boolean
  series?: string             // characters only (FR-021)
  status?: string             // release status / merch availability / event status
  haystack: {                 // pre-normalised, built once (§7)
    primary: string           // title
    secondary: string         // description, role, series, location, type
    body: string              // long text: article body, character biography
    tags: string              // joined normalised tags
  }
}
```

### 2.2 Per-type field mapping

| Type | Count | `title` | `description` | `body` | `date` | `featured` | `status` | Extra |
|---|---|---|---|---|---|---|---|---|
| article | 21 | `title` | `summary` | `body` | `publishedDate` | `featured` | — | — |
| character | 35 | `name` | `role` + `series` | `biography` + `traits` | — | false | — | `series` (FR-021) |
| event | 21 | `title` | `description` + `location` | — | `date` | false | `status` | `eventType` |
| trailer (media) | 14 | `title` | `description` | — | `publishedDate` | false | `releaseStatus` | `mediaType` (FR-016/026) |
| release | 21 | `title` | `description` | — | `releaseDate` | false | `status` | `type` |
| merchandise | 14 | `name` | `description` | — | — | false | `status` | price (display only) |
| gallery image | 28 | `title` | `caption` | — | — | false | — | — |
| category | 7 | `name` | `tagline` + `description` | `visualMotif` + `franchise` | — | false | — | — |
| **Total** | **161** | | | | | | | |

### 2.3 Display-only vs filterable

| Filterable | Display-only |
|---|---|
| `categoryId`, `type`, `tags`, `series`, `status`, `date` (range/sort), `featured` | `thumbnail`, `price`, `currency`, `durationSeconds`, `traits`, `location`, `eventType` label, `credit`/provenance, `fictional` flag |

`fictional` is deliberately **not** a filter: everything in the dataset is fictional, so a filter over it would always be a no-op. It stays a display badge.

---

## 3. Search model

### 3.1 Normalisation (`normalise(text): string`)

Applied identically to indexed text and to the query — this is the single most important correctness rule, because any asymmetry produces silent misses.

1. `String.prototype.normalize('NFD')` — decomposes accented characters into base + combining mark.
2. Strip `̀-ͯ` — removes the combining marks. `é → e`, `Hòa → Hoa`, `ế → e`.
3. **Replace `đ → d` and `Đ → D` explicitly.** This is the Vietnamese case NFD does *not* handle: `đ` is a distinct letter, not `d` + a combining mark, so it survives step 2 untouched. Omitting this is the classic Vietnamese search bug — `dien` would fail to match `điện`.
4. Lowercase (`toLocaleLowerCase()`).
5. Collapse runs of whitespace to a single space; trim.
6. Strip punctuation used as word glue (`–—’'"()[]:;,.!?`) to spaces, so `"Ronin:"` and `"Ronin"` match, and `ARIA-9` is findable as `aria 9` and as `aria-9`.

**Vietnamese behaviour.** The dataset is currently all-English, so this is forward-looking, but the rules are specified now because retrofitting them later silently changes every result. Diacritic-insensitivity is **symmetric**: `hoa` matches `Hòa`, and `Hòa` matches `hoa`. A Vietnamese user typing without diacritics (very common) still finds diacritic content.

### 3.2 Matching

- Query is normalised then split on whitespace into **tokens**.
- A document matches only if **every** token matches somewhere in it (AND semantics). AND is chosen over OR because with 161 documents OR returns nearly everything and feels broken.
- A single token matches a field if the normalised field **contains** the token (substring, so partial matching works mid-word: `ronin` matches `starlit ronin`, `ron` matches `ronin`).
- Case-insensitive by construction (both sides lowercased).
- Empty/whitespace-only query ⇒ no search is performed; the page shows the browse/empty state (§6), not zero results.
- Minimum query length: **1 character**. No artificial minimum — with 161 documents there is no performance reason for one, and minimums surprise users.

### 3.3 Ranking (deterministic)

Score is the **sum** of every rule that fires, so a document matching in several places outranks one matching in a single place.

| Rule | Points |
|---|---|
| Normalised title equals the full query exactly | 100 |
| Title starts with the query | 60 |
| Title contains the query | 40 |
| An exact tag equals the query | 30 |
| Secondary text (description/role/series/location) contains the query | 20 |
| Body text (article body / biography) contains the query | 10 |
| Document is `featured` | +5 |

**Exact-match priority** is therefore structural: a title-exact hit (100) can never be outranked by body hits.

**Determinism.** Ties are broken in a fixed order, so the same query always yields byte-identical ordering:
1. score, descending
2. type, by a fixed declared order (`category, article, character, event, trailer, release, merchandise, gallery`)
3. normalised title, ascending (`localeCompare`)
4. `id`, ascending — the final tie-break, guaranteed unique, so the sort is **total**

A stable sort alone is not enough, because the input order across collections is itself arbitrary; the `id` tie-break is what makes ordering reproducible.

### 3.4 Result grouping

Results are grouped by `type`, in the fixed type order above, with a count per group and an overall total. Grouping is presentational only — ranking is global, so the best match is the first item of the first non-empty group. When a type filter selects exactly one type, grouping headers collapse to a single list.

---

## 4. Filter model

| Facet | Applies to | Values | Multi-select | Source |
|---|---|---|---|---|
| **Category** | all | the 7 categories | yes (OR within facet) | `categories.json` |
| **Content type** | all | the 8 `ContentKind`s | yes (OR) | fixed union |
| **Tag** | article, character, trailer, merchandise | union of `tags` | yes (OR) | data, **after cleanup — see G3** |
| **Series** | character only (FR-021) | the 7 franchises | yes (OR) | `characters[].series` |
| **Status** | event, trailer, release, merchandise | `upcoming`/`recent`/`available`/`coming-soon` | yes (OR) | per-type status fields |

**Combination semantics:** OR *within* a facet, AND *across* facets. Selecting Anime + Gaming and type Character means "characters in (Anime or Gaming)". This is the conventional model and the only one users predict correctly.

**Facets are derived from the current result set**, and each option shows its count. Options with a zero count are shown disabled rather than hidden, so the control does not reflow as the user types.

**Deliberately not built:** price range (14 products, no user need), duration (one value), `fictional` (constant), event type (4 values, low value — revisit only if asked). The SRS requires the facets in §1; inventing more would add UI without utility.

---

## 5. Sort model

| Option | Applies | Behaviour |
|---|---|---|
| **Relevance** | when a query is present | Score desc, then the §3.3 tie-breaks. Default with a query. |
| **Newest first** | where `date` exists | `date` desc. Documents with no date sort **last**, then by title — they are not silently dropped. |
| **Oldest first** | where `date` exists | `date` asc, undated last. |
| **A–Z** | all | normalised title asc, `localeCompare`. Default with no query. |
| **Z–A** | all | normalised title desc. |
| **Featured first** | all | `featured` desc, then relevance (or title). Satisfies FR-008's "popularity/featured status". |

**"Popularity" is deliberately mapped to `featured`.** There is no popularity signal in the dataset — no view counts, no ratings, and inventing one would be fabricating data. `featured` is the only real editorial-prominence field. This mapping is recorded so the choice is visible rather than silently assumed.

Only 7 of 161 documents (the featured articles) have `featured: true`; "Featured first" therefore surfaces one article per category. Sort options that cannot apply to the current result set are disabled with a reason, not hidden.

---

## 6. State / URL model

**All search state lives in the URL query string.** No Zustand store, no component state as source of truth.

```
#/search?q=ronin&category=anime,gaming&type=character&tag=protagonist&sort=relevance
```

| Param | Meaning | Default |
|---|---|---|
| `q` | query text | `''` |
| `category` | comma-separated category ids | none (all) |
| `type` | comma-separated content kinds | none (all) |
| `tag` | comma-separated tags | none |
| `series` | comma-separated series | none |
| `status` | comma-separated statuses | none |
| `sort` | one sort key | `relevance` with `q`, else `az` |

**Why the URL.** It is shareable and deep-linkable, survives reload and back/forward, needs no new state library, and keeps a single source of truth. `SearchPage` already reads `?q` via `useSearchParams`, and `deep-links.spec.ts` already proves `#/search?q=anime` survives a reload — so this is an extension of a working, tested pattern, not a new mechanism.

**HashRouter compatibility.** The query string sits *inside* the hash (`#/search?q=x`), which `useSearchParams` handles natively under `createHashRouter`. This is already verified by the existing deep-link test. Three rules protect it:

1. Read and write params **only** through `useSearchParams` — never `window.location.search`, which under HashRouter refers to the pre-hash query and would be wrong.
2. Never write a bare `#fragment`; a raw hash write corrupts the router's route state. This is the D-032 defect class and is the single most dangerous mistake available in this codebase.
3. Use `replace: true` while the user types so the back button steps between *searches*, not between keystrokes.

**Category-hub filters** use the same params scoped to the hub route (`#/anime?type=character&sort=az`), with the category implied by the route rather than duplicated in a param.

---

## 7. Performance

**Current scale: 161 documents, ~99KB of JSON.** Linear scan over 161 pre-normalised objects is sub-millisecond. The correct engineering decision is therefore **not to build an inverted index**.

- **Index build:** one pass at module import, producing the `haystack` strings. Done once per session, memoised at module scope.
- **Normalisation cost:** paid at build time, never per keystroke. Only the query is normalised on input.
- **Memoisation:** `useMemo` on `[query, filters, sort]`; facet counts derived in the same pass.
- **Derived selectors:** pure functions (`searchDocuments`, `applyFilters`, `applySort`, `deriveFacets`) that take data and return data — unit-testable without React.
- **Debounce:** ~120ms on the input for render smoothness only, *not* for compute. The URL is updated with `replace: true` on the debounced value.
- **Lazy:** none needed. Do **not** code-split the index; it is already in the main bundle as content.

**Phase 13 options, explicitly deferred (do not pre-build):** inverted token index, trigram index, or a `Map` from token → document ids. Each is justified only if the dataset grows by roughly an order of magnitude or a measurement shows a real problem. Record a measurement before optimising.

**Watch item:** the main bundle already carries the full content dataset (483 kB raw / 132 kB gzip). Phase 6 adds logic, not data, so it should add only a few kB. If search pushes the main chunk materially, that is a signal to revisit content loading in Phase 13 — not to shrink search.

---

## 8. Accessibility

| Concern | Specification |
|---|---|
| **Input labelling** | `<input type="search">` with a real `<label>` (visually hidden is fine — one already exists in `GlobalSearchBar`). `role="search"` on the wrapping form. |
| **Result announcement** | A polite live region: `<p role="status" aria-live="polite">` announcing `"{n} results for '{q}'"`. Announce the debounced, settled count — never every keystroke. |
| **No-result state** | Same live region announces "No results for '{q}'". The empty state is real text, not an icon. |
| **Filter controls** | Native `<input type="checkbox">` in a `<fieldset>` with a `<legend>` per facet. Not custom divs. Counts are part of each control's accessible name (`"Anime (12)"`). |
| **Disabled options** | `disabled` + `aria-disabled`, with the zero count still in the name, so the reason is audible rather than implied by greying. |
| **Sort control** | Native `<select>` with a `<label>`. Unavailable options `disabled`. |
| **Clear controls** | A real `<button>` per facet plus "Clear all", each with an explicit accessible name (`"Clear category filters"`). Never an unlabelled ✕. |
| **Keyboard** | Everything native and in DOM order: input → filters → sort → results. No key traps, no custom arrow handling needed. `Enter` submits. `Escape` in the input clears it. |
| **Focus management** | Focus stays in the input while typing — results must never steal it. On submit from the header bar, focus moves to the results heading (`tabIndex={-1}`), matching the existing route-transition focus pattern. |
| **Colour** | Active filter state uses a checkmark and text, never colour alone. Badge contrast must use `--color-primary-on-tint` (D-039). |
| **Mobile** | Filters collapse into the existing accessible `Drawer` (already focus-trapped and Escape-dismissible via `useFocusTrap`), opened by a "Filters (2)" button whose name includes the active count. Touch targets ≥24px (Phase 5C fix). |
| **Reduced motion** | No animated result transitions under `prefers-reduced-motion`. |

---

## 9. Component architecture

```
src/features/search/
  searchIndex.ts        buildIndex(): SearchDocument[]   — memoised, pure
  normalise.ts          normalise(text): string          — pure, incl. đ/Đ
  searchDocuments.ts    (docs, query) => ScoredDocument[] — pure, ranked
  applyFilters.ts       (docs, filters) => docs           — pure
  applySort.ts          (docs, sort, hasQuery) => docs    — pure
  deriveFacets.ts       (docs, filters) => Facet[]        — pure, with counts
  useSearchState.ts     URL <-> state via useSearchParams — the only stateful piece

src/components/search/
  FilterBar.tsx         fieldsets of checkbox facets + clear controls
  SortControl.tsx       labelled native select
  ResultsSummary.tsx    the aria-live status region
  ResultGroup.tsx       one type group, reusing the existing Card primitives
```

**Reuse, do not rebuild:** `Card`/`CardMedia`/`CardHeader`/`CardBody`/`CardFooter`, `Grid`, `Badge`, `SectionHeader`, `EmptyState`, `Drawer`, `FormField`, `SearchInput`. Phase 6 adds **no new card system** — the hub and the results page render the same cards.

Everything except `useSearchState` is a pure function, so the engine is testable without rendering.

---

## 10. Implementation order

1. `normalise.ts` + unit tests (including Vietnamese `đ`/diacritics) — everything else depends on its correctness.
2. `searchIndex.ts` + a test asserting all 161 documents are indexed with the right types.
3. `searchDocuments.ts` (match + rank) + ranking/determinism tests.
4. `applyFilters.ts`, `applySort.ts`, `deriveFacets.ts` + tests.
5. `useSearchState.ts` — URL round-trip, HashRouter deep-link tests.
6. `ResultsSummary`, `ResultGroup` — rebuild `SearchPage` on the real engine.
7. `FilterBar`, `SortControl` on `/search` (FR-009/010/011).
8. Mount the same controls on the category hub (FR-007/008).
9. Add type badge + tag chips to cards (**closes gap G1, FR-006**).
10. Accessibility pass + axe + keyboard walkthrough; then full regression.

Steps 1–4 are pure logic and can be completed and fully tested before any UI exists.

---

## 11. Known gaps this spec must not paper over

| # | Gap | Impact | Recommendation |
|---|---|---|---|
| **G1** | **FR-006 is only partly met today.** Cards show title, thumbnail and description, but not content type or tags. | A mandatory SRS requirement is unmet in shipped UI. | Add a type badge and tag chips to the shared card in Phase 6 step 9. Cheap, and it also makes filter results self-explanatory. |
| **G2** | **FR-016 expects media types trailer/interview/podcast/fan-content; only `trailer` exists** (14 items). | The media-type facet would render with a single option. | Either add interview/podcast/fan-content content, or ship the facet with one option and document why. **Director decision — do not invent content unilaterally.** |
| **G3** | **Tag data is polluted.** Tags duplicate the category (`anime`, `gaming`…) and merchandise tags include SVG glyph names (`shirt`, `pin`, `poster`, `disc`) that are asset-pipeline artefacts, not user-facing concepts. | A tag facet built from raw data would show a redundant category list plus meaningless glyph names. | Phase 6 must derive the tag facet from `tags` **minus category ids**. Recommend also cleaning `generate-content.mjs` so merchandise tags describe the product (`apparel`, `collectible`) rather than the glyph. |
| **G4** | Only 7 of 161 documents are `featured`, and there is no popularity signal. | "Popularity" in FR-008 cannot be satisfied literally. | Map it to `featured` (§5) and state the mapping in the UI copy. Do not fabricate view counts. |
| **G5** | Characters, merchandise and gallery images have **no date**. | "Newest" cannot order 84 of 161 documents (35 characters, 14 merchandise, 28 gallery images, 7 categories). | Undated documents sort last, deterministically by title (§5). Do not invent dates. |

---

## 12. Acceptance criteria

Objective and measurable. Phase 6 is done when all of these hold.

| # | Criterion | How it is measured |
|---|---|---|
| A1 | All 161 documents are indexed, with correct type and category | Unit test asserts per-type counts equal the dataset counts |
| A2 | `normalise` is diacritic-insensitive **both ways**, and handles `đ`/`Đ` | Unit test over an explicit Vietnamese table |
| A3 | Exact title match always ranks first | Unit test per type |
| A4 | Ranking is deterministic | Same query run twice returns identical id order; asserted over a fixed query set |
| A5 | Partial and case-insensitive matching work | Unit tests (`ron` → Starlit Ronin; `RONIN` == `ronin`) |
| A6 | Empty query shows the browse state, not "no results" | Component test |
| A7 | No-result state renders real text and is announced | Component + axe test |
| A8 | Category, type, tag, series and status filters each narrow correctly | Unit test per facet |
| A9 | Combined query + filters + sort behaves as OR-within / AND-across | Unit test over a fixed matrix |
| A10 | All six sort modes order correctly; undated items sort last | Unit tests |
| A11 | Every control is reachable and operable by keyboard alone | E2E keyboard walkthrough |
| A12 | Result count is announced via `aria-live` | E2E assertion on `role="status"` |
| A13 | URL round-trips: state → URL → reload → identical state | E2E deep-link test |
| A14 | Deep link with all params restores exactly that view | E2E test |
| A15 | Back/forward steps between searches, not keystrokes | E2E history test |
| A16 | **No network request is made during search** (FR-011) | E2E asserts zero non-asset requests while typing |
| A17 | axe reports no serious/critical issues on `/search` with results, with no results, and with filters open | E2E axe scan |
| A18 | No horizontal overflow at 375 / 390 / 768 / 1024 / 1440 | E2E responsive test |
| A19 | Mobile filter drawer traps focus and closes on Escape | E2E test (pattern already proven for `Drawer`) |
| A20 | Search interaction produces no console error or failed request | E2E console audit |
| A21 | FR-006 gap G1 closed — cards show type and tags | Component test |
| A22 | Main bundle grows by < 15 kB gzip versus the Phase 5C baseline | Build output comparison |

---

## 13. Explicitly out of scope for Phase 6

Fuzzy/typo-tolerant matching, synonyms, stemming, search-as-you-type suggestions, recent-search history, result pagination (161 documents do not need it), server-side anything, and any analytics. Each would add real complexity for no requirement in the SRS.
