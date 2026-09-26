import { copyFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

const SRC_ROOT = 'FandomVerse_Content_Assets'
const DEST_ROOT = 'public/assets/generated/content'

// [sourceRelativePath, destFilename]
// Destination names follow the same slug convention already established by
// the merchandise integration (tvshows/kpop, no hyphen, matching the id the
// merch assets already used) -- one naming convention for the whole
// public/assets/generated tree, not a second one invented here.
const MAP = [
  ['01_ANIME/01-anime-start-here.png', 'anime-start-here.png'],
  ['01_ANIME/01-anime-article-01.png', 'anime-article-01.png'],
  ['01_ANIME/01-anime-article-02.webp.png', 'anime-article-02.png'],

  ['02_GAMING/02-gaming-start-here.png', 'gaming-start-here.png'],
  ['02_GAMING/02-gaming-article-01.png', 'gaming-article-01.png'],
  ['02_GAMING/02-gaming-article-02.png', 'gaming-article-02.png'],

  ['03_MOVIES/03-movies-start-here.png', 'movies-start-here.png'],
  ['03_MOVIES/03-movies-article-01.png', 'movies-article-01.png'],
  ['03_MOVIES/03-movies-article-02.png', 'movies-article-02.png'],

  ['04_TV_SHOWS/04-tvshows-start-here.png', 'tvshows-start-here.png'],
  ['04_TV_SHOWS/04-tvshows-article-01.png', 'tvshows-article-01.png'],
  ['04_TV_SHOWS/04-tvshows-article-02.png', 'tvshows-article-02.png'],

  ['05_KPOP/05-kpop-start-here.png', 'kpop-start-here.png'],
  ['05_KPOP/05-kpop-article-01.png', 'kpop-article-01.png'],
  ['05_KPOP/05-kpop-article-02.png', 'kpop-article-02.png'],

  ['06_COMICS/06-comics-start-here.png', 'comics-start-here.png'],
  ['06_COMICS/06-comics-article-01.png', 'comics-article-01.png'],
  ['06_COMICS/06-comics-article-02.png', 'comics-article-02.png'],

  ['07_MANGA/07-manga-start-here.webp.png', 'manga-start-here.png'],
  ['07_MANGA/07-manga-article-01.png', 'manga-article-01.png'],
  ['07_MANGA/07-manga-article-02.png', 'manga-article-02.png'],
]

let missing = []
let copied = []
for (const [src, dest] of MAP) {
  const srcPath = join(SRC_ROOT, src)
  const destPath = join(DEST_ROOT, dest)
  if (!existsSync(srcPath)) {
    missing.push(srcPath)
    continue
  }
  copyFileSync(srcPath, destPath)
  const size = statSync(destPath).size
  copied.push(`${dest} (${(size / 1024).toFixed(0)}KB)`)
}

console.log(`Copied: ${copied.length}/${MAP.length}`)
if (missing.length) {
  console.log('MISSING SOURCE FILES:')
  missing.forEach((m) => console.log('  ' + m))
}
copied.forEach((c) => console.log('  ' + c))
