// Phase 5 content + asset generator.
//
// Produces the full static content dataset (src/data/*.json) and every
// visual asset it references (public/assets/generated/**/*.svg) in one
// deterministic pass. All imagery is procedural SVG — gradients, shapes,
// and text rendered from code, seeded by each entity's own id — so every
// asset is 100% original, reproducible, and requires no license row
// beyond the batch note in docs/08_LICENSES.md (docs/11_DECISION_LOG.md
// D-036). No external images, no AI image generation, no copyrighted
// material of any kind.
//
// Re-run with `node scripts/generate-content.mjs` any time the content
// below changes; it fully overwrites its own output files.

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const DATA_DIR = join(ROOT, 'src', 'data')
const ASSET_DIR = join(ROOT, 'public', 'assets', 'generated')

const ACCENT_HEX = {
  anime: '#ff5d73',
  gaming: '#33d0ff',
  movies: '#ffb648',
  'tv-shows': '#8f7bff',
  kpop: '#ff5de0',
  comics: '#ffe14d',
  manga: '#5ce6a6',
}

const PROVENANCE = 'Original procedural SVG, self-authored by the FandomVerse content-generation script (Phase 5) — no external source, no AI image generation.'

// ---------- deterministic hash + small SVG template helpers ----------

function hash(seed) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function initials(name) {
  return name
    .replace(/[^A-Za-z0-9 ]/g, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

function shade(hex, amount) {
  const num = parseInt(hex.slice(1), 16)
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xff) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amount))
  const b = Math.min(255, Math.max(0, (num & 0xff) + amount))
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/**
 * Gradient banner used for category heroes and every card thumbnail.
 *
 * Two things here are deliberate, both found by real-screenshot QA (D-040):
 * 1. Card art is 4:3 by default, because CardMedia crops to 4:3 with
 *    `object-fit: cover` — wider artboards had their text sliced off at
 *    both edges.
 * 2. The entity's title is NOT drawn into the art. Every card and hero
 *    already renders the title as real text right beside the image, so
 *    baking it in produced a visibly duplicated title on every card. Only
 *    a small franchise/type label is drawn, and the gradient's angle and
 *    highlight position are seeded from the id so sibling cards still look
 *    distinct from one another.
 */
function bannerSvg({ seed, accent, label, width = 640, height = 480 }) {
  const h = hash(seed)
  const dark = shade(accent, -90)
  const angle = h % 360
  const cx = 20 + (h % 60)
  const cy = 20 + ((h >>> 8) % 60)
  const pad = Math.round(width * 0.06)
  const fontSize = Math.round(width * 0.04)

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(label ?? seed)}">
  <defs>
    <linearGradient id="g" gradientTransform="rotate(${angle})">
      <stop offset="0%" stop-color="${dark}" />
      <stop offset="100%" stop-color="${accent}" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="${dark}" />
  <circle cx="${(cx / 100) * width}" cy="${(cy / 100) * height}" r="${width * 0.55}" fill="url(#g)" opacity="0.85" />
  <rect y="${height * 0.62}" width="${width}" height="${height * 0.38}" fill="${dark}" opacity="0.5" />
  ${label ? `<text x="${pad}" y="${height - pad}" font-family="sans-serif" font-size="${fontSize}" font-weight="600" letter-spacing="1.5" fill="#ffffffdd">${escapeXml(label.toUpperCase())}</text>` : ''}
</svg>`
}

/** Deterministic "initials aura" identicon used for character portraits and gallery art. */
function identiconSvg({ seed, accent, label, glyphText, size = 480 }) {
  const h = hash(seed)
  const dark = shade(accent, -100)
  const shapes = []
  const shapeCount = 5 + (h % 4)
  for (let i = 0; i < shapeCount; i++) {
    const seedI = hash(`${seed}-${i}`)
    const r = size * (0.08 + ((seedI % 100) / 100) * 0.22)
    const x = (seedI % size)
    const y = ((seedI >>> 8) % size)
    const opacity = (0.12 + ((seedI % 40) / 100)).toFixed(2)
    shapes.push(`<circle cx="${x}" cy="${y}" r="${r.toFixed(1)}" fill="${accent}" opacity="${opacity}" />`)
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" role="img" aria-label="${escapeXml(label)}">
  <rect width="${size}" height="${size}" fill="${dark}" />
  ${shapes.join('\n  ')}
  <circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.32}" fill="${accent}" opacity="0.9" />
  <text x="50%" y="53%" font-family="sans-serif" font-size="${size * 0.2}" font-weight="700" fill="#0b0b12" text-anchor="middle" dominant-baseline="middle">${escapeXml(glyphText ?? initials(label))}</text>
</svg>`
}

/**
 * Small icon tile for merchandise/trailer art. The viewBox is a 4:3 window
 * onto the 400x400 glyph space so CardMedia's 4:3 crop never clips the
 * glyph (D-040).
 */
