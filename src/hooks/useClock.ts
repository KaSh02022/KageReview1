import { useEffect, useState } from 'react'

/** Real-time clock, FR-042 — updates once per second via JS, no server involved. */
export function useClock(): Date {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(interval)
  }, [])

  return now
}
