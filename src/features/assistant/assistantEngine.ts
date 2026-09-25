import { chatbotConfig, getCategoryById, characters } from '../../data'
import type { CategoryId, ChatbotRule } from '../../types/content'

export interface AssistantContext {
  /** The world the visitor is currently standing in, if any. */
  categoryId?: CategoryId
}

export interface AssistantReply {
  ruleId: string | null
  text: string
  quickReplies: string[]
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

export function getWelcome(context: AssistantContext): AssistantReply {
  return {
    ruleId: null,
    text: fillTokens(chatbotConfig.welcomeMessage, context),
    quickReplies: chatbotConfig.quickRepliesStart ?? [],
  }
}

export function respond(input: string, context: AssistantContext = {}): AssistantReply {
  const rule = matchRule(input)
  if (!rule) {
    return {
      ruleId: null,
      text: fillTokens(chatbotConfig.defaultFallback, context),
      quickReplies: chatbotConfig.quickRepliesStart ?? [],
    }
  }
  return {
    ruleId: rule.id,
    text: fillTokens(rule.response, context),
    quickReplies: (rule.quickReplies ?? []).map((reply: string) => fillTokens(reply, context)),
  }
}
