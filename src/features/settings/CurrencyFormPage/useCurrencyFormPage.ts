import { useNavigate, useParams } from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import { useCurrencyStore } from '@/stores'
import type { Currency } from '@/types/domain'

export function useCurrencyFormPage() {
  const { code } = useParams()
  const navigate = useNavigate()
  const backNavigate = useBackNavigate()
  const existing = useCurrencyStore((state) => (code ? state.findByCode(code) : undefined))
  const add = useCurrencyStore((state) => state.add)
  const update = useCurrencyStore((state) => state.update)
  const remove = useCurrencyStore((state) => state.remove)
  const setBase = useCurrencyStore((state) => state.setBase)

  async function onSubmit(form: Currency, setError: (err: string | null) => void) {
    if (!form.code.trim()) {
      setError('Code is required'); return 
    }
    if (!form.symbol.trim()) {
      setError('Symbol is required'); return 
    }
    if (!form.name.trim()) {
      setError('Name is required'); return 
    }
    if (form.rate <= 0) {
      setError('Rate must be greater than 0'); return 
    }
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

  async function onDelete(setError: (err: string | null) => void) {
    if (!existing) {
      return
    }
    try {
      await remove(existing.code)
      navigate('/settings/currencies')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete currency')
    }
  }

  return {
    existing,
    onBack: () => backNavigate('/settings/currencies'),
    onSubmit,
    onDelete,
  }
}
