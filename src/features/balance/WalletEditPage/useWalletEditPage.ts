import { useState } from 'react'
import {
  useParams,
  useSearchParams,
} from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import { useFormCrud } from '@/hooks'
import { createId } from '@/lib'
import { useCurrencyStore, useWalletStore } from '@/stores'
import type { Wallet, WalletType } from '@/types/domain'

import type { WalletEditPageProps } from './WalletEditPage'

const DEFAULT_ICON: Record<string, string> = {
  payment: 'fa-wallet',
  credit_card: 'fa-credit-card',
}

export function useWalletEditPage(): WalletEditPageProps | null {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const backNavigate = useBackNavigate()
  const currencies = useCurrencyStore((state) => state.items)
  const existing = useWalletStore((state) => (id
    ? state.findById(id)
    : undefined))
  const add = useWalletStore((state) => state.add)
  const update = useWalletStore((state) => state.update)
  const remove = useWalletStore((state) => state.remove)

  const initialType: WalletType = (searchParams.get('type') as WalletType) || existing?.type || 'payment'

  const [form, setForm] = useState<Wallet>(() => existing ?? {
    id: createId(),
    name: '',
    type: initialType,
    currency: currencies[0]?.code ?? 'THB',
    balance: 0,
    color: '#10b981',
    icon: initialType === 'credit_card'
      ? 'fa-credit-card'
      : 'fa-wallet',
  })

  const {
    error, onSubmit, onDelete,
  } = useFormCrud<Wallet>({
    existing,
    add,
    update,
    remove: (item) => remove(item.id),
    navigateTo: '/balance',
    validate: (data) => {
      if (!data.name.trim()) {
        return 'Name is required'
      }
      if (data.type === 'credit_card' && data.creditLimit !== undefined && data.creditLimit <= 0) {
        return 'Credit limit must be greater than 0'
      }

      return null
    },
  })

  if (id && !existing) {
    return null
  }

  return {
    form,
    currencies,
    error,
    title: existing
      ? 'Edit Wallet'
      : 'New Wallet',
    showDelete: Boolean(existing),
    typeDisabled: Boolean(existing),
    onChangeName: (name) => setForm((prev) => ({ ...prev, name })),
    onChangeType: (type) => setForm((prev) => ({
      ...prev,
      type: type as WalletType,
      icon: DEFAULT_ICON[type] ?? prev.icon,
    })),
    onChangeCurrency: (currency) => setForm((prev) => ({ ...prev, currency })),
    onChangeIcon: (icon) => setForm((prev) => ({ ...prev, icon })),
    onChangeBalance: (balance) => setForm((prev) => ({ ...prev, balance })),
    onChangeCreditLimit: (creditLimit) => setForm((prev) => ({ ...prev, creditLimit })),
    onChangeReconciliation: (reconciliationEnabled) => setForm((prev) => ({ ...prev, reconciliationEnabled })),
    onBack: () => backNavigate('/balance'),
    onSubmit: () => onSubmit(form),
    onDelete,
  }
}
