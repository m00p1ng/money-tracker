import { AnimatePresence, motion } from 'framer-motion'
import { Icon } from '../../components/Icon'
import type { Currency } from '../../types/domain'

function currencyFlag(code: string): string {
  return [...code.slice(0, 2).toUpperCase()]
    .map((c) => String.fromCodePoint(c.charCodeAt(0) + 127397))
    .join('')
}

export function CurrencyPicker({
  currencies,
  selectedCode,
  onSelect,
  onClose,
}: {
  currencies: Currency[]
  selectedCode: string
  onSelect: (code: string) => void
  onClose: () => void
}) {
  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      <motion.div
        key="sheet"
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border-t border-white/[0.08] bg-[#131320] pb-8"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 38 }}
      >
        <div className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-white/15" />
        <h3 className="px-5 pb-2.5 pt-3.5 text-center text-[15px] font-bold">Currency</h3>
        <div className="mx-5 mb-2.5 h-px bg-white/[0.06]" />
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
      </motion.div>
    </AnimatePresence>
  )
}
