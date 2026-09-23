import { describe, it, expect, beforeEach } from 'vitest'
import { useNotesStore, toBookmarkKey } from './notesStore'
import { STORAGE_KEYS } from '../utils/storage'

describe('notesStore', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    useNotesStore.setState({ notes: {} })
  })

  it('initializes with no notes', () => {
    expect(useNotesStore.getState().getNote(toBookmarkKey('article', 'article-anime-sample-01'))).toBe('')
  })

  it('sets and reads a note by bookmark key', () => {
    const key = toBookmarkKey('article', 'article-anime-sample-01')
    useNotesStore.getState().setNote(key, 'My personal note')
    expect(useNotesStore.getState().getNote(key)).toBe('My personal note')
  })

  it('persists notes to sessionStorage ONLY, per the FR-037 session-only boundary', () => {
    const key = toBookmarkKey('article', 'article-anime-sample-01')
    useNotesStore.getState().setNote(key, 'Session-only note')

    const sessionRaw = sessionStorage.getItem(STORAGE_KEYS.notes)
    expect(sessionRaw).not.toBeNull()
    const parsed = JSON.parse(sessionRaw as string)
    expect(parsed.state.notes[key]).toBe('Session-only note')

    // Must never leak into localStorage — that would make the note
    // survive a browser restart, contradicting the SRS's session-only
    // requirement for personal notes.
    expect(localStorage.getItem(STORAGE_KEYS.notes)).toBeNull()
  })

  it('clears a note', () => {
    const key = toBookmarkKey('article', 'article-anime-sample-01')
    useNotesStore.getState().setNote(key, 'to be cleared')
    useNotesStore.getState().clearNote(key)
    expect(useNotesStore.getState().getNote(key)).toBe('')
  })
})
