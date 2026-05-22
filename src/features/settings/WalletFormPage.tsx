import { FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, SelectInput, TextInput } from '../../components/ui/Field'
import { createId } from '../../lib/id'
import { useCurrencyStore } from '../../stores/currencyStore'
import { useWalletStore } from '../../stores/walletStore'
import type { Wallet, WalletType } from '../../types/domain'

const DEFAULT_CURRENCY = 'THB'

export function WalletFormPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const currencies = useCurrencyStore((state) => state.items)
  const wallet = useWalletStore((state) => (id ? state.findById(id) : undefined))
  const add = useWalletStore((state) => state.add)
  const update = useWalletStore((state) => state.update)
  const remove = useWalletStore((state) => state.remove)
  const initialType = (searchParams.get('type') as WalletType) || wallet?.type || 'payment'
  const [error, setError] = useState('')
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
      setError('Name is required')
      return
    }
    if (form.type === 'credit_card' && form.creditLimit !== undefined && form.creditLimit <= 0) {
      setError('Credit limit must be greater than 0')
      return
    }
    try {
      await (wallet ? update(form) : add(form))
      navigate('/settings/wallets')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to save wallet')
    }
  }

  async function onDelete() {
    if (!wallet) return
    try {
      await remove(wallet.id)
      navigate('/settings/wallets')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unable to delete wallet')
    }
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <header>
        <Link className="text-sm text-accent" to="/settings/wallets">Back</Link>
        <h1 className="mt-3 text-2xl font-semibold">{title}</h1>
      </header>
      <Card className="space-y-4">
        <Field label="Name"><TextInput value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
        <Field label="Type"><SelectInput value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value as WalletType })}><option value="payment">Payment</option><option value="credit_card">Credit Card</option></SelectInput></Field>
        <Field label="Currency"><SelectInput value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })}>{currencies.map((currency) => <option key={currency.code} value={currency.code}>{currency.code}</option>)}</SelectInput></Field>
        <Field label="Starting Balance"><TextInput type="number" value={form.balance} onChange={(event) => setForm({ ...form, balance: Number(event.target.value) })} /></Field>
        {form.type === 'credit_card' ? <Field label="Credit Limit"><TextInput type="number" value={form.creditLimit ?? ''} onChange={(event) => setForm({ ...form, creditLimit: Number(event.target.value) || undefined })} /></Field> : null}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </Card>
      <Button type="submit" variant="accent">Save</Button>
      {wallet ? <Button type="button" variant="danger" onClick={onDelete}>Delete</Button> : null}
    </form>
  )
}
