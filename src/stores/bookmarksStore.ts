import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { BookmarkContentType, BookmarkEntry } from '../types/content'
import { STORAGE_KEYS } from '../utils/storage'

interface BookmarksState {
  entries: BookmarkEntry[]
  isBookmarked: (contentType: BookmarkContentType, contentId: string) => boolean
  toggleBookmark: (contentType: BookmarkContentType, contentId: string) => void
  removeBookmark: (contentType: BookmarkContentType, contentId: string) => void
}

/** Favorites, per FR-036 — persisted to localStorage so they survive a reload/browser restart. */
export const useBookmarksStore = create<BookmarksState>()(
  persist(
    (set, get) => ({
      entries: [],
      isBookmarked: (contentType, contentId) =>
        get().entries.some(
          (entry) => entry.contentType === contentType && entry.contentId === contentId,
        ),
      toggleBookmark: (contentType, contentId) =>
        set((state) => {
          const exists = state.entries.some(
            (entry) => entry.contentType === contentType && entry.contentId === contentId,
          )
          if (exists) {
            return {
              entries: state.entries.filter(
                (entry) => !(entry.contentType === contentType && entry.contentId === contentId),
              ),
            }
          }
          return {
            entries: [
              ...state.entries,
              { contentType, contentId, bookmarkedAt: new Date().toISOString() },
            ],
          }
        }),
      removeBookmark: (contentType, contentId) =>
        set((state) => ({
          entries: state.entries.filter(
            (entry) => !(entry.contentType === contentType && entry.contentId === contentId),
          ),
        })),
    }),
    {
      name: STORAGE_KEYS.bookmarks,
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
