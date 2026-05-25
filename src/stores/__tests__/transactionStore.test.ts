import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

import { useTransactionStore } from '@/stores'
import type { Transaction } from '@/types/domain'

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

describe('transactionsByMonth', () => {
  afterEach(() => useTransactionStore.setState({ items: [] }))

  it('returns completed transactions in the given month', () => {
    useTransactionStore.setState({
      items: [
        makeTx({ id: 'tx-1', date: '2026-05-10T10:00' }),
        makeTx({ id: 'tx-2', date: '2026-04-10T10:00' }),
        makeTx({ id: 'tx-3', date: '2026-05-20T10:00', status: 'paid' }),
      ],
    })
    const result = useTransactionStore.getState().transactionsByMonth(2026, 4)
    expect(result.map((t) => t.id).sort()).toEqual(['tx-1', 'tx-3'])
  })

  it('excludes planned and overdue transactions', () => {
    useTransactionStore.setState({
      items: [
        makeTx({ id: 'tx-1', date: '2026-05-10T10:00', status: 'planned' }),
        makeTx({ id: 'tx-2', date: '2026-05-15T10:00', status: 'overdue' }),
        makeTx({ id: 'tx-3', date: '2026-05-20T10:00' }),
      ],
    })
    const result = useTransactionStore.getState().transactionsByMonth(2026, 4)
    expect(result.map((t) => t.id)).toEqual(['tx-3'])
  })

  it('returns results sorted newest first', () => {
    useTransactionStore.setState({
      items: [
        makeTx({ id: 'tx-1', date: '2026-05-01T10:00' }),
        makeTx({ id: 'tx-2', date: '2026-05-20T10:00' }),
      ],
    })
    const result = useTransactionStore.getState().transactionsByMonth(2026, 4)
    expect(result[0].id).toBe('tx-2')
    expect(result[1].id).toBe('tx-1')
  })
})

describe('upcomingByMonth', () => {
  afterEach(() => useTransactionStore.setState({ items: [] }))

  it('returns planned transactions in the given month', () => {
    useTransactionStore.setState({
      items: [
        makeTx({ id: 'tx-1', date: '2026-05-28T10:00', status: 'planned' }),
        makeTx({ id: 'tx-2', date: '2026-04-01T10:00', status: 'overdue' }),
        makeTx({ id: 'tx-3', date: '2026-05-10T10:00' }),
      ],
    })
    const result = useTransactionStore.getState().upcomingByMonth(2026, 4)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('tx-1')
  })

  it('includes overdue transactions in the given month', () => {
    useTransactionStore.setState({
      items: [
        makeTx({ id: 'tx-1', date: '2026-05-01T10:00', status: 'overdue' }),
      ],
    })
    const result = useTransactionStore.getState().upcomingByMonth(2026, 4)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('tx-1')
  })

  it('does NOT include overdue transactions from a different month', () => {
    useTransactionStore.setState({
      items: [
        makeTx({ id: 'tx-1', date: '2026-04-01T10:00', status: 'overdue' }),
      ],
    })
    const result = useTransactionStore.getState().upcomingByMonth(2026, 4)
    expect(result).toHaveLength(0)
  })
})
