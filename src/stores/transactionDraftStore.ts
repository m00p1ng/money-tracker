import { create } from 'zustand'

import type {
  RepeatConfig,
  TransactionItem,
  TransactionType,
} from '@/types/domain'

export type TransactionDraft = {
  id?: string
  type: TransactionType
  walletId: string
  toWalletId?: string
  items: TransactionItem[]
  focusedIndex: number | null
  date: string
  note: string
  currency: string
  exchangeRate: string
  toExchangeRate: string
  repeatConfig: RepeatConfig
  transferAmount: number
}

type TransactionDraftStore = {
  draft: TransactionDraft | null
  init: (draft: TransactionDraft) => void
  update: (patch: Partial<TransactionDraft>) => void
  clear: () => void
}

export const useTransactionDraftStore = create<TransactionDraftStore>((set, get) => ({
  draft: null,
  init(draft) {
    set({ draft })
  },
  update(patch) {
    const current = get().draft
    if (!current) {
      return
    }
    set({ draft: { ...current, ...patch } })
  },
  clear() {
    set({ draft: null })
  },
}))
