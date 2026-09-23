# 05 — Data Schema

All content is static, versioned JSON under `src/data/` (per CR-001/IR-002). Schemas below were proposed in Phase 0 and implemented as TypeScript interfaces in Phase 1 (`src/types/content.ts`), matching field-for-field. IDs are string slugs, unique within their collection, stable across edits (referenced by bookmarks/cart/related-content links).

**Phase 1 status:** every type below exists in `src/types/content.ts` and every collection has a small **seed** JSON file (`src/data/*.json`, 1–2 entries each) plus a typed loader (`src/data/index.ts`) — enough to verify the schema end-to-end through routing, detail pages, cart, and bookmarks. This is architecture verification data, not the full content population required by `01_SRS_REQUIREMENTS.md` (e.g. FR-019's ≥5 characters/category, FR-022's ≥3 events/category) — that population is Phase 5–8 scope.

## 1. Shared Types

```
CategoryId = "anime" | "gaming" | "movies" | "tv-shows" | "kpop" | "comics" | "manga"

ContentType = "article" | "gallery" | "video" | "audio" | "character" | "event" | "merchandise"
```

## 2. `categories.json`

```
Category {
  id: CategoryId
  name: string
  tagline: string
  accentColor: string        // design-token reference, see 04_DESIGN_SYSTEM.md
  heroImage: AssetRef
  description: string
}
```

## 3. `articles.json`

```
Article {
  id: string
  categoryId: CategoryId
  title: string
  thumbnail: AssetRef
  summary: string            // short description for card view
  body: string                // full article body (markdown or plain text), detail view only
  tags: string[]
  publishedDate: ISODateString
  featured: boolean
  relatedIds: string[]       // explicit related-content refs; falls back to shared-tag matching if empty
}
```

## 4. `galleries.json`

```
Gallery {
  id: string
  categoryId: CategoryId
  title: string
  images: AssetRef[]         // each entry: { src, alt, credit? }
}
```

## 5. `media.json` (videos & audio — trailers, interviews, podcasts, fan content)

```
MediaItem {
  id: string
  categoryId: CategoryId
  title: string
  mediaType: "trailer" | "interview" | "podcast" | "fan-content"
  format: "video" | "audio"
  embedUrl: string            // e.g. YouTube embed URL
  thumbnail: AssetRef
  description: string
  releaseStatus: "upcoming" | "recent" | "archived"   // supports Trailers filter (FR-026)
  publishedDate: ISODateString
  tags: string[]
}
```

## 6. `characters.json`

```
Character {
  id: string
  categoryId: CategoryId
  name: string
  image: AssetRef
  series: string               // franchise/show name, used for franchise filter (FR-021)
  biography: string
  traits: string[]
  tags: string[]
}
```

Minimum 5 `Character` entries per `categoryId` (FR-019) — enforced by a data-integrity test (`T-FR-019`).

## 7. `events.json`

```
EventItem {
  id: string
  categoryId: CategoryId
  title: string
  date: ISODateString
  location: string
  description: string
  eventType: "convention" | "watch-party" | "meetup" | "other"
  status: "past" | "upcoming"   // derivable from `date` vs. now, stored for simpler filtering/testing
}
```

Minimum 3 `EventItem` entries per `categoryId` (FR-022) — enforced by a data-integrity test (`T-FR-022`).

## 8. `merchandise.json`

```
MerchandiseItem {
  id: string
  categoryId: CategoryId
  name: string
  image: AssetRef
  priceRangeMin: number
  priceRangeMax: number
  currency: string             // e.g. "USD"
  description: string
  tags: string[]
}
```

## 9. `releases.json` (upcoming releases calendar)

```
Release {
  id: string
  categoryId: CategoryId
  title: string
  releaseDate: ISODateString
  type: "game" | "movie" | "show" | "album" | "comic-issue" | "manga-volume" | "other"
  description: string
  coverImage: AssetRef
}
```

## 10. `faqs.json`

```
Faq {
  id: string
  question: string
  answer: string
  category?: CategoryId        // optional scoping, null = site-wide FAQ
}
```

## 11. `chatbot.json`

```
ChatbotRule {
  id: string
  patterns: string[]           // keyword/phrase triggers matched against user input
  response: string
  quickReplies?: string[]      // suggested next-user-utterances shown as buttons
  linkTo?: { type: "category" | "article" | "character" | "event" | "merchandise", id: string }
  recommendCategoryId?: CategoryId
}

ChatbotConfig {
  welcomeMessage: string
  defaultFallback: string      // used when no pattern matches
  quickRepliesStart: string[]
  rules: ChatbotRule[]
}
```

## 12. Shared `AssetRef`

```
AssetRef {
  src: string          // path under /assets or a licensed external URL
  alt: string           // required, non-empty — accessibility requirement (NFR-002)
  credit?: string        // required whenever the asset is not originally created for this project — cross-referenced in 08_LICENSES.md
}
```

## 13. Bookmarks & Cart (runtime state, not static data — schema for the persisted shape)

