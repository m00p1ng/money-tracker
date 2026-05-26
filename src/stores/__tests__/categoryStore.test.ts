import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

import { useCategoryStore } from '@/stores/categoryStore'
import type { Category } from '@/types/domain'

const baseCategories: Category[] = [
  { id: 'food', name: 'Food', type: 'expense', level: 1, icon: 'fa-utensils', isDefault: false, position: 0 },
  { id: 'transport', name: 'Transport', type: 'expense', level: 1, icon: 'fa-car', isDefault: false, position: 1 },
  { id: 'housing', name: 'Housing', type: 'expense', level: 1, icon: 'fa-home', isDefault: false, position: 2 },
  { id: 'food-snacks', name: 'Snacks', type: 'expense', level: 2, icon: 'fa-cookie', isDefault: false, parentId: 'food', position: 0 },
  { id: 'food-dinner', name: 'Dinner', type: 'expense', level: 2, icon: 'fa-plate-wheat', isDefault: false, parentId: 'food', position: 1 },
]

beforeEach(() => {
  useCategoryStore.setState({ items: baseCategories })
})

afterEach(() => {
  useCategoryStore.setState({ items: [] })
})

describe('categoryStore.reorder', () => {
  it('updates positions by new id order', async () => {
    await useCategoryStore.getState().reorder(['transport', 'food', 'housing'])
    const items = useCategoryStore.getState().items
    expect(items.find(c => c.id === 'transport')?.position).toBe(0)
    expect(items.find(c => c.id === 'food')?.position).toBe(1)
    expect(items.find(c => c.id === 'housing')?.position).toBe(2)
  })
})

describe('categoryStore.mergeAndDelete', () => {
  it('deletes the source category from store', async () => {
    await useCategoryStore.getState().mergeAndDelete('food-snacks', 'food-dinner')
    const items = useCategoryStore.getState().items
    expect(items.find(c => c.id === 'food-snacks')).toBeUndefined()
  })
})

describe('categoryStore.reparent', () => {
  it('updates parentId and level of the moved category', async () => {
    await useCategoryStore.getState().reparent('transport', 'food')
    const items = useCategoryStore.getState().items
    const transport = items.find(c => c.id === 'transport')
    expect(transport?.parentId).toBe('food')
    expect(transport?.level).toBe(2)
  })

  it('updates descendant levels recursively', async () => {
    await useCategoryStore.getState().reparent('food', 'transport')
    // food becomes level 2 under transport
    // food-snacks and food-dinner should become level 3
    const items = useCategoryStore.getState().items
    expect(items.find(c => c.id === 'food')?.level).toBe(2)
    expect(items.find(c => c.id === 'food-snacks')?.level).toBe(3)
    expect(items.find(c => c.id === 'food-dinner')?.level).toBe(3)
  })
})
