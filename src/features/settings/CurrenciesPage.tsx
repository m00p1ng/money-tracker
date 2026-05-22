import { Link } from 'react-router'
import { Card } from '../../components/ui/Card'
import { useCurrencyStore } from '../../stores/currencyStore'

export function CurrenciesPage() {
  const currencies = useCurrencyStore((state) => state.items)
  return (
    <div className="space-y-5">
      <header><Link className="text-sm text-accent" to="/settings">Back</Link><h1 className="mt-3 text-2xl font-semibold">Currencies</h1></header>
      {currencies.map((currency) => (
        <Link key={currency.code} to={`/settings/currencies/${currency.code}`}>
          <Card className="mb-3 flex items-center justify-between"><span>{currency.code} {currency.isBase ? 'Base' : ''}</span><span className="text-sm text-slate-400">{currency.isBase ? currency.symbol : currency.rate} ›</span></Card>
        </Link>
      ))}
      <Link className="text-accent" to="/settings/currencies/new">+ Add Currency</Link>
    </div>
  )
}
