import type { Category, Currency, Settings, Wallet } from '../types/domain'
import { db } from './schema'

const expenseRoots = [
  ['Food & Drink', 'fa-utensils', '#65a30d', ['Restaurant', 'Groceries', 'Coffee']],
  ['Transport', 'fa-car', '#0284c7', ['Fuel', 'Public Transit', 'Taxi']],
  ['Shopping', 'fa-bag-shopping', '#db2777', ['Clothes', 'Electronics', 'Household']],
  ['Bills & Utilities', 'fa-file-invoice-dollar', '#ca8a04', ['Electricity', 'Water', 'Internet']],
  ['Health', 'fa-heart-pulse', '#dc2626', ['Medicine', 'Doctor', 'Gym']],
  ['Entertainment', 'fa-film', '#7c3aed', ['Movies', 'Games', 'Streaming']],
  ['Education', 'fa-graduation-cap', '#2563eb', ['Books', 'Courses', 'Supplies']],
  ['Personal Care', 'fa-spa', '#be185d', ['Haircut', 'Cosmetics', 'Spa']],
  ['Travel', 'fa-plane', '#0891b2', ['Hotel', 'Flight', 'Activities']],
  ['Other', 'fa-ellipsis', '#64748b', ['Miscellaneous']],
] as const

const incomeRoots = [
  ['Salary', 'fa-money-bill-wave', '#16a34a', ['Base Pay', 'Bonus', 'Overtime']],
  ['Freelance', 'fa-laptop-code', '#0d9488', ['Project', 'Consulting', 'Design']],
  ['Investment', 'fa-chart-line', '#4f46e5', ['Dividends', 'Interest', 'Capital Gains']],
  ['Gift', 'fa-gift', '#e11d48', ['Birthday', 'Holiday', 'Other Gift']],
  ['Other', 'fa-circle-plus', '#64748b', ['Miscellaneous']],
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

  for (const [name, icon, color, children] of expenseRoots) {
    const rootId = `expense-${slug(name)}`
    categories.push({ id: rootId, name, type: 'expense', level: 1, icon, color, isDefault: true })
    for (const child of children) {
      categories.push({
        id: `${rootId}-${slug(child)}`,
        name: child,
        type: 'expense',
        parentId: rootId,
        level: 2,
        icon,
        color,
        isDefault: true,
      })
    }
  }

  for (const [name, icon, color, children] of incomeRoots) {
    const rootId = `income-${slug(name)}`
    categories.push({ id: rootId, name, type: 'income', level: 1, icon, color, isDefault: true })
    for (const child of children) {
      categories.push({
        id: `${rootId}-${slug(child)}`,
        name: child,
        type: 'income',
        parentId: rootId,
        level: 2,
        icon,
        color,
        isDefault: true,
      })
    }
  }

  return categories
}

export async function seedDatabase(): Promise<void> {
  const walletCount = await db.wallets.count()
  if (walletCount > 0) return

  await db.transaction('rw', db.wallets, db.currencies, db.settings, db.categories, async () => {
    await db.wallets.put(wallet)
    await db.currencies.put(currency)
    await db.settings.put(settings)
    await db.categories.bulkPut(buildCategories())
  })
}
