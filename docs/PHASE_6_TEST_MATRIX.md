# Phase 6 — Search / Filter / Sort Test Matrix

Companion to `PHASE_6_SEARCH_FILTER_SORT_SPEC.md`. Every case below is written against the **actual Phase 5 dataset** (161 documents), so expected results are concrete rather than hypothetical.

**Status: PLANNED.** None of these tests exist yet; they are written now so Phase 6 is built against a fixed target.

Dataset facts these cases rely on: 7 categories · 35 characters (5/category) · 21 events (3/category) · 21 articles (3/category, 1 featured each) · 28 gallery images · 14 trailers · 21 releases · 14 merchandise.

---

## 1. Normalisation (`normalise`) — unit

| # | Input | Expected | Why |
|---|---|---|---|
| N1 | `"Ronin"` | `"ronin"` | lowercase |
| N2 | `"  Starlit   Ronin  "` | `"starlit ronin"` | whitespace collapse + trim |
| N3 | `"Starlit Ronin: Why the Ashen…"` | no `:` or `…` | punctuation → space |
| N4 | `"ARIA-9"` | `"aria 9"` | hyphen → space, so both `aria-9` and `aria 9` match |
| N5 | `"café"` | `"cafe"` | NFD + strip combining marks |
| N6 | `"Hòa"` | `"hoa"` | Vietnamese tone mark stripped |
| N7 | `"điện"` | `"dien"` | **`đ` → `d`; the case NFD does not handle** |
| N8 | `"ĐIỆN"` | `"dien"` | uppercase `Đ` + diacritics |
| N9 | `"Việt Nam"` | `"viet nam"` | multiple diacritics |
| N10 | `""` | `""` | empty is safe |
| N11 | `"🎌 anime"` | `"anime"` (emoji tolerated, not crashing) | non-Latin input must not throw |
| N12 | `normalise(normalise(x)) === normalise(x)` | true for all above | idempotent |

**Symmetry check (critical):** for each pair, `normalise(a) === normalise(b)`:
`("Hoa","Hòa")`, `("dien","điện")`, `("cafe","café")`, `("RONIN","ronin")`.
Asymmetric normalisation is the classic silent-miss bug; assert both directions.

---

## 2. Search matching — unit

| # | Query | Expected | Notes |
|---|---|---|---|
| S1 | `"Kaida Nova"` | `character-anime-kaida-nova` ranks #1 | exact title match |
| S2 | `"kaida nova"` | same as S1 | case-insensitive |
| S3 | `"KAIDA"` | Kaida Nova #1 | case-insensitive partial |
| S4 | `"ron"` | includes every *Starlit Ronin* document (franchise appears in the category, all 5 character `series` values, articles, gallery, trailers, releases and merchandise) | mid-word partial |
| S5 | `"Ronin"` | Starlit Ronin category + anime documents | cross-type |
| S6 | `"starlit ronin"` | the same set as S4; both tokens must match | multi-token AND |
| S7 | `"ronin ashfall"` | **0 results** | AND across unrelated franchises |
| S8 | `"zzzznomatch"` | 0 results, no-result state | negative |
| S9 | `""` | browse state, **not** "no results" | empty query |
| S10 | `"   "` | same as S9 | whitespace-only |
| S11 | `"a"` | many results, no error | 1-char query allowed |
| S12 | `"exorcist"` | Yui Kurogane + Hono Saeki (role/tag) | secondary-field match |
| S13 | `"celestial blade"` | Kaida Nova (biography + tag) | body match |
| S14 | `"protagonist"` | the 5 protagonist-tagged characters (K-Pop and Comics leads use `leader`) | tag match |
| S15 | `"LUNARIS"` | K-Pop category + 5 members + LUNARIS content | franchise across types |
| S16 | `"aria-9"` and `"aria 9"` | both find ARIA-9 | hyphen normalisation (N4) |
| S17 | `"Cartographer"` | `character-comics-the-cartographer` #1 | longest name |
| S18 | `"convention"` | the 3 convention events + related | eventType/description |

---

## 3. Ranking — unit

