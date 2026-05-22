export type TransactionType = 'expense' | 'income'
export type WalletType = 'payment' | 'credit_card'
export type ThemePreset = 'forest' | 'midnight' | 'ocean' | 'sunset' | 'amber' | 'arctic' | 'sakura' | 'void'

export type TransactionStatus = 'planned' | 'overdue' | 'paid'

export type TransactionItem = {
  categoryId: string
  amount: number
}

export type Transaction = {
  id: string
  type: TransactionType
  walletId: string
  currency: string
  items: TransactionItem[]
  date: string
  note?: string
  createdAt: string
  toWalletId?: string
  exchangeRate?: number
  status?: TransactionStatus
  cleared?: boolean
  repeat?: string
}

export type Wallet = {
  id: string
  name: string
  type: WalletType
  currency: string
  balance: number
  creditLimit?: number
  color: string
  icon: string
}

export type Category = {
  id: string
  name: string
  type: TransactionType
  parentId?: string
  level: 1 | 2 | 3 | 4 | 5
  icon: string
  color: string
  isDefault: boolean
}

export type Currency = {
  code: string
  symbol: string
  name: string
  isBase: boolean
  rate: number
}

export type Settings = {
  id: string
  theme: ThemePreset
  language: 'en'
  dateFormat: 'DD MMM YYYY'
}
