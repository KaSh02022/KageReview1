import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FormField } from './FormField'
import { Input } from './Input'

describe('FormField', () => {
  it('associates the label with the control via a generated id', () => {
    render(
      <FormField label="Email">
        <Input type="email" />
      </FormField>,
    )
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
  })

  it('wires help text into aria-describedby', () => {
    render(
      <FormField label="Email" helpText="We'll never share this.">
        <Input type="email" />
      </FormField>,
    )
    const input = screen.getByLabelText('Email')
    const describedBy = input.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    expect(document.getElementById(describedBy as string)).toHaveTextContent("We'll never share this.")
  })

  it('marks the control invalid and surfaces the error as an alert', () => {
    render(
      <FormField label="Email" error="Enter a valid email">
        <Input type="email" />
      </FormField>,
    )
    const input = screen.getByLabelText('Email')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByRole('alert')).toHaveTextContent('Enter a valid email')
  })
})
