import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders its children', () => {
    render(<Badge>upcoming</Badge>)
    expect(screen.getByText('upcoming')).toBeInTheDocument()
  })

  it('applies the requested tone and shape classes', () => {
    render(
      <Badge tone="success" shape="pill">
        3
      </Badge>,
    )
    const badge = screen.getByText('3')
    expect(badge.className).toMatch(/tone-success/)
    expect(badge.className).toMatch(/shape-pill/)
  })
})
