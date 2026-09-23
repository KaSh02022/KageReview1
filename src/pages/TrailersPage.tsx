import { media } from '../data'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { EmptyState } from '../components/EmptyState/EmptyState'

export function TrailersPage() {
  const trailers = media.filter((item) => item.mediaType === 'trailer')

  return (
    <PagePlaceholder
      title="Trailers"
      description="Cross-category trailer aggregation. Phase 1 shows only seed entries; full population is Phase 7."
      requirementIds={['FR-025', 'FR-026']}
      phase="Phase 7"
    >
      {trailers.length === 0 ? (
        <EmptyState title="No trailers yet" />
      ) : (
        <ul>
          {trailers.map((trailer) => (
            <li key={trailer.id}>
              {trailer.title} — {trailer.categoryId} ({trailer.releaseStatus})
            </li>
          ))}
        </ul>
      )}
    </PagePlaceholder>
  )
}
