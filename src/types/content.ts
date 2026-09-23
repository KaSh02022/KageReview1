/**
 * Domain types mirroring docs/05_DATA_SCHEMA.md. These describe the shape of
 * the static, read-only JSON content dataset — never a shape that gets
 * written back to disk at runtime (see docs/00_PROJECT_CONSTITUTION.md CR-001).
 */

export type CategoryId =
  | 'anime'
  | 'gaming'
  | 'movies'
  | 'tv-shows'
  | 'kpop'
  | 'comics'
  | 'manga'

export type ContentType =
  | 'article'
  | 'gallery'
  | 'video'
  | 'audio'
  | 'character'
  | 'event'
  | 'merchandise'

export interface AssetRef {
  src: string
  /** Required, non-empty unless the image is purely decorative (see 06_ASSET_BIBLE.md §6). */
  alt: string
  credit?: string
}

export interface Category {
  id: CategoryId
  name: string
  tagline: string
  accentColor: string
  heroImage: AssetRef
  description: string
}

export interface Article {
  id: string
  categoryId: CategoryId
  title: string
  thumbnail: AssetRef
  summary: string
  body: string
  tags: string[]
  publishedDate: string
  featured: boolean
  relatedIds: string[]
}

export interface Gallery {
  id: string
  categoryId: CategoryId
  title: string
  images: AssetRef[]
}

export type MediaKind = 'trailer' | 'interview' | 'podcast' | 'fan-content'
export type MediaFormat = 'video' | 'audio'
export type ReleaseStatus = 'upcoming' | 'recent' | 'archived'

export interface MediaItem {
  id: string
  categoryId: CategoryId
  title: string
  mediaType: MediaKind
  format: MediaFormat
  embedUrl: string
  thumbnail: AssetRef
  description: string
  releaseStatus: ReleaseStatus
  publishedDate: string
  tags: string[]
}

export interface Character {
  id: string
  categoryId: CategoryId
  name: string
  image: AssetRef
  series: string
  biography: string
  traits: string[]
  tags: string[]
}

export type EventType = 'convention' | 'watch-party' | 'meetup' | 'other'
export type EventStatus = 'past' | 'upcoming'

export interface EventItem {
  id: string
  categoryId: CategoryId
  title: string
  date: string
  location: string
  description: string
  eventType: EventType
  status: EventStatus
}

export interface MerchandiseItem {
  id: string
  categoryId: CategoryId
  name: string
  image: AssetRef
  priceRangeMin: number
  priceRangeMax: number
  currency: string
  description: string
  tags: string[]
}

export type ReleaseType =
  | 'game'
  | 'movie'
  | 'show'
  | 'album'
  | 'comic-issue'
  | 'manga-volume'
  | 'other'

export interface Release {
  id: string
  categoryId: CategoryId
  title: string
  releaseDate: string
  type: ReleaseType
  description: string
  coverImage: AssetRef
}

export interface Faq {
  id: string
  question: string
  answer: string
  category?: CategoryId
}

export interface ChatbotRuleLink {
  type: 'category' | 'article' | 'character' | 'event' | 'merchandise'
  id: string
}

export interface ChatbotRule {
  id: string
  patterns: string[]
  response: string
  quickReplies?: string[]
  linkTo?: ChatbotRuleLink
  recommendCategoryId?: CategoryId
}

export interface ChatbotConfig {
  welcomeMessage: string
  defaultFallback: string
  quickRepliesStart: string[]
  rules: ChatbotRule[]
}

/** Runtime state shapes — persisted per docs/05_DATA_SCHEMA.md §13. */

export type BookmarkContentType = 'article' | 'character' | 'event' | 'media'

export interface BookmarkEntry {
  contentType: BookmarkContentType
  contentId: string
  bookmarkedAt: string
}

export interface BookmarkNote {
  bookmarkKey: string
  note: string
}

export interface CartLineItem {
  merchandiseId: string
  quantity: number
}
