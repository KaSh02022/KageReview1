/**
 * Builds `public/landing-pages/fandomverse-kage.html` from the authored Kage
 * page plus FandomVerse's own content data.
 *
 * WHY A GENERATOR RATHER THAN A HAND-EDITED COPY
 * The Kage page is 4,822 lines of authored HTML, CSS and JavaScript. Almost
 * all of it is the engine — renderer, camera, scroll interpolation, easing,
 * fog, particles, foreground staging, pointer handling, resize, DPR and the
 * WebGL lifecycle — and none of that should be touched. Only the *content*
 * changes. Expressing that as a short list of targeted substitutions keeps the
 * engine provably untouched, keeps `kage.html` pristine for rollback, and lets
 * the adaptation be regenerated after any upstream sync.
 *
 * WHAT IS PRESERVED, VERBATIM
 *   Three.js renderer and the whole scene build
 *   CAM interpolation, damping and easing
 *   scroll -> fractional chapter progress
 *   foreground staging, blur-and-fade handoff
 *   particles, fog, bloom, grain, vignette
 *   pointer trail and custom cursor
 *   resize, DPR handling, reduced motion, WebGL context loss
 *   word-level reveals and the `[data-rv]` stagger
 *   the live `data-frame` / `data-view` viewports
 *
 * WHAT CHANGES
 *   the six camera keyframes become nine (interpolated along the authored path)
 *   the four chapters become seven, one per FandomVerse category
 *   copy, navigation, chapter rail labels and the colophon
 *   each chapter gains one representative character, feathered into the scene
 *
 * Run:  node scripts/build-fandomverse-kage.mjs
 */

import { readFile, writeFile } from 'node:fs/promises'

const SOURCE = 'public/landing-pages/kage.html'
const OUT = 'public/landing-pages/fandomverse-kage.html'

/* ------------------------------------------------------------------ data */

const categories = JSON.parse(await readFile('src/data/categories.json', 'utf8'))
const characters = JSON.parse(await readFile('src/data/characters.json', 'utf8'))
const routes = JSON.parse(
  // The route registry is TypeScript, so the paths are lifted out of it by
  // pattern rather than imported. Kept in step with src/routes/categoryRoutes.ts.
  JSON.stringify([
    { path: 'anime', categoryId: 'anime' },
    { path: 'gaming', categoryId: 'gaming' },
    { path: 'movies', categoryId: 'movies' },
    { path: 'tv-shows', categoryId: 'tv-shows' },
    { path: 'k-pop', categoryId: 'kpop' },
    { path: 'comics', categoryId: 'comics' },
    { path: 'manga', categoryId: 'manga' },
  ]),
)

/**
 * One representative lead per world, and the delivered filename for each.
 * Three of these differ from the manifest stem — the same mapping the runtime
 * keeps in src/data/landingAssets.ts (D-053). Kept here rather than renaming
 * any frozen asset.
 */
const LEADS = {
  anime: ['character-anime-kaida-nova', 'character-anime-kaida-nova'],
  gaming: ['character-gaming-kestrel-rho', 'character-gaming-kestrel-rho'],
  movies: ['character-movies-lena-cross', 'character-movies-det-lena-cross'],
  'tv-shows': ['character-tv-shows-elena-marsh', 'character-tv-shows-dr-elena-marsh'],
  kpop: ['character-kpop-hana', 'character-kpop-hana'],
  comics: ['character-comics-aegis', 'character-comics-aegis-marcus-steele'],
  manga: ['character-manga-yui-kurogane', 'character-manga-yui-kurogane'],
}

const ACCENT = {
  anime: '#ff5d73',
  gaming: '#33d0ff',
  movies: '#ffb648',
  'tv-shows': '#8f7bff',
  kpop: '#ff5de0',
  comics: '#ffe14d',
  manga: '#5ce6a6',
}

/** Plate stems differ from category ids only for k-pop. */
const PLATE = {
  anime: 'hero-anime',
  gaming: 'hero-gaming',
  movies: 'hero-movies',
  'tv-shows': 'hero-tv-shows',
  kpop: 'hero-kpop',
  comics: 'hero-comics',
  manga: 'hero-manga',
}

/**
 * The authored foreground groups, reused as-is so their positioning CSS keeps
 * working. Seven chapters cycle through the four Kage authored, which also
 * keeps the scene from repeating the same silhouette twice in a row.
 */
