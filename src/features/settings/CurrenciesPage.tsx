import { Link } from 'react-router'
import { Icon } from '../../components/Icon'
import { AddRow, ListGroup, PageHeader } from '../../components/ui'
import { useCurrencyStore } from '../../stores/currencyStore'
import { useBackNavigate } from '../../context/navigationDirection'

const FLAG_MAP: Record<string, string> = {
  THB: '🇹🇭', USD: '🇺🇸', EUR: '🇪🇺', JPY: '🇯🇵', GBP: '🇬🇧',
  CNY: '🇨🇳', KRW: '🇰🇷', SGD: '🇸🇬', HKD: '🇭🇰', AUD: '🇦🇺',
  CAD: '🇨🇦', CHF: '🇨🇭', MYR: '🇲🇾', IDR: '🇮🇩', VND: '🇻🇳',
}

function CurrencyRow({ code, isBase, rate, baseCode }: { code: string; isBase: boolean; rate: number; baseCode: string }) {
  return (
    <Link
      to={`/settings/currencies/${code}`}
      className="flex items-center gap-3 border-b border-white/[0.04] px-4 py-[13px] last:border-b-0"
    >
      <span className="text-xl flex-shrink-0">{FLAG_MAP[code] ?? '🏳️'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold">{code}</p>
      </div>
      {isBase ? (
        <span
          className="text-[11px] font-bold px-2 py-0.5 rounded-md border"
          style={{
            background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
            borderColor: 'color-mix(in srgb, var(--accent) 25%, transparent)',
            color: 'var(--accent-btn-2)',
          }}
        >
          Base
        </span>
      ) : (
        <span className="mr-2 text-[12px] text-white/40">1 {code} = {rate} {baseCode}</span>
      )}
      <Icon name="fa-chevron-right" className="text-[11px] text-white/20" />
    </Link>
  )
}

export function CurrenciesPage() {
  const currencies = useCurrencyStore((state) => state.items)
  const baseCode = currencies.find((c) => c.isBase)?.code ?? ''
  const backNavigate = useBackNavigate()

  return (
    <div className="space-y-5">
      <PageHeader title="Currencies" onBack={() => backNavigate('/settings')} />

      <ListGroup label="Currencies & Rates">
        {currencies.map((c) => (
          <CurrencyRow key={c.code} code={c.code} isBase={c.isBase} rate={c.rate} baseCode={baseCode} />
        ))}
        <AddRow label="Add Currency" to="/settings/currencies/new" />
      </ListGroup>
    </div>
  )
}
