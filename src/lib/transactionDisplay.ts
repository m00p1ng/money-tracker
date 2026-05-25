import type {
  Category,
  Transaction,
  Wallet,
} from '@/types/domain'

import { hexToRgba } from './color'
import { formatShortDate } from './date'

export type TransactionBaseProps = {
  to: string
  icon: string
  iconBg: string
  iconColor: string
  primaryLabel: string
  secondaryLabel: string
}

export function titleWithNote(title: string, note?: string): string {
  const trimmed = note?.trim()

  return trimmed
    ? `${title} (${trimmed})`
    : title
}

export function buildTransactionBaseProps(
  transaction: Transaction,
  category: Category | undefined,
  wallets: Wallet[],
  fallbackIconColor = '#94a3b8',
): TransactionBaseProps {
  const to = `/transaction/${transaction.id}`
  const secondaryLabel = formatShortDate(new Date(transaction.date))

  if (transaction.type === 'transfer') {
    const fromWallet = wallets.find((w) => w.id === transaction.walletId)
    const toWallet = wallets.find((w) => w.id === transaction.toWalletId)

    return {
      to,
      icon: 'fa-arrow-right-arrow-left',
      iconBg: hexToRgba('#6366f1', 0.15),
      iconColor: '#6366f1',
      primaryLabel: titleWithNote(
        `Transfer (${fromWallet?.name ?? '—'}->${toWallet?.name ?? '—'})`,
        transaction.note,
      ),
      secondaryLabel,
    }
  }

  const iconColor = category?.color ?? fallbackIconColor

  return {
    to,
    icon: category?.icon ?? 'fa-ellipsis',
    iconBg: hexToRgba(iconColor, 0.15),
    iconColor,
    primaryLabel: titleWithNote(category?.name ?? 'Unknown', transaction.note),
    secondaryLabel,
  }
}
