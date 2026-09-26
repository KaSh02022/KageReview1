import { describe, it, expect } from 'vitest'
import { applySort } from './applySort'

interface Item {
  id: string
  title: string
  date?: string
}

const getTitle = (item: Item) => item.title
const getDate = (item: Item) => item.date

describe('applySort', () => {
  const items: Item[] = [
    { id: '1', title: 'Banana', date: '2026-02-01' },
    { id: '2', title: 'Apple', date: '2026-03-01' },
    { id: '3', title: 'Cherry' }, // undated
  ]

  it('az orders titles ascending', () => {
    const result = applySort(items, 'az', { getTitle })
    expect(result.map((item) => item.title)).toEqual(['Apple', 'Banana', 'Cherry'])
  })

  it('za orders titles descending', () => {
    const result = applySort(items, 'za', { getTitle })
    expect(result.map((item) => item.title)).toEqual(['Cherry', 'Banana', 'Apple'])
  })

  it('newest puts the latest date first and undated items last', () => {
    const result = applySort(items, 'newest', { getTitle, getDate })
    expect(result.map((item) => item.id)).toEqual(['2', '1', '3'])
  })

  it('oldest puts the earliest date first and undated items last', () => {
    const result = applySort(items, 'oldest', { getTitle, getDate })
    expect(result.map((item) => item.id)).toEqual(['1', '2', '3'])
  })

  it('sorts entirely-undated items deterministically by title, never left in input order', () => {
    const undated: Item[] = [
      { id: 'x', title: 'Zebra' },
      { id: 'y', title: 'Anteater' },
    ]
    const result = applySort(undated, 'newest', { getTitle, getDate })
    expect(result.map((item) => item.title)).toEqual(['Anteater', 'Zebra'])
  })

  it('does not mutate the input array', () => {
    const copy = [...items]
    applySort(items, 'za', { getTitle })
    expect(items).toEqual(copy)
  })
})
