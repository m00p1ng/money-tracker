import {
  FormEvent,
  useMemo,
  useState,
} from 'react'

import {
  FormActions,
  FormErrorMessage,
  Icon,
  PageHeader,
  Card,
  Field,
  SelectInput,
  SegmentedControl,
  SwitchField,
  TextInput,
} from '@/components'
import { createId, hexToRgba } from '@/lib'
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

function walletTypeLabel(type: WalletType) {
  return type === 'credit_card' ? 'Credit Card' : 'Payment Account'
}

function nextTypeIcon(type: WalletType, currentIcon: string) {
  if (type === 'credit_card' && currentIcon === 'fa-wallet') {
    return 'fa-credit-card'
  }
  if (type === 'payment' && currentIcon === 'fa-credit-card') {
    return 'fa-wallet'
  }
  return currentIcon
}

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

  function handleTypeChange(type: WalletType) {
    setForm((current) => ({
      ...current,
      type,
      icon: nextTypeIcon(type, current.icon),
    }))
  }

  const reconciliationEnabled = form.reconciliationEnabled ?? false
  const reconciliationDescription = reconciliationEnabled
    ? 'Included in reconciliation checks'
    : 'Excluded from reconciliation checks'

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <PageHeader title={title} onBack={onBack} />
      <Card className="space-y-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-base"
            style={{
              background: hexToRgba(form.color, 0.15),
              color: form.color,
            }}
          >
            <Icon name={form.icon} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-slate-50">
              {form.name.trim() || 'New wallet'}
            </p>
            <p className="mt-0.5 text-sm text-white/40">{walletTypeLabel(form.type)}</p>
          </div>
          <span className="shrink-0 text-xs font-semibold text-white/45">{form.currency}</span>
        </div>

        <Field label="Name">
          <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>

        <div className="space-y-2">
          <span className="text-sm font-medium text-slate-300">Type</span>
          <SegmentedControl
            value={form.type}
            segments={[
              { value: 'payment', label: 'Payment' },
              { value: 'credit_card', label: 'Credit Card' },
            ]}
            onChange={handleTypeChange}
          />
        </div>

        <Field label="Currency">
          <SelectInput
            value={form.currency}
            options={currencies.map((c) => ({ value: c.code, label: c.code }))}
            onChange={(value) => setForm({ ...form, currency: value })}
          />
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

        <SwitchField
          checked={reconciliationEnabled}
          description={reconciliationDescription}
          label="Reconciliation"
          onChange={(checked) => setForm({ ...form, reconciliationEnabled: checked })}
        />

        <FormErrorMessage error={error} />
      </Card>

      <FormActions showDelete={Boolean(wallet)} onDelete={handleDelete} />
    </form>
  )
}
