import {
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import { useCurrencyStore, useWalletStore } from '@/stores'
import type { Wallet, WalletType } from '@/types/domain'

export function useWalletFormPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const backNavigate = useBackNavigate()
  const currencies = useCurrencyStore((state) => state.items)
  const wallet = useWalletStore((state) => (id
    ? state.findById(id)
    : undefined))
  const add = useWalletStore((state) => state.add)
  const update = useWalletStore((state) => state.update)
  const remove = useWalletStore((state) => state.remove)
  const initialType: WalletType = (searchParams.get('type') as WalletType) || wallet?.type || 'payment'

  async function onSubmit(form: Wallet, setError: (err: string | null) => void) {
    if (!form.name.trim()) {
      setError('Name is required')

      return
    }
    if (form.type === 'credit_card' && form.creditLimit !== undefined && form.creditLimit <= 0) {
      setError('Credit limit must be greater than 0')

      return
    }
    try {
      await (wallet
        ? update(form)
        : add(form))
      navigate('/settings/wallets')
    } catch (err) {
      setError(err instanceof Error
        ? err.message
        : 'Unable to save wallet')
    }
  }

  async function onDelete(setError: (err: string | null) => void) {
    if (!wallet) {
      return
    }
    try {
      await remove(wallet.id)
      navigate('/settings/wallets')
    } catch (err) {
      setError(err instanceof Error
        ? err.message
        : 'Unable to delete wallet')
    }
  }

  return {
    wallet,
    currencies,
    initialType,
    onBack: () => backNavigate('/settings/wallets'),
    onSubmit,
    onDelete,
  }
}
