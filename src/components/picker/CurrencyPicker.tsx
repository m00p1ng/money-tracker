import type { Currency } from '@/types/domain'

import { SelectorSheet, type SelectorOption } from './SelectorSheet'

function currencyFlag(code: string): string {
  return [...code.slice(0, 2).toUpperCase()]
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join('')
}

interface CurrencyPickerProps {
  isOpen: boolean
  currencies: Currency[]
  selectedCode: string
  onSelect: (code: string) => void
  onClose: () => void
}

export function CurrencyPicker({
  isOpen,
  currencies,
  selectedCode,
  onSelect,
  onClose,
}: CurrencyPickerProps) {
  const options: SelectorOption<string>[] = currencies.map((currency) => ({
    label: currency.code,
    value: currency.code,
    description: currency.name,
    leading: (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-white/6 text-xl">
        {currencyFlag(currency.code)}
      </div>
    ),
  }))

  return (
    <SelectorSheet
      isOpen={isOpen}
      title="Currency"
      options={options}
      value={selectedCode}
      onSelect={(code) => {
        onSelect(code)
        onClose()
      }}
      onClose={onClose}
      scrollable
    />
  )
}