const FG = [
  `    <span class="fg-el fg-wall" data-fg-in="left"><img src="secret-pathways-assets/foreground/png/temple-wall.webp" alt="" width="1536" height="884" loading="lazy" decoding="async"></span>
    <span class="fg-el fg-pine" data-fg-in="right"><img src="secret-pathways-assets/foreground/png/pine-tree.webp" alt="" width="1024" height="1438" loading="lazy" decoding="async"></span>
    <span class="fg-el fg-grass" data-fg-in="up"><img src="secret-pathways-assets/foreground/png/tall-grass.webp" alt="" width="1717" height="916" loading="lazy" decoding="async"></span>`,
  `    <span class="fg-el fg-sakura fg-el--sway" data-fg-in="left"><img src="secret-pathways-assets/foreground/png/sakura-branch.webp" alt="" width="1536" height="1024" loading="lazy" decoding="async"></span>
    <span class="fg-el fg-leaves fg-el--sway" data-fg-in="right"><img src="secret-pathways-assets/foreground/png/maple-leaves.webp" alt="" width="1536" height="1024" loading="lazy" decoding="async"></span>
    <span class="fg-el fg-bush" data-fg-in="up"><img src="secret-pathways-assets/foreground/png/garden-bush.webp" alt="" width="1717" height="876" loading="lazy" decoding="async"></span>`,
  `    <span class="fg-el fg-wall fg-el--flip" data-fg-in="right"><img src="secret-pathways-assets/foreground/png/temple-wall.webp" alt="" width="1536" height="884" loading="lazy" decoding="async"></span>
    <span class="fg-el fg-stones" data-fg-in="up"><img src="secret-pathways-assets/foreground/png/basalt-stones.webp" alt="" width="1536" height="996" loading="lazy" decoding="async"></span>
    <span class="fg-el fg-grass" data-fg-in="up"><img src="secret-pathways-assets/foreground/png/tall-grass.webp" alt="" width="1717" height="916" loading="lazy" decoding="async"></span>`,
  `    <span class="fg-el fg-hill" data-fg-in="up"><img src="secret-pathways-assets/foreground/png/hill.webp" alt="" width="1774" height="887" loading="lazy" decoding="async"></span>
    <span class="fg-el fg-ruins" data-fg-in="left"><img src="secret-pathways-assets/foreground/png/shrine-ruins.webp" alt="" width="1536" height="1001" loading="lazy" decoding="async"></span>
    <span class="fg-el fg-grass" data-fg-in="up"><img src="secret-pathways-assets/foreground/png/tall-grass.webp" alt="" width="1717" height="916" loading="lazy" decoding="async"></span>`,
]

/* --------------------------------------------------------------- camera */

/**
 * Nine keyframes from the authored six.
 *
 * The hero and the colophon keep their authored shots exactly. The seven
 * chapters are sampled along the authored polyline through keyframes 1-4 —
 * sanmon, gardens, craft, afterlight — at seven evenly spaced points. Every
 * resulting position is therefore either an authored shot or a linear blend
 * of two adjacent ones, so the camera never leaves the modelled scene and no
 * shot had to be invented.
 */
const AUTHORED = [
  { p: [0.0, 4.05, 13.6], t: [0.0, 6.6, -18.0], fov: 36 },
  { p: [-5.6, 2.35, 11.6], t: [1.2, 5.6, -14.0], fov: 48 },
  { p: [1.2, 3.6, 2.2], t: [-0.6, 7.5, -22.0], fov: 40 },
  { p: [5.2, 2.1, -3.4], t: [-2.6, 7.0, -20.0], fov: 46 },
  { p: [0.0, 7.6, -16.0], t: [0.0, 13.0, -40.0], fov: 42 },
  { p: [0.0, 10.5, -20.0], t: [0.0, 3.0, -34.0], fov: 46 },
]

const lerp = (a, b, k) => a + (b - a) * k
const lerp3 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]

function sampleChapterPath(i, count) {
  const u = (i * 3) / (count - 1) // 0..3 across authored keyframes 1..4
  const seg = Math.min(2, Math.floor(u))
  const k = u - seg
  const a = AUTHORED[1 + seg]
  const b = AUTHORED[2 + seg]
  return { p: lerp3(a.p, b.p, k), t: lerp3(a.t, b.t, k), fov: lerp(a.fov, b.fov, k) }
}

const n = (v) => Number(v.toFixed(2))
const camLine = (c, label) =>
  `  { p: [ ${n(c.p[0])}, ${n(c.p[1])}, ${n(c.p[2])} ], t: [ ${n(c.t[0])}, ${n(c.t[1])}, ${n(c.t[2])} ], fov: ${n(c.fov)} },  /* ${label} */`

