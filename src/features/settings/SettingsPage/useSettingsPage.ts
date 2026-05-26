import {
  useCurrencyStore,
  useSettingsStore,
} from '@/stores'

export function useSettingsPage() {
  const settings = useSettingsStore((state) => state.settings)
  const currencies = useCurrencyStore((state) => state.items)

  const currencyCode = currencies.find((currency) => currency.isBase)?.code
  const theme = settings?.theme ?? 'forest'

  return {
    currencyCode,
    theme,
  }
}
