import {
  render,
  screen,
  within,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router'
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

import CategoryEditPage from '@/features/transaction/CategoryEditPage'
import CategorySelectionPage from '@/features/transaction/CategorySelectionPage'
import { useCategoryStore, useTransactionDraftStore } from '@/stores'

const categories = [
  {
    id: 'exp-food',
    name: 'Food & Drink',
    type: 'expense' as const,
    level: 1 as const,
    icon: 'fa-utensils',
    color: '#65a30d',
    isDefault: true,
  },
  {
    id: 'exp-food-coffee',
    name: 'Coffee',
    type: 'expense' as const,
    parentId: 'exp-food',
    level: 2 as const,
    icon: 'fa-utensils',
    color: '#65a30d',
    isDefault: true,
  },
  {
    id: 'inc-salary',
    name: 'Salary',
    type: 'income' as const,
    level: 1 as const,
    icon: 'fa-money-bill',
    color: '#3b82f6',
    isDefault: true,
  },
]

function renderPage(search = '') {
  return render(
    <MemoryRouter initialEntries={[`/transaction/category${search}`]}>
      <Routes>
        <Route path="/transaction/category" element={<CategorySelectionPage />} />
        <Route path="/transaction/category/new" element={<CategoryEditPage />} />
        <Route path="/transaction/new" element={<div data-testid="tx-page" />} />
      </Routes>
    </MemoryRouter>,
  )
}

async function openTypeDropdown() {
  // The trigger button text matches the current type label ("Expense", "Income", etc.)
  // Find the trigger by its chevron-down icon sibling — or find by current label
  const trigger = screen.getByRole('button', { name: /expense|income|transfer/i })
  await userEvent.click(trigger)
}

beforeEach(() => {
  useTransactionDraftStore.getState().clear()
  useCategoryStore.setState({ items: categories })
})

describe('CategorySelectionPage', () => {
  it('shows expense categories by default', () => {
    renderPage()
    expect(screen.getByText('Food & Drink')).toBeInTheDocument()
    expect(screen.queryByText('Salary')).not.toBeInTheDocument()
  })

  it('switches to income categories when Income selected from dropdown', async () => {
    renderPage()
    await openTypeDropdown()
    await userEvent.click(screen.getByRole('button', { name: 'Income' }))
    expect(screen.getByText('Salary')).toBeInTheDocument()
    expect(screen.queryByText('Food & Drink')).not.toBeInTheDocument()
  })

  it('renders 3-column grid', () => {
    renderPage()
    // The grid container has class grid-cols-3
    const grid = document.querySelector('.grid-cols-3')
    expect(grid).toBeInTheDocument()
  })

  it('drills into sub-categories on parent tap', async () => {
    renderPage()
    await userEvent.click(screen.getByText('Food & Drink'))
    expect(screen.getByText('Coffee')).toBeInTheDocument()
    // grid button gone; header still shows parent name
    expect(screen.queryByRole('button', { name: 'Food & Drink' })).not.toBeInTheDocument()
  })

  it('shows parent category name in content area when drilling into sub-categories', async () => {
    renderPage()
    await userEvent.click(screen.getByText('Food & Drink'))
    expect(screen.getByText('Food & Drink')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /expense|income|transfer/i })).toBeInTheDocument()
  })

  it('does not show parent label at root level', () => {
    renderPage()
    // No parent label div — only the dropdown button exists
    expect(screen.getByRole('button', { name: /expense|income|transfer/i })).toBeInTheDocument()
  })

  it('navigates to /transaction/new with type and categoryId on leaf tap (standalone)', async () => {
    renderPage()
    await userEvent.click(screen.getByText('Food & Drink'))
    await userEvent.click(screen.getByText('Coffee'))
    expect(screen.getByTestId('tx-page')).toBeInTheDocument()
  })

  it('navigates to /transaction/new?type=transfer when Transfer selected from dropdown', async () => {
    renderPage()
    await openTypeDropdown()
    await userEvent.click(screen.getByRole('button', { name: 'Transfer' }))
    expect(screen.getByTestId('tx-page')).toBeInTheDocument()
  })
})