const chapterCams = routes.map((_, i) => sampleChapterPath(i, routes.length))
const CAM_BLOCK = [
  'const CAM = [',
  camLine(AUTHORED[0], '0 intro'),
  ...chapterCams.map((c, i) =>
    camLine(c, `${i + 1} ${categories.find((x) => x.id === routes[i].categoryId).name}`),
  ),
  camLine(AUTHORED[5], '8 colophon').replace(/,(\s+\/\* 8)/, '$1'),
  ']',
].join('\n')

/* ------------------------------------------------------------- sections */

const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function chapterSection(route, index) {
  const category = categories.find((c) => c.id === route.categoryId)
  const [charId, file] = LEADS[route.categoryId]
  const lead = characters.find((c) => c.id === charId)
  const num = String(index + 1).padStart(2, '0')
  const accent = ACCENT[route.categoryId]

  return `<!-- ================================================= chapter ${num} · ${category.name} -->
<section class="sec fv-sec" id="${route.path}" data-cam="${index + 1}" style="--fv-accent:${accent}">
  <!-- No Kage foreground here, deliberately. The temple's cut-outs — maple,
       sakura, shrine wall, basalt — belong to Chapter 00. These seven chapters
       are FandomVerse's own worlds and carry their own art. The cinematic
       behaviour is unaffected: it lives in the camera, the scroll progress and
       the reveal system, not in these images. -->

  <div class="fv-plate" aria-hidden="true">
    <img src="/assets/gemini/web/${PLATE[route.categoryId]}-wide.webp" alt="" width="1920" height="1072" loading="lazy" decoding="async">
  </div>
  <div class="fv-figure" aria-hidden="true">
    <img src="/assets/gemini/web/${file}.webp" alt="" width="800" height="800" loading="lazy" decoding="async">
  </div>

  <div class="sec-head" data-rv="fade">
    <span class="k"><b>${num}</b> — ${esc(category.name)}</span><span class="rule"></span><span class="k">${esc(category.franchise)}</span>
  </div>

  <div class="fv-grid">
    <h2 class="display h-sec" data-rv="up">${esc(category.name)}</h2>
    <div class="fv-copy">
      <p class="lead" data-rv="up">${esc(category.tagline)}</p>
      <p class="body" data-rv="up">${esc(category.description)}</p>
      <p class="fv-lead-line" data-rv="up"><span class="fv-lead-k">Lead</span> <b>${esc(lead.name)}</b> <em>${esc(lead.role)}</em></p>
      <a class="arrowlink" href="/#/${route.path}" data-rv="fade" data-cursor>
        <span>Explore ${esc(category.name)}</span>
        <span class="ar"><svg viewBox="0 0 14 14" fill="none"><path d="M3 11 11 3M5 3h6v6" stroke="#dfe7e0" stroke-width="1.3"/></svg></span>
      </a>
    </div>
  </div>
</section>`
}

const CHAPTERS = routes.map(chapterSection).join('\n\n')

const CHIPS = routes
  .map((route, i) => {
    const category = categories.find((c) => c.id === route.categoryId)
    return `      <div class="chip" data-chip="${i}" data-rv="up" data-cursor><span class="num">${String(i + 1).padStart(2, '0')}</span>
        <span class="tx"><b>${esc(category.name)}</b><p>${esc(category.tagline)}</p></span></div>`
  })
  .join('\n')

const HERO = `<section class="hero" id="hero" data-cam="0">
  <div class="hero-top">
    <div class="eyebrow" data-rv="fade"><span class="dot"></span> Chapter 00 — The Threshold</div>
    <h1 class="display h-hero">
      <span class="mask-line"><span>Seven worlds</span></span>
      <span class="mask-line"><span>that share</span></span>
      <span class="mask-line"><span>a sky.</span></span>
    </h1>
    <p class="hero-sub body" data-rv="up">FandomVerse — Portal for Fandom World. Characters, worlds and
      stories, all original fiction written and drawn for this portal.</p>
  </div>

  <div class="hero-spacer"></div>

  <div class="hero-foot">
    <div class="hero-cue" data-rv="fade"><span>Scroll to explore</span><span class="track"><i></i></span></div>
    <div class="chapters" id="chips">
${CHIPS}
    </div>
  </div>

  <a class="peek" href="#anime" data-view="3" data-rv="fade" data-cursor aria-label="Preview: enter the universe">
    <span class="peek-fr" data-frame></span>
    <span class="peek-play"><svg viewBox="0 0 22 22" fill="none"><path d="M8 5.6 16.4 11 8 16.4z" fill="#dfe7e0"/></svg></span>
    <span class="peek-cap"><b>07</b><i>Seven worlds, one universe</i></span>
  </a>

  <div class="word-fb" aria-hidden="true">FANDOMVERSE</div>
</section>`

