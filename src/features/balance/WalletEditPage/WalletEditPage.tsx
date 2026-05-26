import { FormEvent, useState } from 'react'

import {
  CurrencyPicker,
  Field,
  FormActions,
  FormErrorMessage,
  Icon,
  IconPicker,
  PageHeader,
  SelectInput,
  Switch,
  TextInput,
} from '@/components'
import type {
  Currency,
  Wallet,
} from '@/types/domain'

export interface WalletEditPageProps {
  form: Wallet
  currencies: Currency[]
  error: string | null
  title: string
  balanceLabel: string
  showDelete: boolean
  typeDisabled: boolean
  onChangeName: (name: string) => void
  onChangeType: (type: string) => void
  onChangeCurrency: (code: string) => void
  onChangeIcon: (icon: string) => void
  onChangeBalance: (balance: number) => void
  onChangeCreditLimit: (limit: number | undefined) => void
  onChangeReconciliation: (enabled: boolean) => void
  onBack: () => void
  onSubmit: () => Promise<void>
  onDelete: () => Promise<void>
}

const WALLET_TYPE_OPTIONS = [
  { value: 'payment', label: 'Payment Account' },
  { value: 'credit_card', label: 'Credit Card' },
]

export function WalletEditPage({
  form,
  currencies,
  error,
  title,
  balanceLabel,
  showDelete,
  typeDisabled,
  onChangeName,
  onChangeType,
  onChangeCurrency,
  onChangeIcon,
  onChangeBalance,
  onChangeCreditLimit,
  onChangeReconciliation,
  onBack,
  onSubmit,
  onDelete,
}: WalletEditPageProps) {
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await onSubmit()
  }

  const reconciliationEnabled = form.reconciliationEnabled ?? false
  const reconciliationDescription = reconciliationEnabled
    ? 'Included in reconciliation checks'
    : 'Excluded from reconciliation checks'

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <PageHeader title={title} onBack={onBack} />

      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Change icon"
          onClick={() => setIconPickerOpen(true)}
          className={[
            'flex h-12 w-12 shrink-0 items-center justify-center',
            'rounded-[14px] bg-white/10 text-base text-slate-50',
            'active:bg-white/20',
          ].join(' ')}
        >
          <Icon name={form.icon} />
        </button>
        <TextInput
          type="text"
          value={form.name}
          onChange={(e) => onChangeName(e.target.value)}
          placeholder="Wallet name"
        />
      </div>

      <IconPicker
        isOpen={iconPickerOpen}
        selectedIcon={form.icon}
        onSelect={(icon) => {
          onChangeIcon(icon)
          setIconPickerOpen(false)
        }}
        onClose={() => setIconPickerOpen(false)}
      />

      <Field label="Type">
        <SelectInput
          disabled={typeDisabled}
          options={WALLET_TYPE_OPTIONS}
          value={form.type}
          onChange={onChangeType}
        />
      </Field>

      <Field label="Currency">
        <button
          type="button"
          onClick={() => setCurrencyPickerOpen(true)}
          className={[
            'flex min-h-11 w-full items-center rounded-lg border border-white/10',
            'bg-white/5 px-3 text-slate-50 transition-colors',
          ].join(' ')}
        >
          {form.currency}
        </button>
      </Field>
      <CurrencyPicker
        isOpen={currencyPickerOpen}
        currencies={currencies}
        selectedCode={form.currency}
        onSelect={(code) => {
          onChangeCurrency(code)
          setCurrencyPickerOpen(false)
        }}
        onClose={() => setCurrencyPickerOpen(false)}
      />

      <Field label={balanceLabel}>
        <TextInput
          type="number"
          value={form.balance}
          onChange={(e) => onChangeBalance(Number(e.target.value))}
        />
      </Field>

      {form.type === 'credit_card'
        ? (
          <Field label="Credit Limit">
            <TextInput
              type="number"
              value={form.creditLimit ?? ''}
              onChange={(e) => onChangeCreditLimit(Number(e.target.value) || undefined)}
            />
          </Field>
        )
        : null}

      <Switch
        checked={reconciliationEnabled}
        description={reconciliationDescription}
        label="Reconciliation"
        onChange={onChangeReconciliation}
      />

      <FormErrorMessage error={error} />

      <FormActions showDelete={showDelete} onDelete={onDelete} />
    </form>
  )
}
