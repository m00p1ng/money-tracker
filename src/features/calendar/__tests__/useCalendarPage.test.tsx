import { act, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest'

import {
  useCategoryStore,
  useTransactionStore,
  useWalletStore,
} from '@/stores'
import type { Transaction } from '@/types/domain'

import { useCalendarPage } from '../CalendarPage/useCalendarPage'

function makeTx(overrides: Partial<Transaction> & Pick<Transaction, 'id' | 'date'>): Transaction {
  return {
    type: 'expense',
    walletId: 'w1',
    currency: 'THB',
    items: [{ categoryId: 'cat1', amount: 100 }],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('useCalendarPage', () => {
  afterEach(() => {
    useTransactionStore.setState({ items: [] })
    useCategoryStore.setState({ items: [] })
    useWalletStore.setState({ items: [] })
  })

  it('defaults selectedDate to today', () => {
    const { result } = renderHook(() => useCalendarPage(), { wrapper })
    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    expect(result.current.selectedDate).toBe(`${y}-${m}-${d}`)
  })

  it('toggles selectedDate to null when tapping the already-selected date', () => {
    const { result } = renderHook(() => useCalendarPage(), { wrapper })
    const todayKey = result.current.selectedDate!
    act(() => result.current.onSelectDate(null))
    expect(result.current.selectedDate).toBeNull()
    act(() => result.current.onSelectDate(todayKey))
    expect(result.current.selectedDate).toBe(todayKey)
  })

  it('clears selectedDate when navigating to a different month', () => {
    const { result } = renderHook(() => useCalendarPage(), { wrapper })
    act(() => result.current.onNext())
    expect(result.current.selectedDate).toBeNull()
  })

  it('builds indicatorMap with transaction entry for a date with completed tx', () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    useTransactionStore.setState({
      items: [makeTx({ id: 'tx-1', date: `${y}-${m}-10T10:00` })],
    })
    const { result } = renderHook(() => useCalendarPage(), { wrapper })
    expect(result.current.indicatorMap[`${y}-${m}-10`]).toBe('transaction')
  })

  it('builds indicatorMap with upcoming entry for a planned tx', () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    useTransactionStore.setState({
      items: [makeTx({
        id: 'tx-1', date: `${y}-${m}-28T10:00`, status: 'planned',
      })],
    })
    const { result } = renderHook(() => useCalendarPage(), { wrapper })
    expect(result.current.indicatorMap[`${y}-${m}-28`]).toBe('upcoming')
  })

  it('sets indicatorMap to both when a date has both completed and upcoming', () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    useTransactionStore.setState({
      items: [
        makeTx({ id: 'tx-1', date: `${y}-${m}-15T10:00` }),
        makeTx({
          id: 'tx-2', date: `${y}-${m}-15T10:00`, status: 'planned',
        }),
      ],
    })
    const { result } = renderHook(() => useCalendarPage(), { wrapper })
    expect(result.current.indicatorMap[`${y}-${m}-15`]).toBe('both')
  })

  it('builds completed transaction rows like today transactions', () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    const selectedDate = `${y}-${m}-10`
    useCategoryStore.setState({
      items: [
        {
          id: 'expense-food-and-drink',
          name: 'Food & Drink',
          type: 'expense',
          level: 1,
          icon: 'fa-utensils',
          isDefault: true,
        },
        {
          id: 'cat1',
          name: 'Coffee',
          type: 'expense',
          parentId: 'expense-food-and-drink',
          level: 2,
          icon: 'fa-mug-hot',
          isDefault: true,
        },
        {
          id: 'cat2',
          name: 'Food',
          type: 'expense',
          parentId: 'expense-food-and-drink',
          level: 2,
          icon: 'fa-burger',
          isDefault: true,
        },
      ],
    })
    useTransactionStore.setState({
      items: [
        makeTx({
          id: 'tx-multiple-items',
          date: `${selectedDate}T10:00`,
          currency: 'USD',
          note: 'brunch',
          items: [
            { categoryId: 'cat1', amount: 10 },
            { categoryId: 'cat2', amount: 20 },
          ],
        }),
      ],
    })

    const { result } = renderHook(() => useCalendarPage(), { wrapper })
    act(() => result.current.onSelectDate(selectedDate))

    expect(result.current.listRows).toEqual([
      expect.objectContaining({
        key: 'tx-multiple-items',
        icon: 'fa-mug-hot',
        primaryLabel: 'Coffee, Food (brunch)',
        secondaryLabel: 'Food & Drink',
        amount: '-$30.00',
        amountColor: 'text-expense',
      }),
    ])
  })
})
