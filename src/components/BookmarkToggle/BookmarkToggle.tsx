import { useBookmarksStore } from '../../stores/bookmarksStore'
import { useNotesStore, toBookmarkKey } from '../../stores/notesStore'
import type { BookmarkContentType } from '../../types/content'
import { Button } from '../ui/Button/Button'

interface BookmarkToggleProps {
  contentType: BookmarkContentType
  contentId: string
}

/** FR-035/FR-036: favorite toggle, reused across articles/characters/events/media. */
export function BookmarkToggle({ contentType, contentId }: BookmarkToggleProps) {
  const isBookmarked = useBookmarksStore((state) => state.isBookmarked(contentType, contentId))
  const toggleBookmark = useBookmarksStore((state) => state.toggleBookmark)
  const clearNote = useNotesStore((state) => state.clearNote)

  function handleClick() {
    const wasBookmarked = isBookmarked
    toggleBookmark(contentType, contentId)
    if (wasBookmarked) {
      clearNote(toBookmarkKey(contentType, contentId))
    }
  }

  return (
    <Button
      variant={isBookmarked ? 'secondary' : 'outline'}
      size="small"
      onClick={handleClick}
      aria-pressed={isBookmarked}
      leadingIcon={isBookmarked ? '★' : '☆'}
    >
      {isBookmarked ? 'Bookmarked' : 'Bookmark'}
    </Button>
  )
}
