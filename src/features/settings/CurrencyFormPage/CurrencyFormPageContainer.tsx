import { CurrencyFormPage } from './CurrencyFormPage'
import { useCurrencyFormPage } from './useCurrencyFormPage'

export function CurrencyFormPageContainer() {
  const props = useCurrencyFormPage()

  return <CurrencyFormPage {...props} />
}
