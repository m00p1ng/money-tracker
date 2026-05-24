import { FormEvent, useState } from 'react'

import {
  Button,
  Card,
  Field,
  FormErrorMessage,
  PageHeader,
  TextInput,
} from '@/components'
import type { Currency } from '@/types/domain'

interface CurrencyFormPageProps {
  existing: Currency | undefined
  onBack: () => void
  onSubmit: (form: Currency, setError: (err: string | null) => void) => Promise<void>
  onDelete: (setError: (err: string | null) => void) => Promise<void>
}

export function CurrencyFormPage({
  existing,
  onBack,
  onSubmit,
  onDelete,
}: CurrencyFormPageProps) {
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Currency>(() => (
    existing ?? {
      code: '',
      symbol: '',
      name: '',
      isBase: false,
      rate: 1,
    }
  ))

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await onSubmit(form, setError)
  }

  async function handleDelete() {
    await onDelete(setError)
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <PageHeader title={existing ? 'Edit Currency' : 'New Currency'} onBack={onBack} />
      <Card className="space-y-4">
        <Field label="Code">
          <TextInput
            value={form.code}
            disabled={Boolean(existing)}
            onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
          />
        </Field>
        <Field label="Symbol">
          <TextInput
            value={form.symbol}
            onChange={(event) => setForm({ ...form, symbol: event.target.value })}
          />
        </Field>
        <Field label="Name">
          <TextInput
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
          />
        </Field>
        <Field label="Rate">
          <TextInput
            type="number"
            value={form.rate}
            onChange={(event) => setForm({ ...form, rate: Number(event.target.value) })}
          />
        </Field>
        <label className="flex items-center gap-2 text-sm">
          <input
            checked={form.isBase}
            type="checkbox"
            onChange={(event) => setForm({
              ...form,
              isBase: event.target.checked,
              rate: event.target.checked ? 1 : form.rate,
            })}
          />
          Base currency
        </label>
        <FormErrorMessage error={error} />
      </Card>
      <Button type="submit" variant="accent">Save</Button>
      {existing ? <Button type="button" variant="danger" onClick={handleDelete}>Delete</Button> : null}
    </form>
  )
}
