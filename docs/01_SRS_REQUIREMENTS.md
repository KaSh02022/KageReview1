# 01 — SRS Requirements Matrix

Source: `docs/FandomVerse-Web_Innovation Unleashed_SRS.pdf`, v1.0 ("SRS"), 17 pages, extracted and reviewed in full on 2026-09-23.

Every requirement below is traced to an SRS page. Priority is **M = Mandatory** unless noted (the SRS states functional + non-functional requirements are "the bare minimum expectations... a must implement"). Status starts at **Not Started** for all items — Phase 0 produces no application code.

Test IDs are named `T-<Req ID>` and detailed by category in `09_TEST_STRATEGY.md`.

## Legend

- **FR** — Functional Requirement
- **CR** — Constraint
- **NFR** — Non-Functional Requirement
- **IR** — Interface/Technology Requirement
- **DR** — Deliverable Requirement
- **AI** — AI-Usage Governance Rule (process requirement, still binding)

---

## A. Functional Requirements

### A.1 Home Page

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| FR-001 | Home page displays portal logo, animated heading, introductory text | M | p.8 | Logo, animated heading, and intro copy render on `/` on first load | Home module | T-FR-001 | Not Started |
| FR-002 | Responsive navigation (bar or grid) links to all 7 category hubs: Anime, Gaming, Movies, TV Shows, K-Pop, Comics, Manga | M | p.8 | All 7 category links present and functional at every breakpoint | Home module / Global Nav | T-FR-002 | Not Started |
| FR-003 | Featured Content: rotating or grid-based showcase of featured articles, trailers, and highlighted events across categories | M | p.8 | Home page shows a curated cross-category showcase sourced from JSON | Home module | T-FR-003 | Not Started |
| FR-004 | Floating chatbot launcher icon accessible from home page and all subsequent pages | M | p.8 | Chatbot icon visible and clickable on every route | Chatbot module (global) | T-FR-004 | Not Started |

### A.2 Category Hubs

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| FR-005 | Selecting a category displays its hub page with a catalog of content items loaded from JSON, specific to that category | M | p.9 | Each of the 7 hub routes renders content filtered to that category only | CategoryHub module | T-FR-005 | Not Started |
| FR-006 | Each content card shows: title, thumbnail image, short description, content type (article/gallery/video/audio), and tags | M | p.9 | Card component renders all 5 fields for every content item | CategoryHub / ContentCard component | T-FR-006 | Not Started |
| FR-007 | Content filterable by type (articles, galleries, videos, audio, character profiles, events, merchandise, releases) and by category sub-tags | M | p.9 | Filter UI narrows visible items correctly for each type and tag combination | CategoryHub / Filter module | T-FR-007 | Not Started |
| FR-008 | Content sortable alphabetically, by newest, and by popularity/featured status | M | p.9 | Sort control reorders the visible list correctly for all 3 modes | CategoryHub / Sort module | T-FR-008 | Not Started |

### A.3 Global Search

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| FR-009 | Global search bar accessible from all pages; searches across all categories and content types | M | p.9 | Search input present in global header on every route; querying returns cross-category results | Search module | T-FR-009 | Not Started |
| FR-010 | Search results filterable by category and content type | M | p.9 | Result list narrows correctly by category/type filters | Search module | T-FR-010 | Not Started |
| FR-011 | Search operates over the pre-populated JSON content dataset using client-side JavaScript logic only | M | p.9 | No network/server call performed for search; verified via network-tab inspection in tests | Search module (client-side index) | T-FR-011 | Not Started |

### A.4 Image Galleries

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| FR-012 | Every category includes its own image gallery | M | p.9 | All 7 category hubs expose a gallery section with ≥1 image set | Gallery component | T-FR-012 | Not Started |
| FR-013 | Gallery supports lightbox or carousel viewing without leaving the page | M | p.9 | Clicking a thumbnail opens an in-page lightbox/carousel; closes without route change | Gallery component | T-FR-013 | Not Started |

### A.5 Videos and Audio Clips

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| FR-014 | Every category embeds trailers, interviews, fan content, and podcast-style audio where applicable | M | p.10 | Each category has at least one playable video/audio embed | Media module | T-FR-014 | Not Started |
| FR-015 | Video/audio links and descriptions loaded from JSON (e.g., embedded YouTube links) or hardcoded data | M | p.10 | Media entries resolve from `media.json` (or equivalent), not hand-authored per page | Media module / data layer | T-FR-015 | Not Started |
| FR-016 | Media filterable by category and content type (trailer, interview, podcast, fan content) | M | p.10 | Filter UI narrows the media list by both dimensions correctly | Media module | T-FR-016 | Not Started |

