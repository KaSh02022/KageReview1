import { test, expect } from '@playwright/test'
import { AxeBuilder } from '@axe-core/playwright'

/**
 * Focused E2E coverage for the Fandom Quiz / Discovery feature
 * (2026-09-26): the main intro → 12 questions → result → explore/retake
 * flow, exercised through a real browser. Unit/component coverage for the
 * scoring engine and question data lives in src/utils/quizEngine.test.ts
 * and src/pages/FandomQuizPage.test.tsx — this suite is about the flow
 * actually working end to end, not re-testing the scoring logic.
 */

const TOTAL_QUESTIONS = 12

test('completes the full Fandom Quiz flow: intro → 12 questions → result → explore', async ({ page }) => {
  await page.goto('/#/quiz')

  // Intro
  await expect(page.getByRole('heading', { name: /which fandom universe fits you/i })).toBeVisible()
  await expect(page.getByText(new RegExp(`${TOTAL_QUESTIONS} questions`, 'i'))).toBeVisible()
  await page.getByRole('button', { name: /start quiz/i }).click()

  // 12 questions — always pick the first option, so the deterministic
  // result is known (the anime-primary option every time).
  for (let questionNumber = 1; questionNumber <= TOTAL_QUESTIONS; questionNumber++) {
    await expect(page.getByText(new RegExp(`question ${questionNumber} of ${TOTAL_QUESTIONS}`, 'i'))).toBeVisible()
    const options = page.getByRole('group').getByRole('button')
    await expect(options).toHaveCount(7)
    await options.first().click()

    const isLast = questionNumber === TOTAL_QUESTIONS
    await page.getByRole('button', { name: isLast ? /see my result/i : /^next/i }).click()
  }

  // Result
  await expect(page.getByRole('heading', { name: /^anime$/i })).toBeVisible()
  await expect(page.getByText(/fandom match/i)).toBeVisible()
  await expect(page.getByText('100%')).toBeVisible()
  await expect(page.getByText(/your other matches/i)).toBeVisible()

  // HashRouter renders relative hash hrefs ("#/anime"), not real paths —
  // matches the pattern deep-links.spec.ts navigates with directly.
  const exploreLink = page.getByRole('link', { name: /explore anime/i })
  await expect(exploreLink).toBeVisible()
  await expect(exploreLink).toHaveAttribute('href', '#/anime')

  // Retake Quiz
  await page.getByRole('button', { name: /retake quiz/i }).click()
  await expect(page.getByText(new RegExp(`question 1 of ${TOTAL_QUESTIONS}`, 'i'))).toBeVisible()
  await expect(page.getByRole('button', { name: /^next/i })).toBeDisabled()
})

test('the Fandom Quiz entry point is reachable from the footer Discover navigation', async ({ page }) => {
  await page.goto('/#/anime')
  const discoverNav = page.getByRole('navigation', { name: /discover/i })
  await discoverNav.getByRole('link', { name: /fandom quiz/i }).click()
  await expect(page).toHaveURL(/#\/quiz$/)
  await expect(page.getByRole('heading', { name: /which fandom universe fits you/i })).toBeVisible()
})

test('the Explore button navigates to the real category route', async ({ page }) => {
  await page.goto('/#/quiz')
  await page.getByRole('button', { name: /start quiz/i }).click()

  for (let questionNumber = 1; questionNumber <= TOTAL_QUESTIONS; questionNumber++) {
    const options = page.getByRole('group').getByRole('button')
    await options.first().click()
    const isLast = questionNumber === TOTAL_QUESTIONS
    await page.getByRole('button', { name: isLast ? /see my result/i : /^next/i }).click()
  }

  await page.getByRole('link', { name: /explore anime/i }).click()
  await expect(page).toHaveURL(/#\/anime$/)
  await expect(page.getByRole('heading', { level: 1, name: /^anime$/i })).toBeVisible()
})

test('the quiz intro and question screens have no critical or serious axe violations', async ({ page }) => {
  await page.goto('/#/quiz')
  const introResults = await new AxeBuilder({ page }).analyze()
  const introViolations = introResults.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  )
  expect(introViolations, JSON.stringify(introViolations, null, 2)).toEqual([])

  await page.getByRole('button', { name: /start quiz/i }).click()
  const questionResults = await new AxeBuilder({ page }).analyze()
  const questionViolations = questionResults.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  )
  expect(questionViolations, JSON.stringify(questionViolations, null, 2)).toEqual([])
})
