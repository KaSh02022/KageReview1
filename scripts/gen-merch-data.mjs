import { writeFileSync } from 'node:fs'

const BASE = '/assets/generated/merch'

const CATEGORIES = [
  { id: 'anime', franchise: 'Starlit Ronin', slug: 'anime' },
  { id: 'gaming', franchise: 'Ashfall Protocol', slug: 'gaming' },
  { id: 'movies', franchise: 'Midnight Meridian', slug: 'movies' },
  { id: 'tv-shows', franchise: 'The Glass Archive', slug: 'tvshows' },
  { id: 'kpop', franchise: 'LUNARIS', slug: 'kpop' },
  { id: 'comics', franchise: 'Ironclad Vanguard', slug: 'comics' },
  { id: 'manga', franchise: 'Paper Moon Requiem', slug: 'manga' },
]

// [productTypeTag, title, priceMin, priceMax, description]
const PRODUCTS = {
  anime: [
    ['hoodie', 'Collector Hoodie', 45, 55, 'A hoodie carrying Starlit Ronin colours and emblem.'],
    ['figure', 'Acrylic Collector Stand', 15, 22, 'A display-stand piece featuring Starlit Ronin artwork.'],
    ['poster', 'Collector Art Poster', 15, 25, 'A print of key Starlit Ronin artwork for wall display.'],
    ['pin', 'Enamel Pin Set', 12, 20, 'A set of enamel pins themed around Starlit Ronin.'],
    ['bag', 'Collector Tote Bag', 18, 25, 'A canvas tote printed with Starlit Ronin artwork.'],
  ],
  gaming: [
    ['hoodie', 'Gaming Collector Hoodie', 45, 55, 'A hoodie featuring the Ashfall Protocol squad insignia.'],
    ['accessory', 'Extended Gaming Mouse Pad', 18, 28, 'A desk-length mouse pad themed around Ashfall Protocol.'],
    ['figure', 'Collector Figure', 35, 45, 'A collectible figure of an Ashfall Protocol squad member.'],
    ['accessory', 'Keycap & Keychain Set', 12, 20, 'A matching keycap and keychain set for Ashfall Protocol fans.'],
    ['mug', 'Gaming Collector Mug', 12, 18, 'A mug carrying Ashfall Protocol artwork.'],
  ],
  movies: [
    ['collectible', 'Collector Clapperboard', 25, 35, 'A display clapperboard themed around Midnight Meridian.'],
    ['notebook', 'Filmmaker Collector Notebook', 10, 16, 'A notebook styled after the Midnight Meridian production.'],
    ['mug', 'Collector Mug', 12, 18, 'A mug featuring Midnight Meridian artwork.'],
    ['hoodie', 'Movie Collector Hoodie', 45, 55, 'A hoodie carrying the Midnight Meridian title treatment.'],
    ['cap', 'Director Collector Cap', 20, 28, 'A cap styled after the Midnight Meridian production crew.'],
  ],
  'tv-shows': [
    ['hoodie', 'Archive Collector Hoodie', 45, 55, 'A hoodie carrying The Glass Archive emblem.'],
    ['bag', 'Archive Collector Tote', 18, 25, 'A tote bag printed with The Glass Archive artwork.'],
    ['poster', 'Collector Art Poster', 15, 25, 'A print of key art from The Glass Archive.'],
    ['mug', 'Archive Collector Mug', 12, 18, 'A mug featuring The Glass Archive artwork.'],
    ['collectible', 'Collector Box', 25, 35, 'A keepsake box themed around The Glass Archive.'],
  ],
  kpop: [
    ['collectible', 'Collector Photocard Album', 15, 25, 'A photocard album for collecting LUNARIS member cards.'],
    ['hoodie', 'Collector Hoodie', 45, 55, 'A hoodie carrying the LUNARIS group emblem.'],
    ['bag', 'Collector Tote', 18, 25, 'A tote bag printed with LUNARIS artwork.'],
    ['poster', 'Concert Art Poster', 15, 25, 'A concert-style art poster for LUNARIS.'],
    ['accessory', 'Bracelet & Keychain Set', 10, 18, 'A matching bracelet and keychain set for LUNARIS fans.'],
  ],
  comics: [
    ['notebook', 'Collector Notebook', 10, 16, 'A notebook featuring Ironclad Vanguard artwork.'],
    ['hoodie', 'Collector Hoodie', 45, 55, 'A hoodie carrying the Ironclad Vanguard team insignia.'],
    ['pin', 'Enamel Pin Set', 12, 20, 'A set of enamel pins themed around Ironclad Vanguard.'],
    ['cap', 'Collector Cap', 20, 28, 'A cap featuring the Ironclad Vanguard emblem.'],
    ['collectible', 'Collector Box', 25, 35, 'A keepsake box themed around Ironclad Vanguard.'],
  ],
  manga: [
    ['book', 'Collector Artbook', 30, 45, 'An artbook collecting illustrations from Paper Moon Requiem.'],
    ['hoodie', 'Collector Hoodie', 45, 55, 'A hoodie carrying Paper Moon Requiem artwork.'],
    ['bag', 'Collector Tote', 18, 25, 'A tote bag printed with Paper Moon Requiem artwork.'],
    ['poster', 'Collector Art Poster', 15, 25, 'A print of key art from Paper Moon Requiem.'],
    ['figure', 'Acrylic Collector Stand', 15, 22, 'A display-stand piece featuring Paper Moon Requiem artwork.'],
  ],
}

