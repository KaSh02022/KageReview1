# 03 — UX Architecture

**Phase 2 implementation note:** the structure below was proposed in Phase 0 and is now backed by real, working UX: the mobile/tablet navigation menu (§12) is a real accessible `Drawer`, the chatbot and dummy-auth modals (§10) are real accessible `Dialog`s with a focus trap, and the breadcrumb (§15 in `04_DESIGN_SYSTEM.md`) has responsive truncation and no horizontal overflow. See `04_DESIGN_SYSTEM.md` for the component-level detail; this document stays the UX/IA reference.

## 1. Sitemap

```
FandomVerse
├── Cinematic Entry (WebGL "Fandom Universe" intro) [C]
├── Home [A]
│   ├── Category Grid → 7 hubs [A]
│   ├── Featured Content showcase [A]
│   └── Chatbot launcher [A]
├── Category Hub × 7 (Anime, Gaming, Movies, TV Shows, K-Pop, Comics, Manga) [A]
│   ├── Catalog (filter + sort) [A]
│   ├── Image Gallery [A]
│   ├── Videos & Audio [A]
│   ├── Featured Articles → Article Detail [A]
│   ├── Character Profiles → Character Detail [A]
│   └── Event Highlights → Event Detail [A]
├── Search (global, cross-category) [A]
├── Trailers (cross-category aggregation) [A]
├── Merchandise → Product Detail → Cart (temporary) [A]
├── Bookmarks (favorites + notes + export) [A]
├── Contact Us (team info + map) [A]
├── About Us [A]
├── Chatbot (persistent overlay) [A]
└── Dummy Login / Signup (UI only) [A]
```

Legend: **[A]** mandatory SRS functionality · **[B]** FandomVerse original innovation · **[C]** Kage-inspired interaction principle.

## 2. Global Navigation

Persistent app shell present on every route (post cinematic-entry):
- Header: logo/wordmark, category nav (grid or bar, per FR-002), global search bar (FR-009), visitor counter + clock (FR-041/042), bookmarks icon, cart icon with item count, dummy login/signup entry point.
- Footer: About/Contact links, AI-usage/license acknowledgment line, category quick links.
- Floating chatbot launcher, bottom-corner, on every page (FR-004/FR-032).
- Breadcrumb strip beneath the header on category and detail pages (FR-044).

Per SRS p.6: Search, Bookmarks, Contact Us, About Us, and the chatbot must remain reachable from every page regardless of category — enforced by placing them in the persistent shell rather than per-page.

## 3. Landing Page (Cinematic Entry → Home)

**[C] Kage-inspired, [B] original concept.** The "Fandom Core" — a central original focal object with seven orbiting category nodes — establishes the "Fandom Universe" metaphor at the top of Home, above the same "Explore fandoms" card grid that has existed since Phase 2 (defense in depth: two independent paths to every category). Full technical architecture in `02_PRODUCT_ARCHITECTURE.md` §15.

**Implemented (Phase 4):**
- Not a gate or a sequence the user "sits through" — no autoplay narrative, no forced duration, no "Enter" button blocking content. The seven category links are real, immediately focusable/clickable the moment the page renders (via `FandomCoreOverlay`), whether or not the WebGL canvas has finished loading.
- A visible "Skip intro — jump to categories" control moves focus straight to the "Explore fandoms" grid without navigating away.
- Falls back to a static, intentionally-designed 2D version (`FandomCoreFallback`) immediately when `prefers-reduced-motion` is set or WebGL is unavailable — same seven links, same navigation targets, not a degraded/error-styled experience.
- Never blocks reaching Home/search/any category — confirmed by `e2e/fandom-core.spec.ts` across the WebGL-supported, WebGL-unavailable, and reduced-motion cases.

## 4. Category Hubs

Each of the 7 hubs follows one consistent template (own visual accent color per `04_DESIGN_SYSTEM.md`, shared layout). Consistency here is deliberate — it keeps 7 categories navigable without relearning UX per category, while still allowing category-specific art direction.

**As implemented in Phase 5** (`src/pages/CategoryHubPage.tsx`, architecture in `02_PRODUCT_ARCHITECTURE.md` §16), the section order is:

1. **Hero** — category art, visual motif eyebrow, name (h1), tagline, and description.
2. **Featured** — the category's one featured article, given a larger card as the "start here" entry point.
3. **Articles** — the remaining articles (the featured one is not repeated).
4. **Gallery** — the category's gallery images with captions.
5. **Characters** — all 5 profiles (FR-019), each linking to its detail page.
6. **Events** — all 3 events (FR-022), badged with type and a "Simulated fan event" label.
7. **Trailers** — badged as fictional; no external video is embedded.
8. **Upcoming Releases** — with status badges.
9. **Merchandise** — with price range and availability badges, linking to product pages.
10. **Explore another world** — links to the other six hubs, so a hub is never a dead end.

Filter/sort controls are deliberately absent at this stage: the search/filter/sort engine is later-phase scope, and the data carries normalized `tags`/`categoryId`/date fields ready for it. Sections render an `EmptyState` when a content type genuinely has no items rather than fabricating filler cards.

## 5. Search

