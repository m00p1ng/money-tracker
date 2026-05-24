import { FormEvent, useState } from 'react'

import {
  Button,
  Card,
  Field,
  FormErrorMessage,
  PageHeader,
  SelectInput,
  TextInput,
} from '@/components'
import { createId } from '@/lib'
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
      <PageHeader title={existing ? 'Edit Category' : 'New Category'} onBack={onBack} />
      <Card className="space-y-4">
        <Field label="Name">
          <TextInput
            value={form.name}
            onChange={(event) => setForm({
              ...form,
              name: event.target.value,
            })}
          />
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
                level: parent ? ((parent.level + 1) as Category['level']) : 1,
                type: parent?.type ?? form.type,
              })
            }}
          />
        </Field>
        <FormErrorMessage error={error} />
      </Card>
      <Button type="submit" variant="accent">Save</Button>
      {existing ? <Button
        type="button"
        variant="danger"
        onClick={handleDelete}
      >Delete</Button> : null}
    </form>
  )
}
