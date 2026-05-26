import { type FormEvent } from 'react'

import {
  Field,
  Icon,
  PageHeader,
} from '@/components'
import { TextInput } from '@/components/shared/input'
import { IconPickerField } from '@/components/shared/picker/IconPickerField'
import type { Category } from '@/types/domain'

export type CategoryEditPageProps = {
  form: Pick<Category, 'name' | 'icon'>
  onChangeName: (name: string) => void
  onChangeIcon: (icon: string) => void
  onBack: () => void
  onSubmit: () => void
}

export function CategoryEditPage({
  form,
  onChangeName,
  onChangeIcon,
  onBack,
  onSubmit,
}: CategoryEditPageProps) {
  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <PageHeader title="Edit Category" onBack={onBack} />

      <div className="flex items-center gap-3 rounded-xl bg-white/3 p-3">
        <div className={[
          'flex h-11 w-11 shrink-0 items-center justify-center',
          'rounded-[14px] bg-white/10 text-base text-slate-50',
        ].join(' ')}>
          <Icon name={form.icon} />
        </div>
        <p className="min-w-0 flex-1 truncate text-base font-semibold text-slate-50">
          {form.name.trim() || 'Category name'}
        </p>
      </div>

      <Field label="Name">
        <TextInput
          value={form.name}
          onChange={(e) => onChangeName(e.target.value)}
        />
      </Field>

      <Field label="Icon">
        <IconPickerField value={form.icon} onChange={onChangeIcon} />
      </Field>

      <div className="px-0">
        <button
          type="submit"
          className={[
            'w-full rounded-xl bg-white/5 py-3.5 text-center',
            'text-base font-semibold text-slate-100 active:bg-white/8',
          ].join(' ')}
        >
          Save
        </button>
      </div>
    </form>
  )
}
