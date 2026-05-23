import {
  AddRow,
  ListGroup,
  PageHeader,
} from '@/components'
import type { Currency } from '@/types/domain'

import { CurrencyRow } from './CurrencyRow'

interface CurrenciesPageProps {
  currencies: Currency[]
  baseCode: string
  onBack: () => void
}

export function CurrenciesPage({
  currencies,
  baseCode,
  onBack,
}: CurrenciesPageProps) {
  return (
    <div className="space-y-5">
      <PageHeader title="Currencies" onBack={onBack} />

      <ListGroup label="Currencies & Rates">
        {currencies.map((c) => (
          <CurrencyRow
            key={c.code}
            code={c.code}
            isBase={c.isBase}
            rate={c.rate}
            baseCode={baseCode}
          />
        ))}
        <AddRow label="Add Currency" to="/settings/currencies/new" />
      </ListGroup>
    </div>
  )
}
