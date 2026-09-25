import type { CSSProperties } from 'react'
import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import {
  articles,
  characters,
  events,
  media,
  galleries,
  releases,
  merchandise,
  getCategoryByIdOrSlug,
} from '../data'
import { CATEGORY_ROUTES } from '../routes/categoryRoutes'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { SectionHeader } from '../components/ui/SectionHeader/SectionHeader'
import { Grid } from '../components/ui/Layout/Grid'
import { Stack } from '../components/ui/Layout/Stack'
import { Badge } from '../components/ui/Badge/Badge'
import { Card, CardMedia, CardHeader, CardBody, CardMeta, CardFooter } from '../components/ui/Card/Card'
import { Link } from '../components/ui/Link/Link'
import { CategoryCinematicHero } from '../features/category/CategoryCinematicHero'
import { FEATURED_CHARACTER_IDS } from '../data/landingAssets'
import styles from './CategoryHubPage.module.css'

/**
 * Categories whose hub opens with the cinematic hero rather than the flat
 * banner. All seven now; the set is kept rather than removed so a single
 * category can be dropped back to the flat banner without a code change.
 */
const CINEMATIC_CATEGORIES = new Set<string>([
  'anime',
  'gaming',
  'movies',
  'tv-shows',
  'kpop',
  'comics',
  'manga',
])

interface CategoryHubPageProps {
  categoryId?: string
  label?: string
}

/**
 * The shared "one universe, seven worlds" category hub template (Phase 5,
 * docs/02_PRODUCT_ARCHITECTURE.md §16). Every category renders the exact
 * same section structure — hero, featured, articles, gallery, characters,
 * events, trailers, upcoming releases, merchandise, discovery — with only
 * the accent color, imagery, and content differing per category.
 */
