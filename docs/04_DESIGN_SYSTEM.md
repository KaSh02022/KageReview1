# 04 — Design System

FandomVerse's own visual language and component system. Written from principles, not copied from Kage's styling (Master Directive, Kage Reference Policy). Phase 0 proposed the concept; Phase 1 implemented the structural token foundation; **Phase 2 implemented the full canonical token system, the shared component primitive library (`src/components/ui/`), and reconciled the one Phase 1 inconsistency (the Header's breakpoint)**. Everything described below exists as real, working code — this document was updated to match the implementation, not the other way around.

## 1. Visual Principles

- **Media-rich fandom energy, kept legible.** Bold color, motion, and imagery (per SRS p.8 "attractive fonts, colors, and animations suited to a media-rich fandom theme") must never come at the cost of contrast, readability, or navigability (NFR-002/003).
- **One shell, seven identities.** A single consistent layout/interaction language across all 7 category hubs, expressed through a distinct accent color per category (§9) so each fandom feels distinct without needing a different UX per hub.
- **Motion with intent.** Animation calls out state changes (hover, added-to-cart, dialog open) — it is never decorative noise, and it always has a reduced-motion equivalent (§7).
- **Original, not derivative.** Kage informs technique (scroll-driven pacing, WebGL depth) but FandomVerse's palette, type, iconography, and narrative concept are original. No color values, component shapes, font choices, copy, or imagery are lifted from the Kage landing page (§10).
- **Dark-first, dark-only, deliberately.** FandomVerse is a "digital fandom universe" — a dark canvas that per-category accents and controlled glow sit on top of. There is no light theme and no theme toggle; this is a documented decision (D-016, formally re-confirmed under explicit Phase 3 review as D-029), not a missing feature (§2).

## 2. Token Architecture

All values live in `src/styles/tokens.css` as CSS custom properties on `:root`. Components reference tokens; nothing hard-codes a color, font-size, spacing, radius, shadow, or duration that has a token equivalent (verified in the Phase 2 audit — the only hard-coded values remaining anywhere in `src/**/*.css` are small, genuinely one-off pixel sizes like an 18px spinner or a badge's `-6px` offset, which have no sensible token).

**Color** — `--color-bg`, `--color-surface`, `--color-surface-elevated`, `--color-border`, `--color-border-strong`, `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-text-on-accent`/`-on-primary`, `--color-primary` (+ `-hover`/`-active`), `--color-secondary` (+ `-hover`), `--color-accent`, `--color-success`/`-warning`/`-error` (+ `-bg` tint variants), `--color-focus`, plus the 7 per-category accents (§9). Phase 1's names (`--color-bg-base`, `--color-action-primary`, `--color-danger`, …) are kept as aliases pointing at the new tokens so nothing silently broke during the Phase 2 migration — new code uses the canonical names above.

`color-scheme: dark` is set once, globally, on `:root` (D-016) — no light-mode branch exists.

**Typography** — semantic, role-based tokens combining family/weight/size/line-height in one shorthand: `--font-display`, `--font-h1`, `--font-h2`, `--font-h3`, `--font-body`, `--font-body-small`, `--font-label`, `--font-caption`, `--font-button`. Components use `font: var(--font-h2)` etc. rather than assembling size/weight/family separately. The raw `--font-size-*` scale (`xs` through `4xl`) still exists for the rare case a semantic role doesn't fit. Two font families total (`--font-family-display`, `--font-family-body`), per NFR-005.

**Spacing** — a 4px-based named scale: `--space-xs` (4px), `-sm` (8px), `-md` (16px), `-lg` (24px), `-xl` (32px), `-2xl` (48px), `-3xl` (64px), plus `--space-section` (a fluid `clamp()` for between-section spacing). Phase 1's numbered aliases (`--space-1`…`--space-8`) still work.

**Radius** — `--radius-small` (4px), `-medium` (8px), `-large` (16px), `-pill` (999px). (`--radius-sm`/`-md`/`-lg`/`-full` aliases retained.)

**Shadow** — `--shadow-subtle`, `-card`, `-elevated`, `-dialog` (increasing elevation), plus `--glow-primary` — the one controlled "premium cinematic" glow effect, used sparingly (never as a default card/button state).

**Motion** — `--duration-fast` (120ms), `-normal` (220ms), `-slow` (400ms), `--easing-standard`, `--easing-emphasis`. All zeroed under `prefers-reduced-motion: reduce` at the token layer (§7), so any component using the duration tokens gets reduced motion for free without its own media query.

**Layout** — `--content-max-width` (1440px), `--reading-max-width` (720px), `--sidebar-width`, `--grid-gap`, `--header-height`, `--nav-height`, `--dialog-width-sm`/`-md`/`-lg`, `--drawer-width`.

**Focus** — `--focus-ring` (a 2-layer offset ring: background-colored inner gap + `--color-focus` outer ring), applied globally via `:focus-visible` in `global.css`. Never removed for aesthetics (NFR-002).

## 2a. Breakpoints — the ONE Canonical System

| Name | Range | CSS literal used in `@media` |
|---|---|---|
| Mobile | ≤ 599px | `max-width: 599px` |
| Tablet | 600–1023px | `min-width: 600px` / `max-width: 1023px` |
| Desktop | 1024–1439px | `min-width: 1024px` |
| Wide | ≥ 1440px | `min-width: 1440px` |

These exact pixel values are the single source of truth, mirrored in two places that must stay in sync (documented, not automated, since CSS custom properties cannot be read inside `@media` conditions and this project deliberately avoids adding a PostCSS custom-media dependency for a 4-value list):
- `src/styles/tokens.css` (`--breakpoint-*` reference comments)
- `src/styles/breakpoints.ts` (the same values as TS constants, used by Playwright's viewport-driven E2E specs, `e2e/responsive.spec.ts`)

**Every `@media` query in the codebase uses one of these four literal values — no other breakpoint number exists anywhere in `src/`.** This directly resolves the Phase 1 inconsistency the Director flagged (D-018): the Header's mobile-nav drawer used to collapse at an arbitrary `767px`; it now collapses at the canonical tablet/desktop boundary (`max-width: 1023px`) — a 10-link category bar plus search/utility icons doesn't comfortably fit until the desktop tier, so both mobile *and* tablet get the drawer nav, and only desktop+ gets the inline bar. `Layout.module.css` (Container/Grid gutter reduction) and `SectionHeader.module.css` (stacking on narrow screens) are the only other components with a real breakpoint need, and both use the `599px` mobile boundary. Fluid, non-breakpoint responsiveness (CSS Grid `auto-fill`/`minmax`, `clamp()` for type/spacing) is preferred wherever it removes the need for a breakpoint at all — see `Grid` in §6.

## 3. Component Principles

Every primitive in `src/components/ui/` follows the same rules (Director §10):
- Semantic HTML first (`<button>`, `<nav>`, `<dialog>`-pattern `role="dialog"`, `<label>`/`<input>` pairs) — no "div soup".
- Full keyboard support and a visible `:focus-visible` state (never suppressed).
- A disabled state where applicable, a loading state where applicable (Button), and correct ARIA only where semantic HTML can't express the state alone.
- An accessible name is mandatory, not optional — `IconButton`'s `label` prop and `FormField`'s label association are compile-time required, not "should probably add one."
- Responsive by construction (fluid layout primitives) rather than by bolting on a breakpoint per component.
- Motion (if any) respects `prefers-reduced-motion` via the token layer.

## 4. Button System

`src/components/ui/Button/` — `Button` and `IconButton` (icon-only, mandatory `label`).

| Variant | Use |
|---|---|
| `primary` | The one primary action per view (add to cart, submit) |
| `secondary` | A secondary brand-colored action (rare; reserved for genuinely equal-weight alternatives) |
| `outline` | Default secondary action (cancel, "log in", "get directions") |
| `ghost` | Low-emphasis inline action (remove, dialog close) |
| `danger` | Destructive-leaning action, outlined in `--color-error` rather than filled (so it doesn't read as more prominent than `primary`) |

Sizes: `small` (32px), `medium` (40px, default), `large` (48px). States: hover/active/disabled/loading are all real CSS states, never simulated with `opacity` alone — loading shows a spinner *and* disables the control, communicated by both a visual and a functional change, not color alone (Director §11).

## 5. Card Architecture

`src/components/ui/Card/` — one composable shell instead of seven near-duplicate card components:

```
Card (optionally `to="/route"`, renders as a single accessible link)
 ├── CardMedia   (image/video slot, 4:3 aspect ratio)
 ├── CardHeader  (title)
 ├── CardBody    (description text)
 ├── CardMeta    (inline Badges/metadata row)
 └── CardFooter  (actions, pinned to the bottom via flex)
```

A linked `Card` renders as **one** `<a>`, not a `<div>` containing nested interactive elements (avoids the common "card full of overlapping click targets" a11y bug). The `accent` prop takes a category accent color (§9) and shows it as a top-edge highlight on hover/focus — the one shared mechanism every content type (article/character/event/merchandise/media/release/category) uses to carry its category identity, so seven content types never need seven different card implementations.

Currently used by: `HomePage` (category + featured cards), `CategoryHubPage` (articles/characters/events/media/gallery), `SearchPage`, `TrailersPage`, `EventsPage`, `ReleasesPage`, `MerchandisePage`, `CartPage` (line items).

## 6. Layout Primitives

`src/components/ui/Layout/` — `Container` (centered, max-width, horizontal gutter — replaces the same pattern that was independently duplicated in Header/Footer/category-nav during the Phase 1 audit), `Stack` (flex row/column with a spacing-token gap), `Grid` (fluid `repeat(auto-fill, minmax(N, 1fr))` — responsive without a single breakpoint), `Divider` (semantic `<hr>`, or a labeled separator).

`SectionHeader` (`src/components/ui/SectionHeader/`) — eyebrow + title + description + optional action, used for every "Explore fandoms" / "Featured content" / per-content-type section heading, so heading hierarchy and spacing stay consistent without each page reinventing it.

## 7. Modal / Dialog / Drawer

`src/components/ui/Dialog/` and `src/components/ui/Drawer/`, both built on one shared hook, `src/hooks/useFocusTrap.ts` (D-017):

- **Focus trap**: Tab/Shift+Tab cycle only among the dialog's own focusable elements while open.
- **Initial focus**: moves into the panel the moment it opens — but *only* on the open transition, never on mount while closed (this exact bug shipped in Phase 1's hand-rolled ChatbotLauncher, D-012; the shared hook makes it structurally hard to reintroduce, and `ChatbotLauncher.test.tsx`/`Dialog.test.tsx` regression-test it directly).
- **Escape to close.**
- **Focus restoration** to the trigger element on close.
- **Background hidden from assistive tech**: `aria-hidden` is applied to `#root` while any dialog/drawer is open (module-level open-dialog counter so nested/sequential dialogs don't fight over the attribute), and pointer users are blocked by a full-viewport backdrop.
- **Accessible naming**: `aria-labelledby` points at the dialog's own title; `aria-describedby` at an optional description.
- Rendered via a React portal to `document.body`, so stacking order is never a z-index fight with the rest of the shell.

`ChatbotLauncher` and `DummyAuthModal` are both now thin consumers of `Dialog` (Phase 1 had each hand-roll its own, incomplete, version). `Drawer` is the side-sliding variant, currently used for the mobile navigation menu (§8) — the same primitive is available for a future filter drawer (Phase 6) or cart drawer (Phase 9) without new focus-trap code.

## 8. Navigation Visual System

Header (`src/components/Header/`): logo, search, visitor counter, clock, bookmarks/cart icon links with a `Badge` count, and a login/logout `Button` are always visible. Category navigation is either an inline bar (desktop, ≥1024px) or a `Drawer` (mobile + tablet, ≤1023px — the canonical breakpoint, §2a). Because the mobile menu is a portal-rendered overlay (not an inline collapsible element), opening it causes **zero layout shift** in the header itself — verified in `e2e/responsive.spec.ts`. Active category links get `aria-current="page"` automatically via React Router's `NavLink`, styled with an underline in `--color-primary`.

## 9. Category Visual Identity

One global system, seven accent tokens — not seven separate designs:

| Category | Token |
|---|---|
| Anime | `--color-accent-anime` |
| Gaming | `--color-accent-gaming` |
| Movies | `--color-accent-movies` |
| TV Shows | `--color-accent-tvshows` |
| K-Pop | `--color-accent-kpop` |
| Comics | `--color-accent-comics` |
| Manga | `--color-accent-manga` |

A category's accent is passed as `Card`'s `accent` prop and shown as a top-edge highlight on hover/focus (§5) — the *only* per-category visual variable. Navigation structure, typography, spacing, card composition, interaction patterns, and accessibility behavior are identical across all seven, per the Director's Phase 2 §9 instruction ("navigation / typography / spacing / card structure / interaction patterns / accessibility / layout must remain consistent"). Iconography, hero motif, and badge-treatment variation beyond color are Phase 5+ content-population scope (no large image asset collections were generated in Phase 2, per the Director's scope boundary).

**Phase 4 reuse:** the Fandom Core's seven category nodes (`02_PRODUCT_ARCHITECTURE.md` §15) read these exact same seven CSS custom properties at runtime (`useCategoryAccentColors.ts`) for both the HTML overlay dots and the 3D fragment meshes — explicitly *not* a second, 3D-specific color palette. No new motion, radius, or shadow tokens were introduced for the cinematic layer either; it reuses `--duration-*`/`--easing-*` (zeroed under reduced motion at the token layer, same as every other animated component) and `--radius-*`/`--shadow-*` for the hero container and dialog-adjacent chrome.

## 10. Kage Non-Copying Note

Where Kage is referenced during design exploration, it is used to study *technique* (e.g., how depth/parallax is staged, how a scroll sequence paces reveals) — never copied as color values, component shapes, font choices, copy, or imagery. FandomVerse's tokens and components above are independently designed and named.

## 11. Form Patterns

`src/components/ui/Form/` — `FormField` (label + control + help/error text, auto-wires `id`/`aria-describedby`/`aria-invalid` so no consumer has to hand-roll label association), `Input`, `Textarea`, `Select`, `SearchInput` (a labeled search box with a leading icon, used by the global search bar). Every control requires a `label` (via `FormField` or `SearchInput`'s own `label` prop) — there is no placeholder-only-label pattern anywhere in the app (Director §16 / SRS accessibility principle).

## 12. Accessibility Rules (foundation — full audit is Phase 12)

- Keyboard navigation works end-to-end: skip link → header → nav → main → footer, plus every dialog/drawer's internal trap.
- `:focus-visible` is the only focus-indication mechanism, applied globally, never removed.
- Heading hierarchy: page `<h1>` (via `PagePlaceholder`/detail pages) → section `<h2>`/`<h3>` (via `SectionHeader`, `level` prop) → card `<h3>`/`<h4>`.
- Every icon-only control has a mandatory accessible name (`IconButton`'s `label` prop).
- Dialog semantics: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`/`aria-describedby` (§7).
- Touch target sizing: `IconButton`'s `medium` size is 40×40px, `large` 48×48px — both meet the common ≥40px touch-target guidance.
- Contrast: token pairs are checked qualitatively during implementation; a full automated contrast sweep is Phase 12 scope. Axe-core scans (`e2e/accessibility.spec.ts`) currently report zero serious/critical violations on the home page.

## 13. Motion System

Two states only: normal and reduced (no separate "medium motion" tier). `prefers-reduced-motion: reduce` zeroes `--duration-fast`/`-normal`/`-slow` at the token layer (`tokens.css`), so any component that builds its transitions from these tokens is automatically reduced-motion-safe without its own media query. Components with an explicit reduced-motion branch (because the effect isn't purely duration-based) declare it directly: `Card`'s hover lift (`transform: translateY(-2px)` → `none`), `Dialog`/`Drawer`'s entrance animation (→ `none`), `Skeleton`'s shimmer (→ a static tone). The cinematic entry's WebGL sequence is the largest reduced-motion consumer and is covered separately in `02_PRODUCT_ARCHITECTURE.md` §8 — Phase 2 does not implement the full cinematic animation (Phase 4 scope), only the token-level motion contract every future animated component must follow.

## 14. Responsive Principles

Fluid layout is preferred over breakpoints wherever it works: `Grid`'s `auto-fill`/`minmax` reflows card counts without a single `@media` query; `--font-h1`/`-h2`/`-display` use `clamp()` so heading size scales continuously rather than jumping at breakpoints; `--space-section` is a fluid `clamp()` too. Where a real breakpoint is unavoidable (nav collapse, gutter reduction, `SectionHeader` stacking), it always uses one of the four canonical values (§2a) — verified with `e2e/responsive.spec.ts` across 5 viewport widths (375/599/820/1280/1600px) checking for zero horizontal overflow on 7 representative routes, plus dedicated mobile/tablet drawer and desktop inline-nav checks.
