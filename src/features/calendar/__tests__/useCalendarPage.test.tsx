import { act, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest'

import { useCategoryStore, useTransactionStore, useWalletStore } from '@/stores'
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
      items: [makeTx({ id: 'tx-1', date: `${y}-${m}-28T10:00`, status: 'planned' })],
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
        makeTx({ id: 'tx-2', date: `${y}-${m}-15T10:00`, status: 'planned' }),
      ],
    })
    const { result } = renderHook(() => useCalendarPage(), { wrapper })
    expect(result.current.indicatorMap[`${y}-${m}-15`]).toBe('both')
  })
})
