import { useBookmarksStore } from '../stores/bookmarksStore'
import { useNotesStore, toBookmarkKey } from '../stores/notesStore'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { Card, CardBody, CardFooter } from '../components/ui/Card/Card'
import { Stack } from '../components/ui/Layout/Stack'
import { Button } from '../components/ui/Button/Button'
import { Textarea } from '../components/ui/Form/Textarea'
import styles from './BookmarksPage.module.css'

/** FR-035–038: favorites (localStorage) + session-only notes (sessionStorage) + export. */
export function BookmarksPage() {
  const entries = useBookmarksStore((state) => state.entries)
  const removeBookmark = useBookmarksStore((state) => state.removeBookmark)
  const notes = useNotesStore((state) => state.notes)
  const setNote = useNotesStore((state) => state.setNote)

  function handleExport() {
    const lines = entries.map(
      (entry) =>
        `${entry.contentType}: ${entry.contentId} (bookmarked ${entry.bookmarkedAt})${
          notes[toBookmarkKey(entry.contentType, entry.contentId)]
            ? ` — note: ${notes[toBookmarkKey(entry.contentType, entry.contentId)]}`
            : ''
        }`,
    )
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'fandomverse-bookmarks.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <PagePlaceholder
      title="Bookmarks"
      description="Favorites persist on this device via localStorage. Personal notes are session-only (sessionStorage) and clear when the browser session ends."
      requirementIds={['FR-035', 'FR-036', 'FR-037', 'FR-038']}
    >
      {entries.length === 0 ? (
        <EmptyState
          title="No bookmarks yet"
          description="Bookmark an article, character, or event to see it here."
        />
      ) : (
        <Stack gap="md">
          {entries.map((entry) => {
            const key = toBookmarkKey(entry.contentType, entry.contentId)
            return (
              <Card key={key}>
                <CardBody>
                  <strong className={styles.entryLabel}>
                    {entry.contentType}: {entry.contentId}
                  </strong>
                  <label htmlFor={`note-${key}`} className="visually-hidden">
                    Note for {entry.contentId}
                  </label>
                  <Textarea
                    id={`note-${key}`}
                    value={notes[key] ?? ''}
                    onChange={(event) => setNote(key, event.target.value)}
                    placeholder="Personal note (this session only)"
                  />
                </CardBody>
                <CardFooter>
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => removeBookmark(entry.contentType, entry.contentId)}
                  >
                    Remove
                  </Button>
                </CardFooter>
              </Card>
            )
          })}
          <Button variant="outline" onClick={handleExport}>
            Export bookmarks
          </Button>
        </Stack>
      )}
    </PagePlaceholder>
  )
}
