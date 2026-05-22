import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../schema'
import { seedDatabase } from '../seed'

describe('seedDatabase', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('creates the default wallet, currency, settings, and categories once', async () => {
    await seedDatabase()
    await seedDatabase()

    expect(await db.wallets.count()).toBe(1)
    expect(await db.currencies.count()).toBe(1)
    expect(await db.settings.count()).toBe(1)
    expect(await db.categories.where('type').equals('expense').count()).toBe(40)
    expect(await db.categories.where('type').equals('income').count()).toBe(20)

    await expect(db.wallets.get('wallet-cash')).resolves.toMatchObject({
      name: 'Cash',
      type: 'payment',
      currency: 'THB',
      balance: 0,
    })
  })
})
