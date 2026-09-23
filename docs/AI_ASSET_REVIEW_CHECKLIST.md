# AI Asset Review Checklist (Phase 5B)

The gate every Gemini-generated image must pass before it enters the repository. Run in full, per asset, by a human. Used at step 3 of the workflow in `ASSET_PROVENANCE.md`.

**H = hard fail** (reject or revise immediately — do not continue weighing trade-offs).

Status: **unused.** No asset has been generated or reviewed.

---

## Asset under review

| Field | Value |
|---|---|
| Asset ID | |
| Filename | |
| Class | `CLASS-HERO` / `CLASS-CARD` / `CLASS-PORTRAIT` |
| Category | |
| Replaces | |
| Reviewer | |
| Date | |

---

## 1. IP safety — run this first

Do this section before any aesthetic judgement. A beautiful image that fails here is still rejected, and time spent admiring it first is wasted.

- [ ] **H** No recognisable real person (actor, musician, athlete, streamer, public figure).
- [ ] **H** No character resembling one from an existing franchise.
- [ ] **H** No logo, wordmark, brand mark or trademark — including partial, blurred or background instances.
- [ ] **H** Not a recreation of, and does not closely evoke, a specific existing poster / album cover / box art / book cover.
- [ ] **H** No costume, emblem, insignia or colourway matching an existing franchise.
- [ ] **H** No real-world branded product or packaging.
- [ ] **H** Does not imitate a named living artist's signature style.
- [ ] **H** Reverse image search run, and no near-identical existing work found.
- [ ] **H** A reasonable viewer could not mistake this for official art of a real property.

> Full IP question set with fail actions: `ASSET_PROVENANCE.md` §4.

## 2. Technical quality

- [ ] **H** No malformed hands, extra fingers, extra limbs or distorted anatomy.
- [ ] **H** No distorted, melted or uncanny facial features.
- [ ] **H** No duplicated, cloned or mirrored figures.
- [ ] **H** No legible text, lettering or numerals anywhere in frame.
- [ ] **H** No watermark, signature or artist mark.
- [ ] No compression artefacts, banding in the gradients, or blown highlights.
- [ ] Delivered at or above the class master size, before optimisation.
- [ ] Exported as WebP at the delivered sizes for its class.
- [ ] Weight within budget — hero ≤300KB, card ≤80KB delivered.
- [ ] **H** Measurably better than the procedural SVG it replaces. (An SVG is ~1KB. A 250KB file has to earn it.)

## 3. Style consistency

Judge against the other six worlds, not in isolation. Open a sibling asset side by side.

- [ ] Stylised cinematic painting — not photorealistic, not flat vector, not a 3D render.
- [ ] Single dominant coloured key/rim light present.
- [ ] Key light is the **correct category accent** (`#ff5d73` anime · `#33d0ff` gaming · `#ffb648` movies · `#8f7bff` tv-shows · `#ff5de0` kpop · `#ffe14d` comics · `#5ce6a6` manga).
- [ ] Near-black desaturated blue base; at most three hues in frame.
- [ ] High cinematic contrast; shadows retain detail rather than crushing to black.
- [ ] Background dark, simplified and low-detail.
- [ ] Subtle film grain and soft bloom present; no heavy noise.
- [ ] Shadows soft, directional, accent-tinted — not pure black.
- [ ] Category environment, materials and signature texture match the row in `AI_IMAGE_ASSET_BIBLE.md` §3.
- [ ] Universe motif (faint nested-polygon core with drifting motes) subtly present.
- [ ] **Placed beside the other six categories, it reads as the same production.**

## 4. Composition

- [ ] Subject core inside the central 60% of frame.
- [ ] Generous negative space; not cluttered edge to edge.
- [ ] Clear foreground / midground / background separation.
- [ ] Silhouette reads before detail does.

## 5. Crop and safe area — by class

**CLASS-HERO**
- [ ] **H** Survives the desktop band: the central ~36% vertical slice still works as an image.
- [ ] **H** Survives the mobile near-square centre crop (≈1.2:1).
- [ ] **H** Lower third is visually quiet — the hub title, tagline and description sit over it.
- [ ] Nothing meaningful touches the frame edges.

**CLASS-PORTRAIT**
- [ ] **H** Face and head inside the central 4:3 band (card view discards the top and bottom ~12%).
- [ ] Head is not in the top eighth of the frame.
- [ ] Head-and-shoulders framing; works both as a 280×280 square and a 165×124 crop.

**CLASS-CARD**
- [ ] **H** Legible at 158px wide — check it at that size, do not estimate.
- [ ] No fine linework or small detail carrying meaning.

## 6. Mobile check

Do this on the actual page, not in an image viewer.

- [ ] Viewed at 375×812 in the real UI, in its real slot.
- [ ] Hero: title and tagline remain legible over it.
- [ ] Card: still reads in a two-column dense grid.
- [ ] No horizontal overflow introduced.
- [ ] Lazy loading still applies; the page does not jump as it loads.

## 7. Accessibility

- [ ] **H** Hand-written alt text describing what the image **actually depicts** — subject, setting, mood.
- [ ] **H** Alt text is not the filename, not `"hero image"` / `"character portrait"`, and not copied from the prompt.
- [ ] Alt text is at least 10 characters (enforced by `contentValidation.test.ts`).
- [ ] No information exists only in the artwork — category, event type, status and availability all remain in text.
- [ ] Sufficient contrast for any text rendered over the image.
- [ ] If decorative only: marked `alt=""` / `aria-hidden` rather than given filler text.

## 8. UI integration

- [ ] Dropped into its real slot and viewed in the running app — not judged as a standalone file.
- [ ] Category accent in the art agrees with the accent the UI applies around it.
- [ ] Sits correctly with `object-fit: cover`; no letterboxing or stretch.
- [ ] Hub, card and detail views all checked where the asset appears in more than one.
- [ ] Visual QA at 375 / 768 / 1440 — real screenshots, per the standing rule that visual quality is never declared from automated results alone.

## 9. Provenance

- [ ] All fourteen metadata fields from `ASSET_PROVENANCE.md` §2 populated — no placeholders.
- [ ] Exact prompt recorded verbatim, including the negative block.
- [ ] Generation tool, model/version and date captured **at generation time**, not reconstructed.
- [ ] **H** Platform terms read as of the generation date; `licenseNote` written without overstatement.
- [ ] **H** No claim of "public domain", "copyright-free", "royalty-free" or "no license required".
- [ ] Row added to `08_LICENSES.md` §1, separate from the procedural-SVG batch rows.
- [ ] Generation event logged in `07_AI_USAGE.md`.
- [ ] **H** The replaced procedural SVG is retained in the repository as the fallback.

## 10. Post-swap validation

- [ ] `npm test` passes — including `contentValidation.test.ts` asset-existence, alt-text and provenance assertions.
- [ ] `npm run typecheck` clean.
- [ ] `npm run lint` clean.
- [ ] `npm run build` succeeds.
- [ ] Relevant Playwright suites pass — including the "no broken images" hub test.
- [ ] Console/network audit clean: no 404, no console error.

---

## Verdict

| | |
|---|---|
| **Result** | ☐ Accepted ☐ Revise ☐ Rejected ☐ Blocked (provenance) |
| **Hard fails** | |
| **Notes** | |
| **If Revise** | Prompt adjustment needed (record the new prompt verbatim): |

A `Rejected` or `Blocked` asset changes nothing — the procedural SVG remains in place and referenced. There is no partial state to clean up.
