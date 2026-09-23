import { releases } from '../data'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { Grid } from '../components/ui/Layout/Grid'
import { Card, CardMedia, CardHeader, CardMeta } from '../components/ui/Card/Card'
import { Badge } from '../components/ui/Badge/Badge'

export function ReleasesPage() {
  return (
    <PagePlaceholder
      title="Upcoming Releases"
      description="Cross-category release calendar (docs/05_DATA_SCHEMA.md §9) — 21 simulated releases (3 per category) across every fandom hub. Filtering/sorting is a later phase."
    >
      {releases.length === 0 ? (
        <EmptyState title="No releases yet" />
      ) : (
        <Grid minItemWidth={220} gap="md">
          {releases.map((release) => (
            <Card key={release.id}>
              <CardMedia>
                <img src={release.coverImage.src} alt={release.coverImage.alt} loading="lazy" />
              </CardMedia>
              <CardHeader>
                <h3>{release.title}</h3>
              </CardHeader>
              <CardMeta>
                <span>{release.releaseDate}</span>
                <Badge tone="neutral">{release.type}</Badge>
                <Badge tone={release.status === 'upcoming' ? 'primary' : 'neutral'}>{release.status}</Badge>
              </CardMeta>
            </Card>
          ))}
        </Grid>
      )}
    </PagePlaceholder>
  )
}
