import { chatbotConfig, getCategoryById, categories, characters } from '../../data'
import { CATEGORY_ROUTES } from '../../routes/categoryRoutes'
import type { CategoryId, ChatbotRule, ChatbotRuleLink } from '../../types/content'

export interface AssistantContext {
  /** The world the visitor is currently standing in, if any. */
  categoryId?: CategoryId
}

/** A resolved, ready-to-render quick action — a path the UI can navigate to and a label to show on the button. */
export interface AssistantLink {
  path: string
  label: string
}

export interface AssistantReply {
  ruleId: string | null
  text: string
  quickReplies: string[]
  link?: AssistantLink
}

/**
 * The rule-based assistant, as the SRS asks for: pre-scripted and local.
 *
 * It is a pure function of (input, context) — no network, no API key, no
 * service, and no randomness, so the same question always produces the same
 * answer and the whole thing is testable without rendering anything.
 *
 * Responses live in `src/data/chatbot.json`, not in JSX. Adding an answer is a
 * data edit; the component below never grows another branch.
 */

/** Lowercase, strip punctuation, collapse whitespace. */
function normalise(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * The most *specific* match wins, measured by pattern length, so "what is
 * fandomverse" beats the bare "what is this". Ties keep the authored order,
 * which keeps the choice deterministic rather than dependent on iteration
 * accidents.
 */
export function matchRule(input: string, rules: ChatbotRule[] = chatbotConfig.rules): ChatbotRule | null {
  const haystack = normalise(input)
  if (!haystack) return null

  let best: { rule: ChatbotRule; length: number } | null = null
  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      const needle = normalise(pattern)
      if (!needle || !haystack.includes(needle)) continue
      if (!best || needle.length > best.length) best = { rule, length: needle.length }
    }
  }
  return best?.rule ?? null
}

/**
 * `{world}` and `{lead}` let one authored line serve all seven worlds instead
 * of seven near-identical rules. Off a category route "this world" keeps the
 * sentence grammatical without claiming a category the visitor is not in.
 */
export function fillTokens(template: string, context: AssistantContext): string {
  const category = context.categoryId ? getCategoryById(context.categoryId) : undefined
  const lead = context.categoryId
    ? characters.find((character) => character.categoryId === context.categoryId)
    : undefined

  return template
    .replace(/\{world\}/g, category ? category.name : 'FandomVerse')
    .replace(/\{lead\}/g, lead ? lead.name : 'its lead character')
}

/** Turns an authored `linkTo` into a real path + label the UI can act on. */
function resolveLink(linkTo: ChatbotRuleLink | undefined): AssistantLink | undefined {
  if (!linkTo) return undefined
  if (linkTo.type === 'category') {
    const category = getCategoryById(linkTo.id)
    const route = CATEGORY_ROUTES.find((item) => item.categoryId === linkTo.id)
    if (!category || !route) return undefined
    return { path: `/${route.path}`, label: linkTo.label ?? `Go to ${category.name}` }
  }
  if (linkTo.type === 'route') {
    return { path: linkTo.id, label: linkTo.label ?? 'Open' }
  }
  // article/character/event/merchandise item-level links aren't resolved
  // yet — nothing currently authors one, and per-item routing would need a
  // lookup across four different collections for no current use case.
  return undefined
}

const CATEGORY_NAV_INTENT = ['show', 'go to', 'take me', 'open', 'visit', 'jump to', 'view', 'category']

/**
 * Fallback for "show me the anime category"-style requests: rather than
 * one near-duplicate static rule per world (7x), this scans the input for
 * any category name alongside a navigation-intent word and links straight
 * to that hub. Only runs when no static rule already matched, so it can
 * never shadow an authored rule.
 */
function detectCategoryLinkRequest(input: string): CategoryId | undefined {
  const haystack = normalise(input)
  if (!haystack) return undefined
  const hasIntent = CATEGORY_NAV_INTENT.some((word) => haystack.includes(normalise(word)))
  if (!hasIntent) return undefined

  for (const category of categories) {
    // `id`, `slug` and `name` cover both hyphenated ("k-pop"/"tv-shows")
    // and bare ("kpop") phrasing without a hand-authored alias list.
    const candidates = [category.id, category.slug, category.name]
    if (candidates.some((candidate) => haystack.includes(normalise(candidate)))) {
      return category.id
    }
  }
  return undefined
}

export function getWelcome(context: AssistantContext): AssistantReply {
  return {
    ruleId: null,
    text: fillTokens(chatbotConfig.welcomeMessage, context),
    quickReplies: chatbotConfig.quickRepliesStart ?? [],
  }
}

export function respond(input: string, context: AssistantContext = {}): AssistantReply {
  const rule = matchRule(input)
  if (rule) {
    return {
      ruleId: rule.id,
      text: fillTokens(rule.response, context),
      quickReplies: (rule.quickReplies ?? []).map((reply: string) => fillTokens(reply, context)),
      link: resolveLink(rule.linkTo),
    }
  }

  const categoryId = detectCategoryLinkRequest(input)
  if (categoryId) {
    const category = getCategoryById(categoryId)
    const route = CATEGORY_ROUTES.find((item) => item.categoryId === categoryId)
    if (category && route) {
      return {
        ruleId: null,
        text: `Here's the ${category.name} hub — hero art, a featured story, more articles and merchandise, all in one place.`,
        quickReplies: ['What can I buy?', 'Which fandom should I explore?'],
        link: { path: `/${route.path}`, label: `Go to ${category.name}` },
      }
    }
  }

  return {
    ruleId: null,
    text: fillTokens(chatbotConfig.defaultFallback, context),
    quickReplies: chatbotConfig.quickRepliesStart ?? [],
  }
}
