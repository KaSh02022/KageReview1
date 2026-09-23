import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Card, CardHeader, CardBody } from './Card'

describe('Card', () => {
  it('renders composed content', () => {
    render(
      <Card>
        <CardHeader>
          <h3>Sample Article</h3>
        </CardHeader>
        <CardBody>A short summary.</CardBody>
      </Card>,
    )
    expect(screen.getByRole('heading', { name: 'Sample Article' })).toBeInTheDocument()
    expect(screen.getByText('A short summary.')).toBeInTheDocument()
  })

  it('renders as a single accessible link when `to` is provided, not a div full of nested links', () => {
    render(
      <MemoryRouter>
        <Card to="/article/sample">
          <CardHeader>
            <h3>Sample Article</h3>
          </CardHeader>
        </Card>
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /Sample Article/i })
    expect(link).toHaveAttribute('href', '/article/sample')
  })

  it('applies the category accent as a CSS custom property', () => {
    render(
      <MemoryRouter>
        <Card to="/x" accent="var(--color-accent-anime)" data-testid="accent-card">
          <CardHeader>
            <h3>Accent</h3>
          </CardHeader>
        </Card>
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: 'Accent' })
    expect(link.style.getPropertyValue('--card-accent')).toBe('var(--color-accent-anime)')
  })
})
