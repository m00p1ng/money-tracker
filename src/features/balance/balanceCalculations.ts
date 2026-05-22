import { isWithinDateRange, type DateRange } from '../../lib/dateRange'
import type { Transaction, Wallet } from '../../types/domain'

export type RunningWalletRow = {
  transaction: Transaction
  amount: number
  runningAmount: number
}

export function transactionTotal(transaction: Transaction): number {
  return transaction.items.reduce((sum, item) => sum + item.amount, 0)
}

export function signedWalletAmount(wallet: Wallet, transaction: Transaction): number {
  const total = transactionTotal(transaction)
  if (wallet.type === 'credit_card') return transaction.type === 'expense' ? total : -total
  return transaction.type === 'income' ? total : -total
}

export function walletTransactions(walletId: string, transactions: Transaction[], range?: DateRange): Transaction[] {
  return transactions
    .filter((transaction) => transaction.walletId === walletId)
    .filter((transaction) => (range ? isWithinDateRange(transaction.date, range) : true))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function walletCurrentAmount(wallet: Wallet, transactions: Transaction[]): number {
  return walletTransactions(wallet.id, transactions).reduce((sum, transaction) => sum + signedWalletAmount(wallet, transaction), wallet.balance)
}

export function assetsTotal(wallets: Wallet[], transactions: Transaction[]): number {
  return wallets.filter((wallet) => wallet.type === 'payment').reduce((sum, wallet) => sum + walletCurrentAmount(wallet, transactions), 0)
}

export function debtTotal(wallets: Wallet[], transactions: Transaction[]): number {
  return wallets.filter((wallet) => wallet.type === 'credit_card').reduce((sum, wallet) => sum + walletCurrentAmount(wallet, transactions), 0)
}

export function walletRunningRows(wallet: Wallet, transactions: Transaction[], range: DateRange): RunningWalletRow[] {
  let runningAmount = wallet.balance
  return walletTransactions(wallet.id, transactions, range)
    .map((transaction) => {
      const amount = signedWalletAmount(wallet, transaction)
      runningAmount += amount
      return { transaction, amount, runningAmount }
    })
    .reverse()
}
