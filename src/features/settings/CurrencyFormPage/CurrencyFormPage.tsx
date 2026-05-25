import { FormEvent, useState } from 'react'

import {
  Field,
  FormActions,
  FormErrorMessage,
  PageHeader,
  Switch,
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
      symbol: '$',
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
      <PageHeader
        title={existing
          ? 'Edit Currency'
          : 'New Currency'}
        onBack={onBack}
      />

      {/* Live preview card */}
      <div className="flex items-center gap-3 rounded-xl bg-white/3 p-3">
        <div
          className={[
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]',
            'bg-[rgba(16,185,129,0.15)] text-lg font-bold text-[#34d399]',
          ].join(' ')}
        >
          {form.symbol || '$'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-50">
            {form.name.trim() || 'New currency'}
          </p>
          <p className="mt-0.5 text-sm text-white/40">Rate: {form.rate}</p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-white/45">
          {form.code || '—'}
        </span>
      </div>

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
          disabled={form.isBase}
          onChange={(event) => setForm({ ...form, rate: Number(event.target.value) })}
        />
      </Field>

      <Switch
        label="Base currency"
        description="Rate is always 1.0"
        checked={form.isBase}
        onChange={(checked) => setForm({
          ...form,
          isBase: checked,
          rate: checked
            ? 1
            : form.rate,
        })}
      />

      <FormErrorMessage error={error} />

      <FormActions showDelete={Boolean(existing)} onDelete={handleDelete} />
    </form>
  )
}
