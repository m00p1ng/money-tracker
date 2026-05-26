import { db } from '@/db/schema'
import type {
  Category,
  Currency,
  Settings,
  Wallet,
} from '@/types/domain'

const expenseRoots = [
  ['Food & Drink', 'fa-utensils', ['Restaurant', 'Groceries', 'Coffee']],
  ['Transport', 'fa-car', ['Fuel', 'Public Transit', 'Taxi']],
  ['Shopping', 'fa-bag-shopping', ['Clothes', 'Electronics', 'Household']],
  ['Bills & Utilities', 'fa-file-invoice-dollar', ['Electricity', 'Water', 'Internet']],
  ['Health', 'fa-heart-pulse', ['Medicine', 'Doctor', 'Gym']],
  ['Entertainment', 'fa-film', ['Movies', 'Games', 'Streaming']],
  ['Education', 'fa-graduation-cap', ['Books', 'Courses', 'Supplies']],
  ['Personal Care', 'fa-spa', ['Haircut', 'Cosmetics', 'Spa']],
  ['Travel', 'fa-plane', ['Hotel', 'Flight', 'Activities']],
  ['Other', 'fa-ellipsis', ['Miscellaneous', 'Uncategorized', 'Adjustment']],
] as const

const incomeRoots = [
  ['Salary', 'fa-money-bill-wave', ['Base Pay', 'Bonus', 'Overtime']],
  ['Freelance', 'fa-laptop-code', ['Project', 'Consulting', 'Design']],
  ['Investment', 'fa-chart-line', ['Dividends', 'Interest', 'Capital Gains']],
  ['Gift', 'fa-gift', ['Birthday', 'Holiday', 'Other Gift']],
  ['Other', 'fa-circle-plus', ['Miscellaneous', 'Refund', 'Adjustment']],
] as const

const wallet: Wallet = {
  id: 'wallet-cash',
  name: 'Cash',
  type: 'payment',
  currency: 'THB',
  balance: 0,
  color: '#10b981',
  icon: 'fa-wallet',
}

const currency: Currency = {
  code: 'THB',
  symbol: '฿',
  name: 'Thai Baht',
  isBase: true,
  rate: 1,
}

const settings: Settings = {
  id: 'default',
  theme: 'forest',
  language: 'en',
  dateFormat: 'DD MMM YYYY',
}

function slug(value: string): string {
  return value.toLowerCase().replace(/\u0026/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

function buildCategories(): Category[] {
  const categories: Category[] = []
  let expensePosition = 0
  let incomePosition = 0

  for (const [name, icon, children] of expenseRoots) {
    const rootId = `expense-${slug(name)}`
    categories.push({
      id: rootId,
      name,
      type: 'expense',
      level: 1,
      icon,
      isDefault: true,
      position: expensePosition++,
    })
    let childPosition = 0
    for (const child of children) {
      categories.push({
        id: `${rootId}-${slug(child)}`,
        name: child,
        type: 'expense',
        parentId: rootId,
        level: 2,
        icon,
        isDefault: true,
        position: childPosition++,
      })
    }
  }

  for (const [name, icon, children] of incomeRoots) {
    const rootId = `income-${slug(name)}`
    categories.push({
      id: rootId,
      name,
      type: 'income',
      level: 1,
      icon,
      isDefault: true,
      position: incomePosition++,
    })
    let childPosition = 0
    for (const child of children) {
      categories.push({
        id: `${rootId}-${slug(child)}`,
        name: child,
        type: 'income',
        parentId: rootId,
        level: 2,
        icon,
        isDefault: true,
        position: childPosition++,
      })
    }
  }

  return categories
}

const BALANCE_ADJUSTMENT_CATEGORY: Category = {
  id: 'adjustment-balance-adjustment',
  name: 'Balance Adjustment',
  type: 'adjustment',
  level: 1,
  icon: 'fa-sliders',
  isDefault: true,
}

export async function ensureSystemCategories(): Promise<void> {
  await db.categories.put(BALANCE_ADJUSTMENT_CATEGORY)
}

export async function seedDatabase(): Promise<void> {
  const walletCount = await db.wallets.count()
  if (walletCount > 0) {
    return
  }

  await db.transaction('rw', db.wallets, db.currencies, db.settings, db.categories, async () => {
    await db.wallets.put(wallet)
    await db.currencies.put(currency)
    await db.settings.put(settings)
    await db.categories.bulkPut([...buildCategories(), BALANCE_ADJUSTMENT_CATEGORY])
  })
}