const FOOTER = `<footer class="foot" data-cam="8">
  <!-- No Kage cut-outs: the colophon follows Chapter 07, by which point the
       temple has retired, and a shrine's planting there would belong to
       nothing. -->
  <div class="foot-grid">
    <div class="foot-brand">
      <p><b>FandomVerse</b> — Portal for Fandom World. Seven original worlds, ${characters.length} characters,
        and the fan coverage around them. Every franchise here is original fiction created for this project.</p>
    </div>
    <div><h4>Worlds</h4><ul>
${routes
  .slice(0, 4)
  .map(
    (r) =>
      `      <li><a href="/#/${r.path}" data-cursor>${esc(categories.find((c) => c.id === r.categoryId).name)}</a></li>`,
  )
  .join('\n')}
    </ul></div>
    <div><h4>More</h4><ul>
${routes
  .slice(4)
  .map(
    (r) =>
      `      <li><a href="/#/${r.path}" data-cursor>${esc(categories.find((c) => c.id === r.categoryId).name)}</a></li>`,
  )
  .join('\n')}
    </ul></div>
    <div><h4>Elsewhere</h4><ul>
      <li><a href="/#/search" data-cursor>Search</a></li>
      <li><a href="/#/events" data-cursor>Events</a></li>
      <li><a href="/#/about" data-cursor>About</a></li>
    </ul></div>
  </div>
  <div class="foot-base">
    <span>© 2026 FandomVerse — a student/competition project</span>
    <span>Scene engine: Kage by Meng To, MIT</span>
    <span>WebGL · Onest</span>
  </div>
</footer>`

/* ------------------------------------------------------- adaptation CSS */

