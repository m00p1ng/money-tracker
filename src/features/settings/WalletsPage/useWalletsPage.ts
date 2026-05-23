import { useWalletStore } from '@/stores/walletStore'
import { useBackNavigate } from '@/context/navigationDirection'

export function useWalletsPage() {
  const wallets = useWalletStore((state) => state.items)
  const payments = wallets.filter((w) => w.type === 'payment')
  const cards = wallets.filter((w) => w.type === 'credit_card')
  const backNavigate = useBackNavigate()

  return {
    payments,
    cards,
    onBack: () => backNavigate('/settings'),
  }
}