### A.6 Featured Articles

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| FR-017 | Long-form articles/news pieces per fandom, shown in card and full detail-page format | M | p.10 | Each category has article cards that link to a full-article detail route | Articles module | T-FR-017 | Not Started |
| FR-018 | Selecting an article opens a full read view with related-content suggestions | M | p.10 | Article detail page renders full body text + a "related content" section | Articles module | T-FR-018 | Not Started |

### A.7 Character Profiles

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| FR-019 | Every category contains at least 5 character profiles loaded from JSON or hardcoded data | M | p.11 | Each of the 7 categories has ≥5 character entries (≥35 total) verified against `characters.json` | Characters module / data layer | T-FR-019 | **Done (Phase 5)** — 35 profiles, 5 per category, asserted per-category |
| FR-020 | Each character profile includes: Name, Image, Series, Biography, Traits | M | p.11 | Character detail view renders all 5 fields for every profile | Characters module | T-FR-020 | Not Started |
| FR-021 | Character profiles filterable by category and franchise/series | M | p.11 | Filter UI narrows character list by category and by series correctly | Characters module | T-FR-021 | Not Started |

### A.8 Event Highlights

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| FR-022 | Every category contains at least 3 events | M | p.11 | Each of the 7 categories has ≥3 event entries (≥21 total) verified against `events.json` | Events module / data layer | T-FR-022 | **Done (Phase 5)** — 21 events, 3 per category, asserted per-category |
| FR-023 | Displays past and upcoming fandom events: conventions, watch parties, meetups | M | p.11 | Event list distinguishes past vs. upcoming; covers the named event types | Events module | T-FR-023 | Not Started |
| FR-024 | Each event entry includes: Title, date, location, description, associated category | M | p.11 | Event card/detail renders all 5 fields | Events module | T-FR-024 | Not Started |

### A.9 Trailers

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| FR-025 | Dedicated section aggregating trailers across all categories, embedded from JSON-sourced links | M | p.11 | A `/trailers` route lists trailers from every category in one place | Trailers module | T-FR-025 | Not Started |
| FR-026 | Trailers filterable by category and release status (upcoming, recently released) | M | p.11 | Filter UI narrows trailers by both dimensions correctly | Trailers module | T-FR-026 | Not Started |

### A.10 Merchandise & Temporary Cart

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| FR-027 | Merchandise items shown in card format: image, name, price range, short description | M | p.12 | Merchandise cards render all 4 fields, loaded from `merchandise.json` | Merchandise module | T-FR-027 | Not Started |
| FR-028 | Users can click to view full product information | M | p.12 | Product detail view opens with expanded info | Merchandise module | T-FR-028 | Not Started |
| FR-029 | Users can add items to a temporary shopping cart | M | p.12 | "Add to cart" updates cart state and visible cart badge/count | Cart module (state store) | T-FR-029 | Not Started |
| FR-030 | Cart total billing amount is calculated and displayed via JavaScript | M | p.12 | Cart view sums line items correctly and updates live on change | Cart module | T-FR-030 | Not Started |
| FR-031 | No checkout, payment, or actual purchase functionality is included | M | p.12 | No checkout/payment route or control exists anywhere in the app | Cart module (scope boundary) | T-FR-031 | Not Started |

### A.11 AI-Powered (Rule-Based) Chatbot

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| FR-032 | Floating chatbot widget available site-wide; answers FAQs, recommends content by stated interest, guides users to relevant pages | M | p.12 | Chatbot widget opens from any route, returns an FAQ answer and at least one content-recommendation + deep link in a scripted demo flow | Chatbot module | T-FR-032 | Not Started |
| FR-033 | Chatbot responses generated from a rule-based, pre-scripted dataset (questions/answers/recommendation rules) loaded from JSON/local knowledge base — not a live external AI service | M | p.13 | No network call to an external AI/chat API is made; all responses resolve from local JSON | Chatbot module / data layer | T-FR-033 | Not Started |
| FR-034 | Visitor can type a question or pick a suggested quick-reply; chatbot responds and links to the relevant category/content page where applicable | M | p.13 | Both free-text (keyword-matched) and quick-reply input paths produce a response; responses include working in-app links where relevant | Chatbot module | T-FR-034 | Not Started |