```
BookmarkEntry {                 // persisted to localStorage (FR-036)
  contentType: "article" | "character" | "event" | "media"
  contentId: string
  bookmarkedAt: ISODateString
}

BookmarkNote {                  // persisted to sessionStorage only (FR-037)
  bookmarkKey: string            // `${contentType}:${contentId}`
  note: string
}

CartLineItem {                  // persisted to localStorage under key "fandomverse.cart.v1" (D-005, 11_DECISION_LOG.md)
  merchandiseId: string
  quantity: number
}
```

**Storage boundary summary (D-005, Director-confirmed):**

| State | Storage | Key (proposed) | Notes |
|---|---|---|---|
| Bookmarks | `localStorage` | `fandomverse.bookmarks.v1` | FR-036 |
| Personal notes on bookmarks | `sessionStorage` | `fandomverse.notes.v1` | FR-037 — cleared when the browser session ends |
| Cart | `localStorage` | `fandomverse.cart.v1` | D-005 — temporary/browser-local, not an account cart; never implies server-side order persistence |
| Chatbot conversation/session | in-memory (module/store state), not persisted to Web Storage | — | Resets on reload; the chatbot is a stateless-per-visit assistant, not a saved conversation history feature — no SRS requirement asks for chat history to survive a reload |
| Visitor counter | `localStorage` | `fandomverse.visitorCount.v1` | FR-041 |
| Content data itself (categories/articles/media/characters/events/merchandise/releases/faqs/chatbot rules) | source-controlled static JSON only | — | Never copied into Web Storage; always read from the bundled data layer |

## 14. Design Notes on Scalability / Non-Duplication

- Every collection keys off `categoryId` using the same `CategoryId` union — adding an 8th category (should the Director approve one later) means extending the union plus data, not restructuring schemas.
- Cross-references (related articles, chatbot `linkTo`) store `{ type, id }` pairs rather than duplicating title/thumbnail — the referenced object is looked up live from its source collection, so edits to one entry never desync copies elsewhere.
- `AssetRef` is reused everywhere an image appears, keeping alt-text and license-credit handling in exactly one shape across the whole schema.
- Tags are free-form strings shared across collections (`tags: string[]`) to keep the schema simple; a controlled tag vocabulary per category can be layered in Phase 6 if search/filter quality needs it, without a schema change.

## 15. Phase 5 Schema Changes and Content Inventory

Phase 5 populated the dataset for real and extended the schema where the Director's Phase 5 field requirements went beyond the Phase 0 draft. All changes are additive; nothing was restructured.

### Fields added in Phase 5

| Type | Field | Why |
|---|---|---|
| `Category` | `slug` | The route path can differ from the id (`kpop` routes at `k-pop`); the two are now explicit rather than assumed equal. Resolved via `getCategoryByIdOrSlug()`. |
| `Category` | `visualMotif`, `franchise` | Director §5 requires a visual motif and per-category identity in the registry; `franchise` names the original flagship property each hub is built around (D-037). |
| `Character` | `role` | Director §6 ("profile information"); rendered on both the hub card and the detail page. |
| `Character` | `relatedIds` | Director §6 ("related content"). |
| `EventItem` | `image` | Director §7 ("visual reference"). |
| `EventItem` | `relatedIds` | Director §7 ("related content"). |
| `EventItem` / `Release` / `MediaItem` | `fictional` | Structured honesty labelling so simulated content can never be mistaken for a real-world claim, and so the labelling is testable (D-038). |
| `Release` | `status` | Director §12 ("status"); `ReleaseStatus` already existed but `Release` never carried it. |
| `MerchandiseItem` | `status` | Director §13 ("availability/status"), typed as `MerchandiseStatus`. |
| `MediaItem` | `durationSeconds` | Director §11 ("duration if known"), optional. |
| `Gallery.images[]` | promoted from `AssetRef` to `GalleryImage` (`id`, `title`, `caption` + `AssetRef`) | Director §9 requires per-image id/title/caption alongside the image and its alt text. |

### Content inventory (as generated)

| Collection | Count | Per category | SRS minimum |
|---|---|---|---|
| Categories | 7 | — | exactly 7 ✅ |
| Characters | 35 | 5 | ≥5 per category (FR-019) ✅ |
| Events | 21 | 3 | ≥3 per category (FR-022) ✅ |
| Articles | 21 | 3 (1 featured + 2) | no fixed minimum |
| Galleries | 7 (28 images) | 1 gallery, 4 images | gallery required per category ✅ |
| Trailers (`media`) | 14 | 2 | — |
| Releases | 21 | 3 | — |
| Merchandise | 14 | 2 | — |

### Generation and validation

Content is generated by `scripts/generate-content.mjs`, which writes both the JSON files and every SVG asset they reference in one deterministic pass — re-running it reproduces byte-identical output. The dataset is then held to `src/data/contentValidation.test.ts` (47 assertions), which fails the build if category count, per-category character/event minimums, id uniqueness, category references, `relatedIds` resolution, required fields, honesty labelling, or asset-file existence ever regress. Both the count gate and the asset-existence gate were verified to actually fail by deliberately breaking the data (see the Phase 5 completion report).
