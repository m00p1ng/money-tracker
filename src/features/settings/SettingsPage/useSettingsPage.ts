import {
  useCategoryStore,
  useCurrencyStore,
  useSettingsStore,
} from '@/stores'

export function useSettingsPage() {
  const settings = useSettingsStore((state) => state.settings)
  const categories = useCategoryStore((state) => state.items)
  const currencies = useCurrencyStore((state) => state.items)

  const categoryCount = categories.length
  const currencyCode = currencies.find((currency) => currency.isBase)?.code
  const theme = settings?.theme ?? 'forest'

  return {
    categoryCount,
    currencyCode,
    theme,
  }
}
