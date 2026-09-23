import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { BookmarkContentType } from '../types/content'
import { STORAGE_KEYS } from '../utils/storage'

interface NotesState {
  notes: Record<string, string>
  getNote: (bookmarkKey: string) => string
  setNote: (bookmarkKey: string, note: string) => void
  clearNote: (bookmarkKey: string) => void
}

/**
 * Personal notes attached to bookmarks, per FR-037 — persisted to
 * sessionStorage ONLY, so they are gone once the browser session ends
 * (distinct from the bookmarks themselves, which live in localStorage).
 */
export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: {},
      getNote: (bookmarkKey) => get().notes[bookmarkKey] ?? '',
      setNote: (bookmarkKey, note) =>
        set((state) => ({ notes: { ...state.notes, [bookmarkKey]: note } })),
      clearNote: (bookmarkKey) =>
        set((state) => {
          const next = { ...state.notes }
          delete next[bookmarkKey]
          return { notes: next }
        }),
    }),
    {
      name: STORAGE_KEYS.notes,
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)

export function toBookmarkKey(contentType: BookmarkContentType, contentId: string): string {
  return `${contentType}:${contentId}`
}
