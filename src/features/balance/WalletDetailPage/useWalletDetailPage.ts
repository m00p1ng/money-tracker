import {
  useNavigate,
  useParams,
} from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import { walletClearedAmount, walletCurrentAmount } from '@/features/balance'
import {
  useCategoryStore,
  useTransactionStore,
  useWalletStore,
} from '@/stores'

import type { WalletDetailPageProps } from './WalletDetailPage'

export function useWalletDetailPage(): WalletDetailPageProps {
  const { id } = useParams()
  const navigate = useNavigate()
  const backNavigate = useBackNavigate()
  const wallet = useWalletStore((state) => state.items.find((item) => item.id === id))
  const transactions = useTransactionStore((state) => state.items)
  const categories = useCategoryStore((state) => state.items)
  const toggleCleared = useTransactionStore((state) => state.toggleCleared)
  const currentAmount = wallet
    ? walletCurrentAmount(wallet, transactions)
    : 0
  const clearedAmount = wallet
    ? walletClearedAmount(wallet, transactions)
    : 0

  return {
    wallet,
    transactions,
    categories,
    currentAmount,
    clearedAmount,
    onAdd: () => navigate(id
      ? `/transaction/new?walletId=${id}`
      : '/transaction/new'),
    onBack: () => backNavigate('/balance'),
    onSearch: () => { },
    onToggleCleared: (txId) => {
      toggleCleared(txId)
    },
  }
}
