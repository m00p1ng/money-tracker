import { describe, expect, it } from 'vitest'
import { deriveTransactionStatus, validateDraft, validateExchangeRate } from '../transactionForm'

describe('transaction status helpers', () => {
  const now = new Date('2026-05-23T10:00:00.000Z')

  it('derives paid when marked paid', () => {
    expect(deriveTransactionStatus({ date: '2026-05-24T10:00', markedPaid: true, now })).toBe('paid')
  })

  it('defaults to paid when markedPaid is omitted', () => {
    expect(deriveTransactionStatus({ date: '2026-05-24T10:00', now })).toBe('paid')
  })

  it('derives planned for unpaid future transactions', () => {
    expect(deriveTransactionStatus({ date: '2026-05-24T10:00', markedPaid: false, now })).toBe('planned')
  })

  it('derives overdue for unpaid current or past transactions', () => {
    expect(deriveTransactionStatus({ date: '2026-05-23T10:00:00.000Z', markedPaid: false, now })).toBe('overdue')
    expect(deriveTransactionStatus({ date: '2026-05-22T10:00', markedPaid: false, now })).toBe('overdue')
  })

  it('validates exchange rates with up to four decimals', () => {
    expect(validateExchangeRate(undefined)).toBe('Enter an exchange rate')
    expect(validateExchangeRate('36')).toBeUndefined()
    expect(validateExchangeRate('36.1234')).toBeUndefined()
    expect(validateExchangeRate('36.12345')).toBe('Enter an exchange rate with up to 4 decimals')
    expect(validateExchangeRate('0')).toBe('Enter a positive exchange rate')
    expect(validateExchangeRate('-1')).toBe('Enter a positive exchange rate')
    expect(validateExchangeRate('abc')).toBe('Enter a valid exchange rate')
    expect(validateExchangeRate('1e-5')).toBe('Enter a valid exchange rate')
    expect(validateExchangeRate('0x10')).toBe('Enter a valid exchange rate')
  })

  it('validates transfer draft requirements', () => {
    expect(
      validateDraft({
        type: 'transfer',
        walletId: 'wallet-thb',
        transferAmount: 25,
        items: [],
      }),
    ).toContain('Select a destination wallet')

    expect(
      validateDraft({
        type: 'transfer',
        walletId: 'wallet-thb',
        toWalletId: 'wallet-thb',
        transferAmount: 25,
        items: [],
      }),
    ).toContain('Choose a different destination wallet')

    expect(
      validateDraft({
        type: 'transfer',
        walletId: 'wallet-thb',
        toWalletId: 'wallet-usd',
        transferAmount: 0,
        items: [],
      }),
    ).toContain('Enter a transfer amount')

    expect(
      validateDraft({
        type: 'transfer',
        walletId: 'wallet-thb',
        toWalletId: 'wallet-usd',
        transferAmount: Number.NaN,
        items: [],
      }),
    ).toContain('Enter a transfer amount')

    expect(
      validateDraft({
        type: 'transfer',
        walletId: 'wallet-thb',
        toWalletId: 'wallet-usd',
        transferAmount: Number.POSITIVE_INFINITY,
        items: [],
      }),
    ).toContain('Enter a transfer amount')

    expect(
      validateDraft({
        type: 'transfer',
        walletId: 'wallet-thb',
        toWalletId: 'wallet-usd',
        transferAmount: 25,
        items: [],
      }),
    ).toEqual([])
  })
})
