import { describe, expect, it } from 'vitest'
import { buildTransaction, validateDraft } from '../transactionForm'

describe('transactionForm', () => {
  it('rejects drafts without category items', () => {
    expect(validateDraft({ walletId: 'wallet-cash', items: [] })).toEqual(['Add at least one category'])
  })

  it('builds a transaction object for saving', () => {
    const transaction = buildTransaction({
      id: undefined,
      type: 'expense',
      walletId: 'wallet-cash',
      currency: 'THB',
      items: [{ categoryId: 'expense-food-and-drink-coffee', amount: 28 }],
      date: '2026-05-22T10:30',
      note: 'latte',
      now: '2026-05-22T10:31:00.000Z',
      createId: () => 'tx-1',
    })

    expect(transaction).toMatchObject({
      id: 'tx-1',
      type: 'expense',
      walletId: 'wallet-cash',
      currency: 'THB',
      createdAt: '2026-05-22T10:31:00.000Z',
    })
    expect(transaction.items[0].amount).toBe(28)
  })
})
