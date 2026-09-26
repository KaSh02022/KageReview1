import type { CategoryId } from '../types/content'
import type { QuizAnswer, QuizOption, QuizOutcome, QuizQuestion, QuizScoredCategory } from '../types/quiz'

const ALL_CATEGORY_IDS: CategoryId[] = [
  'anime',
  'gaming',
  'movies',
  'tv-shows',
  'kpop',
  'comics',
  'manga',
]

function findOption(questions: QuizQuestion[], answer: QuizAnswer): QuizOption | undefined {
  return questions
    .find((question) => question.id === answer.questionId)
    ?.options.find((option) => option.id === answer.optionId)
}

/** Total points every category has actually earned from the given answers. */
function computeScores(questions: QuizQuestion[], answers: QuizAnswer[]): Record<CategoryId, number> {
  const scores = Object.fromEntries(ALL_CATEGORY_IDS.map((id) => [id, 0])) as Record<CategoryId, number>
  for (const answer of answers) {
    const option = findOption(questions, answer)
    if (!option) continue
    for (const [categoryId, points] of Object.entries(option.scores)) {
      scores[categoryId as CategoryId] += points ?? 0
    }
  }
  return scores
}

/** The most any category could have earned across this question set — the percentage denominator. */
function computeMaxPossible(questions: QuizQuestion[]): Record<CategoryId, number> {
  const max = Object.fromEntries(ALL_CATEGORY_IDS.map((id) => [id, 0])) as Record<CategoryId, number>
  for (const category of ALL_CATEGORY_IDS) {
    max[category] = questions.reduce((sum, question) => {
      const best = Math.max(0, ...question.options.map((option) => option.scores[category] ?? 0))
      return sum + best
    }, 0)
  }
  return max
}

/**
 * Deterministic tie-break, in order — never Math.random():
 *  1. Highest total score wins.
 *  2. If tied, walk the answers backward (most recent question first) and
 *     award it to whichever tied category that specific answer favoured.
 *  3. If still tied (e.g. identical scores on every question, or on zero
 *     answers), fall back to the fixed `tieBreakPriority` order.
 */
function compareCategories(
  a: CategoryId,
  b: CategoryId,
  scores: Record<CategoryId, number>,
  questions: QuizQuestion[],
  answers: QuizAnswer[],
  tieBreakPriority: CategoryId[],
): number {
  if (scores[b] !== scores[a]) return scores[b] - scores[a]

  for (let i = answers.length - 1; i >= 0; i--) {
    const option = findOption(questions, answers[i])
    if (!option) continue
    const pointsA = option.scores[a] ?? 0
    const pointsB = option.scores[b] ?? 0
    if (pointsA !== pointsB) return pointsB - pointsA
  }

  return tieBreakPriority.indexOf(a) - tieBreakPriority.indexOf(b)
}

/**
 * Scores every category from the given answers and ranks all 7 — same
 * `questions`/`answers`/`tieBreakPriority` in, same ranking out, always.
 */
export function scoreQuiz(
  questions: QuizQuestion[],
  answers: QuizAnswer[],
  tieBreakPriority: CategoryId[],
): QuizOutcome {
  const scores = computeScores(questions, answers)
  const maxPossible = computeMaxPossible(questions)

  const ranked = [...ALL_CATEGORY_IDS].sort((a, b) =>
    compareCategories(a, b, scores, questions, answers, tieBreakPriority),
  )

  const scoredCategories: QuizScoredCategory[] = ranked.map((categoryId) => ({
    categoryId,
    score: scores[categoryId],
    percentage: maxPossible[categoryId] > 0 ? Math.round((scores[categoryId] / maxPossible[categoryId]) * 100) : 0,
  }))

  return {
    primary: scoredCategories[0],
    topThree: scoredCategories.slice(0, 3),
  }
}