| # | Case | Expected |
|---|---|---|
| R1 | `"Kaida Nova"` | title-exact (100) outranks any body-only match |
| R2 | `"Starlit"` | the *Starlit Ronin* **category** (title-starts) outranks an article mentioning it in body |
| R3 | Featured tie-break | between two equal scores, `featured: true` wins (+5) |
| R4 | Determinism | running each of `["ronin","a","lunaris","exorcist"]` twice yields identical id sequences |
| R5 | Total order | no two results share a tie-break path; `id` guarantees uniqueness |
| R6 | Cross-type order | equal-score documents order by the fixed type order, then title, then id |
| R7 | Multi-field bonus | a document matching title + tag + body outranks one matching title only |

---

## 4. Filters — unit

| # | Filter | Expected count |
|---|---|---|
| F1 | category = anime | 23 documents (1 category + 5 chars + 3 events + 3 articles + 4 gallery + 2 trailers + 3 releases + 2 merch) |
| F2 | category = anime, gaming | union of both (OR within facet) |
| F3 | type = character | 35 |
| F4 | type = character, category = kpop | 5 |
| F5 | type = event | 21 |
| F6 | type = article, category = manga | 3 |
| F7 | tag = protagonist | 5 |
| F8 | series = "Starlit Ronin" | 5 characters (FR-021) |
| F9 | status = upcoming, type = release | the upcoming releases only (FR-026 pattern) |
| F10 | status = coming-soon, type = merchandise | the coming-soon products |
| F11 | no filters | all 161 |
| F12 | contradictory (type = character + series = LUNARIS + category = anime) | 0, clean empty state |
| F13 | AND across facets | category anime + type character = 5, not 40 |
| F14 | **tag facet excludes category ids** (G3) | `anime`/`gaming`/… do not appear as tag options |
| F15 | facet counts | each option's count equals the result count when that option alone is applied |
| F16 | zero-count options | rendered disabled, not removed (no layout reflow) |

---

## 5. Sort — unit

| # | Sort | Expected |
|---|---|---|
| O1 | relevance (with query) | matches §3 ordering |
| O2 | relevance (no query) | falls back to A–Z |
| O3 | A–Z | `localeCompare` ascending on normalised title |
| O4 | Z–A | exact reverse of O3 |
| O5 | newest | dates descending |
| O6 | newest, mixed types | all 84 undated documents sort **last**, ordered by title |
| O7 | oldest | dates ascending, undated last |
| O8 | featured first | the 7 featured articles first, then the rest |
| O9 | stability | equal keys keep the §3.3 tie-break order |
| O10 | unavailable sort | disabled with a reason, not hidden |

---

## 6. Combined query + filter + sort — unit

| # | Combination | Expected |
|---|---|---|
| C1 | `q="ronin"` + type=character + sort=az | the 5 Starlit Ronin characters, alphabetical |
| C2 | `q="a"` + category=kpop + type=article + sort=newest | K-Pop articles by date desc |
| C3 | `q="convention"` + status=upcoming + sort=newest | upcoming convention events, newest first |
| C4 | filters only, no query | filters apply; sort defaults to A–Z |
| C5 | query narrows to 0, filters still applied | empty state, filters remain visible and clearable |
| C6 | clear query, keep filters | filtered browse view |
| C7 | clear all | full 161-document browse view, default sort |
| C8 | order of operations | search → filter → sort, and the result is independent of the order the user set them in |

---

## 7. URL / state — E2E

| # | Case | Expected |
|---|---|---|
| U1 | typing updates `?q=` | debounced, `replace: true` |
| U2 | selecting a filter updates `?category=` | comma-separated |
| U3 | changing sort updates `?sort=` | |
| U4 | **reload preserves full state** | `#/search?q=ronin&category=anime&type=character&sort=az` restores identically |
| U5 | deep link from cold load | same view as U4 without prior navigation |
| U6 | back steps between searches | not between keystrokes (U1 uses `replace`) |
| U7 | forward restores | |
| U8 | **HashRouter integrity** | after every operation the URL still matches `#/search?...`; the app never lands on Not Found (the D-032 defect class) |
| U9 | unknown param values | ignored gracefully, no crash (`?category=notreal`) |
| U10 | malformed params | `?type=,,,` handled without error |
| U11 | header search from another route | navigates to `/search?q=…` from any page (FR-009) |
| U12 | hub filters scoped to route | `#/anime?type=character` filters within Anime; category not duplicated in a param |

---

## 8. Accessibility — E2E

