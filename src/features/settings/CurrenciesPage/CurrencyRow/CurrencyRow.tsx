import { Link } from 'react-router'

import { Icon } from '@/components'

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

export interface CurrencyRowProps {
  code: string
  isBase: boolean
  rate: number
  baseCode: string
}

export function CurrencyRow({
  code,
  isBase,
  rate,
  baseCode,
}: CurrencyRowProps) {
  return (
    <Link
      to={`/settings/currencies/${code}`}
      className="flex items-center gap-3 border-b border-white/4 px-4 py-3.25 last:border-b-0"
    >
      <span className="text-xl shrink-0">{FLAG_MAP[code] ?? '🏳️'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-md font-semibold">{code}</p>
      </div>
      {isBase ? (
        <span
          className="text-sm font-bold px-2 py-0.5 rounded-md border"
          style={{
            background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
            borderColor: 'color-mix(in srgb, var(--accent) 25%, transparent)',
            color: 'var(--accent-btn-2)',
          }}
        >
          Base
        </span>
      ) : (
        <span className="mr-2 text-[12px] text-white/40">
          1 {code} = {rate} {baseCode}
        </span>
      )}
      <Icon name="fa-chevron-right" className="text-sm text-white/20" />
    </Link>
  )
}
