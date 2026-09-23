/**
 * Thin, failure-safe wrappers around Web Storage. Storage access can throw
 * (private browsing, disabled storage, storage quota) — every call site in
 * the app goes through here instead of touching window.localStorage /
 * window.sessionStorage directly, so a storage failure degrades gracefully
 * instead of crashing a feature.
 */

type StorageArea = 'local' | 'session'

function getArea(area: StorageArea): Storage | undefined {
  try {
    return area === 'local' ? window.localStorage : window.sessionStorage
  } catch {
    return undefined
  }
}

export function readJson<T>(area: StorageArea, key: string): T | undefined {
  const storage = getArea(area)
  if (!storage) return undefined
  try {
    const raw = storage.getItem(key)
    if (raw === null) return undefined
    return JSON.parse(raw) as T
  } catch {
    return undefined
  }
}

export function writeJson<T>(area: StorageArea, key: string, value: T): void {
  const storage = getArea(area)
  if (!storage) return
  try {
    storage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full/unavailable — the app continues with in-memory state only.
  }
}

export function removeKey(area: StorageArea, key: string): void {
  const storage = getArea(area)
  if (!storage) return
  try {
    storage.removeItem(key)
  } catch {
    // Ignore — nothing to clean up if storage isn't available.
  }
}

export const STORAGE_KEYS = {
  cart: 'fandomverse.cart.v1',
  bookmarks: 'fandomverse.bookmarks.v1',
  notes: 'fandomverse.notes.v1',
  visitorCount: 'fandomverse.visitorCount.v1',
} as const
