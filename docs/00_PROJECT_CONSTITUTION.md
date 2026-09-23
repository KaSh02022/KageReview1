# 00 — Project Constitution

Status: Draft v1.0 (Phase 0)
Source of truth: `docs/FandomVerse-Web_Innovation Unleashed_SRS.pdf` ("the SRS")

## 1. Vision

FandomVerse is a single, centralized, visually engaging portal that lets fans of Anime, Gaming, Movies, TV Shows, K-Pop, Comics, and Manga discover articles, media, characters, events, trailers, and merchandise in one place instead of scattering across wikis, streaming services, social media, and stores. It is a browser-based Single Page Application (SPA) — no account system, no backend, no real commerce — that demonstrates strong frontend engineering, information architecture, and an original cinematic presentation layer.

## 2. Goals

- Satisfy every functional and non-functional requirement in the SRS with traceable evidence (Phase 0 requirement matrix + Phase 14 audit).
- Deliver a cohesive, original visual identity — a cinematic WebGL entry experience that leads into a fully functional content portal — without imitating the Kage reference project's assets, branding, or narrative concept.
- Ship a responsive, accessible, performant client-side-only application deployable as static files.
- Produce documentation and a demo video suitable for competition submission ("Web Innovation Unleashed").

## 3. Non-Goals

- No real user accounts, authentication, or session persistence beyond the browser (Login/Signup are UI-only per SRS §1.6).
- No checkout, payment processing, or real order fulfillment.
- No server, server-side database, or any persisted write-back to data files.
- No live external AI API for the chatbot (rule-based / pre-scripted only).
- No verbatim reuse of Kage's code, art, copy, or branding.

## 4. Constraints (binding, from SRS §1.4–1.5 and Master Directive)

- Responsive SPA; static hosting only.
- No backend, no server-side database, no server-side user data storage.
- Content sourced from JSON/TXT (or equivalent static local data) — read-only at runtime; nothing is ever written back to those files by the app.
- Chatbot is rule-based / pre-scripted; no live external AI runtime dependency.
- Shopping cart is temporary (in-memory / browser storage) only; no checkout, no payment, no purchasing.
- Only original, royalty-free, or properly licensed content may be used; every non-original asset must be logged in `08_LICENSES.md` with verified permission — never assumed.
- No Firebase, Supabase, MongoDB, MySQL, PostgreSQL, server APIs, authentication backend, cloud database, or external AI runtime dependency unless the Project Director explicitly approves an exception (logged in `11_DECISION_LOG.md`).
- Must run on the latest evergreen browsers and be responsive across desktop, tablet, and mobile.

## 5. Technology Principles

