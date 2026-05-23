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

export function amountInWalletCurrency(transaction: Transaction, wallet: Wallet): number {
  const total = transactionTotal(transaction)
  if (transaction.currency === wallet.currency) {
    return total
  }
  if (transaction.type === 'transfer' && transaction.toWalletId === wallet.id) {
    return total * (transaction.toExchangeRate ?? 1)
  }
  return total * (transaction.exchangeRate ?? 1)
}

export function signedWalletAmount(wallet: Wallet, transaction: Transaction): number {
  const amount = amountInWalletCurrency(transaction, wallet)
  if (transaction.type === 'transfer') {
    if (transaction.walletId === wallet.id) {
      return -amount
    }
    if (transaction.toWalletId === wallet.id) {
      return amount
    }
    return 0
  }
  if (wallet.type === 'credit_card') {
    return transaction.type === 'expense' ? amount : -amount
  }
  return transaction.type === 'income' ? amount : -amount
}

export function walletTransactions(walletId: string, transactions: Transaction[], range?: DateRange): Transaction[] {
  return transactions
    .filter((transaction) => transaction.walletId === walletId || transaction.toWalletId === walletId)
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
