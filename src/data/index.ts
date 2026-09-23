/**
 * Typed access to the static content dataset. All imports below are
 * build-time static JSON — never fetched, never mutated at runtime
 * (docs/00_PROJECT_CONSTITUTION.md CR-001).
 *
 * Phase 1 note: every dataset here is SEED data for architecture
 * verification only (a handful of entries), not the full content
 * population required by docs/01_SRS_REQUIREMENTS.md (e.g. FR-019/FR-022
 * minimum-quantity requirements). Full population is Phase 5+.
 */
import categoriesData from './categories.json'
import articlesData from './articles.json'
import charactersData from './characters.json'
import eventsData from './events.json'
import merchandiseData from './merchandise.json'
import mediaData from './media.json'
import galleriesData from './galleries.json'
import releasesData from './releases.json'
import faqsData from './faqs.json'
import chatbotData from './chatbot.json'

import type {
  Category,
  Article,
  Character,
  EventItem,
  MerchandiseItem,
  MediaItem,
  Gallery,
  Release,
  Faq,
  ChatbotConfig,
} from '../types/content'

export const categories = categoriesData as Category[]
export const articles = articlesData as Article[]
export const characters = charactersData as Character[]
export const events = eventsData as EventItem[]
export const merchandise = merchandiseData as MerchandiseItem[]
export const media = mediaData as MediaItem[]
export const galleries = galleriesData as Gallery[]
export const releases = releasesData as Release[]
export const faqs = faqsData as Faq[]
export const chatbotConfig = chatbotData as ChatbotConfig

export function getCategoryById(id: string): Category | undefined {
  return categories.find((category) => category.id === id)
}