- Client-side rendering only; all "data" lives in versioned JSON files under the app's `src/data/` (or equivalent), loaded via `fetch`/static import — never mutated at runtime beyond in-memory state.
- Framework: React (Claude's assigned domain per Master Directive), TypeScript preferred for correctness, Vite as the build tool (fast, backend-free, static-output SPA tooling appropriate for a no-server project).
- Three.js (via React Three Fiber) is scoped to the cinematic entry/Fandom Universe layer — it is an enhancement, never a gate that blocks access to functional content (must degrade gracefully without WebGL).
- Persistence primitives are limited to what the browser provides: `localStorage` (bookmarks, visitor counter, cart survivability if specified), `sessionStorage` (personal notes, per SRS §1.6).
- Any third-party service embedded directly (e.g., a Google Maps iframe on Contact Us) must not require a private backend key exchange or introduce a server dependency; it is documented as an external, client-only embed.

## 6. AI Responsibility (binding roles)

- **Claude** — primary implementation agent: repository, architecture, React/TypeScript/JavaScript, Three.js, application logic, tests, debugging, optimization, documentation, build, release.
- **ChatGPT** — architecture reviewer and QA director (external to this session; referenced in `07_AI_USAGE.md`).
- **Gemini** — visual asset generation (images, 2D/3D assets, video, visual exploration).
- **Human (Project Director)** — final project authority; approves phase transitions and any exception to these constraints.
- Claude must never claim another AI generated an asset unless that generation actually happened and is recorded in `07_AI_USAGE.md` / `08_LICENSES.md`.
- Per SRS "Important Note Regarding AI Usage" (p.14): AI tools are a supporting aid, not a substitute for original design/development. No full boilerplate or ready-made website templates. No unmodified AI-generated code or content submitted without meaningful modification and understanding. AI-generated images/graphics are permitted. All AI tools used must be acknowledged in documentation. The team must be able to explain every design and implementation decision.

## 7. Coding Principles

- Functional requirements before visual flourish — the cinematic layer must support discovery/navigation/usability, never obstruct it (Master Directive, "Important Development Principle").
- No premature abstraction; no speculative features beyond the SRS plus explicitly approved original enhancements.
- No dead code, no commented-out blocks, no backwards-compatibility shims for a project with no prior release.
- Every data-driven feature (search, filter, sort, bookmarks, cart, chatbot) is implemented in plain client-side TypeScript/JavaScript logic — no server calls.

## 8. Accessibility Principles

- WCAG-aligned: sufficient color contrast, legible text at all breakpoints, full keyboard operability, screen-reader-friendly semantics (landmarks, alt text, ARIA where native semantics are insufficient).
- Respect `prefers-reduced-motion` for the WebGL/cinematic layer and all major transitions.
- The WebGL entry experience must have a non-WebGL / reduced-motion fallback path into the functional SPA — 3D is progressive enhancement, not a requirement to proceed.

## 9. Performance Principles

- Fast initial load and smooth in-app navigation even with media-rich content (images, embedded video, 3D assets) — per SRS NFR "Performance".
- Lazy-load heavy media (galleries, trailers, 3D assets) and code-split routes.
- Validate with Google Lighthouse (explicitly named in the SRS) across Performance, Accessibility, Best Practices, and SEO categories.

## 10. Content & License Rules

- Every non-original asset (image, video, audio, font, 3D model) must be original, royalty-free, or properly licensed with verifiable permission, recorded in `08_LICENSES.md` before use.
- No copyrighted third-party fandom material (official character art, trademarked logos, studio-owned footage) may be used without a verified license — this project depicts an *original* fandom-portal concept, not real franchises' copyrighted assets, unless a specific asset's license is confirmed and logged.
- Never fabricate or assume a license status; unverified assets are blocked from use until confirmed.

## 11. Kage Reference Rules

Kage (`https://threeui.com/landing-pages/kage-landing-page`) may inform: interaction patterns, WebGL architecture approach, scroll-driven storytelling technique, visual-hierarchy thinking, performance technique, procedural-3D technique.

Kage must never be: copied in source code, copied in original artwork/imagery, copied in branding or text, presented as this project, or reproduced as its specific temple/night-walk narrative concept. Kage's own code/artwork is not licensed for reuse; only its vendored Three.js runtime carries a separate MIT license applicable to that library itself, not to Kage's content. FandomVerse's cinematic layer must be an original narrative and visual concept (a "Fandom Universe" portal metaphor, not a temple/night-walk).

## 12. Testing Rules

- Every SRS requirement gets a Test ID in the requirement matrix (`01_SRS_REQUIREMENTS.md`) and a corresponding entry in `09_TEST_STRATEGY.md`.
- No phase is reported complete without running the tests defined for that phase's scope.
- Accessibility and responsive checks are mandatory before Phase 14 sign-off, not optional extras.

## 13. Phase Gate Rules

- Work proceeds in the 16 phases (0–15) defined by the Master Directive, in order, without skipping.
- After every phase: run tests → inspect results → verify against the SRS → update documentation → produce a completion report → **stop** and wait for the Project Director's decision.
- Any SRS conflict discovered mid-phase is documented in `11_DECISION_LOG.md` with the conflict, proposed resolution, and is flagged in that phase's completion report — never silently resolved by changing the requirement.