const STYLE = `<style id="fv-adapt">
/* ===================================================== FandomVerse adapt
   Additive only. Nothing here overrides the Kage engine's own layout rules;
   it styles the two elements the adaptation introduces (a category plate and
   a representative character) and retones the accent per chapter. */

/* ===== Kage Visual belongs to Chapter 00 =====================================
   The canvas is a fixed, full-viewport temple behind every section, so the
   seven FandomVerse chapters were reading their worlds through a Kyoto
   shrine. It is faded out as the reader leaves the threshold.

   This retires the VISUAL only. The engine keeps running — camera keyframes,
   damping, scroll progress, parallax, reveal, particles, resize and DPR are
   all untouched, which is what the chapters below still ride on. */
#gl {
  /* Measured: with the old window the temple was still 54% visible as
     Chapter 01's heading arrived, so Anime's world was read through a shrine.
     Gone by the time the first chapter is on screen. */
  opacity: clamp(0, calc((0.58 - var(--kage-prog, 0)) / 0.34), 1);
  transition: opacity 240ms linear;
}

/* The moon's bloom is painted into the same canvas, so it retires with it.
   Grain and vignette stay: they are atmosphere, not Kyoto. */

/* One chapter to a screen.
   Kage's own chapters are long enough that their padding alone separates
   them; a FandomVerse chapter is a heading and three short paragraphs, so at
   ~730px two of them shared the fold — two leads, two plates and one
   chapter's foreground cutting across the next chapter's copy. Giving each
   one the height of the frame restores the one-shot-at-a-time reading the
   camera choreography assumes.

   Content sits above the lower band, which is where the engine parks the
   active chapter's foreground stage. */
.fv-sec {
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: clamp(150px, 24vh, 280px);
}

/* The category's own key art, sat behind the live WebGL scene's foreground
   and well under the type. Low opacity keeps the temple reading as the world
   and the plate as its weather.

   Selectors are deliberately \`.sec > .fv-*\`, not bare class selectors: Kage
   declares \`.sec > :not(.fg) { position: relative; z-index: 2 }\`, which at
   (0,2,0) outranks a single class and silently pulled these layers back into
   flow as plain rectangles. */
/* Each chapter's plate dissolves at both ends, so two adjacent worlds meet on
   a fade rather than a horizontal seam. */
/* Under the character, deliberately. As a pseudo-element of the section it
   paints after every child at the same z-index, so at z-index 1 — the
   character's own level — it was laying a dark gradient across the top and
   bottom of the figure. That is a large part of what made the lead look
   printed into the scene rather than standing in front of it. */
.fv-sec::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background:
    linear-gradient(to bottom, var(--ink) 0%, transparent 14%),
    linear-gradient(to top, var(--ink) 0%, transparent 12%);
}

.sec > .fv-plate {
  position: absolute; inset: 0; z-index: 0; overflow: hidden; pointer-events: none;
}
.fv-plate img {
  width: 100%; height: 100%; object-fit: cover; opacity: .52;
  mask-image: linear-gradient(to bottom, transparent 0%, #000 22%, #000 72%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 22%, #000 72%, transparent 100%);
}

/* The representative lead.
   ONE mask layer per element, and no \`mask-composite\` anywhere: the legacy
   \`-webkit-mask-composite: source-in\` intersects a single layer with an empty
   accumulated mask and paints nothing (FandomVerse D-062's sibling defect).
   No permanent \`will-change\` either — fourteen promoted layers is what made
   characters vanish mid-scroll on a phone. */
.sec > .fv-figure {
  position: absolute; right: 0; bottom: 0;
  /* Layer 3 of the chapter: plate 0, edge dissolve 1, CHARACTER 2, type 3.
     The lead is a foreground subject and nothing atmospheric may composite
     over it. */
  z-index: 2;
  isolation: isolate;
  width: min(44%, 620px); height: 86%;
  pointer-events: none;
  /* Both ends feathered in ONE gradient. Two stacked layers would need
     \`mask-composite\`, whose legacy \`-webkit-\` form erases a single-layer
     mask entirely at any breakpoint that drops one. */
  mask-image: linear-gradient(to bottom, transparent 0%, #000 15%, #000 80%, transparent 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, #000 15%, #000 80%, transparent 100%);
}
.fv-figure img {
  width: 100%; height: 100%; object-fit: cover; object-position: 50% 14%;
  /* Fully opaque. At .78 the plate behind was reading straight through the
     lead's hair, face and jacket — the "printed into the background" look.
     Separation now comes from the mask and the haze around the figure, not
     from making the figure itself transparent. */
  opacity: 1;
  mask-image: linear-gradient(to left, #000 52%, transparent 100%);
  -webkit-mask-image: linear-gradient(to left, #000 52%, transparent 100%);
}

.sec > .fv-grid { position: relative; z-index: 3; max-width: 46rem; }
.fv-copy { max-width: 40rem; }
.fv-sec .sec-head { position: relative; z-index: 3; }
/* MEASURED DEFECT: the franchise label is \`var(--muted)\` and sits top-right,
   directly over the lead's hair now that she is opaque -- "MIDNIGHT MERIDIAN"
   was reading as "HT MERIDIAN". A shadow scrim restores it without touching
   the colour, so the label stays legible over hair, armour or sky alike. */
.fv-sec .sec-head .k { text-shadow: 0 1px 3px rgba(5, 7, 10, .92), 0 0 10px rgba(5, 7, 10, .68); }
.fv-sec .sec-head .k b { color: var(--fv-accent, var(--vermilion)); }
.fv-sec .lead { color: var(--fv-accent, var(--bone)); }
.fv-sec .arrowlink:hover { color: var(--fv-accent, var(--bone)); }

.fv-lead-line { margin: 1.1rem 0 0; font-size: .95rem; color: var(--bone-dim); }
.fv-lead-k {
  font-size: .72rem; letter-spacing: .18em; text-transform: uppercase; color: var(--muted);
  margin-right: .5rem;
}
.fv-lead-line b { color: var(--bone); font-weight: 500; }
.fv-lead-line em { font-style: normal; color: var(--muted); margin-left: .4rem; }

/* Tablet and below (<=1023px): the lead no longer has the width to stand
   BESIDE the type, so she stands ABOVE it.

   MEASURED DEFECT (768x1024): figure box l:292->768, type box l:26->742 --
   a 450px horizontal by 231px vertical collision, well past the figure's
   feathered left edge. The description ran across the lead's chest and the
   words that crossed her were unreadable. The phone had the identical fault
   (390x844: a 252px overlap with the type block entirely inside the figure),
   so both breakpoints get the same answer: normal flow, character band first,
   type band second, no intersection at all.

   This is a layout fix. Nothing is dimmed to hide a collision -- the lead
   stays at opacity 1 at every breakpoint. */
@media (max-width: 1023px) {
  .fv-sec {
    justify-content: center;
    padding-top: calc(var(--nav-h) + 1.5vh);
    padding-bottom: clamp(28px, 6vh, 64px);
  }

  .sec > .fv-figure {
    position: relative;
    top: auto; right: auto; bottom: auto;
    width: 100%; height: auto;
    /* A wider viewport wants a shallower band, or the type is pushed off the
       fold. The source crop is square, so the box decides how much of her the
       band shows; \`cover\` plus a high object-position keeps head and
       shoulders in frame at both shapes. */
    aspect-ratio: 16 / 10;
    max-height: 44svh;
    margin: 0 0 clamp(14px, 2.6vh, 24px);
    /* ONE layer, feathering every side at once.
       A bottom-only linear gradient left the top and both sides as hard cuts,
       so the band read as a framed panel pasted onto the plate rather than a
       figure standing in it. A radial does all four edges in a single layer,
       which matters because the standing rule here is one mask per element and
       never \`mask-composite\` — stacking two gradients is exactly what erased
       the lead's lower half before. The solid core is generous enough that the
       head stays fully opaque; only the outer margin dissolves. */
    mask-image: radial-gradient(94% 98% at 50% 42%, #000 40%, transparent 100%);
    -webkit-mask-image: radial-gradient(94% 98% at 50% 42%, #000 40%, transparent 100%);
  }
  .fv-figure img {
    object-position: 50% 12%;
    /* Not .92, and not .88. Separation is the mask's and the layout's job;
       fading the lead is what made her look printed into the plate. */
    opacity: 1;
    /* No mask here. The figure element already carries the one feather, and a
       second layer on the child is what was cutting the lead in half. */
    mask-image: none;
    -webkit-mask-image: none;
  }

  .sec > .fv-grid { margin-bottom: 0; }
  .fv-sec .sec-head { margin-bottom: 12px; }
  .fv-grid, .fv-copy { max-width: none; }

  /* The copy no longer has to be read over the lead, but it does sit on the
     plate, so it keeps a soft scrim of its own -- far lighter than the one it
     needed when the two layers were stacked. */
  .sec > .fv-grid { isolation: isolate; }
  .sec > .fv-grid::before {
    content: '';
    position: absolute;
    inset: -18px -24px -24px;
    z-index: -1;
    pointer-events: none;
    background: radial-gradient(120% 100% at 24% 46%,
      rgba(5, 7, 10, .82) 0%, rgba(5, 7, 10, .58) 52%, rgba(5, 7, 10, 0) 100%);
  }
}

@media (max-width: 720px) {
  /* Phone-only deltas on top of the stacked layout above: a squarer band,
     since the viewport is tall and narrow, and a clamped description. The
     full text stays in the DOM for assistive tech, and the hub page carries
     it in full. */
  .sec > .fv-figure {
    aspect-ratio: 4 / 3;
    max-height: 46svh;
  }
  .fv-sec .body {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .fv-lead-line { margin-top: .7rem; }
}

@media (prefers-reduced-motion: reduce) {
  .fv-plate img, .fv-figure, .fv-figure img { transition: none; }
}
</style>
`

