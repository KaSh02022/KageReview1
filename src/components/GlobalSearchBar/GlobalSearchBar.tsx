import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './GlobalSearchBar.module.css'

/**
 * Global search entry point, reachable from every page (FR-009). Phase 1
 * only wires navigation to /search?q=...; the actual client-side search
 * index (FR-011) is built in Phase 6.
 */
export function GlobalSearchBar() {
  const [value, setValue] = useState('')
  const navigate = useNavigate()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = value.trim()
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search')
  }

  return (
    <form role="search" className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor="global-search-input" className="visually-hidden">
        Search FandomVerse
      </label>
      <input
        id="global-search-input"
        type="search"
        name="q"
        placeholder="Search articles, characters, events…"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className={styles.input}
      />
      <button type="submit" className={styles.button}>
        Search
      </button>
    </form>
  )
}
