import { create } from 'zustand'

import { db } from '@/db/schema'
import type { Category, TransactionType } from '@/types/domain'

type CategoryStore = {
  items: Category[]
  load: () => Promise<void>
  add: (category: Category) => Promise<void>
  update: (category: Category) => Promise<void>
  remove: (id: string) => Promise<void>
  reorder: (ids: string[]) => Promise<void>
  mergeAndDelete: (sourceId: string, targetId: string) => Promise<void>
  reparent: (id: string, newParentId: string) => Promise<void>
  byType: (type: TransactionType) => Category[]
  findById: (id: string) => Category | undefined
  parentOf: (category: Category) => Category | undefined
  childrenOf: (id: string) => Category[]
}

async function validateCategory(category: Category): Promise<void> {
  if (!category.name.trim()) {
    throw new Error('Category name is required')
  }
  if (category.level < 1 || category.level > 5) {
    throw new Error('Category level must be between 1 and 5')
  }

  if (!category.parentId) {
    if (category.level !== 1) {
      throw new Error('Root category must be level 1')
    }

    return
  }

  const parent = await db.categories.get(category.parentId)
  if (!parent) {
    throw new Error('Parent category does not exist')
  }
  if (parent.id === category.id) {
    throw new Error('Parent category does not exist')
  }
  if (parent.type !== category.type) {
    throw new Error('Parent category type must match')
  }
  if (category.level !== parent.level + 1) {
    throw new Error('Child category level must be parent level plus 1')
  }
}

async function validateSafeUpdate(category: Category): Promise<void> {
  const existing = await db.categories.get(category.id)
  if (!existing) {
    return
  }

  const childCount = await db.categories.where('parentId').equals(category.id).count()
  if (childCount === 0) {
    return
  }

  const parentChanged = existing.parentId !== category.parentId
  if (existing.type !== category.type || existing.level !== category.level || parentChanged) {
    throw new Error('Category has child categories')
  }
}

export const useCategoryStore = create<CategoryStore>((set, get) => ({
  items: [],
  async load() {
    set({ items: await db.categories.toArray() })
  },
  async add(category) {
    await validateCategory(category)
    await validateSafeUpdate(category)
    await db.categories.put(category)
    set({ items: [...get().items.filter((item) => item.id !== category.id), category] })
  },
  async update(category) {
    await validateCategory(category)
    await validateSafeUpdate(category)
    await db.categories.put(category)
    set({ items: [...get().items.filter((item) => item.id !== category.id), category] })
  },
  async remove(id) {
    const childCount = await db.categories.where('parentId').equals(id).count()
    if (childCount > 0) {
      throw new Error('Category has child categories')
    }

    const transactions = await db.transactions.toArray()
    if (transactions.some((transaction) => transaction.items.some((item) => item.categoryId === id))) {
      throw new Error('Category has existing transactions')
    }

    await db.categories.delete(id)
    set({ items: get().items.filter((category) => category.id !== id) })
  },
  async reorder(ids) {
    const current = get().items
    const updated: Category[] = ids.flatMap((id, index) => {
      const cat = current.find((c) => c.id === id)
      if (!cat) return []
      return [{ ...cat, position: index }]
    })
    await db.categories.bulkPut(updated)
    set({ items: current.map((c) => updated.find((u) => u.id === c.id) ?? c) })
  },
  async mergeAndDelete(sourceId, targetId) {
    const transactions = await db.transactions.toArray()
    const affected = transactions.filter((t) =>
      t.items.some((item) => item.categoryId === sourceId))
    if (affected.length > 0) {
      const updated = affected.map((t) => ({
        ...t,
        items: t.items.map((item) =>
          item.categoryId === sourceId
            ? { ...item, categoryId: targetId }
            : item),
      }))
      await db.transactions.bulkPut(updated)
    }
    await db.categories.delete(sourceId)
    set({ items: get().items.filter((c) => c.id !== sourceId) })
  },
  async reparent(id, newParentId) {
    const items = get().items
    const category = items.find((c) => c.id === id)
    const newParent = items.find((c) => c.id === newParentId)
    if (!category || !newParent) return

    const newLevel = (newParent.level + 1) as Category['level']
    const levelDelta = newLevel - category.level

    function collectDescendants(parentId: string): Category[] {
      const children = items.filter((c) => c.parentId === parentId)
      return children.flatMap((c) => [c, ...collectDescendants(c.id)])
    }

    const descendants = collectDescendants(id)
    const updatedRoot = { ...category, parentId: newParentId, level: newLevel }
    const updatedDescendants = descendants.map((d) => ({
      ...d,
      level: Math.min(5, d.level + levelDelta) as Category['level'],
    }))

    const allUpdated = [updatedRoot, ...updatedDescendants]
    await db.categories.bulkPut(allUpdated)
    set({ items: items.map((c) => allUpdated.find((u) => u.id === c.id) ?? c) })
  },
  byType(type) {
    return get().items.filter((category) => category.type === type)
  },
  findById(id) {
    return get().items.find((category) => category.id === id)
  },
  parentOf(category) {
    return category.parentId
      ? get().findById(category.parentId)
      : undefined
  },
  childrenOf(id) {
    return get().items.filter((category) => category.parentId === id)
  },
}))
