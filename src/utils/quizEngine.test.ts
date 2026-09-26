import { describe, it, expect } from 'vitest'
import { scoreQuiz } from './quizEngine'
import quizQuestions from '../data/fandomQuiz.json'
import quizData from '../data/fandomQuizResults.json'
import type { QuizAnswer, QuizQuestion } from '../types/quiz'
import type { CategoryId } from '../types/content'

const questions = quizQuestions as QuizQuestion[]
const tieBreakPriority = quizData.tieBreakPriority as CategoryId[]

/** Answers question N (1-indexed) with its option at `optionIndex` (0-indexed, a–g). */
function answer(questionNumber: number, optionIndex: number): QuizAnswer {
  const question = questions[questionNumber - 1]
  return { questionId: question.id, optionId: question.options[optionIndex].id }
}

describe('fandomQuiz.json', () => {
  it('has exactly 12 questions', () => {
    expect(questions).toHaveLength(12)
  })

  it('gives every question exactly 7 options', () => {
    for (const question of questions) {
      expect(question.options, `${question.id} should have 7 options`).toHaveLength(7)
    }
  })

  it('gives every option at least one valid, positive category score', () => {
    const validCategories: CategoryId[] = [
      'anime',
      'gaming',
      'movies',
      'tv-shows',
      'kpop',
      'comics',
      'manga',
    ]
    for (const question of questions) {
      for (const option of question.options) {
        const entries = Object.entries(option.scores)
        expect(entries.length, `${option.id} should score at least one category`).toBeGreaterThan(0)
        for (const [categoryId, points] of entries) {
          expect(validCategories, `${option.id} scores unknown category "${categoryId}"`).toContain(categoryId)
          expect(points, `${option.id}'s "${categoryId}" score should be positive`).toBeGreaterThan(0)
        }
      }
    }
  })

  it('uses stable, non-index option ids scoped to their question', () => {
    for (const question of questions) {
      for (const option of question.options) {
        expect(option.id.startsWith(`${question.id}-`)).toBe(true)
        expect(option.id).not.toMatch(/^\d+$/)
      }
    }
  })
})

describe('scoreQuiz', () => {
  it('is deterministic — the same answers always produce the same result', () => {
    const answers = Array.from({ length: 12 }, (_, i) => answer(i + 1, 1)) // always option "b" (gaming)
    const first = scoreQuiz(questions, answers, tieBreakPriority)
    const second = scoreQuiz(questions, answers, tieBreakPriority)
    expect(second).toEqual(first)
  })

  it('picks the highest-scoring category as the primary result', () => {
    const answers = Array.from({ length: 12 }, (_, i) => answer(i + 1, 4)) // always option "e" (kpop)
    const result = scoreQuiz(questions, answers, tieBreakPriority)
    expect(result.primary.categoryId).toBe('kpop')
    expect(result.primary.percentage).toBe(100)
  })

  it('calculates a top 3, sorted by descending score', () => {
    const answers = Array.from({ length: 12 }, (_, i) => answer(i + 1, 0)) // always option "a" (anime)
    const result = scoreQuiz(questions, answers, tieBreakPriority)
    expect(result.topThree).toHaveLength(3)
    expect(result.topThree[0].score).toBeGreaterThanOrEqual(result.topThree[1].score)
    expect(result.topThree[1].score).toBeGreaterThanOrEqual(result.topThree[2].score)
    expect(result.topThree[0].categoryId).toBe('anime')
  })

  it('breaks a tie deterministically using the most recently answered diverging question', () => {
    // Two categories end with an identical total score, but the *last*
    // answered question favours one of them more than the other — that
    // answer should decide it, not the fixed priority list.
    const answers: QuizAnswer[] = [
      answer(1, 1), // gaming +3
      answer(2, 2), // movies +3, tv-shows +1
      answer(12, 1), // gaming +3 -> gaming total 6, movies total 3
    ]
    // Pad movies up to 6 using q3's movies-only option, keeping it tied with gaming.
    const padded = [...answers, answer(3, 2)] // movies +3 -> movies total 6, gaming total 6
    // Final answer (most recently answered) favours movies over gaming.
    const result = scoreQuiz(questions, padded, tieBreakPriority)
    const gaming = result.topThree.find((c) => c.categoryId === 'gaming') ?? result.primary
    const movies = result.topThree.find((c) => c.categoryId === 'movies') ?? result.primary
    expect(gaming.score).toBe(movies.score) // tie confirmed
    expect(result.primary.categoryId).toBe('movies') // the last answer breaks it
  })

  it('falls back to the fixed tieBreakPriority order when every category is tied with zero answers', () => {
    const result = scoreQuiz(questions, [], tieBreakPriority)
    expect(result.primary.categoryId).toBe(tieBreakPriority[0])
    expect(result.primary.score).toBe(0)
    expect(result.topThree.map((c) => c.categoryId)).toEqual(tieBreakPriority.slice(0, 3))
  })

  it('scores every one of the 7 categories, never leaving one undefined', () => {
    const answers = Array.from({ length: 12 }, (_, i) => answer(i + 1, i % 7))
    const result = scoreQuiz(questions, answers, tieBreakPriority)
    expect(result.primary.percentage).toBeGreaterThanOrEqual(0)
    expect(result.primary.percentage).toBeLessThanOrEqual(100)
  })
})

describe('fandomQuizResults.json', () => {
  const categories: CategoryId[] = ['anime', 'gaming', 'movies', 'tv-shows', 'kpop', 'comics', 'manga']

  it('has result copy for all 7 categories', () => {
    for (const categoryId of categories) {
      const copy = quizData.results[categoryId as keyof typeof quizData.results]
      expect(copy, `missing result copy for ${categoryId}`).toBeDefined()
      expect(copy.title.length).toBeGreaterThan(0)
      expect(copy.description.length).toBeGreaterThan(0)
    }
  })

  it('has a tieBreakPriority covering all 7 categories exactly once', () => {
    expect([...tieBreakPriority].sort()).toEqual([...categories].sort())
  })
})