/* ---------------------------------------------------------- build it up */

let html = await readFile(SOURCE, 'utf8')
const before = html.length
const applied = []

function swap(label, find, replace) {
  if (!html.includes(find)) {
    throw new Error(`Anchor not found (${label}). The upstream page changed — re-audit before regenerating.`)
  }
  /* A FUNCTION replacer, never a string. String.prototype.replace reads `$$`,
     `$&`, `` $` `` and `$'` in a *string* replacement as substitution
     patterns. The engine is full of `$$('sel')` (its querySelectorAll helper),
     so a string replacement silently emitted `$('sel')` — one element — and
     the page died at boot with "$(...).forEach is not a function": no
     __kage hook, `anchors` left empty, `progressFor` returning -1 and the
     temple stuck at opacity 1 behind every chapter. A function replacer is
     taken literally, which protects every substitution here, not just that one. */
  html = html.replace(find, () => replace)
  applied.push(label)
}

// -- head ------------------------------------------------------------------
swap(
  'title',
  '<title>Kage — Where stillness reveals the unseen</title>',
  '<title>FandomVerse — Portal for Fandom World</title>',
)
swap(
  'description',
  '<meta name="description" content="A five-chapter night walk through a Kyoto mountain temple. Charred cypress, lantern light and a vermilion moon, rendered live in WebGL.">',
  '<meta name="description" content="Seven original fandom worlds — characters, events, releases and fan coverage — travelled as one continuous cinematic scroll.">',
)
swap('adaptation stylesheet', '</head>', `${STYLE}</head>`)

// -- nav -------------------------------------------------------------------
swap(
  'brand wordmark',
  '<span class="brand-tx"><b>KAGE</b><i>HIDDEN REALMS OF KYOTO</i></span>',
  '<span class="brand-tx"><b>FANDOMVERSE</b><i>PORTAL FOR FANDOM WORLD</i></span>',
)
swap(
  'nav links',
  `    <a class="nav-link" href="#gate" data-cursor><span>Temples</span><span class="alt">伽藍</span></a>
    <a class="nav-link" href="#pathways" data-cursor><span>Gardens</span><span class="alt">庭園</span></a>
    <a class="nav-link" href="#lessons" data-cursor><span>Rituals</span><span class="alt">神事</span></a>
    <a class="nav-link" href="#eternity" data-cursor><span>Afterlight</span><span class="alt">残光</span></a>`,
  routes
    .map((r, i) => {
      const c = categories.find((x) => x.id === r.categoryId)
      return `    <a class="nav-link" href="#${r.path}" data-cursor><span>${esc(c.name)}</span><span class="alt">${String(i + 1).padStart(2, '0')}</span></a>`
    })
    .join('\n'),
)

