# 07 — AI Usage

Per SRS "Important Note Regarding AI Usage" (p.14) and the Master Directive's AI Responsibility section. This document is factual and living — updated as the project progresses, not written in advance of actual use.

## 1. Roles

| AI | Role | Scope |
|---|---|---|
| Claude (this session, Sonnet 5) | Primary implementation agent | Repository setup, architecture, React/TypeScript/JavaScript code, Three.js/React Three Fiber, application logic, tests, debugging, optimization, documentation, build, release |
| ChatGPT | Architecture reviewer and QA director | External review of architecture and QA decisions (used by the human Project Director outside this session) |
| Gemini | Visual asset generation | Images, 2D/3D assets, video, visual exploration (see `06_ASSET_BIBLE.md` §9 for prompts once executed) |
| Human (Project Director) | Final authority | Approves phase transitions, resolves SRS conflicts, approves any exception to project constraints |

## 2. Usage Log

This table is appended to as AI tools are actually used — no row is added speculatively.

| Date | Tool | Used For | Output | Modification/Review by Human-in-loop |
|---|---|---|---|---|
| 2026-09-23 | Claude (Sonnet 5) | Phase 0: repository audit, SRS extraction and requirement-matrix authoring, architecture/UX/design/data-schema/test-strategy/decision-log drafting | `docs/00`–`docs/11`, `README.md` | Reviewed — Director issued "PASS WITH FIXES" gate |
| 2026-09-24 | Claude (Sonnet 5) | Phase 1: resolved 3 Phase 0 open decisions (cart persistence, Contact/Maps architecture, performance baseline categories); scaffolded Vite+React+TypeScript app; implemented routing (HashRouter/data router), app shell, Zustand stores (cart/bookmarks/notes/chatbot/UI), TypeScript domain types, seed data, design tokens, accessibility foundation (skip link, focus states, accessible dialogs, aria-current nav), error/loading/empty/not-found states; configured ESLint/Vitest/Playwright; wrote and ran unit + E2E tests; ran typecheck/lint/build verification | `package.json`, `src/**`, `e2e/**`, `docs/02`, `docs/03`, `docs/04`, `docs/05`, `docs/09`, `docs/11` updates | Every generated file was reviewed for correctness against `01_SRS_REQUIREMENTS.md` and the Director's Phase 1 spec before being counted complete; build/lint/typecheck/test results are reported verbatim in the Phase 1 completion report, not asserted without evidence |
| 2026-09-27 | Claude (Sonnet 5) | Phase 4: designed and implemented the Fandom Core cinematic entry (R3F scene, accessible HTML overlay, 2D fallback, reduced-motion/no-WebGL paths); wrote unit + E2E coverage; performed real-screenshot visual QA; found and fixed the pre-existing `HashRouter` skip-link defect (D-032) | `src/features/universe/**`, `e2e/fandom-core.spec.ts`, `docs/02`/`03`/`04`/`06`/`08`/`09`/`11` updates | Reviewed — Director issued "PASS WITH FIXES" gate |
| 2026-09-28 | Claude (Opus 5) | Phase 5: **authored the entire content dataset as original fiction** — 7 flagship franchises, 35 character profiles, 21 articles, 21 events, 21 releases, 14 trailers, 14 merchandise items, 28 gallery pieces (D-037); wrote `scripts/generate-content.mjs` to generate both the JSON and all 161 procedural SVG assets (D-036); rebuilt the category hub and all four detail pages; wrote the content-validation gate and hub E2E suite; performed real-screenshot visual QA across 12 pages × 2 viewports | `scripts/generate-content.mjs`, `src/data/**`, `public/assets/generated/**` (161 files), `src/pages/**`, `e2e/category-hubs.spec.ts`, `docs/01`/`02`/`05`/`06`/`07`/`08`/`09`/`11` updates | All prose is AI-authored original fiction, reviewed to confirm it makes **no factual claims about real people, groups, productions, or events** — every franchise, character, event and release is invented for this project and labelled as fiction in the data (D-038). Counts and assertions in the completion report are real command output. |

**Note on AI-authored content (Director §19):** every article body, character biography, event description and product description in `src/data/` was drafted by Claude and is treated as such — it is original fiction, not researched fact, and is not presented as human-authored. It deliberately contains no real-world factual claims to verify. The in-universe "fandom" framing (fan theories, community projects, comeback eras) is part of the fiction; the `fictional: true` flags and UI badges exist so a reader can never mistake any of it for reporting about a real property.

## 3. Compliance with SRS AI-Usage Rules

- **AI-001 (supporting aid, not substitute):** Claude drafts architecture/code; every non-trivial decision is logged with rationale in `11_DECISION_LOG.md` so the reasoning is inspectable and challengeable by the Director, not opaque.
- **AI-002 (no full boilerplate/ready-made templates):** the stack choice (`02_PRODUCT_ARCHITECTURE.md`) is a from-scratch Vite+React+TS setup with a custom design system (`04_DESIGN_SYSTEM.md`), not a cloned site template.
- **AI-003 (no unmodified AI content without understanding):** Claude is expected to be able to explain every implementation choice; this is enforced procedurally by the phase-gate review process (`00_PROJECT_CONSTITUTION.md` §13).
- **AI-004 (AI-generated images permitted):** any Gemini-generated visual asset is logged in `06_ASSET_BIBLE.md` (prompt) and `08_LICENSES.md` (license/ownership status) at the time it is generated.
- **AI-005 (acknowledge AI tools used):** this document is that acknowledgment and is kept current.
- **AI-006 (team must be able to explain decisions):** `11_DECISION_LOG.md` exists specifically to support this.

## 4. Boundaries

- Claude does not claim Gemini or ChatGPT produced something unless that generation actually happened and is recorded here.
- Claude does not introduce external AI runtime dependencies (e.g., a live chatbot API) without Director approval — see the chatbot conflict resolution in `01_SRS_REQUIREMENTS.md` §D and `11_DECISION_LOG.md` D-004.
- AI-generated implementation output is never treated as automatically production-ready. Every Phase 1 file was checked against real tool output (typecheck, lint, unit tests, E2E tests, production build) before being reported as done, and remains reviewable/modifiable by the human Project Director — the build/test results in each phase's completion report are the actual command output, not a claim.
