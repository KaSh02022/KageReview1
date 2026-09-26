import type { CSSProperties } from 'react'
import { useRef } from 'react'
import { useParams } from 'react-router-dom'
import { articles, characters, merchandise, getCategoryByIdOrSlug } from '../data'
import { CATEGORY_ROUTES } from '../routes/categoryRoutes'
import { EmptyState } from '../components/EmptyState/EmptyState'
import { SectionHeader } from '../components/ui/SectionHeader/SectionHeader'
import { Grid } from '../components/ui/Layout/Grid'
import { Stack } from '../components/ui/Layout/Stack'
import { Badge } from '../components/ui/Badge/Badge'
import { Card, CardMedia, CardHeader, CardBody, CardFooter } from '../components/ui/Card/Card'
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
 * same section structure — hero, start here, articles, merchandise,
 * discovery — with only the accent color, imagery, and content differing
 * per category.
 *
 * Simplified in two passes, both 2026-09-25
 * (docs/FANDOMVERSE_KAGE_LANDING_WORKLOG.md): first Gallery, Trailers and
 * Upcoming Releases ("Category Hub Visual Simplification"), then Characters
 * and Events ("Category Hub Content Image Integration") were removed from
 * this template. All five were either procedural placeholder art with no
 * unique per-item imagery, or duplicated a dedicated Explore page that
 * already exists site-wide — sections that made the hub read as a long list
 * of thin cards rather than a deliberate product page. Their datasets
 * (`galleries.json`, trailer `media.json` entries, `releases.json`,
 * `characters.json`, `events.json`) are untouched, and character/event
 * detail pages and routes still work; only this template's rendering of
 * them changed. "Start here" and "Articles" now carry dedicated
 * photography (`public/assets/generated/content/`), and Merchandise
 * carries real product photography (`public/assets/generated/merch/`) —
 * together the page's visual content.
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
  const categoryMerch = merchandise.filter((item) => item.categoryId === categoryId)
  // The hero is a distinct, once-only spotlight item (see §Merchandise
  // below) — never one of the five products, and never repeated.
  const merchHero = categoryMerch.find((item) => item.tags.includes('featured'))
  const merchProducts = categoryMerch.filter((item) => item.id !== merchHero?.id)
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

        {/* The catalogue's visual centerpiece: real product photography (see
            docs/FANDOMVERSE_KAGE_LANDING_WORKLOG.md, "Category Hub Visual
            Simplification"), so this is the one content section sized and
            spotlighted like the page means it — not the same quiet card size
            as everything else. The hero item renders once, separately from
            the five products, reusing the exact spotlight treatment the
            Featured Article section already established above
            (`.featuredCard`) rather than inventing a second one. */}
        <section aria-labelledby={`${categoryId}-merch`}>
          <SectionHeader
            id={`${categoryId}-merch`}
            eyebrow="Collection"
            title="Merchandise"
            description={`Original ${category.franchise} gear, from the fan hub's own shop.`}
            level={2}
          />
          {categoryMerch.length === 0 ? (
            <EmptyState title="No merchandise yet" description="Merchandise is added over time." />
          ) : (
            <Stack gap="lg">
              {merchHero && (
                <Card to={`/product/${merchHero.id}`} accent={accent} className={styles.featuredCard}>
                  <CardMedia>
                    <img src={merchHero.image.src} alt={merchHero.image.alt} loading="lazy" />
                  </CardMedia>
                  <CardHeader>
                    <h3>{merchHero.name}</h3>
                  </CardHeader>
                  <CardBody>
                    <p>{merchHero.description}</p>
                  </CardBody>
                  <CardFooter>
                    <span>
                      {merchHero.currency} {merchHero.priceRangeMin}–{merchHero.priceRangeMax}
                    </span>
                    <Badge tone="primary">Featured</Badge>
                    <Badge tone={merchHero.status === 'available' ? 'success' : 'neutral'}>
                      {merchHero.status}
                    </Badge>
                  </CardFooter>
                </Card>
              )}
              <Grid minItemWidth={220} gap="md">
                {merchProducts.map((item) => (
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
            </Stack>
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
