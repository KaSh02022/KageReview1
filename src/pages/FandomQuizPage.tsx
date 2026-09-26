import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import quizQuestions from '../data/fandomQuiz.json'
import quizData from '../data/fandomQuizResults.json'
import { categories } from '../data'
import { CATEGORY_ROUTES } from '../routes/categoryRoutes'
import { scoreQuiz } from '../utils/quizEngine'
import { writeJson, STORAGE_KEYS } from '../utils/storage'
import { PagePlaceholder } from '../components/PagePlaceholder/PagePlaceholder'
import { SectionHeader } from '../components/ui/SectionHeader/SectionHeader'
import { Button } from '../components/ui/Button/Button'
import { Stack } from '../components/ui/Layout/Stack'
import buttonStyles from '../components/ui/Button/Button.module.css'
import type { CategoryId } from '../types/content'
import type { QuizAnswer, QuizOutcome, QuizQuestion, StoredQuizResult } from '../types/quiz'
import styles from './FandomQuizPage.module.css'

const questions = quizQuestions as QuizQuestion[]
const tieBreakPriority = quizData.tieBreakPriority as CategoryId[]
const TOTAL_QUESTIONS = questions.length

type Step = 'intro' | 'question' | 'result'

/**
 * Fandom Quiz / Fandom Discovery (2026-09-26). A personality/preference
 * discovery flow, not a knowledge test — its purpose is to point a visitor
 * at the one of the seven category hubs that best fits them, reusing the
 * existing hero art, routing and page chrome rather than introducing any
 * new visual system. See docs/FANDOMVERSE_KAGE_LANDING_WORKLOG.md,
 * "FANDOM QUIZ / DISCOVERY FEATURE".
 */
export function FandomQuizPage() {
  const [step, setStep] = useState<Step>('intro')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answersById, setAnswersById] = useState<Record<string, string>>({})

  const currentQuestion = questions[currentIndex]
  const selectedOptionId = currentQuestion ? answersById[currentQuestion.id] : undefined
  const isFirstQuestion = currentIndex === 0
  const isLastQuestion = currentIndex === TOTAL_QUESTIONS - 1

  // Answers in question order (q1 → q12) regardless of the order any earlier
  // answer was *changed* in — the deterministic shape the tie-break
  // recency rule (quizEngine.ts) walks backward through.
  const orderedAnswers: QuizAnswer[] = useMemo(
    () =>
      questions
        .filter((question) => answersById[question.id])
        .map((question) => ({ questionId: question.id, optionId: answersById[question.id] })),
    [answersById],
  )

  const result: QuizOutcome | undefined = useMemo(() => {
    if (step !== 'result') return undefined
    return scoreQuiz(questions, orderedAnswers, tieBreakPriority)
  }, [step, orderedAnswers])

  useEffect(() => {
    if (!result) return
    const stored: StoredQuizResult = {
      categoryId: result.primary.categoryId,
      score: result.primary.score,
      topThree: result.topThree,
      timestamp: new Date().toISOString(),
    }
    writeJson('local', STORAGE_KEYS.quizResult, stored)
  }, [result])

  const selectOption = (optionId: string) => {
    setAnswersById((prev) => ({ ...prev, [currentQuestion.id]: optionId }))
  }

  const goBack = () => {
    if (isFirstQuestion) return
    setCurrentIndex((index) => index - 1)
  }

  const goNext = () => {
    if (!selectedOptionId) return
    if (isLastQuestion) {
      setStep('result')
      return
    }
    setCurrentIndex((index) => index + 1)
  }

  const startQuiz = () => {
    setCurrentIndex(0)
    setStep('question')
  }

  const retakeQuiz = () => {
    setAnswersById({})
    setCurrentIndex(0)
    setStep('question')
  }

  return (
    <PagePlaceholder
      title="Fandom Quiz"
      description="A short discovery quiz — not a trivia test — to help you find the FandomVerse world that matches how you actually like to fan out."
    >
      {step === 'intro' && <IntroStep onStart={startQuiz} />}
      {step === 'question' && currentQuestion && (
        <QuestionStep
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          totalQuestions={TOTAL_QUESTIONS}
          selectedOptionId={selectedOptionId}
          isFirstQuestion={isFirstQuestion}
          isLastQuestion={isLastQuestion}
          onSelect={selectOption}
          onBack={goBack}
          onNext={goNext}
        />
      )}
      {step === 'result' && result && <ResultStep result={result} onRetake={retakeQuiz} />}
    </PagePlaceholder>
  )
}

function IntroStep({ onStart }: { onStart: () => void }) {
  return (
    <Stack gap="lg" className={styles.intro}>
      <SectionHeader
        eyebrow="Fandom Quiz"
        title="Which Fandom Universe Fits You?"
        description="Discover the fandom category that best matches your interests, personality and entertainment preferences."
      />
      <p className={styles.introMeta}>{TOTAL_QUESTIONS} questions · Takes about 2 minutes</p>
      <Button variant="primary" size="large" onClick={onStart}>
        Start Quiz
      </Button>
    </Stack>
  )
}

