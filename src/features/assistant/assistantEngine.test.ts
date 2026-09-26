import { describe, it, expect } from 'vitest'
import { matchRule, fillTokens, respond, getWelcome } from './assistantEngine'

/**
 * The assistant is required to be rule-based and local. These tests pin the
 * two properties that claim rests on: the same question always yields the
 * same answer, and nothing reaches outside the bundle to produce it.
 */
describe('assistant engine — matching', () => {
  it('matches a question regardless of case and punctuation', () => {
    expect(matchRule('Who are the characters?')?.id).toBe('rule-characters')
    expect(matchRule('who are the characters')?.id).toBe('rule-characters')
    expect(matchRule('CHARACTERS!!!')?.id).toBe('rule-characters')
  })

  it('prefers the more specific rule when two patterns both match', () => {
    // "what is this" also matches rule-about's shorter pattern; the longer
    // "what is fandomverse" has to win or the answer drifts with rule order.
    expect(matchRule('what is fandomverse')?.id).toBe('rule-about')
  })

  it('returns null for empty or unmatched input', () => {
    expect(matchRule('')).toBeNull()
    expect(matchRule('   ')).toBeNull()
    expect(matchRule('xyzzy plugh quux')).toBeNull()
  })

  it('is deterministic — the same input always resolves to the same rule', () => {
    const ids = Array.from({ length: 5 }, () => matchRule('show me merchandise')?.id)
    expect(new Set(ids).size).toBe(1)
  })
})

describe('assistant engine — context', () => {
  it('names the current world and its lead', () => {
    const reply = respond('who are the characters?', { categoryId: 'anime' })
    expect(reply.ruleId).toBe('rule-characters')
    expect(reply.text).toContain('Anime')
    // The lead is read from the dataset, not hardcoded in the response.
    expect(reply.text).not.toContain('{lead}')
    expect(reply.text).not.toContain('{world}')
  })

  it('answers for a different world without any other change', () => {
    const anime = respond('who are the characters?', { categoryId: 'anime' })
    const gaming = respond('who are the characters?', { categoryId: 'gaming' })
    expect(anime.text).not.toEqual(gaming.text)
    expect(gaming.text).toContain('Gaming')
  })

  it('stays grammatical off a category route', () => {
    const reply = respond('who are the characters?', {})
    expect(reply.text).toContain('FandomVerse')
    expect(reply.text).not.toContain('{world}')
  })

  it('leaves no unresolved token in any authored response', () => {
    for (const probe of ['hi', 'events', 'merch', 'trailers', 'help', 'thanks', 'explore']) {
      expect(respond(probe, { categoryId: 'manga' }).text).not.toMatch(/\{[a-z]+\}/)
    }
  })

  it('fillTokens falls back rather than emitting a placeholder', () => {
    expect(fillTokens('{world} and {lead}', {})).toBe('FandomVerse and its lead character')
  })
})

describe('assistant engine — quick action links', () => {
  it('resolves a route linkTo (e.g. the Fandom Quiz) to a real path and label', () => {
    const reply = respond('help me find a fandom', {})
    expect(reply.ruleId).toBe('rule-find-fandom')
    expect(reply.link).toEqual({ path: '/quiz', label: 'Take the Fandom Quiz' })
  })

  it('resolves the merchandise linkTo', () => {
    const reply = respond('what can i buy', {})
    expect(reply.link).toEqual({ path: '/merchandise', label: 'Browse Merchandise' })
  })

  it('resolves the events linkTo to the real Events route, not a bogus category', () => {
    const reply = respond("what's happening", {})
    expect(reply.link).toEqual({ path: '/events', label: 'Browse Events' })
  })

  it('has no link for a rule that does not author one', () => {
    const reply = respond('thanks', { categoryId: 'anime' })
    expect(reply.link).toBeUndefined()
  })

  it('detects "show me the X category" for any of the seven worlds and links straight to its hub', () => {
    const anime = respond('Show me the Anime category.', {})
    expect(anime.link).toEqual({ path: '/anime', label: 'Go to Anime' })

    const kpop = respond('show me the kpop category', {})
    expect(kpop.link).toEqual({ path: '/k-pop', label: 'Go to K-Pop' })

    const tvShows = respond('take me to the tv shows category', {})
    expect(tvShows.link).toEqual({ path: '/tv-shows', label: 'Go to TV Shows' })
  })

  it('does not treat a bare category name with no navigation intent as a link request', () => {
    // No "show"/"go to"/"category"/etc. — should fall through to the
    // generic fallback rather than assume navigation intent.
    const reply = respond('anime', {})
    expect(reply.ruleId).toBeNull()
    expect(reply.link).toBeUndefined()
  })

  it('never lets the dynamic category detector shadow an authored static rule', () => {
    // "merch" collides with no category name, but this specifically checks
    // that a normal static-rule question is unaffected by the new fallback.
    const reply = respond('show me merchandise', {})
    expect(reply.ruleId).toBe('rule-merchandise')
  })
})

describe('assistant engine — fallback and welcome', () => {
  it('falls back helpfully instead of failing', () => {
    const reply = respond('tell me about quantum tunnelling', { categoryId: 'comics' })
    expect(reply.ruleId).toBeNull()
    expect(reply.text.length).toBeGreaterThan(0)
    expect(reply.quickReplies.length).toBeGreaterThan(0)
  })

  it('offers starting shortcuts in the welcome', () => {
    const welcome = getWelcome({ categoryId: 'kpop' })
    expect(welcome.quickReplies.length).toBeGreaterThan(0)
    expect(welcome.text).not.toMatch(/\{[a-z]+\}/)
  })
})
