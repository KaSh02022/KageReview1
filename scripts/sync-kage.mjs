/**
 * Extracts the Kage landing page and its assets out of the installed
 * `@designcodeio/threeui` package and into `public/landing-pages/`, so the
 * app serves them as first-party static files.
 *
 * WHY A COPY RATHER THAN THE PACKAGE COMPONENT
 * The package's `KageLandingPage` is an `<iframe>` pointing at the
 * root-relative `/landing-pages/kage.html` — it does not bundle that file
 * into the app, it expects the host to serve it. So the files have to be in
 * `public/` either way. Copying them explicitly makes the dependency visible
 * in the repo, survives `node_modules` being wiped, and lets the page be
 * served directly without the package's frame wrapper.
 *
 * LICENCE
 * `@designcodeio/threeui` is MIT (Copyright (c) 2026 Meng To), which permits
 * copying, modification and redistribution provided the notice travels with
 * the files. This script writes that notice next to them; do not delete it.
 * The vendored `three.min.js` inside the asset folder carries its own MIT
 * notice from the three.js project.
 *
 * Re-run after upgrading the package:
 *     node scripts/sync-kage.mjs
 */

import { cp, mkdir, readFile, writeFile, rm, stat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const PACKAGE_ROOT = 'node_modules/@designcodeio/threeui'
const SOURCE = path.join(PACKAGE_ROOT, 'lib-dist/assets/landing-pages')
const DEST = 'public/landing-pages'

/** Only what the Kage page itself needs — not the other four landing pages. */
const ITEMS = ['kage.html', 'secret-pathways-assets']

const ATTRIBUTION = `Kage landing page — third-party asset
=======================================

These files are copied verbatim from the npm package
\`@designcodeio/threeui\` (lib-dist/assets/landing-pages/) by
\`scripts/sync-kage.mjs\`. Re-run that script after upgrading the package
rather than editing anything here by hand.

  kage.html                    the authored Kage single-file experience
  secret-pathways-assets/      its fonts, vendored three.js and artwork

--------------------------------------------------------------------------
MIT License

Copyright (c) 2026 Meng To

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
--------------------------------------------------------------------------

\`secret-pathways-assets/three.min.js\` is a vendored build of three.js and
carries its own MIT notice inside the file.
`

async function dirSize(target) {
  const entries = await import('node:fs/promises').then((fs) =>
    fs.readdir(target, { withFileTypes: true, recursive: true }),
  )
  let total = 0
  for (const entry of entries) {
    if (!entry.isFile()) continue
    total += (await stat(path.join(entry.parentPath ?? entry.path, entry.name))).size
  }
  return total
}

async function main() {
  if (!existsSync(SOURCE)) {
    console.error(
      `Source not found: ${SOURCE}\nRun \`npm install @designcodeio/threeui\` first.`,
    )
    process.exitCode = 1
    return
  }

  await mkdir(DEST, { recursive: true })

  for (const item of ITEMS) {
    const from = path.join(SOURCE, item)
    const to = path.join(DEST, item)
    if (!existsSync(from)) {
      console.error(`Missing from package: ${from}`)
      process.exitCode = 1
      return
    }
    // Removed first so a file deleted upstream does not linger here.
    await rm(to, { recursive: true, force: true })
    await cp(from, to, { recursive: true })
    const bytes = (await stat(to)).isDirectory() ? await dirSize(to) : (await stat(to)).size
    console.log(`  ${item.padEnd(24)} ${(bytes / 1024).toFixed(0)} KB`)
  }

  await writeFile(path.join(DEST, 'ATTRIBUTION.txt'), ATTRIBUTION, 'utf8')
  console.log(`  ${'ATTRIBUTION.txt'.padEnd(24)} written`)

  const html = await readFile(path.join(DEST, 'kage.html'), 'utf8')
  console.log(`\nkage.html: ${html.split('\n').length} lines, served at /landing-pages/kage.html`)
}

await main()
