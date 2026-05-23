import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

import { useTransactionDraftStore } from '@/stores'


beforeEach(() => {
  useTransactionDraftStore.getState().clear()
})

describe('transactionDraftStore', () => {
  it('starts with null draft', () => {
    expect(useTransactionDraftStore.getState().draft).toBeNull()
  })

  it('init sets the draft', () => {
    useTransactionDraftStore.getState().init({
      type: 'expense',
      walletId: 'w1',
      items: [],
      focusedIndex: null,
      date: '2026-01-01T00:00',
      note: '',
      currency: 'THB',
      exchangeRate: '',
      toExchangeRate: '',
      repeatConfig: { preset: 'never' },
      transferAmount: 0,
    })
    expect(useTransactionDraftStore.getState().draft?.type).toBe('expense')
    expect(useTransactionDraftStore.getState().draft?.walletId).toBe('w1')
  })

  it('update patches the draft', () => {
    useTransactionDraftStore.getState().init({
      type: 'expense',
      walletId: 'w1',
      items: [],
      focusedIndex: null,
      date: '2026-01-01T00:00',
      note: '',
      currency: 'THB',
      exchangeRate: '',
      toExchangeRate: '',
      repeatConfig: { preset: 'never' },
      transferAmount: 0,
    })
    useTransactionDraftStore.getState().update({ note: 'coffee' })
    expect(useTransactionDraftStore.getState().draft?.note).toBe('coffee')
    expect(useTransactionDraftStore.getState().draft?.walletId).toBe('w1')
  })

  it('update does nothing when draft is null', () => {
    useTransactionDraftStore.getState().update({ note: 'nope' })
    expect(useTransactionDraftStore.getState().draft).toBeNull()
  })

  it('clear resets draft to null', () => {
    useTransactionDraftStore.getState().init({
      type: 'income',
      walletId: 'w2',
      items: [],
      focusedIndex: null,
      date: '2026-01-01T00:00',
      note: '',
      currency: 'THB',
      exchangeRate: '',
      toExchangeRate: '',
      repeatConfig: { preset: 'never' },
      transferAmount: 0,
    })
    useTransactionDraftStore.getState().clear()
    expect(useTransactionDraftStore.getState().draft).toBeNull()
  })
})
