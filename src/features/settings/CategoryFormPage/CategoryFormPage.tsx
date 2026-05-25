import { FormEvent, useState } from 'react'

import {
  Button,
  Card,
  Field,
  FormErrorMessage,
  Icon,
  PageHeader,
  SelectInput,
  TextInput,
} from '@/components'
import { IconPicker } from '@/components/shared/picker/IconPicker'
import { createId, hexToRgba } from '@/lib'
import type { Category, TransactionType } from '@/types/domain'

interface CategoryFormPageProps {
  existing: Category | undefined
  categories: Category[]
  onBack: () => void
  onSubmit: (form: Category, setError: (err: string | null) => void) => Promise<void>
  onDelete: (setError: (err: string | null) => void) => Promise<void>
}

export function CategoryFormPage({
  existing,
  categories,
  onBack,
  onSubmit,
  onDelete,
}: CategoryFormPageProps) {
  const [error, setError] = useState<string | null>(null)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [form, setForm] = useState<Category>(() => existing ?? {
    id: createId(),
    name: '',
    type: 'expense',
    level: 1,
    icon: 'fa-circle',
    color: '#10b981',
    isDefault: false,
  })

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await onSubmit(form, setError)
  }

  async function handleDelete() {
    await onDelete(setError)
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <PageHeader title={existing
        ? 'Edit Category'
        : 'New Category'} onBack={onBack} />

      <div className="flex items-center gap-3 rounded-xl bg-white/3 p-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-base"
          style={{
            background: hexToRgba(form.color, 0.15),
            color: form.color,
          }}
        >
          <Icon name={form.icon} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-50">
            {form.name.trim() || 'New category'}
          </p>
          <p className="mt-0.5 text-sm text-white/40">{form.type}</p>
        </div>
      </div>

      <Card className="space-y-4">
        <Field label="Name">
          <TextInput
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </Field>
        <Field label="Icon">
          <button
            type="button"
            aria-label="icon"
            onClick={() => setIconPickerOpen(true)}
            className={[
              'flex min-h-11 w-full items-center gap-2 rounded-lg',
              'border border-white/10 bg-white/5 px-3 text-slate-50 transition-colors',
            ].join(' ')}
          >
            <Icon name={form.icon} />
            <span className="text-sm">{form.icon}</span>
          </button>
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
      </Card>

      <IconPicker
        isOpen={iconPickerOpen}
        selectedIcon={form.icon}
        onSelect={(icon) => setForm({ ...form, icon })}
        onClose={() => setIconPickerOpen(false)}
      />

      <Button type="submit" variant="accent">Save</Button>
      {existing
        ? <Button type="button" variant="danger" onClick={handleDelete}>Delete</Button>
        : null}
    </form>
  )
}
