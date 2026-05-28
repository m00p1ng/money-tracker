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
          'flex min-h-11 w-full items-center justify-between rounded-xl border px-3',
          'bg-white/[0.04] text-slate-50 outline-none',
          'transition-all duration-150 ease-[cubic-bezier(0.16,1,0.3,1)]',
          isOpen
            ? 'border-(--accent) shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_15%,transparent)]'
            : 'border-white/10',
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer',
        ].join(' ')}
      >
        <span className={selected
          ? ''
          : 'text-white/25'}>{selected?.label ?? placeholder ?? ''}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={[
            'shrink-0 text-white/35 transition-transform duration-200',
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
            initial={{
              opacity: 0, y: -6, scale: 0.98,
            }}
            animate={{
              opacity: 1, y: 0, scale: 1,
            }}
            exit={{
              opacity: 0, y: -4, scale: 0.98,
            }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className={[
              'absolute left-0 right-0 top-[calc(100%+6px)] z-10',
              'overflow-hidden rounded-xl border border-white/10 bg-(--bg)',
              'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
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
                  'flex w-full items-center justify-between px-3 py-2.5 text-sm',
                  'transition-colors duration-100',
                  option.value === value
                    ? 'text-accent-light'
                    : 'text-white/55 hover:bg-white/[0.04] hover:text-slate-50',
                ].join(' ')}
                style={option.value === value
                  ? { background: 'color-mix(in srgb, var(--accent) 10%, transparent)' }
                  : undefined}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    style={{ color: 'var(--accent-light)' }}
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
