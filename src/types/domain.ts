export type TransactionType = 'expense' | 'income' | 'transfer' | 'adjustment'
export type WalletType = 'payment' | 'credit_card'
export type ThemePreset = 'forest' | 'midnight' | 'ocean' | 'sunset' | 'amber' | 'arctic' | 'sakura' | 'void' | 'jade'

export type TransactionStatus = 'planned' | 'overdue' | 'paid'
export type RepeatPreset = 'never' | 'daily' | 'weekly' | '2weeks' | 'monthly' | 'yearly' | 'custom'
export type RepeatConfig = {
  preset: RepeatPreset
  customEvery?: number
  customUnit?: 'day' | 'week' | 'month' | 'year'
}

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
  toExchangeRate?: number
  status?: TransactionStatus
  cleared?: boolean
  repeat?: RepeatConfig
  repeatSourceId?: string
  repeatOccurrenceDate?: string
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
  reconciliationEnabled?: boolean
  position?: number
}

export type Category = {
  id: string
  name: string
  type: TransactionType
  parentId?: string
  level: 1 | 2 | 3 | 4 | 5
  icon: string
  isDefault: boolean
  position?: number
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
}
