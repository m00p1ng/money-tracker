import { useState } from 'react'

import {
  FormErrorMessage,
  Icon,
  IconPicker,
  PageHeader,
  TextInput,
} from '@/components'
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
        <TextInput
          type="text"
          value={form.name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="Category name"
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
