import { Icon, ListRow } from '@/components'

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
    <ListRow
      to={`/settings/currencies/${code}`}
      left={<span className="text-xl shrink-0">{FLAG_MAP[code] ?? '🏳️'}</span>}
      label={code}
      trailing={
        isBase
          ? <Icon name="fa-circle-check" className="text-(--accent-light)" />
          : (
            <div className="flex items-center gap-2 text-white/25">
              <span className="text-[12px] text-white/40">
                1 {code} = {rate} {baseCode}
              </span>
              <Icon name="fa-chevron-right" className="text-base" />
            </div>
          )
      }
    />
  )
}
