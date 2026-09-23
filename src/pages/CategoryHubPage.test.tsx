import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CategoryHubPage } from './CategoryHubPage'
import { categories, characters, events } from '../data'
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
        'Start here', // the Featured section's heading; "Featured" itself is the eyebrow
        'Articles',
        'Gallery',
        'Characters',
        'Events',
        'Trailers',
        'Upcoming Releases',
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

  it('links every one of the category’s characters to its detail route', () => {
    renderHub('anime')
    const charactersHeading = screen.getByRole('heading', { name: /^characters$/i })
    const section = charactersHeading.closest('section')
    const animeCharacters = characters.filter((item) => item.categoryId === 'anime')

    expect(animeCharacters).toHaveLength(5)
    for (const character of animeCharacters) {
      const link = within(section!).getByRole('link', { name: new RegExp(character.name, 'i') })
      expect(link).toHaveAttribute('href', `/character/${character.id}`)
    }
  })

  it('links every one of the category’s events to its detail route', () => {
    renderHub('kpop')
    const eventsHeading = screen.getByRole('heading', { name: /^events$/i })
    const section = eventsHeading.closest('section')
    const kpopEvents = events.filter((item) => item.categoryId === 'kpop')

    expect(kpopEvents).toHaveLength(3)
    for (const event of kpopEvents) {
      const link = within(section!).getByRole('link', { name: new RegExp(event.title, 'i') })
      expect(link).toHaveAttribute('href', `/event/${event.id}`)
    }
  })

  it('labels simulated fan events so users are never misled', () => {
    renderHub('anime')
    const eventsSection = screen.getByRole('heading', { name: /^events$/i }).closest('section')
    expect(within(eventsSection!).getAllByText(/simulated fan event/i).length).toBeGreaterThan(0)
  })

  it('gives every gallery image real alt text', () => {
    renderHub('manga')
    const gallerySection = screen.getByRole('heading', { name: /^gallery$/i }).closest('section')
    const images = within(gallerySection!).getAllByRole('img')

    expect(images.length).toBeGreaterThan(0)
    for (const image of images) {
      expect(image.getAttribute('alt')?.length ?? 0).toBeGreaterThan(10)
      expect(image).toHaveAttribute('loading', 'lazy')
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