// -- body: hero + chapters + footer ---------------------------------------
const bodyStart = html.indexOf('<section class="hero" id="hero" data-cam="0">')
const bodyEnd = html.indexOf('</footer>') + '</footer>'.length
if (bodyStart < 0 || bodyEnd < bodyStart) throw new Error('Could not locate the content block.')
html = html.slice(0, bodyStart) + `${HERO}\n\n${CHAPTERS}\n\n${FOOTER}` + html.slice(bodyEnd)
applied.push('hero + 7 chapters + colophon')

// -- engine data -----------------------------------------------------------
{
  // The array literal contains nested `[ ... ]` for every position and target,
  // so the closing bracket has to be found as a line of its own rather than by
  // the next `]` — which lands inside the first vector.
  const camStart = html.indexOf('const CAM = [')
  const camEnd = html.indexOf('\n]', camStart)
  if (camStart < 0 || camEnd < 0) throw new Error('Could not locate the CAM array.')
  swap('camera keyframes', html.slice(camStart, camEnd + 2), CAM_BLOCK)
}
swap(
  'chapter rail labels',
  `const names = ['The Hidden Gate', 'The Sanmon', 'Still Gardens', 'Sacred Craft', 'Afterlight', 'Colophon'];`,
  `const names = ['The Threshold', ${routes
    .map((r) => `'${categories.find((c) => c.id === r.categoryId).name}'`)
    .join(', ')}, 'Colophon'];`,
)
// -- the 3D wordmark -------------------------------------------------------
// The wordmark is extruded geometry built glyph by glyph, not the `.word-fb`
// element (which is only the no-WebGL fallback). The authored tracking of .40
// was chosen so four wide letters reach the frame edge; eleven letters at that
// tracking would scale the whole word down to a third of its cap height, so
// the tracking comes down with the letter count. The layout code that fits the
// word to the frame is untouched.
swap(
  'wordmark tracking',
  "const SZ = 320, TRACK = .40, PAD = 26;",
  "const SZ = 320, TRACK = .055, PAD = 26;",
)
swap('wordmark text', "const word = 'KAGE', gl = [];", "const word = 'FANDOMVERSE', gl = [];")

// The authored fill of 1.00 sets the word edge to edge, which the four-letter
// original could carry. Eleven letters at that fill clip the outer stems of
// the F and the final E, so the word is held inside the frame instead.
swap(
  'wordmark frame fill',
  "  const fill = narrow ? .96 : 1.00;",
  "  const fill = narrow ? .80 : .86;",
)

// -- brand mark ------------------------------------------------------------
// The torii glyph is Kage's identity. Dropping it rather than inventing a
// FandomVerse logo: the wordmark beside it already carries the brand.
// The word sat low enough that the scene's grass covered the lower half of
// the F, and at .92 fill the final E ran off the frame. Lifting the baseline
// clears the foreground and the narrower fill brings both outer stems inside
// the frame. Geometry, extrusion and the per-glyph reveal are untouched.
swap(
  'wordmark baseline',
  "  const base = hit(0, narrow ? -.16 : -.585);",
  "  const base = hit(0, narrow ? -.06 : -.44);",
)

swap(
  'brand mark',
  `    <svg viewBox="0 0 44 44" fill="none" aria-hidden="true">
      <circle cx="22" cy="25" r="8.6" fill="#e0231c" fill-opacity=".9"/>
      <path d="M5 13h34M9 18.4h26M22 8.5v27" stroke="#dfe7e0" stroke-width="1.5"/>
      <path d="M14 35.5h16" stroke="#dfe7e0" stroke-width="1.2" stroke-opacity=".6"/>
    </svg>
`,
  '',
)

// -- retire the temple after Chapter 00 -----------------------------------
// The Kage canvas is a fixed, full-viewport temple behind every section. It is
// Chapter 00's, and the seven FandomVerse chapters that follow must not
// inherit it. Publishing the continuous progress lets CSS fade it out; the
// engine keeps running, so camera, damping, parallax and reveal are untouched.
swap(
  'publish scroll progress to CSS',
  `    const a = Math.round(progressFor(y));
    if (a !== activeSec) {`,
  `    const a = Math.round(progressFor(y));
    document.documentElement.style.setProperty('--kage-prog', progressFor(y).toFixed(3));
    if (a !== activeSec) {`,
)

