import {
  assetsTotal,
  debtTotal,
  walletCurrentAmount,
} from '@/features/balance/balanceCalculations'
import { useTransactionStore, useWalletStore } from '@/stores'

import type { BalancePageProps } from './BalancePage'

function sortByPosition(a: { position?: number }, b: { position?: number }) {
  const pa = a.position ?? Infinity
  const pb = b.position ?? Infinity
  return pa - pb
}

export function useBalancePage(): BalancePageProps {
  const wallets = useWalletStore((state) => state.items)
  const transactions = useTransactionStore((state) => state.items)
  const sorted = [...wallets].sort(sortByPosition)
  const paymentWallets = sorted
    .filter((w) => w.type === 'payment')
    .map((wallet) => ({ wallet, amount: walletCurrentAmount(wallet, transactions) }))
  const creditCards = sorted
    .filter((w) => w.type === 'credit_card')
    .map((wallet) => ({ wallet, amount: walletCurrentAmount(wallet, transactions) }))
  const assets = assetsTotal(wallets, transactions)
  const debt = debtTotal(wallets, transactions)

  return {
    paymentWallets,
    creditCards,
    assets,
    debt,
  }
}
