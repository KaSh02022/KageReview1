import { describe, it, expect, beforeEach } from 'vitest'
import { useBookmarksStore } from './bookmarksStore'
import { STORAGE_KEYS } from '../utils/storage'

describe('bookmarksStore', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    useBookmarksStore.setState({ entries: [] })
  })

  it('initializes with no bookmarks', () => {
    expect(useBookmarksStore.getState().entries).toEqual([])
  })

  it('toggles a bookmark on and off', () => {
    useBookmarksStore.getState().toggleBookmark('article', 'article-anime-sample-01')
    expect(useBookmarksStore.getState().isBookmarked('article', 'article-anime-sample-01')).toBe(
      true,
    )

    useBookmarksStore.getState().toggleBookmark('article', 'article-anime-sample-01')
    expect(useBookmarksStore.getState().isBookmarked('article', 'article-anime-sample-01')).toBe(
      false,
    )
  })

  it('persists bookmarks to localStorage under the bookmarks storage key (FR-036)', () => {
    useBookmarksStore.getState().toggleBookmark('character', 'character-anime-sample-01')

    const raw = localStorage.getItem(STORAGE_KEYS.bookmarks)
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw as string)
    expect(parsed.state.entries).toHaveLength(1)
    expect(parsed.state.entries[0]).toMatchObject({
      contentType: 'character',
      contentId: 'character-anime-sample-01',
    })
  })

  it('never writes bookmark state to sessionStorage', () => {
    useBookmarksStore.getState().toggleBookmark('event', 'event-anime-sample-01')
    expect(sessionStorage.getItem(STORAGE_KEYS.bookmarks)).toBeNull()
  })
})
