import type {
  Category,
  Transaction,
  Wallet,
} from '@/types/domain'

import { formatSignedAmount } from './currency'
import { formatShortDate } from './date'

export type TransactionBaseProps = {
  to: string
  icon: string
  primaryLabel: string
  secondaryLabel: string
}

export type TransactionRowDisplay = TransactionBaseProps & {
  amount: string
  amountColor: string
  secondaryAmount?: string
  secondaryAmountColor?: string
}

export type TransactionItemSummary = {
  amount: number
  category: Category | undefined
  label: string
}

export function titleWithNote(title: string, note?: string): string {
  const trimmed = note?.trim()

  return trimmed
    ? `${title} (${trimmed})`
    : title
}

export function summarizeTransactionItems(
  transaction: Transaction,
  findCategory: (categoryId: string) => Category | undefined,
): TransactionItemSummary {
  const categories = transaction.items.map((item) => findCategory(item.categoryId))
  const names = categories.map((category) => category?.name ?? 'Unknown')

  return {
    amount: transaction.items.reduce((sum, item) => sum + item.amount, 0),
    category: categories[0],
    label: names.length > 0
      ? names.join(', ')
      : 'Transaction',
  }
}

export function transactionAmountColor(transaction: Transaction, signedAmount: number): string {
  if (transaction.type === 'income') {
    return 'text-income'
  }
  if (transaction.type === 'expense') {
    return 'text-expense'
  }

  return signedAmount >= 0
    ? 'text-income'
    : 'text-expense'
}

export function buildTransactionBaseProps(
  transaction: Transaction,
  category: Category | undefined,
  wallets: Wallet[],
): TransactionBaseProps {
  const to = `/transaction/${transaction.id}`
  const secondaryLabel = formatShortDate(new Date(transaction.date))

  if (transaction.type === 'transfer') {
    const fromWallet = wallets.find((w) => w.id === transaction.walletId)
    const toWallet = wallets.find((w) => w.id === transaction.toWalletId)

    return {
      to,
      icon: 'fa-arrow-right-arrow-left',
      primaryLabel: titleWithNote(
        `Transfer (${fromWallet?.name ?? '—'}->${toWallet?.name ?? '—'})`,
        transaction.note,
      ),
      secondaryLabel,
    }
  }

  return {
    to,
    icon: category?.icon ?? 'fa-ellipsis',
    primaryLabel: titleWithNote(category?.name ?? 'Unknown', transaction.note),
    secondaryLabel,
  }
}

type BuildTransactionRowDisplayOptions = {
  transaction: Transaction
  findCategory: (categoryId: string) => Category | undefined
  wallets: Wallet[]
  secondaryLabel?: string
  amount?: string
  amountColor?: string
  secondaryAmount?: string
  secondaryAmountColor?: string
}

export function buildTransactionRowDisplay({
  transaction,
  findCategory,
  wallets,
  secondaryLabel,
  amount,
  amountColor,
  secondaryAmount,
  secondaryAmountColor,
}: BuildTransactionRowDisplayOptions): TransactionRowDisplay {
  const summary = summarizeTransactionItems(transaction, findCategory)
  const base = buildTransactionBaseProps(transaction, summary.category, wallets)

  return {
    ...base,
    primaryLabel: transaction.type === 'transfer'
      ? base.primaryLabel
      : titleWithNote(summary.label, transaction.note),
    secondaryLabel: secondaryLabel ?? base.secondaryLabel,
    amount: amount ?? formatSignedAmount(summary.amount, transaction.currency),
    amountColor: amountColor ?? (transaction.type === 'income'
      ? 'text-income'
      : transaction.type === 'expense'
        ? 'text-expense'
        : 'text-slate-400'),
    secondaryAmount,
    secondaryAmountColor,
  }
}
