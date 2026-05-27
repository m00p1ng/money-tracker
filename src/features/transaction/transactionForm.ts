import type {
  RepeatConfig,
  Transaction,
  TransactionItem,
  TransactionStatus,
  TransactionType,
} from '@/types/domain'

export type TransactionDraft = {
  type?: TransactionType
  walletId?: string
  toWalletId?: string
  items: TransactionItem[]
  transferAmount?: number
}

export function validateDraft(draft: TransactionDraft): string[] {
  const errors: string[] = []
  if (!draft.walletId) {
    errors.push('Select a wallet')
  }

  if (draft.type === 'transfer') {
    if (!draft.toWalletId) {
      errors.push('Select a destination wallet')
    } else if (draft.walletId === draft.toWalletId) {
      errors.push('Choose a different destination wallet')
    }
    if (!Number.isFinite(draft.transferAmount) || (draft.transferAmount ?? 0) <= 0) {
      errors.push('Enter a transfer amount')
    }

    return errors
  }

  if (draft.items.length === 0) {
    errors.push('Add at least one category')
  }
  if (draft.items.some((item) => !Number.isFinite(item.amount))) {
    errors.push('Enter an amount for every category')
  }

  return errors
}

export function validateExchangeRate(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed) {
    return 'Enter an exchange rate'
  }

  const numberValue = Number(trimmed)
  if (!Number.isFinite(numberValue)) {
    return 'Enter a valid exchange rate'
  }
  if (numberValue <= 0) {
    return 'Enter a positive exchange rate'
  }

  const decimalMatch = /^(\d+)(?:\.(\d+))?$/.exec(trimmed)
  if (!decimalMatch) {
    return 'Enter a valid exchange rate'
  }

  const decimalPlaces = decimalMatch[2]?.length ?? 0
  if (decimalPlaces > 4) {
    return 'Enter an exchange rate with up to 4 decimals'
  }

  return undefined
}

export function deriveTransactionStatus(input: {
  date: string
  markedPaid?: boolean
  now?: Date
}): TransactionStatus {
  if (input.markedPaid ?? true) {
    return 'paid'
  }

  const transactionDate = new Date(input.date)
  const now = input.now ?? new Date()

  return transactionDate > now
    ? 'planned'
    : 'overdue'
}

export function buildTransaction(input: {
  id?: string
  type: TransactionType
  walletId: string
  toWalletId?: string
  currency: string
  items: TransactionItem[]
  transferAmount?: number
  exchangeRate?: number
  toExchangeRate?: number
  date: string
  note?: string
  status?: TransactionStatus
  repeat?: RepeatConfig
  cleared?: boolean
  now: string
  createId: () => string
}): Transaction {
  const status = input.status ?? 'paid'
  const items = input.type === 'transfer'
    ? [{ categoryId: 'transfer', amount: input.transferAmount ?? 0 }]
    : input.items
  const transferFields = input.type === 'transfer'
    ? {
      toWalletId: input.toWalletId,
      exchangeRate: input.exchangeRate,
      toExchangeRate: input.toExchangeRate,
    }
    : {}

  return {
    id: input.id ?? input.createId(),
    type: input.type,
    walletId: input.walletId,
    currency: input.currency,
    items,
    date: new Date(input.date).toISOString(),
    note: input.note?.trim() || undefined,
    createdAt: input.now,
    ...transferFields,
    status,
    repeat: status === 'paid'
      ? undefined
      : input.repeat,
    cleared: status === 'paid'
      ? (input.cleared ?? false)
      : false,
  }
}
