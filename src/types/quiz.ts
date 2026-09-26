import type { CategoryId } from './content'

/**
 * Fandom Quiz domain types — kept separate from content.ts, which mirrors
 * docs/05_DATA_SCHEMA.md's fan-content dataset specifically. The quiz is
 * app/feature data (never SRS-validated content), so it does not belong in
 * that contract.
 */

export interface QuizOption {
  id: string
  text: string
  /** Points this option contributes per category. Sparse — most options touch 1–2 of the 7. */
  scores: Partial<Record<CategoryId, number>>
}

export interface QuizQuestion {
  id: string
  question: string
  options: QuizOption[]
}

export interface QuizResultCopy {
  title: string
  description: string
}

export interface QuizData {
  tieBreakPriority: CategoryId[]
  results: Record<CategoryId, QuizResultCopy>
}

export interface QuizScoredCategory {
  categoryId: CategoryId
  score: number
  percentage: number
}

export interface QuizOutcome {
  primary: QuizScoredCategory
  topThree: QuizScoredCategory[]
}

/** One answered question, in the order it was answered — the order the tie-break recency rule walks backward through. */
export interface QuizAnswer {
  questionId: string
  optionId: string
}

export interface StoredQuizResult {
  categoryId: CategoryId
  score: number
  topThree: QuizScoredCategory[]
  timestamp: string
}
