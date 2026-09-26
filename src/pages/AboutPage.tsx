import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { SectionHeader } from '../components/ui/SectionHeader/SectionHeader'
import { Stack } from '../components/ui/Layout/Stack'

/**
 * Team/institution copy is fixed, director-supplied content (2026-09-26,
 * "Complete About Us / Contact / Footer") — no member names, roles, or
 * personal emails are invented; only TECH4 as a group is credited.
 */
export function AboutPage() {
  return (
    <PagePlaceholder
      title="About FandomVerse"
      description="FandomVerse is a modern, interactive fandom discovery portal that brings Anime, Gaming, Movies, TV Shows, K-Pop, Comics and Manga into one place — built as a client-only Single Page Application with no backend, no server-side database, and no real e-commerce. Explore original stories and articles across all seven worlds, find your next fandom with the Fandom Quiz, and browse original merchandise for every category."
    >
      <Stack gap="md">
        <SectionHeader
          eyebrow="The team"
          title="Built by TECH4"
          description="FandomVerse is developed by TECH4, a student team at FPT Aptech, as a project exploring fandom discovery, content curation and interactive design."
          level={2}
        />
      </Stack>
    </PagePlaceholder>
  )
}
