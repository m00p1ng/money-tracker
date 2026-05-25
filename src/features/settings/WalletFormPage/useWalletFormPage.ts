import {
  useParams,
  useSearchParams,
} from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import { useFormCrud } from '@/hooks'
import { useCurrencyStore, useWalletStore } from '@/stores'
import type { Wallet, WalletType } from '@/types/domain'

export function useWalletFormPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const backNavigate = useBackNavigate()
  const currencies = useCurrencyStore((state) => state.items)
  const wallet = useWalletStore((state) => (id
    ? state.findById(id)
    : undefined))
  const add = useWalletStore((state) => state.add)
  const update = useWalletStore((state) => state.update)
  const remove = useWalletStore((state) => state.remove)
  const initialType: WalletType = (searchParams.get('type') as WalletType) || wallet?.type || 'payment'

  const { error, onSubmit, onDelete } = useFormCrud<Wallet>({
    existing: wallet,
    add,
    update,
    remove: (item) => remove(item.id),
    navigateTo: '/settings/wallets',
    validate: (form) => {
      if (!form.name.trim()) {
        return 'Name is required'
      }
      if (form.type === 'credit_card' && form.creditLimit !== undefined && form.creditLimit <= 0) {
        return 'Credit limit must be greater than 0'
      }

      return null
    },
  })

  return {
    wallet,
    currencies,
    error,
    initialType,
    onBack: () => backNavigate('/settings/wallets'),
    onSubmit,
    onDelete,
  }
}
