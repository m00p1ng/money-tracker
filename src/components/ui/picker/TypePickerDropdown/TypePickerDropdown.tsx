import { useEffect, useRef, useState } from 'react'

import { Icon } from '@/components/Icon'

type TransactionType = 'expense' | 'income' | 'transfer'

const TYPES: { label: string; value: TransactionType }[] = [
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
  { label: 'Transfer', value: 'transfer' },
]

export function TypePickerDropdown({
  value,
  onChange,
  locked = false,
}: {
  value: TransactionType
  onChange: (type: TransactionType) => void
  locked?: boolean
}) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) {
      return
    }
    function handleMouseDown(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [open])

  const currentLabel = TYPES.find((t) => t.value === value)?.label ?? 'Expense'

  return (
    <div ref={wrapperRef} className="relative flex justify-center">
      <button
        type="button"
        className="flex items-center gap-2 text-base font-bold text-white"
        onClick={() => {
          if (!locked) {
            setOpen((prev) => !prev)
          }
        }}
        aria-disabled={locked}
      >
        {currentLabel}
        {!locked && <Icon name="fa-chevron-down" className="text-[11px] text-white/40" />}
      </button>

      {!locked && open && (
        <div
          className="absolute top-full left-1/2 z-50 mt-1 w-[160px] -translate-x-1/2 rounded-2xl border border-white/[0.1] bg-[var(--bg)] p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
        >
          {TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium ${
                value === t.value
                  ? 'bg-[var(--accent)]/[0.12] font-bold text-[var(--accent-light)]'
                  : 'text-white/70'
              }`}
              onClick={() => {
                onChange(t.value)
                setOpen(false)
              }}
            >
              {t.label}
              {value === t.value && <Icon name="fa-circle-check" className="text-[var(--accent-light)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
