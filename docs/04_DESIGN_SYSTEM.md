# 04 — Design System

This defines FandomVerse's own visual language. It is written from principles, not copied from Kage's styling (Master Directive, Kage Reference Policy). Concrete token values were first proposed in Phase 0 and implemented as the structural foundation in Phase 1 (`src/styles/tokens.css`, `src/styles/global.css`) — still intentionally provisional pending Phase 2 visual polish, but now real, working CSS custom properties rather than a paper proposal.

## 1. Visual Principles

- **Media-rich fandom energy, kept legible.** Bold color, motion, and imagery (per SRS p.8 "attractive fonts, colors, and animations suited to a media-rich fandom theme") must never come at the cost of contrast, readability, or navigability (NFR-002/003).
- **One shell, seven identities.** A single consistent layout/interaction language across all 7 category hubs, expressed through a distinct accent color + iconography per category so each fandom feels distinct without needing a different UX per hub.
- **Motion with intent.** Animation calls out state changes (hover, added-to-cart, new chatbot message) and hosts the cinematic layer — it is never decorative noise, and it always has a reduced-motion equivalent.
- **Original, not derivative.** Kage informs technique (scroll-driven pacing, WebGL depth) but FandomVerse's palette, type, iconography, and narrative concept are original.

## 2. Color Tokens (proposal)

| Token | Role | Notes |
|---|---|---|
| `--color-bg-base` | App background (dark-leaning, cinematic) | Final hex chosen in Phase 2 visual exploration |
| `--color-bg-surface` | Card/panel surface | Layered above base with subtle elevation |
| `--color-text-primary` | Body/heading text | Must meet ≥4.5:1 contrast on `--color-bg-base`/`--color-bg-surface` |
| `--color-text-muted` | Secondary text | Must meet ≥4.5:1 for body-sized use, ≥3:1 if large-text only |
| `--color-accent-anime` | Anime hub accent | |
| `--color-accent-gaming` | Gaming hub accent | |
| `--color-accent-movies` | Movies hub accent | |
| `--color-accent-tvshows` | TV Shows hub accent | |
| `--color-accent-kpop` | K-Pop hub accent | |
| `--color-accent-comics` | Comics hub accent | |
| `--color-accent-manga` | Manga hub accent | |
| `--color-action-primary` | Primary buttons/links (cart, chatbot CTA) | |
| `--color-success` / `--color-warning` / `--color-danger` | Feedback states (added to cart, empty state, remove) | |

Each accent color is checked for AA contrast against both `--color-bg-base` and `--color-text-primary`-on-accent usage before being finalized in Phase 2.

Dark and light mode: at minimum, a dark cinematic default; a light/high-contrast alternative may be added in Phase 12 if time allows — tracked as an original enhancement, not an SRS requirement.

## 2a. Radii, Shadows, and Focus (implemented Phase 1)

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 4px | Small controls, badges |
| `--radius-md` | 8px | Buttons, inputs, cards |
| `--radius-lg` | 16px | Panels, modals, hero surfaces |
| `--radius-full` | 999px | Pills, avatar/icon buttons, the chatbot launcher |
| `--shadow-sm` / `--shadow-md` / `--shadow-lg` | layered `rgba(0,0,0,…)` | Elevation for cards, dropdowns, the chatbot panel and dummy-auth modal respectively |
| `--focus-ring` | 3px offset ring using `--color-action-primary` | Applied globally via `:focus-visible` in `global.css` — never removed for aesthetics (NFR-002) |

## 2b. Breakpoints (implemented Phase 1)

