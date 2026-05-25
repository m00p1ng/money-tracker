import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import type { Category } from '@/types/domain'

import { CategoryFormPage } from '../CategoryFormPage'

type SetError = (err: string | null) => void

const existingCategory: Category = {
  id: 'cat-1',
  name: 'Food',
  type: 'expense',
  level: 1,
  icon: 'fa-utensils',
  color: '#65a30d',
  isDefault: false,
}

function renderPage(props: Partial<React.ComponentProps<typeof CategoryFormPage>> = {}) {
  const onSubmit = vi.fn<(form: Category, setError: SetError) => Promise<void>>(async () => {})
  const onDelete = vi.fn<(setError: SetError) => Promise<void>>(async () => {})
  const onBack = vi.fn()

  render(
    <CategoryFormPage
      existing={undefined}
      categories={[]}
      onBack={onBack}
      onSubmit={onSubmit}
      onDelete={onDelete}
      {...props}
    />,
  )

  return { onSubmit, onDelete, onBack }
}

describe('CategoryFormPage', () => {
  it('renders new category form', () => {
    renderPage()
    expect(screen.getByText('New Category')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /icon/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('renders edit mode with delete button', () => {
    renderPage({ existing: existingCategory })
    expect(screen.getByText('Edit Category')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('opens icon picker when icon field is tapped', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /icon/i }))
    expect(screen.getByRole('heading', { name: 'Icon' })).toBeInTheDocument()
  })

  it('submits with selected icon', async () => {
    const { onSubmit } = renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ icon: 'fa-circle' })
  })
})
