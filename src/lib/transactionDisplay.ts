import type {
  Category,
  Transaction,
  Wallet,
} from '@/types/domain'

export type TransactionBaseProps = {
  to: string
  icon: string
  title: string
  date: string
}

export type TransactionRowDisplay = TransactionBaseProps & {
  amount: number
  currency: string
  amountColor: string
  secondaryAmount?: number
  secondaryAmountCurrency?: string
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
  const date = transaction.date

  if (transaction.type === 'transfer') {
    const fromWallet = wallets.find((w) => w.id === transaction.walletId)
    const toWallet = wallets.find((w) => w.id === transaction.toWalletId)

    return {
      to,
      icon: 'fa-arrow-right-arrow-left',
      title: titleWithNote(
        `Transfer (${fromWallet?.name ?? '—'}->${toWallet?.name ?? '—'})`,
        transaction.note,
      ),
      date,
    }
  }

  return {
    to,
    icon: category?.icon ?? 'fa-ellipsis',
    title: titleWithNote(category?.name ?? 'Unknown', transaction.note),
    date,
  }
}

type BuildTransactionRowDisplayOptions = {
  transaction: Transaction
  findCategory: (categoryId: string) => Category | undefined
  wallets: Wallet[]
  date?: string
  amount?: number
  amountColor?: string
  secondaryAmount?: number
  secondaryAmountCurrency?: string
  secondaryAmountColor?: string
}

export function buildTransactionRowDisplay({
  transaction,
  findCategory,
  wallets,
  date,
  amount,
  amountColor,
  secondaryAmount,
  secondaryAmountCurrency,
  secondaryAmountColor,
}: BuildTransactionRowDisplayOptions): TransactionRowDisplay {
  const summary = summarizeTransactionItems(transaction, findCategory)
  const base = buildTransactionBaseProps(transaction, summary.category, wallets)

  return {
    ...base,
    title: transaction.type === 'transfer'
      ? base.title
      : titleWithNote(summary.label, transaction.note),
    date: date ?? base.date,
    amount: amount ?? summary.amount,
    currency: transaction.currency,
    amountColor: amountColor ?? (transaction.type === 'income'
      ? 'text-income'
      : transaction.type === 'expense'
        ? 'text-expense'
        : transaction.type === 'adjustment'
          ? (summary.amount >= 0
            ? 'text-income'
            : 'text-expense')
          : 'text-slate-400'),
    secondaryAmount,
    secondaryAmountCurrency,
    secondaryAmountColor,
  }
}