// -- the temple must be retired before the first scroll, not after ---------
// The scroll handler only runs on a scroll EVENT, so until the visitor
// actually scrolls, --kage-prog is unset and the CSS fallback of 0 applies --
// which reads as "still in Chapter 00" and leaves the temple at full opacity
// behind all seven chapters. Measured at 390x844: #gl opacity 1 on Chapter 01
// and Chapter 02. That is the precise leak the architecture table forbids, and
// it shows on any deep entry, restored scroll position, or load below the hero.
//
// It is published from the tail of measure(), not from the nav wiring: anchors
// are empty until measure() has run, and progressFor() answers -1 against an
// empty array, which is worse than not publishing at all. measure() already
// runs at boot and on every resize, so this rides the existing lifecycle and
// adds no listener of its own -- one runtime source of truth.
swap(
  'seed scroll progress before first scroll',
  `  for (let i = 1; i < anchors.length; i++) anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
}`,
  `  for (let i = 1; i < anchors.length; i++) anchors[i] = Math.max(anchors[i], anchors[i - 1] + 1);
  document.documentElement.style.setProperty('--kage-prog', progressFor(scrollY).toFixed(3));
}`,
)

// -- the hero reveal must survive the route leaving underneath it ----------
// The engine is a standalone page: it assumes #hero is still there 340ms
// after the preloader finishes. Inside FandomVerse it is a ROUTE, and
// KageStage sweeps the stage DOM the moment the hash changes. Navigating off
// `/` inside that window left the timer dereferencing a removed node:
//   [pageerror] Cannot read properties of null (reading 'querySelectorAll')
// caught by the console/network audit, which changes route every 300ms.
// A null check, nothing more -- the reveal simply has nothing left to reveal.
swap(
  'hero reveal survives teardown',
  `      $('#hero').querySelectorAll('[data-rv], .mask-line').forEach((e, i) =>
        setTimeout(() => e.classList.add('rv-in'), REDUCE ? 0 : 120 + i * 95));`,
  `      const heroEl = $('#hero');
      if (!heroEl) return;
      heroEl.querySelectorAll('[data-rv], .mask-line').forEach((e, i) =>
        setTimeout(() => e.classList.add('rv-in'), REDUCE ? 0 : 120 + i * 95));`,
)

// -- the split heading must not name itself with a prohibited attribute ----
// splitHeadingWords() hides every visible word span with aria-hidden and then
// restores the accessible name by putting aria-label on the .mask-line SPAN.
// aria-label is prohibited on a span with no role, which axe reports as a
// SERIOUS violation on `/`:
//   aria-prohibited-attr — "aria-label attribute cannot be used on a span
//   with no valid role attribute"  (<span class="mask-line word-reveal"
//   aria-label="Seven worlds">)
// Removing the label alone would leave the line with no accessible name at
// all, because the words beneath it are hidden. So both go: the word spans
// stay readable and the heading is named by its own text, with no ARIA at
// all. The spaces between words are already real text nodes, so the name
// still computes as "Seven worlds" rather than "SevenWorlds".
swap(
  'split headings are named by their text, not by aria-label',
  `      target.classList.add('word-reveal');
      target.setAttribute('aria-label', phrase);`,
  `      target.classList.add('word-reveal');`,
)
swap(
  'split heading words stay readable',
  `        mask.className = 'word-mask'; mask.setAttribute('aria-hidden', 'true');`,
  `        mask.className = 'word-mask';`,
)

swap(
  'preloader label',
  '<span>Raising the mountain temple</span>',
  '<span>Opening the universe</span>',
)

const banner = `<!--
  FandomVerse — Kage adaptation.  GENERATED FILE — DO NOT EDIT BY HAND.
  Built by scripts/build-fandomverse-kage.mjs from public/landing-pages/kage.html.
  The Kage engine (renderer, camera, scroll, particles, foreground, pointer,
  resize, DPR, reduced motion, WebGL lifecycle) is preserved verbatim; only the
  content, the camera keyframe count and the rail labels differ.
  Kage © 2026 Meng To, MIT — see ATTRIBUTION.txt.
-->
`
html = html.replace('<!DOCTYPE html>', `<!DOCTYPE html>\n${banner}`)

await writeFile(OUT, html, 'utf8')

console.log(`source ${SOURCE}  ${before.toLocaleString()} bytes`)
console.log(`output ${OUT}  ${html.length.toLocaleString()} bytes, ${html.split('\n').length} lines`)
console.log(`\nsubstitutions applied:`)
for (const a of applied) console.log(`  · ${a}`)
console.log(`\nchapters: ${routes.length}   camera keyframes: ${routes.length + 2}`)
