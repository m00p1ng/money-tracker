import { useState } from 'react'
import { useNavigate } from 'react-router'

import {
  assetsTotal,
  debtTotal,
} from '@/features/balance/balanceCalculations'
import { useWalletStore } from '@/stores'

import type { BalancePageProps } from './BalancePage'

function sortByPosition(a: { position?: number }, b: { position?: number }) {
  const pa = a.position ?? Infinity
  const pb = b.position ?? Infinity

  return pa - pb
}

export function useBalancePage(): BalancePageProps {
  const [isEditMode, setIsEditMode] = useState(false)
  const navigate = useNavigate()
  const wallets = useWalletStore((state) => state.items)
  const reorder = useWalletStore((state) => state.reorder)

  const sorted = [...wallets].sort(sortByPosition)
  const paymentWallets = sorted
    .filter((w) => w.type === 'payment')
    .map((wallet) => ({ wallet, amount: wallet.balance }))
  const creditCards = sorted
    .filter((w) => w.type === 'credit_card')
    .map((wallet) => ({ wallet, amount: wallet.balance }))
  const assets = assetsTotal(wallets)
  const debt = debtTotal(wallets)

  return {
    paymentWallets,
    creditCards,
    assets,
    debt,
    isEditMode,
    onToggleEditMode: () => setIsEditMode((prev) => !prev),
    onAddWallet: () => navigate('/balance/wallets/new?type=payment'),
    onEditWallet: (id: string) => navigate(`/balance/wallets/${id}`),
    onReorder: reorder,
  }
}