interface QuestionStepProps {
  question: QuizQuestion
  questionNumber: number
  totalQuestions: number
  selectedOptionId: string | undefined
  isFirstQuestion: boolean
  isLastQuestion: boolean
  onSelect: (optionId: string) => void
  onBack: () => void
  onNext: () => void
}

function QuestionStep({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionId,
  isFirstQuestion,
  isLastQuestion,
  onSelect,
  onBack,
  onNext,
}: QuestionStepProps) {
  const headingId = `${question.id}-heading`
  const progressPercent = Math.round((questionNumber / totalQuestions) * 100)

  return (
    <Stack gap="lg" className={styles.question}>
      <div>
        <p className={styles.progressLabel}>
          Question {questionNumber} of {totalQuestions}
        </p>
        <div
          className={styles.progressTrack}
          role="progressbar"
          aria-valuenow={questionNumber}
          aria-valuemin={1}
          aria-valuemax={totalQuestions}
          aria-label={`Quiz progress: question ${questionNumber} of ${totalQuestions}`}
        >
          <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <h2 id={headingId} className={styles.questionText}>
        {question.question}
      </h2>

      <div role="group" aria-labelledby={headingId} className={styles.options}>
        {question.options.map((option) => {
          const selected = option.id === selectedOptionId
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              className={`${styles.option} ${selected ? styles.optionSelected : ''}`}
              onClick={() => onSelect(option.id)}
            >
              <span className={styles.optionCheck} aria-hidden="true">
                {selected ? '✓' : ''}
              </span>
              <span>{option.text}</span>
            </button>
          )
        })}
      </div>

      <Stack direction="row" justify="between" className={styles.navRow}>
        <Button variant="ghost" onClick={onBack} disabled={isFirstQuestion}>
          ← Back
        </Button>
        <Button variant="primary" onClick={onNext} disabled={!selectedOptionId}>
          {isLastQuestion ? 'See My Result' : 'Next →'}
        </Button>
      </Stack>
    </Stack>
  )
}

function ResultStep({ result, onRetake }: { result: QuizOutcome; onRetake: () => void }) {
  const category = categories.find((item) => item.id === result.primary.categoryId)
  const route = CATEGORY_ROUTES.find((item) => item.categoryId === result.primary.categoryId)
  const copy = quizData.results[result.primary.categoryId as keyof typeof quizData.results]
  const otherMatches = result.topThree.slice(1)
  const accent = category ? `var(${category.accentColor})` : undefined

  if (!category || !route) {
    // Every categoryId scoreQuiz can return comes from the same fixed list
    // categories.json and CATEGORY_ROUTES both cover — this only trips if
    // that invariant is ever broken.
    return (
      <SectionHeader
        eyebrow="Your Fandom Is"
        title="Result unavailable"
        description="Something went wrong matching your answers to a category. Please retry the quiz."
      />
    )
  }

  return (
    <Stack gap="xl" className={styles.result} style={{ '--result-accent': accent } as CSSProperties}>
      <SectionHeader eyebrow="Your Fandom Is…" title={category.name} description={copy?.title} />

      <div className={styles.resultHero}>
        <img
          src={category.heroImage.src}
          alt={category.heroImage.alt}
          loading="lazy"
          className={styles.resultHeroImage}
        />
        <div className={styles.resultMatch}>
          <p className={styles.matchLabel}>Fandom Match</p>
          <p className={styles.matchPercent}>{result.primary.percentage}%</p>
        </div>
      </div>

      {copy?.description && <p className={styles.resultDescription}>{copy.description}</p>}

      {otherMatches.length > 0 && (
        <div>
          <h3 className={styles.otherMatchesHeading}>Your Other Matches</h3>
          <Stack gap="sm">
            {otherMatches.map((match) => {
              const matchCategory = categories.find((item) => item.id === match.categoryId)
              return (
                <div key={match.categoryId} className={styles.otherMatchRow}>
                  <span>{matchCategory?.name ?? match.categoryId}</span>
                  <span>{match.percentage}%</span>
                </div>
              )
            })}
          </Stack>
        </div>
      )}

      <Stack direction="row" wrap gap="md">
        {/* The ui Link component's own tone-primary text color (the same
            blue as variant-primary's background) makes text invisible when
            the two are combined — react-router's plain Link avoids that
            collision and picks up Button's colors cleanly instead. */}
        <RouterLink
          to={`/${route.path}`}
          className={`${buttonStyles.button} ${buttonStyles['variant-primary']} ${buttonStyles['size-large']} ${styles.exploreButton}`}
        >
          Explore {category.name}
        </RouterLink>
        <Button variant="outline" size="large" onClick={onRetake}>
          Retake Quiz
        </Button>
      </Stack>
    </Stack>
  )
}
