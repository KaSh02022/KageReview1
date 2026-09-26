import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { FandomQuizPage } from './FandomQuizPage'
import quizQuestions from '../data/fandomQuiz.json'
import { STORAGE_KEYS } from '../utils/storage'
import type { QuizQuestion } from '../types/quiz'

const questions = quizQuestions as QuizQuestion[]

function renderQuiz() {
  return render(
    <MemoryRouter>
      <FandomQuizPage />
    </MemoryRouter>,
  )
}

/** Starts the quiz and answers the current question with its option at `optionIndex` (0-indexed). */
async function answerCurrentQuestion(user: ReturnType<typeof userEvent.setup>, optionIndex: number) {
  const optionsGroup = screen.getByRole('group')
  const optionButtons = within(optionsGroup).getAllByRole('button')
  await user.click(optionButtons[optionIndex])
}

/** Answers every remaining question (always the option at `optionIndex`) through to the result screen. */
async function completeQuiz(user: ReturnType<typeof userEvent.setup>, optionIndex = 0) {
  for (let i = 0; i < questions.length; i++) {
    await answerCurrentQuestion(user, optionIndex)
    const nextLabel = i === questions.length - 1 ? /see my result/i : /^next/i
    await user.click(screen.getByRole('button', { name: nextLabel }))
  }
}

describe('FandomQuizPage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('shows the intro screen first, with a Start Quiz call to action', () => {
    renderQuiz()
    expect(screen.getByRole('heading', { name: /which fandom universe fits you/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start quiz/i })).toBeInTheDocument()
  })

  it('loads all 12 questions, each with 7 selectable options', async () => {
    const user = userEvent.setup()
    renderQuiz()
    await user.click(screen.getByRole('button', { name: /start quiz/i }))

    for (let i = 0; i < questions.length; i++) {
      expect(screen.getByText(new RegExp(`question ${i + 1} of ${questions.length}`, 'i'))).toBeInTheDocument()
      const optionsGroup = screen.getByRole('group')
      expect(within(optionsGroup).getAllByRole('button')).toHaveLength(7)
      if (i < questions.length - 1) {
        await answerCurrentQuestion(user, 0)
        await user.click(screen.getByRole('button', { name: /^next/i }))
      }
    }
  })

  it('shows progress correctly as the user advances', async () => {
    const user = userEvent.setup()
    renderQuiz()
    await user.click(screen.getByRole('button', { name: /start quiz/i }))
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1')

    await answerCurrentQuestion(user, 0)
    await user.click(screen.getByRole('button', { name: /^next/i }))
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')
  })

  it('marks the selected option and disables Next until one is chosen', async () => {
    const user = userEvent.setup()
    renderQuiz()
    await user.click(screen.getByRole('button', { name: /start quiz/i }))

    expect(screen.getByRole('button', { name: /^next/i })).toBeDisabled()

    const optionsGroup = screen.getByRole('group')
    const firstOption = within(optionsGroup).getAllByRole('button')[0]
    await user.click(firstOption)

    expect(firstOption).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /^next/i })).toBeEnabled()
  })

  it('disables Back on question 1 and retains the previous answer when navigating back', async () => {
    const user = userEvent.setup()
    renderQuiz()
    await user.click(screen.getByRole('button', { name: /start quiz/i }))

    expect(screen.getByRole('button', { name: /back/i })).toBeDisabled()

    const q1Options = within(screen.getByRole('group')).getAllByRole('button')
    await user.click(q1Options[2]) // pick option index 2 on question 1
    await user.click(screen.getByRole('button', { name: /^next/i }))

    expect(screen.getByText(/question 2 of 12/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /back/i }))

    expect(screen.getByText(/question 1 of 12/i)).toBeInTheDocument()
    const q1OptionsAgain = within(screen.getByRole('group')).getAllByRole('button')
    expect(q1OptionsAgain[2]).toHaveAttribute('aria-pressed', 'true')
  })

  it('allows changing an earlier answer', async () => {
    const user = userEvent.setup()
    renderQuiz()
    await user.click(screen.getByRole('button', { name: /start quiz/i }))

    const q1Options = within(screen.getByRole('group')).getAllByRole('button')
    await user.click(q1Options[0])
    await user.click(q1Options[3])

    expect(q1Options[0]).toHaveAttribute('aria-pressed', 'false')
    expect(q1Options[3]).toHaveAttribute('aria-pressed', 'true')
  })

  it('reaches a deterministic result after all 12 questions, matching the answers given', async () => {
    const user = userEvent.setup()
    renderQuiz()
    await user.click(screen.getByRole('button', { name: /start quiz/i }))
    await completeQuiz(user, 4) // always the kpop-primary option

    expect(screen.getByRole('heading', { name: /k-pop/i })).toBeInTheDocument()
    expect(screen.getByText(/fandom match/i)).toBeInTheDocument()
    expect(screen.getByText('100%')).toBeInTheDocument()
  })

  it("points the Explore button at the matched category's real route", async () => {
    const user = userEvent.setup()
    renderQuiz()
    await user.click(screen.getByRole('button', { name: /start quiz/i }))
    await completeQuiz(user, 1) // always the gaming-primary option

    const exploreLink = screen.getByRole('link', { name: /explore gaming/i })
    expect(exploreLink).toHaveAttribute('href', '/gaming')
  })

  it('clears all state and returns to question 1 when Retake Quiz is clicked, without a page reload', async () => {
    const user = userEvent.setup()
    renderQuiz()
    await user.click(screen.getByRole('button', { name: /start quiz/i }))
    await completeQuiz(user, 0)

    await user.click(screen.getByRole('button', { name: /retake quiz/i }))

    expect(screen.getByText(/question 1 of 12/i)).toBeInTheDocument()
    const q1Options = within(screen.getByRole('group')).getAllByRole('button')
    for (const option of q1Options) {
      expect(option).toHaveAttribute('aria-pressed', 'false')
    }
    expect(screen.getByRole('button', { name: /^next/i })).toBeDisabled()
  })

  it('stores the latest result to localStorage on completion', async () => {
    const user = userEvent.setup()
    renderQuiz()
    await user.click(screen.getByRole('button', { name: /start quiz/i }))
    await completeQuiz(user, 0)

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.quizResult) ?? 'null')
    expect(stored).toMatchObject({ categoryId: 'anime' })
    expect(stored.topThree).toHaveLength(3)
    expect(typeof stored.timestamp).toBe('string')
  })
})
