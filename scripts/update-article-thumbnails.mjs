import { readFileSync, writeFileSync } from 'node:fs'

const PATH = 'src/data/articles.json'
const BASE = '/assets/generated/content'

// categoryId -> the slug the runtime filenames use (matches the merchandise
// integration's precedent: tvshows/kpop, no hyphen).
const SLUG = {
  anime: 'anime',
  gaming: 'gaming',
  movies: 'movies',
  'tv-shows': 'tvshows',
  kpop: 'kpop',
  comics: 'comics',
  manga: 'manga',
}

const CREDIT =
  'Original FandomVerse article artwork, provided by the project team for this catalogue -- depicts fictional in-house content only; no external source, no real-world brand, celebrity likeness, or trademark.'

const articles = JSON.parse(readFileSync(PATH, 'utf8'))

// Fixed, verified per-category order: [featured, non-featured #1, non-featured #2].
const byCategory = {}
for (const article of articles) {
  ;(byCategory[article.categoryId] ??= []).push(article)
}

let changed = 0
for (const [categoryId, slug] of Object.entries(SLUG)) {
  const items = byCategory[categoryId]
  const featured = items.find((a) => a.featured)
  const rest = items.filter((a) => a !== featured)

  const assign = (article, filename, label) => {
    article.thumbnail = {
      src: `${BASE}/${slug}-${filename}.png`,
      alt: `Cover art for ${article.title}`,
      credit: CREDIT,
    }
    changed++
    console.log(`${article.id} -> ${slug}-${filename}.png (${label})`)
  }

  assign(featured, 'start-here', 'Start here')
  assign(rest[0], 'article-01', 'Article 1')
  assign(rest[1], 'article-02', 'Article 2')
}

console.log(`\nTotal thumbnails updated: ${changed}`)
writeFileSync(PATH, JSON.stringify(articles, null, 2) + '\n')
console.log('written to', PATH)
