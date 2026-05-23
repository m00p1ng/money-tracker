import { Link } from 'react-router'

import {
  Icon,
  AddRow,
  ListGroup,
  PageHeader,
} from '@/components'
import type { Currency } from '@/types/domain'

const FLAG_MAP: Record<string, string> = {
  THB: '🇹🇭',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  JPY: '🇯🇵',
  GBP: '🇬🇧',
  CNY: '🇨🇳',
  KRW: '🇰🇷',
  SGD: '🇸🇬',
  HKD: '🇭🇰',
  AUD: '🇦🇺',
  CAD: '🇨🇦',
  CHF: '🇨🇭',
  MYR: '🇲🇾',
  IDR: '🇮🇩',
  VND: '🇻🇳',
}

interface CurrencyRowProps {
  code: string
  isBase: boolean
  rate: number
  baseCode: string
}

function CurrencyRow({ code, isBase, rate, baseCode }: CurrencyRowProps) {
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

interface CurrenciesPageProps {
  currencies: Currency[]
  baseCode: string
  onBack: () => void
}

export function CurrenciesPage({ currencies, baseCode, onBack }: CurrenciesPageProps) {
  return (
    <div className="space-y-5">
      <PageHeader title="Currencies" onBack={onBack} />

      <ListGroup label="Currencies & Rates">
        {currencies.map((c) => (
          <CurrencyRow key={c.code} code={c.code} isBase={c.isBase} rate={c.rate} baseCode={baseCode} />
        ))}
        <AddRow label="Add Currency" to="/settings/currencies/new" />
      </ListGroup>
    </div>
  )
}
