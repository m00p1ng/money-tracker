import { useParams } from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import { useFormCrud } from '@/hooks'
import { useCurrencyStore } from '@/stores'
import type { Currency } from '@/types/domain'

export function useCurrencyFormPage() {
  const { code } = useParams()
  const backNavigate = useBackNavigate()
  const existing = useCurrencyStore((state) => (code
    ? state.findByCode(code)
    : undefined))
  const add = useCurrencyStore((state) => state.add)
  const update = useCurrencyStore((state) => state.update)
  const remove = useCurrencyStore((state) => state.remove)

  const {
    error, onSubmit, onDelete,
  } = useFormCrud<Currency>({
    existing,
    add,
    update,
    remove: (item) => remove(item.code),
    navigateTo: '/settings/currencies',
    validate: (form) => {
      if (!form.code.trim()) {
        return 'Code is required'
      }
      if (!form.symbol.trim()) {
        return 'Symbol is required'
      }
      if (!form.name.trim()) {
        return 'Name is required'
      }
      if (form.rate <= 0) {
        return 'Rate must be greater than 0'
      }

      return null
    },
  })

  return {
    existing,
    error,
    onBack: () => backNavigate('/settings/currencies'),
    onSubmit,
    onDelete,
  }
}
