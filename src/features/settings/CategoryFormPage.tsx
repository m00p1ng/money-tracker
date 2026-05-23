import { FormEvent, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useBackNavigate } from '@/context/navigationDirection'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, SelectInput, TextInput } from '@/components/ui/Field'
import { FormErrorMessage, PageHeader } from '@/components/ui'
import { createId } from '@/lib/id'
import { useCategoryStore } from '@/stores/categoryStore'
import type { Category, TransactionType } from '@/types/domain'

export function CategoryFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const backNavigate = useBackNavigate()
  const existing = useCategoryStore((state) => (id ? state.findById(id) : undefined))
  const categories = useCategoryStore((state) => state.items)
  const add = useCategoryStore((state) => state.add)
  const update = useCategoryStore((state) => state.update)
  const remove = useCategoryStore((state) => state.remove)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Category>(() => existing ?? { id: createId(), name: '', type: 'expense', level: 1, icon: 'fa-circle', color: '#10b981', isDefault: false })

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required')
      return
    }
    if (form.parentId) {
      const parent = categories.find((c) => c.id === form.parentId)
      if (parent && parent.type !== form.type) {
        setError('Category type must match parent type')
        return
      }
    }
    try {
      await (existing ? update(form) : add(form))
      navigate('/settings/categories')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save category')
    }
  }

  async function onDelete() {
    if (!existing) {
      return
    }
    try {
      await remove(existing.id)
      navigate('/settings/categories')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete category')
    }
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <PageHeader title={existing ? 'Edit Category' : 'New Category'} onBack={() => backNavigate('/settings/categories')} />
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
      {existing ? <Button type="button" variant="danger" onClick={onDelete}>Delete</Button> : null}
    </form>
  )
}
