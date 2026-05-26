import type {
  Category,
  RepeatConfig,
  Transaction,
  Wallet,
} from '@/types/domain'

export const STUB_WALLET_PAYMENT: Wallet = {
  id: 'w1',
  name: 'Cash',
  type: 'payment',
  currency: 'USD',
  balance: 500,
  color: '#10b981',
  icon: 'fa-wallet',
}

export const STUB_WALLET_CREDIT: Wallet = {
  id: 'w2',
  name: 'Credit Card',
  type: 'credit_card',
  currency: 'USD',
  balance: 1200,
  creditLimit: 5000,
  color: '#3b82f6',
  icon: 'fa-credit-card',
}

export const STUB_CATEGORY: Category = {
  id: 'cat-1',
  name: 'Food',
  type: 'expense',
  level: 1,
  icon: 'fa-burger',
  isDefault: true,
}

export const STUB_TRANSACTION: Transaction = {
  id: 'tx-1',
  type: 'expense',
  walletId: 'w1',
  currency: 'USD',
  items: [{ categoryId: 'cat-1', amount: 12.5 }],
  date: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  cleared: false,
}

export const STUB_RUNNING_ROW = {
  transaction: STUB_TRANSACTION,
  amount: -12.5,
  runningAmount: 487.5,
}

export const STUB_RANGE = { start: '2026-05-01', end: '2026-05-31' }

export const STUB_REPEAT_NEVER: RepeatConfig = { preset: 'never' }
export const STUB_REPEAT_DAILY: RepeatConfig = { preset: 'daily' }

export const STUB_DATE_PAST = new Date(Date.now() - 86400000).toISOString()
export const STUB_DATE_FUTURE = new Date(Date.now() + 86400000).toISOString()