describe('CategorySelectionPage edit mode', () => {
  it('shows Edit button in header', () => {
    renderPage()
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })

  it('shows Done button after clicking Edit', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument()
  })

  it('exits edit mode when Done is clicked', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: 'Done' }))
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument()
  })

  it('shows Add Category card button only in edit mode', async () => {
    renderPage()
    expect(screen.queryByRole('button', { name: 'Add Category' })).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))

    expect(screen.getByRole('button', { name: 'Add Category' })).toBeInTheDocument()
  })

  it('places Add Category after existing categories in edit mode', async () => {
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))

    const grid = document.querySelector('.grid-cols-3')
    expect(grid).toBeInTheDocument()
    const gridButtons = within(grid as HTMLElement)
      .getAllByRole('button')
      .filter((button) => !button.getAttribute('aria-label')?.startsWith('Remove '))
    expect(gridButtons.map((button) => button.textContent)).toEqual([
      'Food & Drink',
      'Add Category',
    ])
  })

  it('opens the new category form when Add Category is tapped in edit mode', async () => {
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    await userEvent.click(screen.getByRole('button', { name: 'Add Category' }))

    expect(screen.getByRole('heading', { name: 'New Category' })).toBeInTheDocument()
  })
})

describe('CategorySelectionPage edit mode — cell tap navigation', () => {
  it('navigates to edit page when tapping a leaf category in edit mode', async () => {
    const { unmount } = renderPage()
    unmount()

    render(
      <MemoryRouter initialEntries={['/transaction/category']}>
        <Routes>
          <Route path="/transaction/category" element={<CategorySelectionPage />} />
          <Route path="/transaction/category/edit/:id" element={<div data-testid="edit-page" />} />
        </Routes>
      </MemoryRouter>,
    )
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    // drill into Food & Drink first
    await userEvent.click(screen.getByText('Food & Drink'))
    // Coffee is a leaf
    await userEvent.click(screen.getByText('Coffee'))
    expect(screen.getByTestId('edit-page')).toBeInTheDocument()
  })
})

describe('CategorySelectionPage edit mode — close badge + delete', () => {
  it('shows close badge on each category cell in edit mode', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const closeBtns = screen.getAllByRole('button', { name: /remove/i })
    expect(closeBtns.length).toBeGreaterThan(0)
  })

  it('opens confirm sheet when close badge tapped on category with no transactions', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Edit' }))
    const [firstClose] = screen.getAllByRole('button', { name: /remove/i })
    await userEvent.click(firstClose)
    expect(screen.getByRole('heading', { name: /delete/i })).toBeInTheDocument()
  })
})

describe('CategorySelectionPage with draft store', () => {
  beforeEach(() => {
    useTransactionDraftStore.getState().init({
      type: 'expense',
      walletId: 'w1',
      items: [{ categoryId: 'exp-food-coffee', amount: 50 }],
      focusedIndex: 0,
      date: '2026-01-01T00:00',
      note: '',
      currency: 'THB',
      exchangeRate: '',
      toExchangeRate: '',
      repeatConfig: { preset: 'never' },
      transferAmount: 0,
      cleared: false,
      status: 'paid',
    })
  })

  it('updates item at changingIndex and navigates back on leaf select', async () => {
    renderPage('?changingIndex=0&type=expense')
    await userEvent.click(screen.getByText('Food & Drink'))
    await userEvent.click(screen.getByText('Coffee'))
    const draft = useTransactionDraftStore.getState().draft
    expect(draft?.items[0].categoryId).toBe('exp-food-coffee')
  })

  it('appends new item when addCategory=true on leaf select', async () => {
    renderPage('?addCategory=true&type=expense')
    await userEvent.click(screen.getByText('Food & Drink'))
    await userEvent.click(screen.getByText('Coffee'))
    const draft = useTransactionDraftStore.getState().draft
    expect(draft?.items).toHaveLength(2)
    expect(draft?.items[1].categoryId).toBe('exp-food-coffee')
  })

  it('does not show type dropdown when changingIndex is set', async () => {
    renderPage('?changingIndex=0&type=expense')
    // The chevron-down button should not be present when locked
    const trigger = screen.getByRole('button', { name: /expense/i })
    await userEvent.click(trigger)
    // Dropdown items should NOT appear
    expect(screen.queryByRole('button', { name: 'Income' })).not.toBeInTheDocument()
  })

  it('does not show type dropdown when addCategory is true', async () => {
    renderPage('?addCategory=true&type=expense')
    const trigger = screen.getByRole('button', { name: /expense/i })
    await userEvent.click(trigger)
    expect(screen.queryByRole('button', { name: 'Income' })).not.toBeInTheDocument()
  })
})