### A.12 Bookmarks

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| FR-035 | Users can favorite articles, media, characters, and events | M | p.13 | A bookmark control exists on all 4 content types and toggles saved state | Bookmarks module | T-FR-035 | Not Started |
| FR-036 | Bookmarks persist in the browser's LocalStorage | M | p.13 | Bookmarks survive a full page reload and browser restart (same browser/profile) | Bookmarks module (localStorage) | T-FR-036 | Not Started |
| FR-037 | Personal notes can be attached to bookmarked content; notes persist only for the current browser session (SessionStorage) | M | p.13 | Note text is saved per bookmark and is gone after the tab/session ends, but present within the same session/reload | Bookmarks module (sessionStorage) | T-FR-037 | Not Started |
| FR-038 | Bookmarks can be exported as a formatted list | M | p.13 | An export action produces a human-readable list (e.g., downloadable text/JSON) of current bookmarks | Bookmarks module | T-FR-038 | Not Started |

### A.13 Contact Us / About Us

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| FR-039 | Contact Us page shows responsive team contact information with a Google Map (location + GPS) | M | p.13 | `/contact` renders contact details and an embedded, responsive map showing a location | Contact page | T-FR-039 | Not Started |
| FR-040 | About Us page shows responsive information about the team and the website | M | p.13 | `/about` renders team/site information, responsive at all breakpoints | About page | T-FR-040 | Not Started |

### A.14 UI Features

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| FR-041 | Visitor Counter simulated using JavaScript and LocalStorage | M | p.14 | A counter increments per visit/session and persists across reloads via localStorage, with no server involved | VisitorCounter component | T-FR-041 | Not Started |
| FR-042 | Real-Time Clock displays current date and time via JavaScript | M | p.14 | A live clock updates at least once per second/minute and shows correct local date/time | Clock component | T-FR-042 | Not Started |
| FR-043 | Hover effects and animated transitions provide an interactive feel | M | p.14 | Interactive elements (cards, buttons, nav) show hover/transition states; respects `prefers-reduced-motion` | Global CSS / motion system | T-FR-043 | Not Started |
| FR-044 | Breadcrumb navigation across category and detail pages | M | p.14 | Breadcrumb trail renders correctly on all category and detail routes and is clickable | Breadcrumb component | T-FR-044 | Not Started |
| FR-045 | Dummy Login/Signup buttons are UI-only and do not authenticate users | M | p.14 | Login/Signup UI opens a form/modal; submitting performs no real authentication and does not create real accounts | Auth UI (dummy) module | T-FR-045 | Not Started |

---

## B. Constraints

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| CR-001 | No server-side data storage; content is fetched from JSON/TXT and displayed, never written back from within the site | M | p.7 | No write API exists; JSON/TXT files in the repo are the only data source and remain unmodified by runtime code | Data layer | T-CR-001 | Not Started |
| CR-002 | Only original, royalty-free, or non-copyrighted content used; no copyrighted content without permission/license | M | p.7 | Every non-original asset has a verified entry in `08_LICENSES.md` before merge | Asset pipeline / `08_LICENSES.md` | T-CR-002 | Not Started |
| CR-003 | Chatbot does not connect to a live external AI service or backend; responses come from a pre-scripted dataset | M | p.7 | No chatbot network call to any AI API exists in the codebase | Chatbot module | T-CR-003 | Not Started |
| CR-004 | SPA architecture; no backend technologies or server-side databases | M | p.4 | Repository contains no server process/DB dependency; deployable as static files | Overall architecture | T-CR-004 | Not Started |
| CR-005 | Responsive across desktop, tablet, and mobile devices | M | p.4, p.7 | Layouts verified at defined breakpoints (see `04_DESIGN_SYSTEM.md`) with no horizontal scroll/broken layout | Design system / responsive QA | T-CR-005 | Not Started |

---

