import {
  FormEvent,
  useMemo,
  useState,
} from 'react'

import {
  FormErrorMessage,
  PageHeader,
  Button,
  Card,
  Field,
  SelectInput,
  TextInput,
} from '@/components'
import { createId } from '@/lib'
import type {
  Currency,
  Wallet,
  WalletType,
} from '@/types/domain'

interface WalletFormPageProps {
  wallet: Wallet | undefined
  currencies: Currency[]
  initialType: WalletType
  onBack: () => void
  onSubmit: (form: Wallet, setError: (err: string | null) => void) => Promise<void>
  onDelete: (setError: (err: string | null) => void) => Promise<void>
}

const DEFAULT_CURRENCY = 'THB'

export function WalletFormPage({
  wallet,
  currencies,
  initialType,
  onBack,
  onSubmit,
  onDelete,
}: WalletFormPageProps) {
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Wallet>(() => wallet ?? {
    id: createId(),
    name: '',
    type: initialType,
    currency: currencies[0]?.code ?? DEFAULT_CURRENCY,
    balance: 0,
    color: '#10b981',
    icon: initialType === 'credit_card' ? 'fa-credit-card' : 'fa-wallet',
  })
  const title = useMemo(() => (wallet ? 'Edit Wallet' : 'New Wallet'), [wallet])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await onSubmit(form, setError)
  }

  async function handleDelete() {
    await onDelete(setError)
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <PageHeader title={title} onBack={onBack} />
      <Card className="space-y-4">
        <Field label="Name">
          <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Type">
          <SelectInput value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as WalletType })}>
            <option value="payment">Payment</option>
            <option value="credit_card">Credit Card</option>
          </SelectInput>
        </Field>
        <Field label="Currency">
          <SelectInput value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>
            {currencies.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
          </SelectInput>
        </Field>
        <Field label="Starting Balance">
          <TextInput
            type="number"
            value={form.balance}
            onChange={(e) => setForm({ ...form, balance: Number(e.target.value) })}
          />
        </Field>
        {form.type === 'credit_card' ? (
          <Field label="Credit Limit">
            <TextInput
              type="number"
              value={form.creditLimit ?? ''}
              onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) || undefined })}
            />
          </Field>
        ) : null}
        <Field label="Reconciliation">
          <label className="flex cursor-pointer items-center gap-3">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={form.reconciliationEnabled ?? false}
                onChange={(e) => setForm({ ...form, reconciliationEnabled: e.target.checked })}
              />
              <div
                className={[
                  'h-6 w-11 rounded-full transition-colors',
                  (form.reconciliationEnabled ?? false) ? 'bg-accent' : 'bg-white/15',
                ].join(' ')}
              />
              <div
                className={[
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
                  (form.reconciliationEnabled ?? false) ? 'translate-x-5' : 'translate-x-0.5',
                ].join(' ')}
              />
            </div>
            <span className="text-sm text-white/70">
              {(form.reconciliationEnabled ?? false) ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </Field>
        <FormErrorMessage error={error} />
      </Card>
      <Button type="submit" variant="accent">Save</Button>
      {wallet ? <Button type="button" variant="danger" onClick={handleDelete}>Delete</Button> : null}
    </form>
  )
}
