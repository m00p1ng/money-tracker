import { useParams } from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import { walletCurrentAmount } from '@/features/balance/balanceCalculations'
import {
  useCategoryStore,
  useTransactionStore,
  useWalletStore,
} from '@/stores'

import type { WalletDetailPageProps } from './WalletDetailPage'

export function useWalletDetailPage(): WalletDetailPageProps {
  const { id } = useParams()
  const backNavigate = useBackNavigate()
  const wallet = useWalletStore((state) => state.items.find((item) => item.id === id))
  const transactions = useTransactionStore((state) => state.items)
  const categories = useCategoryStore((state) => state.items)
  const currentAmount = wallet ? walletCurrentAmount(wallet, transactions) : 0
  return {
    wallet,
    transactions,
    categories,
    currentAmount,
    onBack: () => backNavigate('/balance'),
  }
}
