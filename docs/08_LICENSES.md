# 08 — Licenses & Asset Register

Every non-original asset used anywhere in FandomVerse must have a row here **before** it is committed to the repository. An asset is never marked "licensed"/"cleared" without actual verification — no status is assumed or fabricated (per `00_PROJECT_CONSTITUTION.md` §10 and Master Directive Kage Reference Policy).

## 1. Register

Phase 5 introduced the project's first visual assets. They are registered as batches rather than 161 identical rows, because they are not individually sourced works: every one is output of a single in-repo script, under identical terms, reproducible byte-for-byte by re-running it (D-036).

| Asset ID | Source | Creator | License | Permission Status | Attribution Requirement | Usage Restriction |
|---|---|---|---|---|---|---|
| `/assets/generated/category/*.svg` (7) | `scripts/generate-content.mjs` | FandomVerse project (own code) | Original work — no third-party license involved | Verified | None | None |
| `/assets/generated/character/*.svg` (35) | `scripts/generate-content.mjs` | FandomVerse project (own code) | Original work — no third-party license involved | Verified | None | None |
| `/assets/generated/gallery/*.svg` (28) | `scripts/generate-content.mjs` | FandomVerse project (own code) | Original work — no third-party license involved | Verified | None | None |
| `/assets/generated/event/*.svg` (21) | `scripts/generate-content.mjs` | FandomVerse project (own code) | Original work — no third-party license involved | Verified | None | None |
| `/assets/generated/article/*.svg` (21) | `scripts/generate-content.mjs` | FandomVerse project (own code) | Original work — no third-party license involved | Verified | None | None |
| `/assets/generated/release/*.svg` (21) | `scripts/generate-content.mjs` | FandomVerse project (own code) | Original work — no third-party license involved | Verified | None | None |
| `/assets/generated/media/*.svg` (14) | `scripts/generate-content.mjs` | FandomVerse project (own code) | Original work — no third-party license involved | Verified | None | None |
| `/assets/generated/merch/*.svg` (14) | `scripts/generate-content.mjs` | FandomVerse project (own code) | Original work — no third-party license involved | Verified | None | None |

Each asset additionally carries a provenance string inline in its `AssetRef.credit` field in the data files, so provenance travels with the data rather than living only in this document. `contentValidation.test.ts` asserts that every declared asset has a non-empty credit.

Column definitions:
- **Asset ID** — matches `06_ASSET_BIBLE.md` naming convention.
- **Source** — where the asset came from (e.g., "Gemini-generated", "self-authored", a named royalty-free stock library, a font foundry).
- **Creator** — the actual author/generator (a named AI tool + prompt author, or a human).
- **License** — the specific license under which the asset may be used (e.g., "original work, no license needed", "CC0", "Google Fonts OFL", a stock library's specific license terms).
- **Permission Status** — `Verified` / `Pending Verification` / `Blocked`. Nothing may enter the codebase as `Blocked`, and nothing should be used while `Pending Verification`.
- **Attribution Requirement** — exact credit text required in-app (if any), cross-referenced to where it's rendered (e.g., footer, gallery credit line via `AssetRef.credit`).
- **Usage Restriction** — any constraint (e.g., "non-commercial only", "web use only", "no modification").

## 2. Rules

1. AI-generated images/graphics (Gemini) are permitted per SRS p.14, but the generating tool, prompt, and date must be logged, and ownership/usage terms of the generating platform's output must be checked (not assumed to be unrestricted) before the row is marked `Verified`. **The full workflow is `ASSET_PROVENANCE.md`.** Accepted generated assets are registered with the honest status `AI-generated — usage governed by the generating platform's terms as of the generation date; ownership status not independently adjudicated`, in their own rows — never merged into the procedural-SVG batch rows below, and never described as public-domain, copyright-free, royalty-free or owned (D-045).
2. No real franchise's copyrighted character art, logos, trademarks, or footage may be used under any circumstances without a verified, specific license — this project's fandom content is original, not a reproduction of any real IP's official assets.
3. Third-party embeds that are not "assets" per se (the Google Maps iframe on Contact Us, YouTube video embeds referenced by `media.json`) are governed by their respective platforms' terms of embedding and are noted here as **Embedded Services**, not asset rows, since no file is copied into the repository.
4. Fonts must be either self-hosted under an open license (e.g., OFL) or loaded from a permitted CDN (per `artifact-design`/build tooling norms) with their license recorded here.
5. Any asset whose status cannot be verified is excluded from the build — a missing/blocked asset is a bug to fix, never silently shipped.

## 3. Embedded Services (not files, tracked separately from the asset table)

| Service | Used For | Terms Reference | Notes |
|---|---|---|---|
| Google Maps (iframe embed, `output=embed`) | Contact Us location/GPS (FR-039) | Google Maps Platform Terms of Service | No API key required for the basic `/maps?q=...&output=embed` iframe pattern; confirmed as a client-side-only embed, no FandomVerse backend involved |
| YouTube (iframe embed) | Trailers/interviews/fan videos (FR-014/FR-015) | YouTube Terms of Service / embed policy | Only publicly embeddable videos are referenced; FandomVerse does not rehost video files sourced from YouTube |

## 4. Status Summary (last updated: Phase 5B)

- Total assets logged: 161 (8 batches — see §1)
- Verified: 161
- Pending Verification: 0
- Blocked: 0

Phases 1–4 introduced zero assets; the Phase 4 Fandom Core cinematic scene is entirely procedural (Three.js primitive geometry + code-driven materials + CSS), per D-033.

Phase 5 introduced 161 visual assets, all of them **original procedural SVG generated by this repository's own script** (D-036) — no stock imagery, no scraped artwork, no AI image generation, and no third-party license obligations of any kind. No franchise, character, logo or title referenced anywhere in the content dataset belongs to a real rights-holder: all seven hubs are built on original fictional properties created for this project (D-037). Simulated events, releases and trailers are explicitly flagged in the data and badged in the UI so nothing reads as a real-world claim (D-038).

**Copyright risk assessment: none identified.** All 161 registered assets are original procedural SVG with unambiguous provenance.

**Phase 5B (planning only) — no change to this register.** A Gemini generation pass has been *specified* (70 assets approved, prompts written, workflow and acceptance gate authored — D-042/D-043), but **no image has been generated and no asset has been added**. When the pass runs, each accepted asset gets its own row here with the status `AI-generated — usage governed by the generating platform's terms as of the generation date; ownership status not independently adjudicated` (D-045), never merged into the procedural batch rows above and never described as copyright-free. The procedural SVG each one replaces is retained, so any accepted asset can be withdrawn with a one-line revert.

This section will be updated at the end of every phase that introduces new assets.