| # | Case | Expected |
|---|---|---|
| A1 | axe on `/search` with results | no serious/critical |
| A2 | axe with no results | no serious/critical |
| A3 | axe with the mobile filter drawer open | no serious/critical |
| A4 | result count announced | `role="status"` `aria-live="polite"` contains "{n} results" |
| A5 | announcement is debounced | not fired per keystroke |
| A6 | keyboard-only journey | input → filters → sort → first result, all reachable, focus always visible |
| A7 | focus is never stolen | focus stays in the input while results update |
| A8 | submit moves focus | to the results heading |
| A9 | `Escape` in input | clears the query |
| A10 | filters are native controls | `fieldset`/`legend`/`checkbox`, each with a count in its accessible name |
| A11 | disabled options | `aria-disabled`, reason audible |
| A12 | clear buttons named | "Clear category filters", "Clear all" — never a bare ✕ |
| A13 | heading hierarchy | single h1, no skipped levels (the Phase 5C defect class) |
| A14 | not colour-alone | active filters show a checkmark/text, and badges use `--color-primary-on-tint` (D-039) |
| A15 | drawer focus trap | traps Tab, closes on Escape, restores focus to the opener |

---

## 9. Responsive — E2E

| # | Viewport | Expected |
|---|---|---|
| V1 | 375×812 | no horizontal overflow; filters in the drawer |
| V2 | 390×844 | as V1 |
| V3 | 768×1024 | no overflow; filters inline or drawer per breakpoint |
| V4 | 1024×768 | inline filters |
| V5 | 1440×900 | inline filters |
| V6 | all | touch targets ≥24px (Phase 5C fix) |
| V7 | all | long titles wrap, never clip |
| V8 | 375 | result cards remain legible in a dense grid |

---

## 10. Performance & integrity — E2E

| # | Case | Expected |
|---|---|---|
| P1 | **no network during search (FR-011)** | zero non-asset requests while typing — the direct proof of the requirement |
| P2 | no console error during search | clean |
| P3 | no failed request | clean |
| P4 | index built once | not rebuilt per keystroke (assert via a build counter in test) |
| P5 | bundle growth | main chunk grows < 15 kB gzip vs the Phase 5C baseline (483 kB raw / 132 kB gzip) |
| P6 | typing latency | no dropped frames typing a 10-character query at 375px |

---

## 11. Boundary cases

| # | Case | Expected |
|---|---|---|
| B1 | shortest title (`"Yuri"`, `"Hana"`) | findable; not lost among substring noise |
| B2 | longest title (`"The Cartographer (Elliot Graves)"`, 32 chars; longest article title 66 chars) | matches and renders without clipping |
| B3 | query longer than any title | 0 results, clean empty state |
| B4 | query of only punctuation (`"---"`) | normalises to empty → browse state, not a crash |
| B5 | very long query (500 chars) | 0 results, no hang |
| B6 | query matching every document (`"a"`) | all groups render, no perf issue |
| B7 | parenthesised name (`"Marcus Steele"`) | finds `Aegis (Marcus Steele)` |
| B8 | non-human character (`"ARIA-9"`) | found despite the hyphen/digit |
| B9 | duplicate titles across types | both returned, ordered by the type tie-break |
| B10 | all filters selected at once | equals no filter (full set) |
| B11 | category with an id/slug mismatch (`kpop` vs `k-pop`) | both resolve — the existing `getCategoryByIdOrSlug` trap |
| B12 | Vietnamese query against English content | no match, no crash; normalisation still applied |

---

## 12. Regression guards

These existing behaviours must still hold after Phase 6.

| # | Guard | Source |
|---|---|---|
| G1 | skip link never corrupts router state | D-032 |
| G2 | badge contrast uses `--color-primary-on-tint` | D-039 |
| G3 | no heading-level skips anywhere | Phase 5C |
| G4 | no SRS ids or placeholder copy in the UI | Phase 5C (`content-honesty.spec.ts`) |
| G5 | Fandom Core nodes still map to the 7 hubs | Phase 5 |
| G6 | `CATEGORY_ROUTES` remains the only route registry | Phase 5 |
| G7 | content-validation gate still passes | Phase 5 (47 assertions) |
| G8 | all 161 declared assets still resolve | Phase 5 |
| G9 | touch targets remain ≥24px | Phase 5C |
| G10 | mobile hub height does not regress | D-041 |
