import { useState } from 'react'
import { useParams } from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import { useCategoryStore } from '@/stores'

import type { CategoryEditPageProps } from './CategoryEditPage'

export function useCategoryEditPage(): CategoryEditPageProps | null {
  const { id } = useParams()
  const backNavigate = useBackNavigate()
  const findById = useCategoryStore((state) => state.findById)
  const update = useCategoryStore((state) => state.update)

  const existing = id ? findById(id) : undefined

  const [name, setName] = useState(existing?.name ?? '')
  const [icon, setIcon] = useState(existing?.icon ?? 'fa-circle')

  if (!existing) return null

  async function onSubmit() {
    if (!existing) return
    await update({ ...existing, name: name.trim(), icon })
    backNavigate(-1)
  }

  return {
    form: { name, icon },
    onChangeName: setName,
    onChangeIcon: setIcon,
    onBack: () => backNavigate(-1),
    onSubmit,
  }
}
