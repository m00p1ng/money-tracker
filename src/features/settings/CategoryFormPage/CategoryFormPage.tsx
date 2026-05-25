import {
  FormEvent,
  useMemo,
  useState,
} from 'react'

import {
  Field,
  FormActions,
  FormErrorMessage,
  Icon,
  PageHeader,
  SelectInput,
  TextInput,
} from '@/components'
import { IconPickerField } from '@/components/shared/picker/IconPickerField'
import { createId } from '@/lib'
import type { Category, TransactionType } from '@/types/domain'

interface CategoryFormPageProps {
  existing: Category | undefined
  categories: Category[]
  error: string | null
  onBack: () => void
  onSubmit: (form: Category) => Promise<void>
  onDelete: () => Promise<void>
}

export function CategoryFormPage({
  existing,
  categories,
  error,
  onBack,
  onSubmit,
  onDelete,
}: CategoryFormPageProps) {
  const title = useMemo(() => (existing
    ? 'Edit Category'
    : 'New Category'), [existing])
  const [form, setForm] = useState<Category>(() => existing ?? {
    id: createId(),
    name: '',
    type: 'expense',
    level: 1,
    icon: 'fa-circle',
    isDefault: false,
  })

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await onSubmit(form)
  }

  async function handleDelete() {
    await onDelete()
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <PageHeader title={title} onBack={onBack} />

      <div className="flex items-center gap-3 rounded-xl bg-white/3 p-3">
        <div className={[
          'flex h-11 w-11 shrink-0 items-center justify-center',
          'rounded-[14px] bg-white/10 text-base text-slate-50',
        ].join(' ')}>
          <Icon name={form.icon} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-50">
            {form.name.trim() || 'New category'}
          </p>
          <p className="mt-0.5 text-sm text-white/40">{form.type}</p>
        </div>
      </div>

      <Field label="Name">
        <TextInput
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
      </Field>
      <Field label="Icon">
        <IconPickerField value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
      </Field>
      <Field label="Type">
        <SelectInput
          value={form.type}
          options={[
            { value: 'expense', label: 'Expense' },
            { value: 'income', label: 'Income' },
          ]}
          onChange={(value) => setForm({ ...form, type: value as TransactionType })}
        />
      </Field>
      <Field label="Parent">
        <SelectInput
          value={form.parentId ?? ''}
          options={[
            { value: '', label: 'Root' },
            ...categories
              .filter((c) => c.type === form.type && c.level < 5)
              .map((c) => ({ value: c.id, label: c.name })),
          ]}
          onChange={(value) => {
            const parent = categories.find((c) => c.id === value)
            setForm({
              ...form,
              parentId: parent?.id,
              level: parent
                ? ((parent.level + 1) as Category['level'])
                : 1,
              type: parent?.type ?? form.type,
            })
          }}
        />
      </Field>

      <FormErrorMessage error={error} />

      <FormActions showDelete={Boolean(existing)} onDelete={handleDelete} />
    </form>
  )
}
