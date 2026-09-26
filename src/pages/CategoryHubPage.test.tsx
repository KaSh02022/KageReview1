import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CategoryHubPage } from './CategoryHubPage'
import { categories, merchandise } from '../data'
import { CATEGORY_ROUTES } from '../routes/categoryRoutes'

function renderHub(categoryId: string) {
  return render(
    <MemoryRouter>
      <CategoryHubPage categoryId={categoryId} />
    </MemoryRouter>,
  )
}

describe('CategoryHubPage', () => {
  it.each(CATEGORY_ROUTES.map((route) => route.categoryId))(
    'renders the same full section structure for "%s" (one universe, seven worlds)',
    (categoryId) => {
      renderHub(categoryId)
      const category = categories.find((item) => item.id === categoryId)

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(category!.name)
      for (const sectionTitle of [
        // Gallery, Trailers and Upcoming Releases were removed 2026-09-25
        // ("Category Hub Visual Simplification"); Characters and Events
        // followed the same day ("Category Hub Content Image
        // Integration") once Start here/Articles/Merchandise had real
        // dedicated photography and no longer needed the extra sections to
        // fill the page. All five datasets are untouched and their detail
        // pages/routes still work — covered directly by
        // e2e/deep-links.spec.ts and e2e/content-honesty.spec.ts — only
        // this hub template stopped rendering them.
        'Start here', // the Featured section's heading; "Featured" itself is the eyebrow
        'Articles',
        'Merchandise',
        'Explore another world',
      ]) {
        expect(
          screen.getByRole('heading', { name: new RegExp(sectionTitle, 'i') }),
          `${categoryId} is missing the "${sectionTitle}" section`,
        ).toBeInTheDocument()
      }
    },
  )

  // The three tests that used to live here ("links every character to its
  // detail route", "links every event to its detail route", "labels
  // simulated fan events") no longer apply: Characters and Events were
  // removed from this template 2026-09-25 ("Category Hub Content Image
  // Integration"). The guarantees they checked are not lost — they are
  // asserted directly against the still-working character/event detail
  // pages in e2e/deep-links.spec.ts (`/character/...`, `/event/...` resolve)
  // and e2e/content-honesty.spec.ts ("events are explicitly labelled as
  // simulated, not real") — neither of which depends on the hub rendering a
  // card at all.

  it('gives Start here and every Articles image real alt text, and never reuses one image between the two articles', () => {
    renderHub('gaming')
    const startHereSection = screen.getByRole('heading', { name: /^start here/i }).closest('section')
    const articlesSection = screen.getByRole('heading', { name: /^articles$/i }).closest('section')

    const startHereImage = within(startHereSection!).getByRole('img')
    const articleImages = within(articlesSection!).getAllByRole('img')

    expect(articleImages).toHaveLength(2)
    for (const image of [startHereImage, ...articleImages]) {
      expect(image.getAttribute('alt')?.length ?? 0).toBeGreaterThan(10)
      expect(image).toHaveAttribute('loading', 'lazy')
    }

    // Article 1 and Article 2 each ship their own dedicated asset — this is
    // a real regression guard, not just documentation of the mapping.
    const [article1Src, article2Src] = articleImages.map((image) => image.getAttribute('src'))
    expect(article1Src).not.toEqual(article2Src)
    expect(article1Src).not.toEqual(startHereImage.getAttribute('src'))
  })

  it('gives every merchandise image real alt text', () => {
    // Was "gives every gallery image real alt text" until Gallery was
    // removed 2026-09-25 (Category Hub Visual Simplification). Merchandise
    // is now the hub's real-photography section, so the same accessibility
    // coverage moved here rather than being dropped.
    renderHub('manga')
    const merchSection = screen.getByRole('heading', { name: /^merchandise$/i }).closest('section')
    const images = within(merchSection!).getAllByRole('img')

    expect(images.length).toBeGreaterThan(0)
    for (const image of images) {
      expect(image.getAttribute('alt')?.length ?? 0).toBeGreaterThan(10)
      expect(image).toHaveAttribute('loading', 'lazy')
    }
  })

  it('shows the featured merchandise hero once, separately from the five products, never duplicated', () => {
    renderHub('anime')
    const merchSection = screen.getByRole('heading', { name: /^merchandise$/i }).closest('section')
    const animeMerch = merchandise.filter((item) => item.categoryId === 'anime')
    const hero = animeMerch.find((item) => item.tags.includes('featured'))
    const products = animeMerch.filter((item) => item.id !== hero?.id)

    expect(hero, 'anime has no merchandise hero').toBeDefined()
    expect(products).toHaveLength(5)

    // The hero's own product link appears exactly once in the section...
    expect(within(merchSection!).getAllByRole('link', { name: new RegExp(hero!.name, 'i') })).toHaveLength(1)
    // ...and every one of the five products is a distinct, separate card.
    for (const product of products) {
      expect(
        within(merchSection!).getByRole('link', { name: new RegExp(product.name, 'i') }),
      ).toHaveAttribute('href', `/product/${product.id}`)
    }
  })

  it('resolves the K-Pop hub from its route slug as well as its id', () => {
    // Category.id is "kpop" but the route path is "k-pop" — the generic
    // /category/:slug route has to resolve both.
    renderHub('k-pop')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('K-Pop')
  })

  it('shows a real empty state rather than a broken page for an unknown category', () => {
    renderHub('not-a-real-category')
    expect(screen.getByRole('heading', { name: /category not found/i })).toBeInTheDocument()
  })
})
