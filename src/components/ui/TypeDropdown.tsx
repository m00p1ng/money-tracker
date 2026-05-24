import cx from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import {
  useEffect,
  useRef,
  useState,
} from 'react'

import { Icon } from '@/components'

type TransactionType = 'expense' | 'income' | 'transfer'

const TYPES: { label: string; value: TransactionType }[] = [
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
  { label: 'Transfer', value: 'transfer' },
]

interface TypeDropdownProps {
  value: TransactionType
  onChange: (type: TransactionType) => void
  locked?: boolean
}

export function TypePickerDropdown({
  value,
  onChange,
  locked = false,
}: TypeDropdownProps) {
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
        className="flex items-center gap-2 text-lg text-white"
        onClick={() => {
          if (!locked) {
            setOpen((prev) => !prev)
          }
        }}
        aria-disabled={locked}
      >
        <span className="font-bold">{currentLabel}</span>
        {!locked && <Icon name="fa-chevron-down" className="text-[11px] text-white/40" />}
      </button>

      {!locked && (
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.92,
                y: -4,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.92,
                y: -4,
              }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={[
                'absolute top-full left-1/2 z-50 mt-1 -translate-x-1/2',
                'rounded-2xl border border-white/10 bg-(--bg) p-1.5',
                'shadow-[0_8px_24px_rgba(0,0,0,0.5)]',
              ].join(' ')}
            >
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={cx(
                    'flex w-full items-center justify-between rounded-xl px-8 py-2.5 text-sm font-medium',
                    value === t.value
                      ? 'bg-(--accent)/12 font-bold text-(--accent-light)'
                      : 'text-white/70',
                  )}
                  onClick={() => {
                    onChange(t.value)
                    setOpen(false)
                  }}
                >
                  {t.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
