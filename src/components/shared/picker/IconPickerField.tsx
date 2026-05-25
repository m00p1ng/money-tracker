import { useState } from 'react'

import { Icon } from '@/components'

import { IconPicker } from './IconPicker'

interface IconPickerFieldProps {
  value: string
  onChange: (icon: string) => void
}

export function IconPickerField({ value, onChange }: IconPickerFieldProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-label="icon"
        onClick={() => setOpen(true)}
        className={[
          'flex min-h-11 w-full items-center gap-2 rounded-lg',
          'border border-white/10 bg-white/5 px-3 text-slate-50 transition-colors',
        ].join(' ')}
      >
        <Icon name={value} />
        <span className="text-sm">{value}</span>
      </button>
      <IconPicker
        isOpen={open}
        selectedIcon={value}
        onSelect={(icon) => {
          onChange(icon)
          setOpen(false)
        }}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
