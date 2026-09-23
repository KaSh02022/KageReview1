import { useId, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { SearchInput } from '../ui/Form/SearchInput'
import { IconButton } from '../ui/Button/IconButton'
import styles from './GlobalSearchBar.module.css'

/**
 * Global search entry point, reachable from every page (FR-009). Phase 1
 * only wires navigation to /search?q=...; the actual client-side search
 * index (FR-011) is built in Phase 6.
 */
export function GlobalSearchBar() {
  const [value, setValue] = useState('')
  const navigate = useNavigate()
  const inputId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = value.trim()
    navigate(query ? `/search?q=${encodeURIComponent(query)}` : '/search')
  }

  return (
    <form role="search" className={styles.form} onSubmit={handleSubmit}>
      <SearchInput
        id={inputId}
        label="Search FandomVerse"
        name="q"
        placeholder="Search articles, characters, events…"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <IconButton type="submit" label="Search" icon="→" variant="primary" />
    </form>
  )
}
