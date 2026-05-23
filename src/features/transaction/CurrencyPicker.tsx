import { Icon } from '../../components/Icon'
import { BottomSheet } from '../../components/ui'
import type { Currency } from '../../types/domain'

function currencyFlag(code: string): string {
  return [...code.slice(0, 2).toUpperCase()]
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join('')
}

export function CurrencyPicker({
  isOpen,
  currencies,
  selectedCode,
  onSelect,
  onClose,
}: {
  isOpen: boolean
  currencies: Currency[]
  selectedCode: string
  onSelect: (code: string) => void
  onClose: () => void
}) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Currency">
      <div className="max-h-72 space-y-1.5 overflow-y-auto px-4">
        {currencies.map((c) => (
          <button
            key={c.code}
            className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-3 ${selectedCode === c.code ? 'border border-[var(--accent)]/30 bg-[var(--accent)]/[0.12]' : ''}`}
            onClick={() => {
              onSelect(c.code); onClose() 
            }}
            type="button"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-[9px] bg-white/[0.06] text-xl">
              {currencyFlag(c.code)}
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-medium">{c.code}</p>
              <p className="text-[11px] text-white/40">{c.name}</p>
            </div>
            {selectedCode === c.code && (
              <Icon name="fa-circle-check" className="text-[var(--accent-light)]" />
            )}
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}
