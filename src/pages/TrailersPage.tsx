import { media } from '../data'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { Grid } from '../components/ui/Layout/Grid'
import { Card, CardMedia, CardHeader, CardMeta } from '../components/ui/Card/Card'
import { Badge } from '../components/ui/Badge/Badge'

export function TrailersPage() {
  const trailers = media.filter((item) => item.mediaType === 'trailer')

  return (
    <PagePlaceholder
      title="Trailers"
      description="Cross-category trailer aggregation across all seven fandom hubs. Filtering/sorting is a later phase (FR-025/FR-026); every trailer here is a demonstrative placeholder for an original, fictional franchise — see each category hub for full context."
    >
      {trailers.length === 0 ? (
        <EmptyState title="No trailers yet" />
      ) : (
        <Grid minItemWidth={220} gap="md">
          {trailers.map((trailer) => (
            <Card key={trailer.id}>
              <CardMedia>
                <img src={trailer.thumbnail.src} alt={trailer.thumbnail.alt} loading="lazy" />
              </CardMedia>
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
