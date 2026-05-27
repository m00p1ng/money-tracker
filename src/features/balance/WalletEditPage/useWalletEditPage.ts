import { useState } from 'react'
import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import { createId } from '@/lib'
import {
  useCurrencyStore,
  useTransactionStore,
  useWalletStore,
} from '@/stores'
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
  const navigate = useNavigate()
  const currencies = useCurrencyStore((state) => state.items)
  const existing = useWalletStore((state) => (id
    ? state.findById(id)
    : undefined))
  const add = useWalletStore((state) => state.add)
  const update = useWalletStore((state) => state.update)
  const remove = useWalletStore((state) => state.remove)
  const addTransaction = useTransactionStore((state) => state.add)

  const [error, setError] = useState<string | null>(null)

  const initialType: WalletType = (searchParams.get('type') as WalletType) || existing?.type || 'payment'

  const [form, setForm] = useState<Wallet>(() => {
    if (existing) {
      return {
        ...existing,
        balance: existing.balance,
      }
    }

    return {
      id: createId(),
      name: '',
      type: initialType,
      currency: currencies[0]?.code ?? 'THB',
      balance: 0,
      color: '#10b981',
      icon: initialType === 'credit_card'
        ? 'fa-credit-card'
        : 'fa-wallet',
    }
  })

  function validate(data: Wallet): string | null {
    if (!data.name.trim()) {
      return 'Name is required'
    }
    if (data.type === 'credit_card' && data.creditLimit !== undefined && data.creditLimit <= 0) {
      return 'Credit limit must be greater than 0'
    }

    return null
  }

  async function onSubmit() {
    const msg = validate(form)
    if (msg) {
      setError(msg)

      return
    }

    try {
      if (existing) {
        const currentAmount = existing.balance
        const diff = form.balance - currentAmount
        await update({ ...form, balance: existing.balance })
        if (diff !== 0) {
          await addTransaction({
            id: createId(),
            type: 'adjustment',
            walletId: existing.id,
            currency: existing.currency,
            items: [{ categoryId: 'adjustment-balance-adjustment', amount: diff }],
            date: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          })
        }
      } else {
        const initialBalance = form.balance
        await add({ ...form, balance: 0 })
        if (initialBalance !== 0) {
          await addTransaction({
            id: createId(),
            type: 'adjustment',
            walletId: form.id,
            currency: form.currency,
            items: [{ categoryId: 'adjustment-opening-balance', amount: initialBalance }],
            date: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          })
        }
      }
      navigate('/balance')
    } catch (err) {
      setError(err instanceof Error
        ? err.message
        : 'Unable to save')
    }
  }

  async function onDelete() {
    if (!existing) {
      return
    }
    try {
      await remove(existing.id)
      navigate('/balance')
    } catch (err) {
      setError(err instanceof Error
        ? err.message
        : 'Unable to delete')
    }
  }

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
    balanceLabel: existing
      ? 'Current Balance'
      : 'Starting Balance',
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
    onSubmit,
    onDelete,
  }
}
