import { useBackNavigate } from '@/context/navigationDirection'
import { useCurrencyStore } from '@/stores/currencyStore'

export function useCurrenciesPage() {
  const currencies = useCurrencyStore((state) => state.items)
  const baseCode = currencies.find((c) => c.isBase)?.code ?? ''
  const backNavigate = useBackNavigate()

  return {
    currencies,
    baseCode,
    onBack: () => backNavigate('/settings'),
  }
}