## C. Non-Functional Requirements

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| NFR-001 | Safe to use: no malicious or unnecessary file downloads | M | p.15 | No unsolicited downloads triggered by any page; only explicit user-initiated exports (e.g., bookmark export) | Overall / security review | T-NFR-001 | Not Started |
| NFR-002 | Accessible: usable by people with visual, hearing, or motor impairments via sufficient contrast, legible text, keyboard/screen-reader support | M | p.15 | Automated a11y scan (axe) passes with no critical/serious issues; full keyboard navigation verified; contrast ratios meet WCAG AA | Design system / a11y QA | T-NFR-002 | Not Started |
| NFR-003 | User-friendly: quick and intuitive, clear layout, logical navigation | M | p.15 | Usability walkthrough completes core tasks (find content, bookmark, add to cart, use chatbot) without external guidance | UX architecture | T-NFR-003 | Not Started |
| NFR-004 | Operability: reliably efficient operation | M | p.15 | No unhandled runtime errors during core-flow QA pass | Overall / QA | T-NFR-004 | Not Started |
| NFR-005 | Performance: fast load, smooth page redirection even with media-rich content | M | p.15 | Lighthouse Performance score meets target threshold defined in `09_TEST_STRATEGY.md`; route transitions remain smooth under target frame budget | Performance engineering | T-NFR-005 | Not Started |
| NFR-006 | Capacity: supports many users | M | p.15 | Static-hosting architecture confirmed (no shared server-side bottleneck); asset sizes and caching verified to scale to concurrent static traffic | Architecture / deployment | T-NFR-006 | Not Started |
| NFR-007 | Availability: 24/7 with minimum downtime | M | p.15 | Deployment target is a static host with documented high-availability SLA (e.g., static CDN hosting) | Deployment / release engineering | T-NFR-007 | Not Started |
| NFR-008 | Compatibility: latest browsers | M | p.15 | Verified on latest Chrome, Edge, Firefox (and Safari where available) per `09_TEST_STRATEGY.md` browser matrix | Browser compatibility QA | T-NFR-008 | Not Started |

---

## D. Interface / Technology Requirements

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| IR-001 | Frontend stack drawn from HTML5, CSS3, JavaScript, jQuery, Bootstrap, Angular or ReactJS, XML, Figma UI Toolkit | M | p.16 | Chosen stack (see `02_PRODUCT_ARCHITECTURE.md`) is documented and justified against this list | Architecture decision | T-IR-001 | Not Started |
| IR-002 | Data store is JSON or TXT files | M | p.16 | All content lives in versioned JSON files under the repo; no other data store used | Data layer | T-IR-002 | Not Started |
| IR-003 | AI/dev tools (Figma AI, Canva Magic, Framer AI, Uizard, Visily AI, Penpot, GitHub Copilot, Tabnine, Windsurf, ChatGPT/Claude/Gemini) may assist design, code, image generation, FAQ/content generation | Should | p.16 | Any such tool actually used is recorded in `07_AI_USAGE.md` | AI usage governance | T-IR-003 | Not Started |
| IR-004 | Chatbot platforms suggested: Tawk.to and Tidio | Optional (see conflict below) | p.13, p.16 | Decision recorded in `11_DECISION_LOG.md`: build a custom in-app rule-based engine instead of an external SaaS widget, to satisfy the Master Directive's "no external AI runtime dependency without approval" | Chatbot module / decision log | T-IR-004 | Not Started |

**Conflict note (IR-004):** the SRS lists Tawk.to/Tidio as *optional* chatbot platforms one "can" use; it does not mandate them, and it explicitly requires the chatbot to avoid a live external AI service/backend (p.7, p.13). The Master Directive additionally forbids introducing external runtime dependencies without Director approval. Resolution: implement a fully custom, in-repo rule-based chatbot engine (JSON-driven keyword/intent matching) — this satisfies the SRS's own binding constraint (CR-003) and avoids the Master Directive conflict without weakening any requirement. Logged as Decision D-004 in `11_DECISION_LOG.md`.

---