export function CategoryHubPage({ categoryId: categoryIdProp, label }: CategoryHubPageProps) {
  const { slug } = useParams()
  const sectionsRef = useRef<HTMLDivElement | null>(null)
  const lookupValue = categoryIdProp ?? slug ?? ''
  const category = getCategoryByIdOrSlug(lookupValue)

  if (!category) {
    return (
      <EmptyState
        title="Category not found"
        description={`No category matches "${label ?? lookupValue}". Explore one of the seven fandom hubs from the navigation.`}
      />
    )
  }

  const categoryId = category.id
  const accent = `var(${category.accentColor})`

  const categoryArticles = articles.filter((item) => item.categoryId === categoryId)
  const featuredArticle = categoryArticles.find((item) => item.featured)
  const remainingArticles = categoryArticles.filter((item) => item.id !== featuredArticle?.id)
  const categoryCharacters = characters.filter((item) => item.categoryId === categoryId)
  const categoryEvents = events.filter((item) => item.categoryId === categoryId)
  const categoryTrailers = media.filter((item) => item.categoryId === categoryId && item.mediaType === 'trailer')
  const categoryGallery = galleries.find((item) => item.categoryId === categoryId)
  const categoryReleases = releases.filter((item) => item.categoryId === categoryId)
  const categoryMerch = merchandise.filter((item) => item.categoryId === categoryId)
  const otherCategories = CATEGORY_ROUTES.filter((route) => route.categoryId !== categoryId)

  const isCinematic = CINEMATIC_CATEGORIES.has(categoryId)
  const lead = isCinematic
    ? characters.find(
        (item) =>
          item.categoryId === categoryId &&
          (FEATURED_CHARACTER_IDS as readonly string[]).includes(item.id),
      )
    : undefined

  return (
    <div className={styles.wrapper}>
      {isCinematic ? (
        <CategoryCinematicHero
          category={category}
          lead={lead}
          onEnter={() =>
            sectionsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
          }
        />
      ) : (
        <header className={styles.hero} style={{ '--hero-accent': accent } as CSSProperties}>
          <img
            className={styles.heroImage}
            src={category.heroImage.src}
            alt={category.heroImage.alt}
            loading="lazy"
          />
          <div className={styles.heroContent}>
            <p className={styles.heroEyebrow}>{category.visualMotif}</p>
            <h1 className={styles.heroTitle}>{category.name}</h1>
            <p className={styles.heroTagline}>{category.tagline}</p>
            <p className={styles.heroDescription}>{category.description}</p>
          </div>
        </header>
      )}

      <div ref={sectionsRef} aria-hidden="true" />

      <Stack gap="2xl" className={styles.sections}>
        {featuredArticle && (
          <section aria-labelledby={`${categoryId}-featured`}>
            <SectionHeader
              id={`${categoryId}-featured`}
              eyebrow="Featured"
              title={`Start here: ${category.franchise}`}
            />
            <Card to={`/article/${featuredArticle.id}`} accent={accent} className={styles.featuredCard}>
              <CardMedia>
                <img src={featuredArticle.thumbnail.src} alt={featuredArticle.thumbnail.alt} loading="lazy" />
              </CardMedia>
              <CardBody>
                <h3>{featuredArticle.title}</h3>
                <p>{featuredArticle.summary}</p>
              </CardBody>
            </Card>
          </section>
        )}

        <section aria-labelledby={`${categoryId}-articles`}>
          <SectionHeader id={`${categoryId}-articles`} title="Articles" level={2} />
          {remainingArticles.length === 0 ? (
            <EmptyState title="No further articles yet" description="Check back soon for more coverage." />
          ) : (
            <Grid minItemWidth={240} gap="md">
              {remainingArticles.map((article) => (
                <Card key={article.id} to={`/article/${article.id}`} accent={accent}>
                  <CardMedia>
                    <img src={article.thumbnail.src} alt={article.thumbnail.alt} loading="lazy" />
                  </CardMedia>
                  <CardHeader>
                    <h3>{article.title}</h3>
                  </CardHeader>
                  <CardBody>
                    <p>{article.summary}</p>
                  </CardBody>
                </Card>
              ))}
            </Grid>
          )}
        </section>

        <section aria-labelledby={`${categoryId}-gallery`}>
          <SectionHeader id={`${categoryId}-gallery`} title="Gallery" level={2} />
          {!categoryGallery || categoryGallery.images.length === 0 ? (
            <EmptyState title="No gallery images yet" description="Fan-art and concept pieces are added over time." />
          ) : (
            <Grid minItemWidth={150} gap="sm">
              {categoryGallery.images.map((image) => (
                <figure key={image.id} className={styles.galleryItem}>
                  <img src={image.src} alt={image.alt} loading="lazy" />
                  <figcaption>{image.caption}</figcaption>
                </figure>
              ))}
            </Grid>
          )}
        </section>

        <section aria-labelledby={`${categoryId}-characters`}>
          <SectionHeader id={`${categoryId}-characters`} title="Characters" level={2} />
          {categoryCharacters.length === 0 ? (
            <EmptyState title="No character profiles yet" description="Character profiles are added over time." />
          ) : (
            <Grid minItemWidth={150} gap="sm">
              {categoryCharacters.map((character) => (
                <Card key={character.id} to={`/character/${character.id}`} accent={accent}>
                  <CardMedia>
                    <img src={character.image.src} alt={character.image.alt} loading="lazy" />
                  </CardMedia>
                  <CardHeader>
                    <h3>{character.name}</h3>
                  </CardHeader>
                  <CardMeta>{character.role}</CardMeta>
                </Card>
              ))}
            </Grid>
          )}
        </section>

        <section aria-labelledby={`${categoryId}-events`}>
          <SectionHeader id={`${categoryId}-events`} title="Events" level={2} />
          {categoryEvents.length === 0 ? (
            <EmptyState title="No events scheduled" description="Fan events are added as they're organized." />
          ) : (
            <Grid minItemWidth={240} gap="md">
              {categoryEvents.map((event) => (
                <Card key={event.id} to={`/event/${event.id}`} accent={accent}>
                  <CardMedia>
                    <img src={event.image.src} alt={event.image.alt} loading="lazy" />
                  </CardMedia>
                  <CardHeader>
                    <h3>{event.title}</h3>
                  </CardHeader>
                  <CardBody>
                    <p>
                      {event.date} · {event.location}
                    </p>
                  </CardBody>
                  <CardFooter>
                    <Badge tone="neutral">{event.eventType}</Badge>
                    {event.fictional && (
                      <Badge tone="warning">Simulated fan event</Badge>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </Grid>
          )}
        </section>

        <section aria-labelledby={`${categoryId}-trailers`}>
          <SectionHeader id={`${categoryId}-trailers`} title="Trailers" level={2} />
          {categoryTrailers.length === 0 ? (
            <EmptyState title="No trailers yet" description="Trailers are added as they're released." />
          ) : (
            <Grid minItemWidth={220} gap="md">
              {categoryTrailers.map((trailer) => (
                <Card key={trailer.id} accent={accent}>
                  <CardMedia>
                    <img src={trailer.thumbnail.src} alt={trailer.thumbnail.alt} loading="lazy" />
                  </CardMedia>
                  <CardHeader>
                    <h3>{trailer.title}</h3>
                  </CardHeader>
                  <CardBody>
                    <p>{trailer.description}</p>
                  </CardBody>
                  <CardFooter>
                    <Badge tone="neutral">Fictional trailer</Badge>
                  </CardFooter>
                </Card>
              ))}
            </Grid>
          )}
        </section>

        <section aria-labelledby={`${categoryId}-releases`}>
          <SectionHeader id={`${categoryId}-releases`} title="Upcoming Releases" level={2} />
          {categoryReleases.length === 0 ? (
            <EmptyState title="Nothing scheduled" description="Release info is added as it's announced." />
          ) : (
            <Grid minItemWidth={150} gap="sm">
              {categoryReleases.map((release) => (
                <Card key={release.id} accent={accent}>
                  <CardMedia>
                    <img src={release.coverImage.src} alt={release.coverImage.alt} loading="lazy" />
                  </CardMedia>
                  <CardHeader>
                    <h3>{release.title}</h3>
                  </CardHeader>
                  <CardFooter>
                    <Badge tone={release.status === 'upcoming' ? 'primary' : 'neutral'}>{release.status}</Badge>
                  </CardFooter>
                </Card>
              ))}
            </Grid>
          )}
        </section>

        <section aria-labelledby={`${categoryId}-merch`}>
          <SectionHeader id={`${categoryId}-merch`} title="Merchandise" level={2} />
          {categoryMerch.length === 0 ? (
            <EmptyState title="No merchandise yet" description="Merchandise is added over time." />
          ) : (
            <Grid minItemWidth={150} gap="sm">
              {categoryMerch.map((item) => (
                <Card key={item.id} to={`/product/${item.id}`} accent={accent}>
                  <CardMedia>
                    <img src={item.image.src} alt={item.image.alt} loading="lazy" />
                  </CardMedia>
                  <CardHeader>
                    <h3>{item.name}</h3>
                  </CardHeader>
                  <CardFooter>
                    <span>
                      {item.currency} {item.priceRangeMin}–{item.priceRangeMax}
                    </span>
                    <Badge tone={item.status === 'available' ? 'success' : 'neutral'}>{item.status}</Badge>
                  </CardFooter>
                </Card>
              ))}
            </Grid>
          )}
        </section>

        <section aria-labelledby={`${categoryId}-explore`}>
          <SectionHeader id={`${categoryId}-explore`} title="Explore another world" level={2} />
          <Stack direction="row" wrap gap="sm">
            {otherCategories.map((route) => (
              <Link key={route.categoryId} to={`/${route.path}`} className={styles.worldLink}>
                {route.label}
              </Link>
            ))}
          </Stack>
        </section>
      </Stack>
    </div>
  )
}
