import { releases } from '../data'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { EmptyState } from '../components/EmptyState/EmptyState'

export function ReleasesPage() {
  return (
    <PagePlaceholder
      title="Upcoming Releases"
      description="Cross-category release calendar (docs/05_DATA_SCHEMA.md §9). Phase 1 shows only seed entries; full population is Phase 8."
      phase="Phase 8"
    >
      {releases.length === 0 ? (
        <EmptyState title="No releases yet" />
      ) : (
        <ul>
          {releases.map((release) => (
            <li key={release.id}>
              {release.title} — {release.releaseDate} ({release.type})
            </li>
          ))}
        </ul>
      )}
    </PagePlaceholder>
  )
}