Same breakpoint values as the constants in `src/styles/breakpoints.ts` (kept in sync manually, since CSS custom properties can't be read inside `@media` queries):

| Name | Range |
|---|---|
| Mobile | ≤ 599px |
| Tablet | 600–1023px |
| Desktop | 1024–1439px |
| Wide | ≥ 1440px |

Phase 1's Header component uses a pragmatic 767px collapse point for the mobile nav drawer (simpler two-state collapse); reconciling this with the 4-tier scale above (and moving it to a shared breakpoint constant/mixin) is Phase 2 visual-polish scope, tracked as a follow-up rather than a Phase 1 blocker.

## 3. Typography

- A display/headline typeface for the cinematic layer and hero moments (distinctive, fandom-poster energy).
- A highly legible UI/body typeface for all functional content (articles, cards, forms, chatbot).
- Type scale: modular scale with tokens `--font-size-xs` … `--font-size-4xl`; line-height tuned per role (tighter for display, ≥1.5 for body copy, per accessibility best practice).
- No more than 2 font families total, to protect load performance (NFR-005).

## 4. Spacing & Grid

- 8px base spacing scale: `--space-1` (4px) through `--space-8` (64px+), used consistently instead of ad hoc margins.
- Responsive grid: fluid CSS grid for card layouts (`auto-fill`/`minmax`) rather than fixed column counts, so category catalogs, galleries, and merchandise grids reflow naturally across breakpoints.

## 5. Breakpoints

| Name | Range | Notes |
|---|---|---|
| Mobile | ≤ 599px | Single column, collapsed nav, filter/sort in a drawer |
| Tablet | 600–1023px | 2-column card grids, condensed nav |
| Desktop | 1024–1439px | Full nav, 3–4 column grids |
| Wide | ≥ 1440px | Max content width with generous gutters, prevents overly long line lengths |

## 6. Core Components

- **Buttons**: primary / secondary / ghost / icon-only variants; explicit `:hover`, `:focus-visible`, `:disabled` states.
- **Cards**: content card (image, title, description, type badge, tags), character card, event card, merchandise card — share a base card shell with type-specific slots.
- **Navigation**: header nav (desktop bar / mobile drawer), category grid, breadcrumb trail, tab/segmented control (for hub sub-sections).
- **Modals/Dialogs**: chatbot panel, lightbox/carousel, dummy login/signup modal, product detail — all share one accessible dialog primitive (focus trap, `Escape`-to-close, `aria-modal="true"`).
- **Drawers**: mobile nav drawer, filter/sort drawer, cart drawer.
- **Badges**: content-type badge, release-status badge (upcoming/recent), "new"/"featured" badge.
- **Forms**: search input, filter checkboxes/selects, sort select, dummy login/signup fields, bookmark note textarea — all with visible labels (never placeholder-only labels) for accessibility.
- **States**: loading/skeleton, empty state, error/fallback state — defined once per component family and reused everywhere (see `02_PRODUCT_ARCHITECTURE.md` §6).

## 7. Animation & Motion

- Standard easing/duration tokens (`--motion-fast`, `--motion-base`, `--motion-slow`) applied consistently to hover/transition/panel-open interactions.
- Cinematic entry sequence and any scroll-driven storytelling live behind a single `usePrefersReducedMotion` gate (see `02_PRODUCT_ARCHITECTURE.md` §8) — when active, transitions shorten or are removed and autoplay is disabled.
- Carousels/galleries never autoplay by default when reduced motion is requested; manual navigation only.

## 8. Accessibility & Contrast

- Minimum WCAG AA contrast (4.5:1 body text / 3:1 large text and UI components) for every color-token pairing actually used in the UI — verified with a contrast checker during Phase 2 token finalization, not assumed.
- Focus states are always visible (`:focus-visible` outline/ring), never removed for aesthetics.
- Icon-only controls always carry an accessible name (`aria-label` or visually-hidden text).

## 9. Explicit Non-Copying Note

No color values, component shapes, font choices, copy, or imagery are to be lifted from the Kage landing page. Where Kage is referenced during Phase 2 visual exploration, the reference is used to study *technique* (e.g., how depth/parallax is staged) and the resulting FandomVerse tokens/components must be independently designed and named.
