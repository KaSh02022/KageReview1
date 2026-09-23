# Phase 5C — Real Content UX Audit

An audit of the **actual Phase 5 content** as rendered in a browser, rather than of seed data or of test assertions. The purpose was to find defects that a green test suite can hide.

It found five, four of which no existing test could have caught, because every test asserted on what *should* be present and nothing asserted on what must never appear.

---

## 1. Audit scope

| Dimension | Coverage |
|---|---|
| **Pages** | 29 routes — 7 category hubs, 4 character details (longest name, shortest name, longest biography, non-human), 2 event details, 2 article details, 2 product details (available + coming-soon), cart, bookmarks, trailers, events, releases, merchandise, search (empty / with results / no results), contact, about, home |
| **Viewports** | 375×812, 390×844, 768×1024, 1024×768, 1440×900 |
| **Method** | Programmatic DOM evidence at all 5 viewports + full-page screenshots at 375 and 1440 for human review |
| **Checks** | horizontal overflow · broken images · missing/weak alt text · text clipping · links without accessible names · dead links · buttons without accessible names · touch targets < 24px · heading hierarchy · placeholder/TODO leakage · empty sections · document titles · console errors · page errors · failed requests |
| **Boundary cases** | longest character name (`The Cartographer (Elliot Graves)`), shortest (`Yuri`), longest biography (238 chars), longest article title (66 chars), longest article body (579 chars), longest event title, longest location string, non-human character (ARIA-9), coming-soon product |

Harness: a temporary `e2e/zz-audit.spec.ts`, removed before commit. Its durable findings are now permanent tests (§5).

---

## 2. Defects found

| # | Severity | Defect | Status |
|---|---|---|---|
| **D1** | **P1** | Heading-level skip (h1 → h3) on `/trailers`, `/releases`, `/merchandise`, `/events` | **Fixed** |
| **D2** | **P1** | Heading-level skip (h1 → h3 → h4) on `/search` when results render | **Fixed** |
| **D3** | **P1** | Internal SRS requirement ids rendered in the user-facing UI | **Fixed** |
| **D4** | **P1** | Phase 1 placeholder text `"Seed City, Placeholder Region"` shown as the project's address | **Fixed** |
| **D5** | **P2** | Touch targets below the WCAG 2.2 24px minimum (related-content links, contact email) | **Fixed** |
| **I1** | — | Focus ring drawn around the entire `<main>` | **Investigated — not a defect** |

---

### D1 — Heading-level skip on four aggregate pages (P1)

**Symptom.** `/trailers`, `/releases`, `/merchandise` and `/events` produced the heading outline `h1 → h3`, skipping `h2`. Screen-reader users navigating by heading level get a broken document outline.

**Root cause.** These pages render a page `h1` and then `Card`s whose headings were `h3`. On a category hub, `h3` is correct because cards sit beneath an `h2` section heading. These four pages have no intervening section heading, so `h3` skipped a level. The pattern was copied from the hub without re-checking the context.

**Fix.** Card headings changed to `h2` on all four pages — they are top-level items on those pages. No visible design change.

**Why no test caught it.** The Phase 5 heading-hierarchy test asserted only on category hubs. These aggregate pages were never checked.

**Validation.** Audit harness reports a clean outline at all 5 viewports; the durable heading check now runs over every primary route.

---

### D2 — Heading-level skip on Search, only when results render (P1)

**Symptom.** `/search?q=…` produced `h1 → h3 → h4`.

**Root cause.** `SearchPage` used `SectionHeader level={3}` for result groups and `h4` for cards — both one level too deep for a page whose only ancestor heading is the `h1`.

**Fix.** Result-group headings `h3 → h2`, card headings `h4 → h3`.

**Why it nearly escaped this audit too.** The first audit pass tested `/search` with **no query**, which renders no result sections and therefore no skip. It was only found after adding `?q=a` and `?q=zzzznomatch` to the route list. *A page's defect can live entirely in a state the audit never entered.*

**Validation.** Clean outline with results, with no results, and empty.

---

### D3 — Internal SRS requirement ids rendered to visitors (P1)

**Symptom.** The Cart page displayed **"Requirements: FR-029, FR-030, FR-031"**. Found by looking at a screenshot, not by any automated check.

Further inspection found the same class of leak in eleven places:

- `PagePlaceholder` rendered a `requirementIds` list and an `Implemented in: <phase>` line — used by About, Bookmarks, Cart, Contact and Search.
- Requirement ids were also hard-coded inside user-facing copy on Trailers (`FR-025/FR-026`), Events (`FR-022–024`), Merchandise (`FR-027–031`), Releases (`docs/05_DATA_SCHEMA.md §9`), Product detail (`FR-031`), the chatbot panel (`FR-032–034`, plus "Phase 1/2 chatbot shell") and the dummy-auth dialog (`SRS FR-045`).

**Root cause.** Phase 1 development scaffolding that was never removed once the pages became real. `PagePlaceholder` was built as a dev placeholder and kept its dev affordances after it had quietly become the standard page header.

