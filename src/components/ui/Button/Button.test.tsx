import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from './Button'
import { IconButton } from './IconButton'

describe('Button', () => {
  it('renders its label and responds to click', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Add to cart</Button>)
    const button = screen.getByRole('button', { name: 'Add to cart' })
    await userEvent.click(button)
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('applies the requested variant and size classes', () => {
    render(
      <Button variant="danger" size="large">
        Remove
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Remove' })
    expect(button.className).toMatch(/variant-danger/)
    expect(button.className).toMatch(/size-large/)
  })

  it('is disabled and unclickable while loading', async () => {
    const onClick = vi.fn()
    render(
      <Button isLoading onClick={onClick}>
        Saving
      </Button>,
    )
    const button = screen.getByRole('button', { name: 'Saving' })
    expect(button).toBeDisabled()
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('respects an explicit disabled prop', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled()
  })
})

describe('IconButton', () => {
  it('requires and exposes an accessible name via the label prop', () => {
    render(<IconButton label="Close" icon="×" onClick={() => {}} />)
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('hides the icon from assistive tech (the label is the accessible name, not the icon text)', () => {
    render(<IconButton label="Open assistant" icon="💬" onClick={() => {}} />)
    const button = screen.getByRole('button', { name: 'Open assistant' })
    expect(button.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })
})
