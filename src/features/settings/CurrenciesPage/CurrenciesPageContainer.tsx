import { CurrenciesPage } from './CurrenciesPage'
import { useCurrenciesPage } from './useCurrenciesPage'

export function CurrenciesPageContainer() {
  const props = useCurrenciesPage()
  return <CurrenciesPage {...props} />
}
