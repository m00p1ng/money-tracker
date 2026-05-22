import { create } from 'zustand'
import { db } from '../db/schema'
import type { Category, TransactionType } from '../types/domain'

type CategoryStore = {
  items: Category[]
  load: () => Promise<void>
  byType: (type: TransactionType) => Category[]
  findById: (id: string) => Category | undefined
  parentOf: (category: Category) => Category | undefined
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  items: [],
  async load() {
    set({ items: await db.categories.toArray() })
  },
  byType(type) {
    return get().items.filter((category) => category.type === type)
  },
  findById(id) {
    return get().items.find((category) => category.id === id)
  },
  parentOf(category) {
    return category.parentId ? get().findById(category.parentId) : undefined
  },
}))
