import { describe, it, expect } from 'vitest'
import { deriveCategoryFacet, deriveStatusFacet } from './deriveFacets'
import type { CategoryId } from '../../types/content'

interface Item {
  id: string
  categoryId: CategoryId
  status: string
}

const items: Item[] = [
  { id: 'a', categoryId: 'anime', status: 'available' },
  { id: 'b', categoryId: 'anime', status: 'sold-out' },
  { id: 'c', categoryId: 'gaming', status: 'available' },
]

const getCategoryId = (item: Item) => item.categoryId
const getStatus = (item: Item) => item.status

describe('deriveCategoryFacet', () => {
  const options = [
    { value: 'anime', label: 'Anime' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'movies', label: 'Movies' },
  ]

  it('counts items per option from the given (already-otherwise-filtered) set', () => {
    const facet = deriveCategoryFacet(items, getCategoryId, options, [])
    expect(facet.options).toEqual([
      { value: 'anime', label: 'Anime', count: 2, disabled: false },
      { value: 'gaming', label: 'Gaming', count: 1, disabled: false },
      { value: 'movies', label: 'Movies', count: 0, disabled: true },
    ])
  })

  it('keeps a zero-count option enabled if it is currently selected (so it can still be un-toggled)', () => {
    const facet = deriveCategoryFacet(items, getCategoryId, options, ['movies'])
    const movies = facet.options.find((option) => option.value === 'movies')
    expect(movies?.disabled).toBe(false)
  })
})

describe('deriveStatusFacet', () => {
  it('counts per status value', () => {
    const facet = deriveStatusFacet(
      items,
      getStatus,
      [
        { value: 'available', label: 'Available' },
        { value: 'sold-out', label: 'Sold out' },
      ],
      [],
    )
    expect(facet.options.map((option) => option.count)).toEqual([2, 1])
  })
})
