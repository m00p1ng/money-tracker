import { FormEvent, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useBackNavigate } from '../../context/navigationDirection'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Field, TextInput } from '../../components/ui/Field'
import { FormErrorMessage, PageHeader } from '../../components/ui'
import { useCurrencyStore } from '../../stores/currencyStore'
import type { Currency } from '../../types/domain'

export function CurrencyFormPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const backNavigate = useBackNavigate()
  const existing = useCurrencyStore((state) => (code ? state.findByCode(code) : undefined))
  const add = useCurrencyStore((state) => state.add)
  const update = useCurrencyStore((state) => state.update)
  const remove = useCurrencyStore((state) => state.remove)
  const setBase = useCurrencyStore((state) => state.setBase)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<Currency>(() => existing ?? { code: '', symbol: '', name: '', isBase: false, rate: 1 })

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    if (!form.code.trim()) { setError('Code is required'); return }
    if (!form.symbol.trim()) { setError('Symbol is required'); return }
    if (!form.name.trim()) { setError('Name is required'); return }
    if (form.rate <= 0) { setError('Rate must be greater than 0'); return }
    try {
      await (existing ? update(form) : add(form))
      if (form.isBase) {
        await setBase(form.code.toUpperCase())
      }
      navigate('/settings/currencies')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save currency')
    }
  }

  async function onDelete() {
    if (!existing) return
    try {
      await remove(existing.code)
      navigate('/settings/currencies')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete currency')
    }
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <PageHeader title={existing ? 'Edit Currency' : 'New Currency'} onBack={() => backNavigate('/settings/currencies')} />
      <Card className="space-y-4">
        <Field label="Code"><TextInput value={form.code} disabled={Boolean(existing)} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })} /></Field>
        <Field label="Symbol"><TextInput value={form.symbol} onChange={(event) => setForm({ ...form, symbol: event.target.value })} /></Field>
        <Field label="Name"><TextInput value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></Field>
        <Field label="Rate"><TextInput type="number" value={form.rate} onChange={(event) => setForm({ ...form, rate: Number(event.target.value) })} /></Field>
        <label className="flex items-center gap-2 text-sm"><input checked={form.isBase} type="checkbox" onChange={(event) => setForm({ ...form, isBase: event.target.checked, rate: event.target.checked ? 1 : form.rate })} /> Base currency</label>
        <FormErrorMessage error={error} />
      </Card>
      <Button type="submit" variant="accent">Save</Button>
      {existing ? <Button type="button" variant="danger" onClick={onDelete}>Delete</Button> : null}
    </form>
  )
}
