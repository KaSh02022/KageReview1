# 08 — Licenses & Asset Register

Every non-original asset used anywhere in FandomVerse must have a row here **before** it is committed to the repository. An asset is never marked "licensed"/"cleared" without actual verification — no status is assumed or fabricated (per `00_PROJECT_CONSTITUTION.md` §10 and Master Directive Kage Reference Policy).

## 1. Register

_As of Phase 0, no assets have been produced or sourced yet. This table is empty by design and will be populated starting in Phase 2 (Design System) / Phase 5+ (content population) as real assets are created or sourced._

| Asset ID | Source | Creator | License | Permission Status | Attribution Requirement | Usage Restriction |
|---|---|---|---|---|---|---|
| _(none yet)_ | | | | | | |

Column definitions:
- **Asset ID** — matches `06_ASSET_BIBLE.md` naming convention.
- **Source** — where the asset came from (e.g., "Gemini-generated", "self-authored", a named royalty-free stock library, a font foundry).
- **Creator** — the actual author/generator (a named AI tool + prompt author, or a human).
- **License** — the specific license under which the asset may be used (e.g., "original work, no license needed", "CC0", "Google Fonts OFL", a stock library's specific license terms).
- **Permission Status** — `Verified` / `Pending Verification` / `Blocked`. Nothing may enter the codebase as `Blocked`, and nothing should be used while `Pending Verification`.
- **Attribution Requirement** — exact credit text required in-app (if any), cross-referenced to where it's rendered (e.g., footer, gallery credit line via `AssetRef.credit`).
- **Usage Restriction** — any constraint (e.g., "non-commercial only", "web use only", "no modification").

## 2. Rules

1. AI-generated images/graphics (Gemini) are permitted per SRS p.14, but the generating tool, prompt, and date must be logged, and ownership/usage terms of the generating platform's output must be checked (not assumed to be unrestricted) before the row is marked `Verified`.
2. No real franchise's copyrighted character art, logos, trademarks, or footage may be used under any circumstances without a verified, specific license — this project's fandom content is original, not a reproduction of any real IP's official assets.
3. Third-party embeds that are not "assets" per se (the Google Maps iframe on Contact Us, YouTube video embeds referenced by `media.json`) are governed by their respective platforms' terms of embedding and are noted here as **Embedded Services**, not asset rows, since no file is copied into the repository.
4. Fonts must be either self-hosted under an open license (e.g., OFL) or loaded from a permitted CDN (per `artifact-design`/build tooling norms) with their license recorded here.
5. Any asset whose status cannot be verified is excluded from the build — a missing/blocked asset is a bug to fix, never silently shipped.

## 3. Embedded Services (not files, tracked separately from the asset table)

| Service | Used For | Terms Reference | Notes |
|---|---|---|---|
| Google Maps (iframe embed, `output=embed`) | Contact Us location/GPS (FR-039) | Google Maps Platform Terms of Service | No API key required for the basic `/maps?q=...&output=embed` iframe pattern; confirmed as a client-side-only embed, no FandomVerse backend involved |
| YouTube (iframe embed) | Trailers/interviews/fan videos (FR-014/FR-015) | YouTube Terms of Service / embed policy | Only publicly embeddable videos are referenced; FandomVerse does not rehost video files sourced from YouTube |

## 4. Status Summary (Phase 0)

- Total assets logged: 0
- Verified: 0
- Pending Verification: 0
- Blocked: 0

This section will be updated at the end of every phase that introduces new assets.
