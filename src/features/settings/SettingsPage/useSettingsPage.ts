import { useCategoryStore } from '@/stores/categoryStore'
import { useCurrencyStore } from '@/stores/currencyStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useWalletStore } from '@/stores/walletStore'

export function useSettingsPage() {
  const settings = useSettingsStore((state) => state.settings)
  const wallets = useWalletStore((state) => state.items)
  const categories = useCategoryStore((state) => state.items)
  const currencies = useCurrencyStore((state) => state.items)

  const walletCount = wallets.length
  const categoryCount = categories.length
  const currencyCodes = currencies.slice(0, 3).map((c) => c.code).join(' · ')
  const theme = settings?.theme ?? 'forest'

  return {
    walletCount,
    categoryCount,
    currencyCodes,
    theme,
  }
}