const HERO = {
  anime: ['book', 'Starlit Ronin Featured Artbook', 35, 50, 'A featured artbook collecting key Starlit Ronin illustrations.'],
  gaming: ['accessory', 'Ashfall Protocol Tactical Desk Mat', 25, 35, 'A featured, full-desk mat themed around Ashfall Protocol.'],
  movies: ['poster', 'Midnight Meridian Featured Poster', 20, 30, 'A featured art poster for the Midnight Meridian series.'],
  'tv-shows': ['notebook', 'Glass Archive Featured Notebook', 15, 22, 'A featured notebook styled after The Glass Archive.'],
  kpop: ['accessory', 'LUNARIS Official Lightstick', 30, 45, 'The official fan lightstick for the LUNARIS group.'],
  comics: ['collectible', 'Ironclad Vanguard Featured Art Print', 20, 30, 'A featured art print of the Ironclad Vanguard team.'],
  manga: ['collectible', 'Paper Moon Requiem Collector Scroll', 25, 35, 'A featured hanging scroll print for Paper Moon Requiem.'],
}

const CREDIT =
  'Original FandomVerse merchandise artwork, provided by the project team for this catalogue -- depicts fictional in-house products only; no external source, no real-world brand, celebrity likeness, or trademark.'

const items = []

for (const cat of CATEGORIES) {
  const [, heroName, heroMin, heroMax, heroDesc] = HERO[cat.id]
  items.push({
    id: `${cat.slug}-merch-hero`,
    categoryId: cat.id,
    name: heroName,
    image: {
      src: `${BASE}/${cat.slug}-merch-hero.png`,
      alt: `Featured merchandise artwork for ${heroName}`,
      credit: CREDIT,
    },
    priceRangeMin: heroMin,
    priceRangeMax: heroMax,
    currency: 'USD',
    description: heroDesc,
    tags: [cat.id, 'featured'],
    status: 'available',
  })

  PRODUCTS[cat.id].forEach(([tag, title, min, max, desc], i) => {
    const n = String(i + 1).padStart(2, '0')
    items.push({
      id: `${cat.slug}-merch-${n}`,
      categoryId: cat.id,
      name: title,
      image: {
        src: `${BASE}/${cat.slug}-merch-${n}.png`,
        alt: `Product artwork for ${title}`,
        credit: CREDIT,
      },
      priceRangeMin: min,
      priceRangeMax: max,
      currency: 'USD',
      description: desc,
      tags: [cat.id, tag],
      status: 'available',
    })
  })
}

console.log('total items:', items.length)
const ids = items.map((i) => i.id)
console.log('unique ids:', new Set(ids).size)

writeFileSync('src/data/merchandise.json', JSON.stringify(items, null, 2) + '\n')
console.log('written to src/data/merchandise.json')