Always-reachable via the header. Results view groups by content type (article/character/event/media/merchandise) with category and type filter chips, per FR-010. Typing shows an instant (client-side, no debounce-for-latency-hiding needed since there's no network round trip) result count.

## 6. Content Detail Pages (Article / Character / Event)

Consistent detail-page shell: hero image/media, metadata block (type-specific fields per FR-020/FR-024), body content, "related content" module (FR-018), bookmark toggle, breadcrumb back to the owning category hub.

**Phase 5 additions:** each detail page also carries explicit category context (an accent-toned badge naming the category) and an in-page "← Back to \<Category\>" link, so returning to the owning hub does not depend on the breadcrumb alone. The browser tab title is the item's own name rather than the generic route label (`useDynamicDocumentTitle`). Related content resolves across types — an article can relate to characters and events — and any id that does not resolve is dropped rather than rendered as a dead link, with the dataset itself guarded against orphan references by `contentValidation.test.ts`.

## 7. Trailers

A single cross-category page (not per-hub) so users can browse "what's new/upcoming" across all 7 fandoms in one place (FR-025), with category + release-status filter chips (FR-026).

## 8. Merchandise & Cart

Merchandise grid → product detail (image, name, price range, description, add-to-cart) → cart drawer/page showing line items and a live total (FR-027–030). Cart UI must visually communicate "temporary / no real purchase" (e.g., a persistent note near the total) so the UX itself reinforces CR: no checkout/payment exists, and none should be implied by the copy or button labels (FR-031).

## 9. Bookmarks

A dedicated `/bookmarks` view lists all favorited items across types, each with its session-only note field and a remove/unfavorite control, plus an "Export" action (FR-035–038). Bookmark toggles also appear inline on every card/detail view across the app, not only from this page.

## 10. Chatbot

A floating launcher opens a chat panel with: a welcome message + quick-reply suggestions, a text input, and a scrollable conversation log. Responses may include an inline link/button to a relevant category or content page (FR-034). The chat panel is dismissible without losing the app's current page state.

**Implemented (Phase 2):** the panel is the shared `Dialog` primitive (`04_DESIGN_SYSTEM.md` §7) — real focus trap, Escape-to-close, focus restoration to the launcher button. The quick-reply/text-input/rule-matching conversation flow itself remains Phase 11 scope; Phase 2 shipped the dialog shell and a static welcome message.

## 11. About Us / Contact Us

Static informational pages reachable from header/footer at all times. About Us covers team + site purpose (FR-040), consistent with `00_PROJECT_CONSTITUTION.md` §1 vision language.

Contact Us (FR-039, architecture finalized as D-006 in `11_DECISION_LOG.md`) shows: team contact details, a responsive embedded Google Map (client-only iframe, no key), a "Get Directions" link that always works (opens Google Maps directions in a new tab, destination pre-filled), and an optional "Directions from my location" control that only requests browser geolocation when the user explicitly clicks it. If the user denies the permission prompt, the browser doesn't support geolocation, or it's unavailable, the control shows a brief inline message (e.g., "Location unavailable — use the map or directions link above") and the rest of the page remains fully usable — geolocation never gates access to the map or the manual directions link.

## 12. Mobile Navigation

- Header collapses to a hamburger/menu control for category navigation and search below a defined breakpoint (see `04_DESIGN_SYSTEM.md`).
- Cart, bookmarks, and chatbot remain reachable via persistent icons or the mobile menu — never hidden behind more than one tap.
- Filter/sort controls collapse into a sheet/drawer on small screens rather than a cramped inline toolbar.

**Implemented (Phase 2):** the hamburger menu opens the shared `Drawer` primitive (`04_DESIGN_SYSTEM.md` §7), collapsing at the canonical tablet/desktop boundary (≤1023px, not the Phase 1 arbitrary 767px — D-018). Cart and bookmarks stay as persistent header icons at every breakpoint (never moved into the drawer); category navigation moves into the drawer below the breakpoint. Verified with zero horizontal overflow across 5 viewport widths in `e2e/responsive.spec.ts` (a real overflow bug in the header's utility bar was found and fixed this way — D-023). Filter/sort drawers themselves are Phase 6 scope (no filter/sort UI exists yet).

## 13. Accessibility Navigation

- Skip-to-content link as the first focusable element.
- All interactive elements (nav, filters, cards, chatbot, cart, lightbox) reachable and operable by keyboard alone, with visible focus states.
- Landmarks (`header`, `nav`, `main`, `footer`) and heading hierarchy kept consistent across all page templates.
- The chatbot panel and lightbox/carousel are implemented as accessible dialogs (focus trap, `Escape` to close, `aria-modal`).
- Live regions (`aria-live`) for dynamic feedback: cart updates, search result counts, chatbot new messages.

## 14. Mandatory vs. Original vs. Kage-Inspired — Summary Table

| Area | A: Mandatory (SRS) | B: FandomVerse Original | C: Kage-Inspired |
|---|---|---|---|
| Cinematic entry | Must exist as an enhancement layer that doesn't block function | "Fandom Universe" narrative/visual concept, original art direction | Scroll/interaction technique, WebGL performance approach |
| Category hubs | Catalog, filter, sort, galleries, media, articles, characters, events | Per-category accent theming, card micro-interactions | Visual hierarchy / pacing inspiration |
| Search/filter/sort | Global search, category/type filters, 3 sort modes | Result grouping UX, instant client-side feel | — |
| Merchandise/cart | Temporary cart, no checkout | Cart UX copy reinforcing "no real purchase" | — |
| Chatbot | Rule-based, FAQ + navigation help | Personality/voice, recommendation phrasing | — |
| Bookmarks | Favorites, session notes, export | Export format design | — |
| UI shell | Visitor counter, clock, breadcrumb, dummy login | Original branding/visual language | Procedural/motion polish inspiration |