function iconTileSvg({ seed, accent, glyph, label, size = 400 }) {
  const dark = shade(accent, -95)
  const glyphs = {
    shirt: `<path d="M160 70 L200 70 L200 84 Q200 104 220 104 Q240 104 240 84 L240 70 L280 70 L330 120 L292 158 L272 138 L272 320 L128 320 L128 138 L108 158 L70 120 Z" fill="${accent}" />`,
    pin: `<circle cx="200" cy="180" r="90" fill="${accent}" /><circle cx="200" cy="180" r="46" fill="${dark}" />`,
    poster: `<rect x="120" y="60" width="160" height="260" rx="6" fill="${accent}" /><rect x="140" y="90" width="120" height="80" fill="${dark}" opacity="0.5" />`,
    disc: `<circle cx="200" cy="180" r="110" fill="${accent}" /><circle cx="200" cy="180" r="24" fill="${dark}" />`,
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 45 ${size} ${Math.round((size * 3) / 4)}" role="img" aria-label="${escapeXml(label)}">
  <rect y="45" width="${size}" height="${Math.round((size * 3) / 4)}" fill="${dark}" />
  ${glyphs[glyph] ?? glyphs.pin}
  <text x="50%" y="312" font-family="sans-serif" font-size="22" fill="#ffffffcc" text-anchor="middle">${escapeXml(seed)}</text>
</svg>`
}

function escapeXml(str) {
  return String(str).replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]))
}

const writtenAssets = []

function writeAsset(relPath, svg) {
  const fullPath = join(ASSET_DIR, relPath)
  mkdirSync(dirname(fullPath), { recursive: true })
  writeFileSync(fullPath, svg, 'utf8')
  writtenAssets.push(relPath)
  return `/assets/generated/${relPath.replaceAll('\\', '/')}`
}

// ---------------------------------------------------------------------
// Content model
// ---------------------------------------------------------------------

const CATEGORIES = [
  {
    id: 'anime',
    slug: 'anime',
    name: 'Anime',
    tagline: 'Worlds drawn in motion.',
    visualMotif: 'Ember gradients and blade-light streaks',
    franchise: 'Starlit Ronin',
    description:
      'Home of Starlit Ronin, FandomVerse’s original blade-and-sky adventure, plus the fan community built around it: character deep-dives, con meetups, and every Ashen Reaches theory in one place.',
  },
  {
    id: 'gaming',
    slug: 'gaming',
    name: 'Gaming',
    tagline: 'Every save file, one hub.',
    visualMotif: 'HUD grids and signal-flare cyan',
    franchise: 'Ashfall Protocol',
    description:
      'Everything for Ashfall Protocol, FandomVerse’s original tactical-squad shooter series: squad lore, community tournaments, and the gear people actually want to buy.',
  },
  {
    id: 'movies',
    slug: 'movies',
    name: 'Movies',
    tagline: 'The reel world, curated.',
    visualMotif: 'Amber spotlight and film-grain vignette',
    franchise: 'Midnight Meridian',
    description:
      'A curated hub for Midnight Meridian, FandomVerse’s original neo-noir mystery series: cast profiles, premiere-night events, and the ongoing debate over who Julian Moreau really is.',
  },
  {
    id: 'tv-shows',
    slug: 'tv-shows',
    name: 'TV Shows',
    tagline: 'Binge-worthy, organized.',
    visualMotif: 'Violet scanlines and archive-glass texture',
    franchise: 'The Glass Archive',
    description:
      'The full companion hub for The Glass Archive, FandomVerse’s original sci-fi mystery series: episode-era articles, fan theory meetups, and every recovered "fragment" fans have catalogued.',
  },
  {
    id: 'kpop',
    slug: 'k-pop',
    name: 'K-Pop',
    tagline: 'Stages, stans, and setlists.',
    visualMotif: 'Magenta stage-light bloom',
    franchise: 'LUNARIS',
    description:
      'The fan hub for LUNARIS, FandomVerse’s original five-member group: member profiles, comeback-era releases, and the lightstick-sea meetups that keep the fandom going.',
  },
  {
    id: 'comics',
    slug: 'comics',
    name: 'Comics',
    tagline: 'Panels, ink, and legends.',
    visualMotif: 'Halftone dots and bold primary ink',
    franchise: 'Ironclad Vanguard',
    description:
      'The full hub for Ironclad Vanguard, FandomVerse’s original superhero-team comic: issue-by-issue coverage, character files, and the artwork fans keep drawing between issues.',
  },
  {
    id: 'manga',
    slug: 'manga',
    name: 'Manga',
    tagline: 'Volumes without borders.',
    visualMotif: 'Screentone monochrome with a single accent',
    franchise: 'Paper Moon Requiem',
    description:
      'A dedicated hub for Paper Moon Requiem, FandomVerse’s original dark-fantasy manga: volume tracking, character files, and reader meetups for a series that never stays quietly bound.',
  },
]

const CHARACTERS_BY_CATEGORY = {
  anime: [
    { slug: 'kaida-nova', name: 'Kaida Nova', role: 'Wandering Blade-Bearer', traits: ['Resolute', 'Blade-bonded', 'Guarded'], tags: ['protagonist', 'swordfighter', 'celestial-blade'], biography: 'Kaida carries a celestial blade that chooses its wielder, and it chose her the night her village burned. She crosses the Ashen Reaches searching for the ronin who abandoned her — and the truth about why the sky itself seems to be dimming.' },
    { slug: 'ryo-ashen', name: 'Ryo Ashen', role: 'Rival Swordsman', traits: ['Disciplined', 'Conflicted', 'Loyal-to-a-fault'], tags: ['rival', 'swordsman', 'imperial-guard'], biography: "Once Kaida's closest friend, Ryo trained under the same fallen master and now serves the empire hunting blade-bearers. Every duel between them is as much an argument as a fight." },
    { slug: 'mei-lantern', name: 'Mei Lantern', role: 'Tactician & Mechanist', traits: ['Inventive', 'Quick-witted', 'Overprepared'], tags: ['support', 'engineer', 'strategist'], biography: 'Mei builds the gliders, wards, and lantern-drones that keep the group alive between battles. She talks faster than she fights, and she is rarely wrong about either.' },
    { slug: 'ozren-vale', name: 'Ozren Vale', role: 'Disgraced Mentor', traits: ['Weathered', 'Principled', 'Haunted'], tags: ['mentor', 'ex-imperial', 'swordsman'], biography: 'A former imperial blade-master who broke his oath rather than burn one more village, Ozren now teaches Kaida the forms the empire tried to erase.' },
    { slug: 'suzu-windrift', name: 'Suzu Windrift', role: 'Scout & Storyteller', traits: ['Curious', 'Resourceful', 'Talkative'], tags: ['scout', 'comic-relief', 'cartographer'], biography: 'Suzu maps the Ashen Reaches by ear, collecting rumors, songs, and shortcuts in equal measure, and insists every road has a story worth trading for.' },
  ],
  gaming: [
    { slug: 'kestrel-rho', name: 'Kestrel Rho', role: 'Squad Commander', traits: ['Decisive', 'Protective', 'Tactical'], tags: ['protagonist', 'squad-leader', 'soldier'], biography: "Kestrel leads the last independent strike team operating inside the Ashfall exclusion zone, running missions the official Protocol won't authorize." },
    { slug: 'juno-marchetti', name: 'Juno Marchetti', role: 'Demolitions Specialist', traits: ['Fearless', 'Meticulous', 'Blunt'], tags: ['demolitions', 'field-specialist'], biography: 'Juno never met a locked door — or a collapsing structure — she did not like. Her chaotic energy in the field hides a near-perfect memory for blueprints.' },
    { slug: 'talon-vex', name: 'Talon Vex', role: 'Recon Sniper', traits: ['Silent', 'Precise', 'Distrustful'], tags: ['sniper', 'recon', 'ex-protocol'], biography: "A former Protocol marksman who went rogue after a mission he still won't discuss, Talon says little and sees everything from half a klick out." },
    { slug: 'aria-9', name: 'ARIA-9', role: 'Tactical AI Companion', traits: ['Analytical', 'Adaptive', 'Secretive'], tags: ['ai-companion', 'support', 'non-human'], biography: "Salvaged from a downed Protocol dropship, ARIA-9 was built to coordinate airstrikes. Instead it coordinates Kestrel's squad — and keeps its own counsel about why." },
    { slug: 'dax-okafor', name: 'Sgt. Dax Okafor', role: 'Heavy Support', traits: ['Steadfast', 'Dry-humored', 'Protective'], tags: ['heavy-support', 'veteran'], biography: "Dax carries more armor plating than anyone should be able to move in, and somehow still reaches the extraction point first. The squad's steadiest hand under fire." },
  ],
  movies: [
    { slug: 'lena-cross', name: 'Det. Lena Cross', role: 'Lead Investigator', traits: ['Relentless', 'Observant', 'Guarded'], tags: ['protagonist', 'detective', 'noir'], biography: "Cross has worked every unsolved case that crosses the Meridian city line at midnight, and the Meridian case is the only one she's never closed." },
    { slug: 'julian-moreau', name: 'Julian Moreau', role: 'Nightclub Owner', traits: ['Charming', 'Evasive', 'Well-connected'], tags: ['informant', 'club-owner', 'ambiguous'], biography: "Moreau's club sits at the center of every rumor in the city, which is exactly how he likes it. Whether he's an ally or a suspect changes with the lighting." },
    { slug: 'vivian-sharpe', name: 'Vivian Sharpe', role: 'Investigative Journalist', traits: ['Ambitious', 'Sharp-tongued', 'Independent'], tags: ['journalist', 'deuteragonist'], biography: "Sharpe has been three days ahead of the police on every Meridian story so far, and she's not planning to slow down to explain how." },
    { slug: 'nico-delacroix', name: 'Nico Delacroix', role: 'Forensic Analyst', traits: ['Meticulous', 'Idealistic', 'Loyal'], tags: ['forensics', 'analyst'], biography: "Nico reads a crime scene like other people read a room, and is the only one on the team who still believes the case is solvable by the book." },
    { slug: 'wren-halloway', name: 'Insp. Wren Halloway', role: "Cross's Superior", traits: ['Pragmatic', 'Pressured', 'Morally-grey'], tags: ['police-captain', 'antagonist-adjacent'], biography: 'Halloway wants the Meridian case closed for reasons that have nothing to do with justice, and everything to do with who keeps calling him at 2 a.m.' },
  ],
  'tv-shows': [
    { slug: 'elena-marsh', name: 'Dr. Elena Marsh', role: 'Archive Researcher', traits: ['Curious', 'Rigorous', 'Haunted'], tags: ['protagonist', 'researcher'], biography: "Marsh discovered the Glass Archive's first recovered fragment and has spent three seasons proving it isn't a hoax — even as the fragments start proving things about her." },
    { slug: 'abel-finch', name: 'Curator Abel Finch', role: 'Archive Curator', traits: ['Secretive', 'Composed', 'Long-serving'], tags: ['gatekeeper', 'ambiguous'], biography: 'Finch has managed the Archive’s public collection for decades and knows exactly which fragments are never shown to visitors — or explained to Marsh.' },
    { slug: 'iris-kaine', name: 'Iris Kaine', role: 'Field Recovery Specialist', traits: ['Bold', 'Skeptical', 'Independent'], tags: ['field-agent', 'recovery-specialist'], biography: 'Iris retrieves fragments from wherever they surface, which is rarely somewhere safe, and trusts the Archive’s mission more than she trusts most of its people.' },
    { slug: 'tobias-lund', name: 'Prof. Tobias Lund', role: 'Archive Linguist', traits: ['Brilliant', 'Anxious', 'Devoted'], tags: ['linguist', 'support'], biography: 'Lund is the only person who can partially translate the fragments’ script, a fact that makes him both essential and constantly in danger.' },
    { slug: 'nova-reyes', name: 'Nova Reyes', role: 'Whistleblower Intern', traits: ['Idealistic', 'Nervous', 'Determined'], tags: ['whistleblower', 'newcomer'], biography: 'Reyes started as an intern filing fragment reports. Now she is the one who leaked what the Archive’s board really knew, and there is no going back to filing.' },
  ],
  kpop: [
    { slug: 'hana', name: 'Hana', role: 'Leader & Main Vocalist', traits: ['Steady', 'Warm', 'Perfectionist'], tags: ['leader', 'vocalist'], biography: 'Hana has led LUNARIS since its earliest predebut days, and fans credit her steady presence for holding the group together through three lineup changes.' },
    { slug: 'soojin', name: 'Soojin', role: 'Main Dancer', traits: ['Disciplined', 'Expressive', 'Driven'], tags: ['dancer', 'choreographer'], biography: "Soojin choreographs most of LUNARIS's title-track breaks herself, blending traditional dance training with sharp, percussive modern lines." },
    { slug: 'yuri', name: 'Yuri', role: 'Lead Rapper', traits: ['Witty', 'Confident', 'Introspective'], tags: ['rapper', 'lyricist'], biography: 'Yuri writes her own verses for nearly every LUNARIS release, and fans comb every comeback for the references hidden in her lyrics.' },
    { slug: 'minji', name: 'Minji', role: 'Vocalist & Visual', traits: ['Bright', 'Hardworking', 'Camera-ready'], tags: ['vocalist', 'performer'], biography: 'Minji joined LUNARIS as its youngest member and has grown into one of its strongest live vocalists, known for note-perfect high-energy stages.' },
    { slug: 'dahye', name: 'Dahye', role: 'Maknae & Sub-Rapper', traits: ['Playful', 'Bold', 'Fast-learner'], tags: ['maknae', 'rapper'], biography: "The group's youngest member, Dahye balances sharp stage presence with an unfiltered, fan-favorite variety-show personality." },
  ],
  comics: [
    { slug: 'aegis', name: 'Aegis (Marcus Steele)', role: 'Team Leader', traits: ['Dutiful', 'Guilt-driven', 'Inventive'], tags: ['leader', 'powered-armor'], biography: "Marcus built the Vanguard's signature exo-armor to stop the accident that killed his brother from ever happening to anyone else, and has been failing to retire from the mission ever since." },
    { slug: 'voltaire', name: 'Voltaire (Simone Aubert)', role: 'Energy Manipulator', traits: ['Volatile', 'Loyal', 'Sharp-witted'], tags: ['energy-powers', 'deuteragonist'], biography: 'Simone can channel raw electrical current through her own body, a gift that cost her the career she trained for and gave her the one she has now.' },
    { slug: 'wraithwing', name: 'Wraithwing (Devon Cole)', role: 'Aerial Scout', traits: ['Agile', 'Impulsive', 'Protective'], tags: ['flight', 'scout'], biography: "Devon's glide-suit lets him cover a city in minutes, which makes him the Vanguard's eyes before anyone else arrives — and often its first line of defense." },
    { slug: 'terra-prime', name: 'Terra Prime (Amara Osei)', role: 'Geokinetic', traits: ['Grounded', 'Powerful', 'Cautious'], tags: ['geokinesis', 'tank'], biography: 'Amara can reshape stone and steel with a thought, a power she has only fully trusted herself to use since joining the Vanguard.' },
    { slug: 'the-cartographer', name: 'The Cartographer (Elliot Graves)', role: 'Recurring Antagonist', traits: ['Calculating', 'Patient', 'Manipulative'], tags: ['antagonist', 'strategist'], biography: "Graves maps the fault lines in every hero team he studies, and has spent years mapping the Vanguard's. He doesn't fight his enemies; he redirects them." },
  ],
  manga: [
    { slug: 'yui-kurogane', name: 'Yui Kurogane', role: 'Bound Exorcist', traits: ['Stubborn', 'Compassionate', 'Burdened'], tags: ['protagonist', 'exorcist'], biography: 'Yui inherited her family’s duty to bind wandering spirits to paper talismans — and one particular spirit that refuses to stay bound to hers.' },
    { slug: 'shiro-tsukimori', name: 'Shiro Tsukimori', role: 'Spirit Broker', traits: ['Enigmatic', 'Calm', 'Untrustworthy-seeming'], tags: ['broker', 'deuteragonist'], biography: 'Shiro trades favors between the living and the dead for a living, and always seems to know more about Yui’s bound spirit than he admits.' },
    { slug: 'renji-amakawa', name: 'Renji Amakawa', role: "Yui's Childhood Friend", traits: ['Steady', 'Observant', 'Protective'], tags: ['support', 'childhood-friend'], biography: 'Renji grew up next door to Yui’s family shrine and has spent years pretending not to notice the paper talismans multiplying in her sleeves.' },
    { slug: 'hono-saeki', name: 'Hono Saeki', role: 'Rival Exorcist', traits: ['Proud', 'Skilled', 'Begrudgingly-helpful'], tags: ['rival', 'exorcist'], biography: 'Hono comes from a rival exorcist lineage that considers Yui’s family methods reckless, and keeps showing up to prove it whether Yui asks or not.' },
    { slug: 'tsukiko', name: 'Tsukiko', role: 'The Bound Spirit', traits: ['Mysterious', 'Melancholic', 'Fiercely-loyal'], tags: ['spirit', 'bound-companion'], biography: 'Tsukiko is the spirit bound to Yui’s oldest talisman, and the only one who remembers why the binding was never supposed to be permanent.' },
  ],
}

const EVENTS_BY_CATEGORY = {
  anime: [
    { slug: 'starlit-ronin-convention', title: 'Starlit Ronin Fan Convention', date: '2026-11-14', location: 'The Lantern Pavilion (fictional fan-convention venue)', eventType: 'convention', description: 'An annual fan-run convention celebrating Starlit Ronin, with cosplay meetups, panel discussions, and fan-art showcases. A simulated FandomVerse community event, not a real-world convention.' },
    { slug: 'season-finale-watch-party', title: 'Season Finale Watch Party', date: '2026-08-02', location: 'Online (FandomVerse Watch Party)', eventType: 'watch-party', description: 'Fans gather online to watch the Starlit Ronin season finale together, with a live chat running alongside the stream.' },
    { slug: 'kaida-cosplay-meetup', title: 'Kaida Cosplay Meetup', date: '2026-06-20', location: 'Ashen Reaches Park (fictional meetup spot)', eventType: 'meetup', description: 'A casual, fan-organized meetup for Starlit Ronin cosplayers to share builds and photos.' },
  ],
  gaming: [
    { slug: 'community-championship', title: 'Ashfall Protocol Community Championship', date: '2026-09-05', location: 'Online (FandomVerse Community Event)', eventType: 'other', description: 'A fan-run bracket tournament for Ashfall Protocol, streamed live with community-cast commentary.' },
    { slug: 'squad-up-watch-party', title: 'Ashfall Squad-Up Watch Party', date: '2026-07-18', location: 'Online (FandomVerse Watch Party)', eventType: 'watch-party', description: 'A community watch-along for the Ashfall Protocol Community Championship finals.' },
    { slug: 'local-meetup', title: 'Ashfall Protocol Local Meetup', date: '2026-05-30', location: 'Exclusion Zone Arcade (fictional venue)', eventType: 'meetup', description: 'An in-person meetup for local Ashfall Protocol players to team up and compare loadouts.' },
  ],
  movies: [
    { slug: 'premiere-night', title: 'Midnight Meridian Premiere Night', date: '2026-10-10', location: 'The Meridian Theatre (fictional venue)', eventType: 'other', description: 'A fan-organized premiere-night screening event for the latest Midnight Meridian release.' },
    { slug: 'directors-cut-watch-party', title: "Director's Cut Watch Party", date: '2026-08-22', location: 'Online (FandomVerse Watch Party)', eventType: 'watch-party', description: "A community watch party for the Midnight Meridian director's cut, with a discussion thread running live." },
    { slug: 'noir-fans-meetup', title: 'Noir Fans Meetup', date: '2026-06-12', location: 'Cross Street Cafe (fictional venue)', eventType: 'meetup', description: 'A small in-person meetup for Midnight Meridian fans to trade theories about the Meridian case.' },
  ],
  'tv-shows': [
    { slug: 'con-panel', title: 'Glass Archive Fan Convention Panel', date: '2026-11-01', location: 'The Archive Hall (fictional venue)', eventType: 'convention', description: 'A fan-convention panel dedicated to The Glass Archive, covering fragment theories and set-design breakdowns.' },
    { slug: 'season-3-finale-watch-party', title: 'Season 3 Finale Watch Party', date: '2026-09-27', location: 'Online (FandomVerse Watch Party)', eventType: 'watch-party', description: 'Fans watch the Glass Archive season 3 finale together online, with live reactions.' },
    { slug: 'archive-theory-meetup', title: 'Archive Theory Meetup', date: '2026-07-09', location: 'Fragment Cafe (fictional venue)', eventType: 'meetup', description: 'A recurring in-person meetup where Glass Archive fans compare fragment-translation theories.' },
  ],
  kpop: [
    { slug: 'lunaris-convention', title: 'LUNARIS Fan Convention', date: '2026-12-05', location: 'Lunaris Dome (fictional venue)', eventType: 'convention', description: 'An annual fan convention for LUNARIS, featuring fan-cam screenings and lightstick customization booths.' },
    { slug: 'comeback-watch-party', title: 'Comeback Stage Watch Party', date: '2026-08-15', location: 'Online (FandomVerse Watch Party)', eventType: 'watch-party', description: "Fans stream LUNARIS's comeback stage together online, reacting in real time." },
    { slug: 'lightstick-meetup', title: 'Lightstick Meetup', date: '2026-06-28', location: 'Moonlight Plaza (fictional venue)', eventType: 'meetup', description: 'A local, fan-organized meetup for LUNARIS fans to trade merch and photocards.' },
  ],
  comics: [
    { slug: 'vanguard-con-panel', title: 'Ironclad Vanguard Con Panel', date: '2026-10-24', location: 'Steelframe Convention Hall (fictional venue)', eventType: 'convention', description: 'A fan-convention panel covering the latest Ironclad Vanguard story arc, with guest fan-artists.' },
    { slug: 'issue-release-party', title: 'Issue #1 Release Party', date: '2026-05-16', location: 'Vanguard Comics & Games (fictional venue)', eventType: 'other', description: 'A local comic-shop release-day event for the newest Ironclad Vanguard issue.' },
    { slug: 'readers-meetup', title: 'Vanguard Readers Meetup', date: '2026-07-02', location: 'Online (FandomVerse Community Event)', eventType: 'meetup', description: 'An online meetup and discussion thread for Ironclad Vanguard readers to catch up on the current arc.' },
  ],
  manga: [
    { slug: 'requiem-convention', title: 'Paper Moon Requiem Fan Convention', date: '2026-11-21', location: 'The Bound Hall (fictional venue)', eventType: 'convention', description: 'A fan convention dedicated to Paper Moon Requiem, with volume-signing lookalike events and fan-art alley.' },
    { slug: 'volume-release-watch-party', title: 'Volume Release Watch Party', date: '2026-09-11', location: 'Online (FandomVerse Watch Party)', eventType: 'watch-party', description: 'Fans watch the newest Paper Moon Requiem promotional trailer together online at midnight release.' },
    { slug: 'readers-meetup', title: 'Requiem Readers Meetup', date: '2026-06-05', location: 'Paper Lantern Bookstore (fictional venue)', eventType: 'meetup', description: 'A local reading-circle meetup for Paper Moon Requiem fans.' },
  ],
}

const ARTICLES_BY_CATEGORY = {
  anime: [
    { slug: 'why-the-ashen-reaches-feel-alive', title: 'Starlit Ronin: Why the Ashen Reaches Feel Alive', featured: true, tags: ['overview', 'worldbuilding'], summary: 'A look at how Starlit Ronin builds its world one region at a time, and why fans keep mapping the Ashen Reaches themselves.', body: "Starlit Ronin never explains the Ashen Reaches all at once — it lets Kaida's journey reveal the world region by region, so every new location feels earned rather than dumped on the viewer. That restraint is exactly what fans point to when explaining why the series' fanart and fan-maps communities are so active: there is always a gap worth filling in. Ozren's backstory hints at an empire-wide history the show has barely touched, and the fandom has spent two seasons debating what happened to the sky before the story even began. It's worldbuilding by suggestion, and it works." },
    { slug: 'ozrens-broken-oath', title: "Character Spotlight: Ozren Vale's Broken Oath", featured: false, tags: ['character-spotlight'], summary: "A closer look at Ozren Vale, the mentor whose refusal to follow orders reshaped Kaida's entire journey.", body: "Every mentor figure needs a reason to break from the system that made them, and Ozren Vale's is one of the more quietly devastating ones in the series: he simply refused to burn one more village. That single refusal cost him his rank, his name within the empire, and nearly his life — and it's the reason Kaida has a teacher at all. Fans often cite his training-ground scenes with Kaida as the emotional backbone of the first arc." },
    { slug: 'community-fan-map-project', title: 'The Fan-Map Project Mapping the Ashen Reaches', featured: false, tags: ['community'], summary: 'How the Starlit Ronin fandom built a collaborative map of a world the show never fully draws.', body: "Because Starlit Ronin reveals its geography a region at a time, fans started stitching the pieces together themselves. The community fan-map project now tracks every named location, every route Kaida has travelled, and a long list of places mentioned exactly once. It is collaborative worldbuilding in reverse — and the show's restraint is what makes it possible." },
  ],
  gaming: [
    { slug: 'squad-tactics', title: "Inside Ashfall Protocol's Squad Tactics", featured: true, tags: ['overview', 'gameplay'], summary: "A breakdown of what makes Kestrel Rho's squad-based tactics loop stand out in the Ashfall Protocol community.", body: "Ashfall Protocol's squad system rewards coordination over individual skill, which is part of why its community-run tournaments have become must-watch events. Kestrel Rho's default loadout is built around covering Juno's demolitions work, while Talon holds overwatch from range — a rhythm players have to relearn every match against a good opponent. ARIA-9's tactical callouts add another layer, feeding real-time terrain data that skilled squads use to outmaneuver larger forces." },
    { slug: 'aria-9-nobody-trusts', title: 'ARIA-9: The AI Nobody Trusts (Yet)', featured: false, tags: ['character-spotlight'], summary: "Why ARIA-9's uncertain loyalties are one of Ashfall Protocol's most debated ongoing threads.", body: "ARIA-9 was built by the Protocol to coordinate airstrikes, not to keep secrets — and yet it clearly does. The community's ongoing theory threads track every line of dialogue where ARIA-9 seems to know more than it says, and Kestrel's squad still hasn't decided whether that makes it an asset or a liability." },
    { slug: 'tournament-meta-shift', title: 'How the Community Championship Reshaped the Meta', featured: false, tags: ['community', 'gameplay'], summary: 'The squad compositions that came out of the last Ashfall Protocol community tournament.', body: "Every community championship leaves the Ashfall Protocol meta slightly different, and the last one was no exception. Squads that leaned entirely on long-range overwatch struggled against teams willing to push demolitions early, and the resulting shift toward mixed-range compositions has filtered all the way down to casual play." },
  ],
  movies: [
    { slug: 'noir-built-for-streaming', title: 'Midnight Meridian: A Noir Built for Streaming', featured: true, tags: ['overview'], summary: 'How Midnight Meridian adapts classic noir pacing for a modern, chapter-by-chapter release format.', body: "Midnight Meridian borrows its visual language straight from classic noir — rain-slicked streets, long shadows, a detective who trusts no one — but releases in a chaptered format built for how people actually watch now. Lena Cross's investigation unfolds slowly enough that fan theory threads have time to build between chapters, and Julian Moreau's screen time is engineered specifically to keep his loyalties unresolved as long as possible." },
    { slug: 'who-is-julian-moreau', title: 'Who Is Julian Moreau, Really?', featured: false, tags: ['character-spotlight'], summary: "The community's ongoing debate over whether Julian Moreau is an ally, a suspect, or both.", body: "No character in Midnight Meridian generates more fan debate than Julian Moreau. He has helped Cross's investigation twice — and obstructed it at least as often. The prevailing fan theory is that Moreau isn't hiding one secret but managing several at once, each one protecting a different person in his orbit." },
    { slug: 'meridian-visual-language', title: 'The Visual Language of Midnight Meridian', featured: false, tags: ['craft'], summary: 'Rain, neon, and negative space: how the series signals who is lying.', body: "Midnight Meridian is remarkably consistent about its visual grammar. Characters who are withholding something are framed with more negative space around them; scenes where Cross is closest to the truth are the driest, with the rain conspicuously absent. Once fans noticed the pattern, rewatching became a completely different exercise." },
  ],
  'tv-shows': [
    { slug: 'what-the-fragments-are-hiding', title: 'The Glass Archive: What the Fragments Are Hiding', featured: true, tags: ['overview'], summary: "An overview of the Glass Archive's central mystery and why the fandom's fragment-translation theories keep evolving.", body: "The Glass Archive is built around a simple premise — recovered fragments of an unexplained language — and a slow-burn mystery about what happens once enough of them are translated. Professor Lund's partial translations give the fandom just enough to theorize with, and Curator Finch's evasiveness about the Archive's private collection has become one of the show's most dissected running threads." },
    { slug: 'nova-reyes-leak', title: 'Nova Reyes and the Leak That Changed Everything', featured: false, tags: ['character-spotlight'], summary: 'How a minor intern character became the pivot point of season three.', body: "Nova Reyes started the series as background dressing — an intern filing fragment reports. By the end of season three, she's the reason audiences know what the Archive's board actually knew, and her arc from nervous newcomer to whistleblower is widely considered the season's strongest thread." },
    { slug: 'fragment-translation-primer', title: 'A Beginner’s Primer to Fragment Translation', featured: false, tags: ['explainer'], summary: 'What Professor Lund has actually translated so far, and what remains guesswork.', body: "Three seasons in, the Glass Archive has confirmed far less about the fragment script than most viewers assume. Lund's on-screen translations cover a small set of recurring symbols; everything beyond that is fan extrapolation. This primer separates what the show has actually established from what the fandom has filled in." },
  ],
  kpop: [
    { slug: 'five-voices-one-stage', title: 'LUNARIS: Five Voices, One Stage', featured: true, tags: ['overview'], summary: 'An introduction to LUNARIS and how each member’s role shapes the group’s sound.', body: "LUNARIS built its identity on contrast: Hana's steady lead vocals grounding Yuri's sharper rap verses, Soojin's precise choreography giving Minji and Dahye room to bring raw stage energy. That balance is part of why the group's comeback stages consistently trend — every member gets a clear moment, and the fandom knows exactly who to watch for what." },
    { slug: 'yuris-lyrics-decoded', title: "Yuri's Lyrics, Decoded", featured: false, tags: ['character-spotlight'], summary: "A look at the recurring references fans have tracked across Yuri's verses.", body: "Yuri writes her own verses for nearly every LUNARIS release, and the fandom has built an entire tracking project around the recurring imagery in her lyrics — moons, tides, and unfinished letters that seem to connect across songs that are otherwise unrelated." },
    { slug: 'lunaris-stage-evolution', title: 'LUNARIS Stages, Era by Era', featured: false, tags: ['performance'], summary: 'How the group’s live performances have changed across three comeback eras.', body: "LUNARIS's early stages leaned heavily on synchronized formation work, with Soojin's choreography built around the full group moving as one unit. Later eras opened up, giving each member isolated moments — a shift fans tie directly to the group's growing confidence as live vocalists." },
  ],
  comics: [
    { slug: 'armor-grief-and-the-next-generation', title: 'Ironclad Vanguard: Armor, Grief, and the Next Generation of Heroes', featured: true, tags: ['overview'], summary: "How Ironclad Vanguard's found-family structure sets it apart from typical superhero-team books.", body: "Ironclad Vanguard opens with Aegis building armor to prevent a tragedy from repeating, and every teammate who joins after him is dealing with a version of the same instinct. Voltaire, Wraithwing, and Terra Prime each get an arc rooted in what their powers cost them personally, not just what the team needs from them — which is part of why readers describe the book as a found-family story that happens to have a supervillain." },
    { slug: 'the-cartographers-endgame', title: "The Cartographer's Endgame", featured: false, tags: ['character-spotlight'], summary: "Why Ironclad Vanguard's recurring antagonist doesn't fight like a typical supervillain.", body: 'The Cartographer never throws a punch. Instead, Elliot Graves studies the Vanguard’s fault lines — old grudges, unresolved guilt, unspoken tension — and redirects the team into fighting itself. Readers have started calling his arcs "no-hit issues" because the real damage never comes from him directly.' },
    { slug: 'vanguard-armor-design', title: 'Reading the Vanguard’s Armor Design', featured: false, tags: ['craft'], summary: 'Why every iteration of the Aegis exo-armor tells you where Marcus is emotionally.', body: "Ironclad Vanguard has quietly used Aegis's armor as an emotional barometer for its entire run. The bulkier and more sealed the design in a given arc, the further Marcus has retreated from the team; the lighter, more open builds show up precisely when he is willing to rely on someone else." },
  ],
  manga: [
    { slug: 'binding-grief-and-what-stays', title: 'Paper Moon Requiem: Binding, Grief, and What Stays', featured: true, tags: ['overview'], summary: 'An introduction to the central binding mythology at the heart of Paper Moon Requiem.', body: "Paper Moon Requiem's premise — spirits bound to paper talismans — could easily stay a simple monster-of-the-volume structure, but the series uses it to ask what a binding actually costs both sides. Yui's bond with Tsukiko is the throughline: a binding that was never supposed to last this long, between two characters who have both stopped wanting it to end." },
    { slug: 'tsukiko-the-spirit-who-remembers', title: 'Tsukiko: The Spirit Who Remembers', featured: false, tags: ['character-spotlight'], summary: 'A closer look at Tsukiko, the bound spirit whose memory may be the key to the whole series.', body: 'Tsukiko is the only character in Paper Moon Requiem who remembers why her binding to Yui’s talisman was never meant to be permanent — and she still hasn’t told Yui. That withheld knowledge is the quiet engine behind most of the series’ emotional turns.' },
    { slug: 'requiem-paper-motif', title: 'Paper as Motif in Paper Moon Requiem', featured: false, tags: ['craft'], summary: 'Talismans, letters, and torn pages: tracking the series’ most persistent visual idea.', body: "Paper runs through every arc of Paper Moon Requiem — binding talismans, unsent letters, pages torn from the family record. The series uses it as shorthand for anything fragile that someone is trying to make permanent, which is, in the end, exactly what Yui's binding to Tsukiko is." },
  ],
}

const GALLERY_IMAGE_CAPTIONS = [
  'Concept mood art — palette study',
  'Fan-favorite scene, reimagined as abstract color study',
  'Title-card inspired composition',
  'Community fan-art jam prompt piece',
]

const MEDIA_BY_CATEGORY = {
  anime: { teaserDate: '2026-04-01', fullDate: '2026-07-01' },
  gaming: { teaserDate: '2026-03-10', fullDate: '2026-06-15' },
  movies: { teaserDate: '2026-05-05', fullDate: '2026-08-20' },
  'tv-shows': { teaserDate: '2026-02-18', fullDate: '2026-06-01' },
  kpop: { teaserDate: '2026-01-20', fullDate: '2026-08-01' },
  comics: { teaserDate: '2026-03-01', fullDate: '2026-05-01' },
  manga: { teaserDate: '2026-04-15', fullDate: '2026-09-01' },
}

const RELEASES_BY_CATEGORY = {
  anime: [
    { slug: 'season-2', title: 'Starlit Ronin: Season 2', type: 'show', status: 'upcoming', date: '2026-10-01', description: "The next chapter of Kaida's journey across the Ashen Reaches." },
    { slug: 'season-1-collection', title: 'Starlit Ronin: Season 1 Complete Collection', type: 'other', status: 'recent', date: '2026-03-15', description: 'A complete-season home release with bonus storyboard art.' },
    { slug: 'ova-special', title: 'Starlit Ronin: Ashfall OVA Special', type: 'other', status: 'upcoming', date: '2027-01-20', description: 'A side-story special following Suzu before she joined the group.' },
  ],
  gaming: [
    { slug: 'protocol-2', title: 'Ashfall Protocol II', type: 'game', status: 'upcoming', date: '2026-11-12', description: 'The sequel expanding Kestrel’s squad-tactics system with new terrain mechanics.' },
    { slug: 'directors-cut', title: "Ashfall Protocol: Director's Cut", type: 'game', status: 'recent', date: '2026-02-01', description: 'An expanded edition of the original with new missions and difficulty options.' },
    { slug: 'mobile', title: 'Ashfall Protocol Mobile', type: 'game', status: 'upcoming', date: '2027-02-01', description: 'A companion mobile squad-tactics spin-off.' },
  ],
  movies: [
    { slug: 'meridian-part-2', title: 'Midnight Meridian: Part II', type: 'movie', status: 'upcoming', date: '2026-12-04', description: "The continuation of Lena Cross's investigation into the Meridian case." },
    { slug: 'meridian-original', title: 'Midnight Meridian', type: 'movie', status: 'recent', date: '2026-01-16', description: 'The original film that introduced the Meridian case.' },
    { slug: 'meridian-extended-cut', title: 'Midnight Meridian: Extended Cut', type: 'movie', status: 'upcoming', date: '2026-11-01', description: 'An extended home release with restored scenes.' },
  ],
  'tv-shows': [
    { slug: 'season-4', title: 'The Glass Archive: Season 4', type: 'show', status: 'upcoming', date: '2026-10-15', description: 'The next season continuing the fragment-translation mystery.' },
    { slug: 'season-3', title: 'The Glass Archive: Season 3', type: 'show', status: 'recent', date: '2026-04-20', description: 'The season introducing Nova Reyes and the board-wide leak.' },
    { slug: 'origins-special', title: 'The Glass Archive: Origins', type: 'other', status: 'upcoming', date: '2027-01-05', description: "A prequel special covering the Archive's founding." },
  ],
  kpop: [
    { slug: 'afterglow', title: 'LUNARIS 3rd Mini Album "Afterglow"', type: 'album', status: 'upcoming', date: '2026-09-18', description: "LUNARIS's next comeback release." },
    { slug: 'nocturne', title: 'LUNARIS 2nd Album "Nocturne"', type: 'album', status: 'recent', date: '2026-03-02', description: "The group's most recent full-length release." },
    { slug: 'winter-single', title: 'LUNARIS Winter Single', type: 'album', status: 'upcoming', date: '2026-12-20', description: 'A seasonal single release.' },
  ],
  comics: [
    { slug: 'issue-13', title: 'Ironclad Vanguard #13', type: 'comic-issue', status: 'upcoming', date: '2026-10-07', description: "The next issue continuing the Cartographer's current arc." },
    { slug: 'issue-12', title: 'Ironclad Vanguard #12', type: 'comic-issue', status: 'recent', date: '2026-09-02', description: 'The most recent issue in the ongoing story.' },
    { slug: 'annual', title: 'Ironclad Vanguard Annual', type: 'comic-issue', status: 'upcoming', date: '2026-12-01', description: 'An extra-length annual issue with a Terra Prime solo story.' },
  ],
  manga: [
    { slug: 'volume-6', title: 'Paper Moon Requiem Vol. 6', type: 'manga-volume', status: 'upcoming', date: '2026-11-10', description: "The next volume continuing Yui and Tsukiko's story." },
    { slug: 'volume-5', title: 'Paper Moon Requiem Vol. 5', type: 'manga-volume', status: 'recent', date: '2026-06-18', description: 'The most recently released volume.' },
    { slug: 'volume-6-limited', title: 'Paper Moon Requiem Vol. 6 Limited Edition', type: 'manga-volume', status: 'upcoming', date: '2026-11-10', description: 'A limited edition of Volume 6 with a bonus art booklet.' },
  ],
}

const MERCH_BY_CATEGORY = {
  anime: [
    { slug: 'blade-bearer-tee', name: 'Starlit Ronin Blade-Bearer Tee', glyph: 'shirt', min: 22, max: 28, status: 'available', description: 'A graphic tee featuring Kaida’s celestial blade motif.' },
    { slug: 'kaida-figure', name: 'Kaida Nova Collectible Figure', glyph: 'pin', min: 35, max: 45, status: 'coming-soon', description: 'A collectible figure of Kaida Nova in her signature pose.' },
  ],
  gaming: [
    { slug: 'squad-hoodie', name: 'Ashfall Protocol Squad Hoodie', glyph: 'shirt', min: 45, max: 55, status: 'available', description: "A hoodie featuring Kestrel's squad insignia." },
    { slug: 'aria-pin-set', name: 'ARIA-9 Enamel Pin Set', glyph: 'pin', min: 15, max: 20, status: 'available', description: 'A set of enamel pins inspired by ARIA-9’s interface icons.' },
  ],
  movies: [
    { slug: 'noir-poster', name: 'Midnight Meridian Noir Poster Print', glyph: 'poster', min: 18, max: 24, status: 'available', description: 'A noir-styled poster print inspired by the Meridian skyline.' },
    { slug: 'trench-coat', name: 'Meridian Trench Coat Replica', glyph: 'shirt', min: 90, max: 120, status: 'coming-soon', description: "A replica of Lena Cross's signature coat." },
  ],
  'tv-shows': [
    { slug: 'fragment-replica', name: 'Glass Archive Fragment Replica', glyph: 'disc', min: 25, max: 32, status: 'available', description: 'A replica prop of a recovered Archive fragment.' },
    { slug: 'researcher-tee', name: 'Archive Researcher Tee', glyph: 'shirt', min: 22, max: 28, status: 'available', description: "A tee styled after the Archive's field-researcher uniform." },
  ],
  kpop: [
    { slug: 'lightstick', name: 'LUNARIS Official Lightstick', glyph: 'pin', min: 30, max: 38, status: 'available', description: "The official LUNARIS fan lightstick." },
    { slug: 'afterglow-hoodie', name: 'LUNARIS Afterglow Hoodie', glyph: 'shirt', min: 48, max: 58, status: 'coming-soon', description: 'A hoodie themed around the Afterglow comeback.' },
  ],
  comics: [
    { slug: 'aegis-figure', name: 'Ironclad Vanguard: Aegis Figure', glyph: 'pin', min: 32, max: 40, status: 'available', description: 'A collectible figure of Aegis in his exo-armor.' },
    { slug: 'team-tee', name: 'Ironclad Vanguard Team Tee', glyph: 'shirt', min: 22, max: 26, status: 'available', description: 'A tee featuring the full Vanguard team roster art.' },
  ],
  manga: [
    { slug: 'talisman-bookmarks', name: 'Paper Moon Requiem Talisman Bookmark Set', glyph: 'disc', min: 12, max: 16, status: 'available', description: "A set of bookmarks styled after Yui's paper talismans." },
    { slug: 'ink-wash-tee', name: 'Paper Moon Requiem Ink-Wash Tee', glyph: 'shirt', min: 24, max: 30, status: 'coming-soon', description: 'A tee featuring ink-wash style art from the series.' },
  ],
}

// ---------------------------------------------------------------------
// Build datasets
// ---------------------------------------------------------------------

const categories = []
const characters = []
const events = []
const articles = []
const galleries = []
const media = []
const releases = []
const merchandise = []

for (const cat of CATEGORIES) {
  const accent = ACCENT_HEX[cat.id]

  const heroSrc = writeAsset(
    `category/${cat.id}-hero.svg`,
    bannerSvg({ seed: `hero-${cat.id}`, accent, label: cat.franchise, width: 1200, height: 500 }),
  )
  categories.push({
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    tagline: cat.tagline,
    accentColor: `--color-accent-${cat.id.replace('-', '')}`,
    heroImage: { src: heroSrc, alt: `${cat.name} category hero banner featuring the ${cat.franchise} franchise`, credit: PROVENANCE },
    description: cat.description,
    visualMotif: cat.visualMotif,
    franchise: cat.franchise,
  })

  // Characters
  const catCharacterIds = []
  for (const c of CHARACTERS_BY_CATEGORY[cat.id]) {
    const id = `character-${cat.id}-${c.slug}`
    catCharacterIds.push(id)
    const src = writeAsset(`character/${id}.svg`, identiconSvg({ seed: id, accent, label: c.name }))
    characters.push({
      id,
      categoryId: cat.id,
      name: c.name,
      image: { src, alt: `Procedural portrait artwork representing ${c.name}`, credit: PROVENANCE },
      series: cat.franchise,
      role: c.role,
      biography: c.biography,
      traits: c.traits,
      tags: c.tags,
      relatedIds: [],
    })
  }

  // Events
  const catEventIds = []
  for (const e of EVENTS_BY_CATEGORY[cat.id]) {
    const id = `event-${cat.id}-${e.slug}`
    catEventIds.push(id)
    const src = writeAsset(`event/${id}.svg`, bannerSvg({ seed: id, accent, label: e.eventType.replace('-', ' ') }))
    events.push({
      id,
      categoryId: cat.id,
      title: e.title,
      date: e.date,
      location: e.location,
      description: e.description,
      eventType: e.eventType,
      status: 'upcoming',
      image: { src, alt: `Promotional artwork for the ${e.title} fan event`, credit: PROVENANCE },
      relatedIds: catCharacterIds.slice(0, 1),
      fictional: true,
    })
  }

  // Articles
  const catArticleIds = []
  for (const a of ARTICLES_BY_CATEGORY[cat.id]) {
    const id = `article-${cat.id}-${a.slug}`
    catArticleIds.push(id)
    const src = writeAsset(`article/${id}.svg`, bannerSvg({ seed: id, accent, label: cat.franchise }))
    articles.push({
      id,
      categoryId: cat.id,
      title: a.title,
      thumbnail: { src, alt: `Editorial thumbnail artwork for "${a.title}"`, credit: PROVENANCE },
      summary: a.summary,
      body: a.body,
      tags: [...a.tags, cat.id],
      publishedDate: a.body ? MEDIA_BY_CATEGORY[cat.id].fullDate : '2026-01-01',
      featured: a.featured,
      relatedIds: [...catCharacterIds.slice(0, 2), ...catEventIds.slice(0, 1)],
    })
  }

  // Gallery
  const galleryId = `gallery-${cat.id}-${cat.franchise.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
  const images = GALLERY_IMAGE_CAPTIONS.map((caption, i) => {
    const imgId = `${galleryId}-img-${i + 1}`
    const src = writeAsset(
      `gallery/${imgId}.svg`,
      // glyphText varies per piece so four gallery tiles in the same
      // category don't read as four copies of the same image (D-040).
      identiconSvg({ seed: imgId, accent, label: `${cat.franchise} ${i + 1}`, glyphText: `${initials(cat.franchise)}·${i + 1}` }),
    )
    return {
      id: imgId,
      title: `${cat.franchise} — Piece ${i + 1}`,
      caption,
      src,
      alt: `Abstract procedural artwork in ${cat.name}'s signature color palette, generated placeholder image ${i + 1} of ${GALLERY_IMAGE_CAPTIONS.length}`,
      credit: PROVENANCE,
    }
  })
  galleries.push({ id: galleryId, categoryId: cat.id, title: `${cat.franchise} Gallery`, images })

  // Media / trailers
  const mediaDates = MEDIA_BY_CATEGORY[cat.id]
  const trailerDefs = [
    { slug: 'teaser-trailer', title: `${cat.franchise}: Teaser Trailer`, date: mediaDates.teaserDate, duration: 45 },
    { slug: 'official-trailer', title: `${cat.franchise}: Official Trailer`, date: mediaDates.fullDate, duration: 120 },
  ]
  for (const t of trailerDefs) {
    const id = `media-${cat.id}-${t.slug}`
    const src = writeAsset(`media/${id}.svg`, iconTileSvg({ seed: cat.franchise, accent, glyph: 'poster', label: t.title }))
    media.push({
      id,
      categoryId: cat.id,
      title: t.title,
      mediaType: 'trailer',
      format: 'video',
      embedUrl: '',
      thumbnail: { src, alt: `Thumbnail artwork for the ${t.title}`, credit: PROVENANCE },
      description: `A trailer for ${cat.franchise}, an original fictional series created for FandomVerse. Video playback is not available — this is a demonstrative listing, not real footage.`,
      releaseStatus: 'upcoming',
      publishedDate: t.date,
      tags: ['trailer', cat.id],
      durationSeconds: t.duration,
      fictional: true,
    })
  }

  // Releases
  for (const r of RELEASES_BY_CATEGORY[cat.id]) {
    const id = `release-${cat.id}-${r.slug}`
    const src = writeAsset(`release/${id}.svg`, bannerSvg({ seed: id, accent, label: r.type.replace('-', ' ') }))
    releases.push({
      id,
      categoryId: cat.id,
      title: r.title,
      releaseDate: r.date,
      type: r.type,
      description: r.description,
      coverImage: { src, alt: `Cover artwork for ${r.title}`, credit: PROVENANCE },
      status: r.status,
      fictional: true,
    })
  }

  // Merchandise
  for (const m of MERCH_BY_CATEGORY[cat.id]) {
    const id = `merch-${cat.id}-${m.slug}`
    const src = writeAsset(`merch/${id}.svg`, iconTileSvg({ seed: cat.franchise, accent, glyph: m.glyph, label: m.name }))
    merchandise.push({
      id,
      categoryId: cat.id,
      name: m.name,
      image: { src, alt: `Product artwork for ${m.name}`, credit: PROVENANCE },
      priceRangeMin: m.min,
      priceRangeMax: m.max,
      currency: 'USD',
      description: m.description,
      tags: [cat.id, m.glyph],
      status: m.status,
    })
  }
}

// Backfill character.relatedIds with their category's featured article + first event
for (const cat of CATEGORIES) {
  const catCharacters = characters.filter((c) => c.categoryId === cat.id)
  const featuredArticle = articles.find((a) => a.categoryId === cat.id && a.featured)
  const firstEvent = events.find((e) => e.categoryId === cat.id)
  for (const c of catCharacters) {
    c.relatedIds = [featuredArticle?.id, firstEvent?.id].filter(Boolean)
  }
}

// ---------------------------------------------------------------------
// Write data files
// ---------------------------------------------------------------------

function writeJson(name, value) {
  writeFileSync(join(DATA_DIR, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

writeJson('categories.json', categories)
writeJson('characters.json', characters)
writeJson('events.json', events)
writeJson('articles.json', articles)
writeJson('galleries.json', galleries)
writeJson('media.json', media)
writeJson('releases.json', releases)
writeJson('merchandise.json', merchandise)

console.log(`categories: ${categories.length}`)
console.log(`characters: ${characters.length}`)
console.log(`events: ${events.length}`)
console.log(`articles: ${articles.length}`)
console.log(`galleries: ${galleries.length} (${galleries.reduce((n, g) => n + g.images.length, 0)} images)`)
console.log(`media (trailers): ${media.length}`)
console.log(`releases: ${releases.length}`)
console.log(`merchandise: ${merchandise.length}`)
console.log(`assets written: ${writtenAssets.length}`)
