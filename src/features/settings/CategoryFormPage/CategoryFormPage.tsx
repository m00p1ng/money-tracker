import { FormEvent, useState } from 'react'

import { FormErrorMessage, PageHeader } from '@/components/ui'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, SelectInput, TextInput } from '@/components/ui/Field'
import { createId } from '@/lib/id'
import type { Category, TransactionType } from '@/types/domain'

interface CategoryFormPageProps {
  existing: Category | undefined
  categories: Category[]
  onBack: () => void
  onSubmit: (form: Category, setError: (err: string | null) => void) => Promise<void>
  onDelete: (setError: (err: string | null) => void) => Promise<void>
}

export function CategoryFormPage({ existing, categories, onBack, onSubmit, onDelete }: CategoryFormPageProps) {
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Category>(() => existing ?? { id: createId(), name: '', type: 'expense', level: 1, icon: 'fa-circle', color: '#10b981', isDefault: false })

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
        <Field label="Name"><TextInput value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
        <Field label="Type"><SelectInput value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as TransactionType })}><option value="expense">Expense</option><option value="income">Income</option></SelectInput></Field>
        <Field label="Parent"><SelectInput value={form.parentId ?? ''} onChange={(event) => {
          const parent = categories.find((category) => category.id === event.target.value)
          setForm({ ...form, parentId: parent?.id, level: parent ? ((parent.level + 1) as Category['level']) : 1, type: parent?.type ?? form.type })
        }}><option value="">Root</option>{categories.filter((category) => category.type === form.type && category.level < 5).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</SelectInput></Field>
        <FormErrorMessage error={error} />
      </Card>
      <Button type="submit" variant="accent">Save</Button>
      {existing ? <Button type="button" variant="danger" onClick={handleDelete}>Delete</Button> : null}
    </form>
  )
}
