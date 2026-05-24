import cx from 'classnames'

import { BottomSheet, Icon } from '@/components'
import type { Currency } from '@/types/domain'

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
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Currency">
      <div className="max-h-72 space-y-1.5 overflow-y-auto px-4">
        {currencies.map((c) => (
          <button
            key={c.code}
            className={cx(
              'flex w-full items-center gap-3 rounded-xl px-3.5 py-3',
              { 'border border-(--accent)/30 bg-(--accent)/12': selectedCode === c.code },
            )}
            onClick={() => {
              onSelect(c.code); onClose()
            }}
            type="button"
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-white/6 text-xl"
            >
              {currencyFlag(c.code)}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">{c.code}</p>
              <p className="text-[11px] text-white/40">{c.name}</p>
            </div>
            {selectedCode === c.code && (
              <Icon name="fa-circle-check" className="text-(--accent-light)" />
            )}
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}
