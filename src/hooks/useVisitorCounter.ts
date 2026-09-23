import { useEffect, useState } from 'react'
import { readJson, writeJson, STORAGE_KEYS } from '../utils/storage'

const SESSION_FLAG_KEY = 'fandomverse.visitorSessionCounted.v1'

/**
 * Simulated visitor counter, FR-041: increments a localStorage-backed count
 * once per new browser session (tracked via a sessionStorage flag so a
 * page reload within the same tab session doesn't inflate the count), with
 * no server involved.
 *
 * The displayed count is computed once, in the lazy useState initializer
 * (a pure read — safe if StrictMode double-invokes it). The effect only
 * performs the storage *write*, never calls setState, so it can't trigger
 * the cascading-render pattern the react-hooks lint rule flags; the
 * sessionStorage flag also makes a StrictMode double-effect a no-op on its
 * second run.
 */
export function useVisitorCounter(): number {
  const [count] = useState<number>(() => {
    const current = readJson<number>('local', STORAGE_KEYS.visitorCount) ?? 0
    const alreadyCounted = readJson<boolean>('session', SESSION_FLAG_KEY)
    return alreadyCounted ? current : current + 1
  })

  useEffect(() => {
    const alreadyCounted = readJson<boolean>('session', SESSION_FLAG_KEY)
    if (alreadyCounted) return
    writeJson('local', STORAGE_KEYS.visitorCount, count)
    writeJson('session', SESSION_FLAG_KEY, true)
  }, [count])

  return count
}
