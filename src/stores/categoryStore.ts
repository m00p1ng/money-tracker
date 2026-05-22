import { create } from 'zustand'
import { db } from '../db/schema'
import type { Category, TransactionType } from '../types/domain'

type CategoryStore = {
  items: Category[]
  load: () => Promise<void>
  add: (category: Category) => Promise<void>
  update: (category: Category) => Promise<void>
  remove: (id: string) => Promise<void>
  byType: (type: TransactionType) => Category[]
  findById: (id: string) => Category | undefined
  parentOf: (category: Category) => Category | undefined
  childrenOf: (id: string) => Category[]
}

function validateCategory(category: Category, items: Category[]): void {
  if (!category.name.trim()) throw new Error('Category name is required')
  if (category.level < 1 || category.level > 5) throw new Error('Category level must be between 1 and 5')

  if (!category.parentId) {
    if (category.level !== 1) throw new Error('Root category must be level 1')
    return
  }

  const parent = items.find((item) => item.id === category.parentId)
  if (!parent) throw new Error('Parent category does not exist')
  if (parent.type !== category.type) throw new Error('Parent category type must match')
  if (category.level !== parent.level + 1) throw new Error('Child category level must be parent level plus 1')
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  items: [],
  async load() {
    set({ items: await db.categories.toArray() })
  },
  async add(category) {
    validateCategory(category, get().items)
    await db.categories.put(category)
    set({ items: [...get().items.filter((item) => item.id !== category.id), category] })
  },
  async update(category) {
    validateCategory(category, get().items.filter((item) => item.id !== category.id))
    await db.categories.put(category)
    set({ items: get().items.map((item) => (item.id === category.id ? category : item)) })
  },
  async remove(id) {
    const childCount = await db.categories.where('parentId').equals(id).count()
    if (childCount > 0) throw new Error('Category has child categories')

    const transactions = await db.transactions.toArray()
    if (transactions.some((transaction) => transaction.items.some((item) => item.categoryId === id))) {
      throw new Error('Category has existing transactions')
    }

    await db.categories.delete(id)
    set({ items: get().items.filter((category) => category.id !== id) })
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
  childrenOf(id) {
    return get().items.filter((category) => category.parentId === id)
  },
}))