**Fix.**
1. The `requirementIds` and `phase` props were **removed from `PagePlaceholder` entirely**, not merely unset — so a future caller cannot reintroduce them.
2. All eleven user-facing strings rewritten in plain language, preserving the honest meaning. For example, *"...no checkout, payment, or real purchase (FR-031)"* became *"This is a fictional product in a temporary demo cart — no checkout, payment, or real purchase."* — which is more informative to a visitor, not less.

Requirement ids in **code comments** were left alone; they are useful to developers and invisible to visitors.

**Validation.** `e2e/content-honesty.spec.ts` asserts no `FR-###`, `NFR-###`, `D-###`, `Requirements:`, `Implemented in:`, `Phase N` or `docs/NN_` string appears in rendered text on any of 22 routes. Verified to fail when a violation is reintroduced.

---

### D4 — Placeholder address presented as the project's real location (P1)

**Symptom.** The Contact page displayed:

```
FandomVerse Team
Seed City, Placeholder Region
hello@example.invalid
```

and embedded a map querying `"FandomVerse HQ, Seed City"` — a place that does not exist.

**Root cause.** Phase 1 seed content on a page that was otherwise complete. The literal word "Placeholder" was visible to visitors.

**Fix.** The address now states plainly what is true rather than inventing a location:

```
FandomVerse Team
A student competition project — no public office or storefront.
hello@example.invalid (example address, not monitored)
```

A note under the map states that the map and directions are an illustrative demonstration of the location feature and that the project has no physical premises. The map query was left unchanged — it still exercises FR-039 — and the fictional destination is now documented at the constant.

**Deliberately not done.** No real address was invented. Choosing what a real contact address should be is the Director's decision, not one to make autonomously (see §6).

**Validation.** Content-honesty suite asserts the page states it is illustrative and contains no placeholder wording.

---

### D5 — Touch targets below the WCAG 2.2 minimum (P2)

**Symptom.** Related-content links on character/event/article detail pages rendered at **21px tall**; the Contact email link likewise. WCAG 2.2 SC 2.5.8 requires a 24×24px minimum.

**Root cause.** Bare inline `<a>` elements in a list, inheriting only the line box height.

**Consideration.** SC 2.5.8 exempts links *inline within a sentence*. These are standalone list items and a standalone address line, so the exemption does not apply.

**Fix.** `min-height: 24px` with `inline-flex` centring on related-content links and the contact email link. No visual change beyond marginally taller hit areas.

**Validation.** Zero `SMALL_TARGET` findings across 29 routes × 5 viewports.

---

### I1 — Focus ring around the entire `<main>` — investigated, **not a defect**

**Observation.** Several audit screenshots showed a blue focus ring drawn around the whole page content.

**Investigation.** Rather than assume a defect and "fix" it, all four navigation paths were measured:

| Path | `activeElement` | `:focus-visible` | Ring shown? |
|---|---|---|---|
| Fresh direct load | `BODY` | — | No — focus is correctly not moved on initial render |
| **Mouse click** | `MAIN` | **false** | **No** |
| **Keyboard Enter** | `MAIN` | **true** | **Yes — correct and desirable** |
| Programmatic hash change (`page.goto`) | `MAIN` | true | Yes — test-harness artifact |

**Conclusion.** The behaviour is correct. `useRouteTransitionEffects` moves focus to the main landmark after a route change (a deliberate Phase 3 accessibility feature), and the global stylesheet uses `:focus-visible`, so the ring appears for keyboard users — where it is wanted — and is suppressed for mouse users. It appeared in the screenshots only because Playwright's programmatic `goto` has no input modality, so Chromium treats the programmatic focus as keyboard-initiated.

**No change made.** Recorded here so the observation is not rediscovered and "fixed" into a real accessibility regression later.

---

## 3. Findings by audit area

**Category hubs (all 7).** Hero, intro, featured, articles, gallery, characters, events, trailers, releases, merchandise and discovery sections all render correctly at every viewport. No overflow, no clipping, no broken images, no empty sections, correct breadcrumbs and document titles. Long titles wrap rather than clip. Section spacing consistent across all seven.

**Character details.** Boundary cases all clean: the longest name (`The Cartographer (Elliot Graves)`), the shortest (`Yuri`), the longest biography, and the non-human `ARIA-9`. Category backlink, badges, traits and related content all present; portrait crops correctly at 1:1 and in the 4:3 card. Only defect was D5.

**Event details.** Every event carries a visible **"Simulated fan event — not a real-world event"** badge plus type and status badges. Date, location and description render correctly; locations are explicitly marked fictional in the data. No ambiguity about whether these events are real.

**Article details.** Title, summary, body, category badge, date, tags and related content all correct. The longest title (66 chars) and longest body (579 chars) render without clipping at 375px.

**Trailers.** Listing behaviour only — no playback was implemented. Each item states it is a demonstrative listing for a fictional franchise with no video to play, so a missing player reads as intentional rather than broken.