## E. Deliverables

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| DR-001 | Project report includes Problem Definition and Design Specifications | M | p.17 | Report section present and complete at submission | Documentation (Phase 15) | T-DR-001 | Not Started |
| DR-002 | Project report includes diagrams (flowcharts, Data Flow Diagrams, etc.) | M | p.17 | ≥1 flowchart and ≥1 DFD included, covering core user flows and data flow | Documentation (Phase 15) | T-DR-002 | Not Started |
| DR-003 | Project report includes test data used in the project | M | p.17 | Sample/test datasets referenced or included | `09_TEST_STRATEGY.md` / Documentation | T-DR-003 | Not Started |
| DR-004 | Project Installation Instructions included (MANDATORY) | M | p.17 | Step-by-step setup/run instructions verified by a clean install | README.md / Documentation | T-DR-004 | Not Started |
| DR-005 | Documentation is complete, comprehensive, and contains no source code | M | p.17 | Docs reviewed to confirm no raw source-code blocks are embedded | Documentation (all docs) | T-DR-005 | Not Started |
| DR-006 | Submission is a Source Code ZIP with a ReadMe.doc listing assumptions made | M | p.17 | ZIP + ReadMe.doc produced at Phase 15 with an explicit assumptions list | Release engineering (Phase 15) | T-DR-006 | Not Started |
| DR-007 | A demonstration video (MP4) showing all functionalities is submitted (MANDATORY) | M | p.17 | MP4 covers every FR in this matrix | Release engineering (Phase 15) | T-DR-007 | Not Started |
| DR-008 | Optionally, a live hosted URL may be supplied | Optional | p.17 | If hosted, URL recorded in README and report | Release engineering (Phase 15) | T-DR-008 | Not Started |

---

## F. AI Usage Governance Rules

| ID | Requirement | Priority | Source | Acceptance Criteria | Implementation Area | Test ID | Status |
|---|---|---|---|---|---|---|---|
| AI-001 | AI tools are a supporting aid, not a substitute for the team's own design/development/problem-solving | M | p.14 | `07_AI_USAGE.md` documents how each AI tool was used and what remained human/agent-authored judgment | AI usage governance | T-AI-001 | Not Started |
| AI-002 | No full boilerplate or ready-made website templates used | M | p.14 | Architecture and components are custom-built for FandomVerse, not a cloned template (verified in `11_DECISION_LOG.md` build choices) | Architecture | T-AI-002 | Not Started |
| AI-003 | No AI-generated code or content submitted without meaningful modification and understanding | M | p.14 | Team can explain any AI-assisted code/content on request | Process / review | T-AI-003 | Not Started |
| AI-004 | AI-generated images/graphics are permitted | Allowed | p.14 | Any AI-generated visual asset logged with prompt + tool in `06_ASSET_BIBLE.md` and `08_LICENSES.md` | Asset pipeline | T-AI-004 | Not Started |
| AI-005 | AI tools used must be acknowledged in project documentation | M | p.14 | `07_AI_USAGE.md` lists every AI tool actually used | AI usage governance | T-AI-005 | Not Started |
| AI-006 | Team must be able to explain design decisions, implementation approach, and code during evaluation | M | p.14 | `11_DECISION_LOG.md` captures rationale for every major decision | Decision log | T-AI-006 | Not Started |

---

## G. Minimum Quantity Checks

| Check | SRS Source | Requirement | Status |
|---|---|---|---|
| 7 fandom categories present | p.4, p.6, p.8 | Anime, Gaming, Movies, TV Shows, K-Pop, Comics, Manga | Verified in this document — carried into `02_PRODUCT_ARCHITECTURE.md` routing |
| ≥5 character profiles per category (≥35 total) | p.11 | FR-019 | **Met (Phase 5)** — exactly 5 per category, 35 total. Enforced per-category by `src/data/contentValidation.test.ts`, which fails the build if any category drops below 5 (gate verified to actually fail) |
| ≥3 events per category (≥21 total) | p.11 | FR-022 | **Met (Phase 5)** — exactly 3 per category, 21 total. Enforced per-category by `src/data/contentValidation.test.ts` (gate verified to actually fail) |

## H. Requirement Count Summary

| Category | Count |
|---|---|
| Functional Requirements (FR) | 45 |
| Constraints (CR) | 5 |
| Non-Functional Requirements (NFR) | 8 |
| Interface/Technology Requirements (IR) | 4 |
| Deliverables (DR) | 8 |
| AI Usage Governance (AI) | 6 |
| **Total requirements tracked** | **76** |

Every row has: an ID, a category, a requirement statement, a priority, a source page, acceptance criteria, an implementation area, and a test ID. No SRS requirement was summarized away — sections 1.1–1.9 of the SRS map fully into sections A–H above (1.1–1.3 are background/purpose, captured in `00_PROJECT_CONSTITUTION.md` §1 rather than as testable requirements, since they state intent rather than a verifiable feature).
