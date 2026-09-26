import { readFileSync, writeFileSync } from 'node:fs'

// Category id -> slug used in the runtime asset path (matches the
// tvshows/kpop no-hyphen convention already established for merch/content).
const SLUG = {
  anime: 'anime',
  gaming: 'gaming',
  movies: 'movies',
  'tv-shows': 'tvshows',
  kpop: 'kpop',
  comics: 'comics',
  manga: 'manga',
}

const TRAILER_PHOTOGRAPHER = {
  anime: 'Cash Macanaya',
  gaming: 'Florian Olivo',
  movies: 'Jake Hills',
  'tv-shows': 'Caroline Roose',
  kpop: 'ActionVance',
  comics: 'Usynor',
  manga: 'Kamil Switalski',
}

const EVENT_PHOTOGRAPHER = {
  anime: 'Nicholas Green',
  gaming: 'Stem List',
  movies: 'Claudio Schwarz',
  'tv-shows': 'Vitaly Gariev',
  kpop: 'Nathan Fertig',
  comics: 'Jin-Woo Lee',
  manga: 'Natalie Sierra',
}

function trailerCredit(categoryId, franchise) {
  const photographer = TRAILER_PHOTOGRAPHER[categoryId]
  return `Stock photo by ${photographer} on Unsplash (Unsplash License, free to use) — a generic category-atmosphere image selected to illustrate this listing; not actual trailer footage or real production photography for ${franchise}.`
}

function eventCredit(categoryId, franchise) {
  const photographer = EVENT_PHOTOGRAPHER[categoryId]
  return `Stock photo by ${photographer} on Unsplash (Unsplash License, free to use) — a generic gathering-atmosphere image selected to illustrate this simulated fan event; not real photography of this fictional ${franchise} event.`
}

// --- media.json (trailers) ---
const mediaPath = 'src/data/media.json'
const media = JSON.parse(readFileSync(mediaPath, 'utf8'))
let trailerCount = 0
for (const item of media) {
  if (item.mediaType !== 'trailer') continue
  const slug = SLUG[item.categoryId]
  item.thumbnail = {
    src: `/assets/generated/media-photo/${slug}.jpg`,
    alt: `${item.title} — category atmosphere photo`,
    credit: trailerCredit(item.categoryId, item.title.split(':')[0]),
  }
  trailerCount++
  console.log(`${item.id} -> media-photo/${slug}.jpg`)
}
writeFileSync(mediaPath, JSON.stringify(media, null, 2) + '\n')
console.log(`Trailers updated: ${trailerCount}`)

// --- events.json ---
const eventsPath = 'src/data/events.json'
const events = JSON.parse(readFileSync(eventsPath, 'utf8'))
let eventCount = 0
for (const item of events) {
  const slug = SLUG[item.categoryId]
  item.image = {
    src: `/assets/generated/event-photo/${slug}.jpg`,
    alt: `${item.title} — category gathering atmosphere photo`,
    credit: eventCredit(item.categoryId, item.title),
  }
  eventCount++
  console.log(`${item.id} -> event-photo/${slug}.jpg`)
}
writeFileSync(eventsPath, JSON.stringify(events, null, 2) + '\n')
console.log(`Events updated: ${eventCount}`)
