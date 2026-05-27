import cx from 'classnames'
import type { ReactNode } from 'react'

import { BottomSheet, Icon } from '@/components'

export type SelectorOption<T extends string> = {
  label: string
  value: T
  description?: string
  leading?: ReactNode
}

export type SelectorSection<T extends string> = {
  title: string
  options: SelectorOption<T>[]
}

interface SelectorSheetProps<T extends string> {
  isOpen: boolean
  title: string
  options?: SelectorOption<T>[]
  sections?: SelectorSection<T>[]
  value: T
  onSelect: (value: T) => void
  onClose: () => void
  scrollable?: boolean
}

function OptionButton<T extends string>({
  option,
  value,
  onSelect,
}: {
  option: SelectorOption<T>
  value: T
  onSelect: (value: T) => void
}) {
  return (
    <button
      key={option.value}
      type="button"
      onClick={() => onSelect(option.value)}
      className={cx(
        'flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors',
        value === option.value
          ? 'border border-(--accent)/30 bg-(--accent)/12 font-bold text-(--accent-light)'
          : 'text-white/70 hover:bg-white/5',
      )}
    >
      {option.leading}
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate">{option.label}</span>
        {option.description
          ? (
            <span className="block truncate text-[11px] font-normal text-white/40">{option.description}</span>
          )
          : null}
      </span>
      {value === option.value && <Icon name="fa-circle-check" className="text-(--accent-light)" />}
    </button>
  )
}

export function SelectorSheet<T extends string>({
  isOpen,
  title,
  options,
  sections,
  value,
  onSelect,
  onClose,
  scrollable = false,
}: SelectorSheetProps<T>) {
  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className={cx('px-4', { 'max-h-72 overflow-y-auto': scrollable })}>
        {sections
          ? (
            <div className="space-y-4">
              {sections.map((section) => (
                <div key={section.title}>
                  <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                    {section.title}
                  </p>
                  <div className="space-y-1.5">
                    {section.options.map((option) => (
                      <OptionButton key={option.value} option={option} value={value} onSelect={onSelect} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )
          : (
            <div className="space-y-1.5">
              {(options ?? []).map((option) => (
                <OptionButton key={option.value} option={option} value={value} onSelect={onSelect} />
              ))}
            </div>
          )}
      </div>
    </BottomSheet>
  )
}
