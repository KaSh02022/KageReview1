import { describe, it, expect } from 'vitest'
import { applyFilters } from './applyFilters'
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
  { id: 'd', categoryId: 'movies', status: 'coming-soon' },
]

const getCategoryId = (item: Item) => item.categoryId
const getStatus = (item: Item) => item.status

describe('applyFilters', () => {
  it('returns every item when no filter is active', () => {
    const result = applyFilters(items, { categoryIds: [], statuses: [] }, getCategoryId, getStatus)
    expect(result).toHaveLength(4)
  })

  it('narrows by category alone (OR within the facet)', () => {
    const result = applyFilters(
      items,
      { categoryIds: ['anime', 'gaming'], statuses: [] },
      getCategoryId,
      getStatus,
    )
    expect(result.map((item) => item.id)).toEqual(['a', 'b', 'c'])
  })

  it('narrows by status alone', () => {
    const result = applyFilters(items, { categoryIds: [], statuses: ['available'] }, getCategoryId, getStatus)
    expect(result.map((item) => item.id)).toEqual(['a', 'c'])
  })

  it('combines category and status with AND across facets', () => {
    const result = applyFilters(
      items,
      { categoryIds: ['anime'], statuses: ['available'] },
      getCategoryId,
      getStatus,
    )
    expect(result.map((item) => item.id)).toEqual(['a'])
  })

  it('returns an empty list when the combination matches nothing', () => {
    const result = applyFilters(
      items,
      { categoryIds: ['movies'], statuses: ['available'] },
      getCategoryId,
      getStatus,
    )
    expect(result).toEqual([])
  })
})
