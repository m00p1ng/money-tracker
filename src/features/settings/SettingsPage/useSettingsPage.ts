import {
  useCategoryStore,
  useCurrencyStore,
  useSettingsStore,
  useWalletStore,
} from '@/stores'

export function useSettingsPage() {
  const settings = useSettingsStore((state) => state.settings)
  const wallets = useWalletStore((state) => state.items)
  const categories = useCategoryStore((state) => state.items)
  const currencies = useCurrencyStore((state) => state.items)

  const walletCount = wallets.length
  const categoryCount = categories.length
  const currencyCode = currencies.find((currency) => currency.isBase)?.code
  const theme = settings?.theme ?? 'forest'

  return {
    walletCount,
    categoryCount,
    currencyCode,
    theme,
  }
}
