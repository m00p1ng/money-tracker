import { describe, expect, it } from 'vitest'
import { buildTransaction, validateDraft } from '../transactionForm'

describe('transactionForm', () => {
  it('rejects drafts without category items', () => {
    expect(validateDraft({ walletId: 'wallet-cash', items: [] })).toEqual(['Add at least one category'])
  })

  it('rejects drafts without walletId', () => {
    expect(validateDraft({ items: [{ categoryId: 'expense-food', amount: 28 }] })).toContain('Select a wallet')
  })

  it('rejects drafts with zero amount', () => {
    expect(validateDraft({ walletId: 'wallet-cash', items: [{ categoryId: 'expense-food', amount: 0 }] })).toContain('Enter an amount for every category')
  })

  it('accepts valid drafts', () => {
    expect(validateDraft({ walletId: 'wallet-cash', items: [{ categoryId: 'expense-food', amount: 28 }] })).toEqual([])
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

  it('uses provided id when given', () => {
    const transaction = buildTransaction({
      id: 'tx-provided',
      type: 'expense',
      walletId: 'wallet-cash',
      currency: 'THB',
      items: [{ categoryId: 'expense-food', amount: 28 }],
      date: '2026-05-22T10:30',
      note: 'latte',
      now: '2026-05-22T10:31:00.000Z',
      createId: () => 'tx-generated',
    })
    expect(transaction.id).toBe('tx-provided')
  })

  it('generates id when not provided', () => {
    const transaction = buildTransaction({
      type: 'expense',
      walletId: 'wallet-cash',
      currency: 'THB',
      items: [{ categoryId: 'expense-food', amount: 28 }],
      date: '2026-05-22T10:30',
      note: 'latte',
      now: '2026-05-22T10:31:00.000Z',
      createId: () => 'tx-generated',
    })
    expect(transaction.id).toBe('tx-generated')
  })

  it('trims note and falls back to undefined when empty', () => {
    const withSpaces = buildTransaction({
      type: 'expense',
      walletId: 'wallet-cash',
      currency: 'THB',
      items: [{ categoryId: 'expense-food', amount: 28 }],
      date: '2026-05-22T10:30',
      note: '  latte  ',
      now: '2026-05-22T10:31:00.000Z',
      createId: () => 'tx-1',
    })
    expect(withSpaces.note).toBe('latte')

    const empty = buildTransaction({
      type: 'expense',
      walletId: 'wallet-cash',
      currency: 'THB',
      items: [{ categoryId: 'expense-food', amount: 28 }],
      date: '2026-05-22T10:30',
      note: '   ',
      now: '2026-05-22T10:31:00.000Z',
      createId: () => 'tx-1',
    })
    expect(empty.note).toBeUndefined()
  })
})