**Releases.** Title, date, type, status badge, category and cover art all correct; status badges use the D-039-corrected token.

**Merchandise.** Name, description, price range, image, status badge and cart CTA correct. Coming-soon products correctly disable the button and show "Coming soon". Cart and product pages both state no checkout/payment/real purchase exists.

**Global navigation.** All flows verified with no dead ends: hub → character/event/article/product, detail → related content, detail → back-to-hub, product → cart, breadcrumb → parent, and all 7 Fandom Core nodes → their hubs.

**Accessibility.** Landmarks, headings (after D1/D2), accessible names on every link and button, alt text on every image, keyboard operability, visible focus, dialog/drawer focus trapping, and no colour-only information. axe reports no serious/critical issues.

**Content honesty.** After D3/D4: no real-world claims, no real brands, franchises or people (a scan of all 98,773 characters of content for ~40 real properties returns zero hits), no ambiguous simulated events, no misleading merchandise, no TODO/lorem-ipsum/test content.

---

## 4. Viewport matrix

| Route group | 375×812 | 390×844 | 768×1024 | 1024×768 | 1440×900 |
|---|---|---|---|---|---|
| 7 category hubs | ✅ | ✅ | ✅ | ✅ | ✅ |
| Character details (×4) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Event details (×2) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Article details (×2) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Product details (×2) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Aggregate pages (×5) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Search (×3 states) | ✅ | ✅ | ✅ | ✅ | ✅ |
| Cart / bookmarks / contact / about / home | ✅ | ✅ | ✅ | ✅ | ✅ |

✅ = no overflow, no clipping, no broken image, no undersized target, correct heading outline, no console error, no failed request.

---

## 5. Test evidence

| Evidence | Result |
|---|---|
| Audit harness, 29 routes × 5 viewports | 0 findings after fixes (was 5 defect classes) |
| Console errors | `[]` at every viewport |
| Page errors | `[]` |
| Failed requests | `[]` |
| Document titles | All 23 checked are correct and item-specific |
| Unit tests | 142 passed |
| `content-honesty.spec.ts` (new, 29 tests) | All pass; **verified to fail** when a requirement id is reintroduced |
| Typecheck / lint | 0 errors |
| Build | Succeeds |

**New permanent coverage.** `e2e/content-honesty.spec.ts` — 22 routes asserted free of developer scaffolding, plus 7 assertions that fiction is labelled as fiction (events simulated, merchandise unbuyable, cart temporary, trailers unplayable, contact illustrative, dummy auth non-authenticating). This is the inverse of the existing suites: it asserts on what must **never** appear.

---

## 6. Remaining issues

| # | Issue | Severity | Why not fixed here |
|---|---|---|---|
| **R1** | The Contact page has no real contact details, and the map points at a fictional location (`"FandomVerse HQ, Seed City"`). **Observed symptom:** because that query resolves to nothing, the Google Maps embed renders a zoomed-out view of the whole world rather than a place, so the location feature does not visibly demonstrate anything. | P2 | The *misleading* part is fixed — the page no longer presents placeholder text as an address, and states plainly that the map is illustrative. Making the map show an actual place requires choosing a real location, which asserts something about the project and is the Director's decision, not one to make autonomously. Two options for the Director: (a) supply a real address, or (b) authorise pointing the embed at a neutral public landmark purely to demonstrate the feature, with the existing illustrative caption retained. |
| **R2** | `PagePlaceholder` is still named for its Phase 1 role although it is now the standard page header. | P3 | Cosmetic rename touching 9 files; out of proportion to the benefit during this run. Documented so it is a deliberate deferral. |
| **R3** | Merchandise tags contain SVG glyph names (`shirt`, `pin`, `poster`, `disc`) rather than product concepts. | P2 | Visible only if a tag filter is built — which is Phase 6. Recorded as gap G3 in `PHASE_6_SEARCH_FILTER_SORT_SPEC.md` with a recommended fix. |
| **R4** | FR-006 is only partly met: cards show title/thumbnail/description but not content type or tags. | P1 (requirement gap, not a rendering defect) | Adding type badges and tag chips is squarely Phase 6 card work and would pre-empt that phase. Recorded as gap G1 with an implementation step. |
| **R5** | FR-016 expects media types trailer/interview/podcast/fan-content; only `trailer` exists. | P2 | Requires new content, which is a Director decision — inventing content unilaterally is out of scope. Recorded as gap G2. |

**None of R1–R5 is a P0, and none blocks the next phase.** R4 is a genuine unmet mandatory requirement, but it is Phase 6 scope by the Director's own boundary, so it is documented rather than silently implemented here.

---

## 7. Decision-log impact

No architectural or design behaviour changed, so no new `D-` entry was warranted for D1/D2/D5 — they are conformance fixes to existing, already-decided standards (heading hierarchy, WCAG target size).

D3 and D4 did change a rule about what may appear in the UI, and are recorded in `11_DECISION_LOG.md` as **D-047**.
