import { media } from '../data'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { Grid } from '../components/ui/Layout/Grid'
import { Card, CardHeader, CardMeta } from '../components/ui/Card/Card'
import { Badge } from '../components/ui/Badge/Badge'

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
        <Grid minItemWidth={220} gap="md">
          {trailers.map((trailer) => (
            <Card key={trailer.id}>
              <CardHeader>
                <h3>{trailer.title}</h3>
              </CardHeader>
              <CardMeta>
                <Badge tone="neutral">{trailer.categoryId}</Badge>
                <Badge tone={trailer.releaseStatus === 'upcoming' ? 'primary' : 'neutral'}>
                  {trailer.releaseStatus}
                </Badge>
              </CardMeta>
            </Card>
          ))}
        </Grid>
      )}
    </PagePlaceholder>
  )
}
