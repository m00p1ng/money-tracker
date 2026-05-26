import { useState } from 'react'

import {
  FormErrorMessage,
  Icon,
  PageHeader,
} from '@/components'
import { IconPicker } from '@/components/shared/picker/IconPicker'
import type { Category } from '@/types/domain'

export type CategoryEditPageProps = {
  form: Pick<Category, 'name' | 'icon'>
  title: string
  error: string | null
  onChangeName: (name: string) => void
  onChangeIcon: (icon: string) => void
  onBack: () => void
}

export function CategoryEditPage({
  form,
  title,
  error,
  onChangeName,
  onChangeIcon,
  onBack,
}: CategoryEditPageProps) {
  const [iconPickerOpen, setIconPickerOpen] = useState(false)

  return (
    <div className="space-y-5">
      <PageHeader title={title} onBack={onBack} />

      <div className="flex items-center gap-3 rounded-xl bg-white/3 p-3">
        <button
          type="button"
          aria-label="Change icon"
          onClick={() => setIconPickerOpen(true)}
          className={[
            'flex h-12 w-12 shrink-0 items-center justify-center',
            'rounded-[14px] bg-white/10 text-base text-slate-50',
            'active:bg-white/20',
          ].join(' ')}
        >
          <Icon name={form.icon} />
        </button>
        <input
          type="text"
          value={form.name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="Category name"
          className={[
            'min-w-0 flex-1 bg-transparent text-2xl font-bold',
            'text-slate-50 outline-none placeholder:text-slate-500',
          ].join(' ')}
        />
      </div>

      <FormErrorMessage error={error} />

      <IconPicker
        isOpen={iconPickerOpen}
        selectedIcon={form.icon}
        onSelect={(icon) => {
          onChangeIcon(icon)
          setIconPickerOpen(false)
        }}
        onClose={() => setIconPickerOpen(false)}
      />
    </div>
  )
}
