import { FormEvent, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { useBackNavigate } from '@/context/navigationDirection'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, SelectInput, TextInput } from '@/components/ui/Field'
import { FormErrorMessage, PageHeader } from '@/components/ui'
import { createId } from '@/lib/id'
import { useCurrencyStore } from '@/stores/currencyStore'
import { useWalletStore } from '@/stores/walletStore'
import type { Wallet, WalletType } from '@/types/domain'

const DEFAULT_CURRENCY = 'THB'

export function WalletFormPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const backNavigate = useBackNavigate()
  const currencies = useCurrencyStore((state) => state.items)
  const wallet = useWalletStore((state) => (id ? state.findById(id) : undefined))
  const add = useWalletStore((state) => state.add)
  const update = useWalletStore((state) => state.update)
  const remove = useWalletStore((state) => state.remove)
  const initialType = (searchParams.get('type') as WalletType) || wallet?.type || 'payment'
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

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Name is required'); return 
    }
    if (form.type === 'credit_card' && form.creditLimit !== undefined && form.creditLimit <= 0) {
      setError('Credit limit must be greater than 0'); return 
    }
    try {
      await (wallet ? update(form) : add(form))
      navigate('/settings/wallets')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save wallet')
    }
  }

  async function onDelete() {
    if (!wallet) {
      return
    }
    try {
      await remove(wallet.id)
      navigate('/settings/wallets')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete wallet')
    }
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <PageHeader title={title} onBack={() => backNavigate('/settings/wallets')} />
      <Card className="space-y-4">
        <Field label="Name"><TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Type"><SelectInput value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as WalletType })}><option value="payment">Payment</option><option value="credit_card">Credit Card</option></SelectInput></Field>
        <Field label="Currency"><SelectInput value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{currencies.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}</SelectInput></Field>
        <Field label="Starting Balance"><TextInput type="number" value={form.balance} onChange={(e) => setForm({ ...form, balance: Number(e.target.value) })} /></Field>
        {form.type === 'credit_card' ? <Field label="Credit Limit"><TextInput type="number" value={form.creditLimit ?? ''} onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) || undefined })} /></Field> : null}
        <FormErrorMessage error={error} />
      </Card>
      <Button type="submit" variant="accent">Save</Button>
      {wallet ? <Button type="button" variant="danger" onClick={onDelete}>Delete</Button> : null}
    </form>
  )
}
