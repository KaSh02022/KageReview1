import { useBookmarksStore } from '../stores/bookmarksStore'
import { useNotesStore, toBookmarkKey } from '../stores/notesStore'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { Card, CardBody, CardFooter } from '../components/ui/Card/Card'
import { Stack } from '../components/ui/Layout/Stack'
import { Button } from '../components/ui/Button/Button'
import { Textarea } from '../components/ui/Form/Textarea'
import styles from './BookmarksPage.module.css'

/**
 * Bookmarks, FR-035–038: favorites saved to this device, personal notes
 * cleared when the browser session ends, plus export. Copy carries none
 * of that storage detail (2026-09-26, UI/Copy Cleanup) — the underlying
 * persistence behaviour (localStorage favourites, sessionStorage notes)
 * is unchanged.
 */
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
      description="Save your favorite FandomVerse content and come back to it anytime."
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
                    placeholder="Add a personal note"
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
