import { AnimatePresence, motion } from 'framer-motion'
import {
  useEffect,
  useRef,
  useState,
} from 'react'

export type SelectOption = { value: string; label: string }

interface SelectInputProps {
  options: SelectOption[]
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

export function SelectInput({
  options,
  value,
  onChange,
  disabled,
  placeholder,
}: SelectInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    if (!isOpen) {
      return
    }
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((o) => !o)
          }
        }}
        className={[
          'flex min-h-11 w-full items-center justify-between rounded-lg border px-3',
          'bg-white/5 text-slate-50 outline-none transition-colors',
          isOpen
            ? 'border-(--accent)'
            : 'border-white/10',
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer',
        ].join(' ')}
      >
        <span>{selected?.label ?? placeholder ?? ''}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={[
            'shrink-0 text-slate-500 transition-transform duration-200',
            isOpen
              ? 'rotate-180'
              : '',
          ].join(' ')}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={[
              'absolute left-0 right-0 top-[calc(100%+4px)] z-10',
              'overflow-hidden rounded-lg border border-white/10 bg-(--bg)',
            ].join(' ')}
          >
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
                className={[
                  'flex w-full items-center justify-between px-3 py-2.5 text-sm transition-colors',
                  option.value === value
                    ? 'bg-accent/10 text-accent-light'
                    : 'text-white/60 hover:bg-white/5 hover:text-slate-50',
                ].join(' ')}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
