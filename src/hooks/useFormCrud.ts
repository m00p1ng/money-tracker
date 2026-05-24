import { useState } from 'react'
import { useNavigate } from 'react-router'

type UseFormCrudOptions<T extends { id: string }> = {
  existing: T | undefined
  add: (data: T) => Promise<void>
  update: (data: T) => Promise<void>
  remove: (id: string) => Promise<void>
  navigateTo: string
  validate?: (data: T) => string | null
}

export function useFormCrud<T extends { id: string }>({
  existing,
  add,
  update,
  remove,
  navigateTo,
  validate,
}: UseFormCrudOptions<T>) {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(data: T) {
    if (validate) {
      const msg = validate(data)
      if (msg) {
        setError(msg)

        return
      }
    }
    try {
      await (existing
        ? update(data)
        : add(data))
      navigate(navigateTo)
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
      navigate(navigateTo)
    } catch (err) {
      setError(err instanceof Error
        ? err.message
        : 'Unable to delete')
    }
  }

  return {
    error,
    onSubmit,
    onDelete,
  }
}
