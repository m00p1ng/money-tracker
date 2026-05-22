import type { Transaction, TransactionItem, TransactionType } from '../../types/domain'

export type TransactionDraft = {
  walletId?: string
  items: TransactionItem[]
}

export function validateDraft(draft: TransactionDraft): string[] {
  const errors: string[] = []
  if (!draft.walletId) {
    errors.push('Select a wallet')
  }
  if (draft.items.length === 0) {
    errors.push('Add at least one category')
  }
  if (draft.items.some((item) => item.amount <= 0)) {
    errors.push('Enter an amount for every category')
  }
  return errors
}

export function buildTransaction(input: {
  id?: string
  type: TransactionType
  walletId: string
  currency: string
  items: TransactionItem[]
  date: string
  note?: string
  now: string
  createId: () => string
}): Transaction {
  return {
    id: input.id ?? input.createId(),
    type: input.type,
    walletId: input.walletId,
    currency: input.currency,
    items: input.items,
    date: new Date(input.date).toISOString(),
    note: input.note?.trim() || undefined,
    createdAt: input.now,
  }
}
