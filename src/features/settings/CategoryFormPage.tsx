import { FormEvent, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, SelectInput, TextInput } from '../../components/ui/Field'
import { createId } from '../../lib/id'
import { useCategoryStore } from '../../stores/categoryStore'
import type { Category, TransactionType } from '../../types/domain'

export function CategoryFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const existing = useCategoryStore((state) => (id ? state.findById(id) : undefined))
  const categories = useCategoryStore((state) => state.items)
  const add = useCategoryStore((state) => state.add)
  const update = useCategoryStore((state) => state.update)
  const remove = useCategoryStore((state) => state.remove)
  const [error, setError] = useState('')
  const [form, setForm] = useState<Category>(() => existing ?? { id: createId(), name: '', type: 'expense', level: 1, icon: 'fa-circle', color: '#10b981', isDefault: false })

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required')
      return
    }
    try {
      await (existing ? update(form) : add(form))
      navigate('/settings/categories')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to save category')
    }
  }

  async function onDelete() {
    if (!existing) return
    try {
      await remove(existing.id)
      navigate('/settings/categories')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to delete category')
    }
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <header><Link className="text-sm text-accent" to="/settings/categories">Back</Link><h1 className="mt-3 text-2xl font-semibold">{existing ? 'Edit Category' : 'New Category'}</h1></header>
      <Card className="space-y-4">
        <Field label="Name"><TextInput value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
        <Field label="Type"><SelectInput value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as TransactionType })}><option value="expense">Expense</option><option value="income">Income</option></SelectInput></Field>
        <Field label="Parent"><SelectInput value={form.parentId ?? ''} onChange={(event) => {
          const parent = categories.find((category) => category.id === event.target.value)
          setForm({ ...form, parentId: parent?.id, level: parent ? ((parent.level + 1) as Category['level']) : 1, type: parent?.type ?? form.type })
        }}><option value="">Root</option>{categories.filter((category) => category.type === form.type && category.level < 5).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</SelectInput></Field>
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </Card>
      <Button type="submit" variant="accent">Save</Button>
      {existing ? <Button type="button" variant="danger" onClick={onDelete}>Delete</Button> : null}
    </form>
  )
}
