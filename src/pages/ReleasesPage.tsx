import { releases } from '../data'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { Grid } from '../components/ui/Layout/Grid'
import { Card, CardHeader, CardMeta } from '../components/ui/Card/Card'
import { Badge } from '../components/ui/Badge/Badge'

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
        <Grid minItemWidth={220} gap="md">
          {releases.map((release) => (
            <Card key={release.id}>
              <CardHeader>
                <h3>{release.title}</h3>
              </CardHeader>
              <CardMeta>
                <span>{release.releaseDate}</span>
                <Badge tone="neutral">{release.type}</Badge>
              </CardMeta>
            </Card>
          ))}
        </Grid>
      )}
    </PagePlaceholder>
  )
}
