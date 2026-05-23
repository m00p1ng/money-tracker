import { seedDatabase } from '@/db/seed'
import { useCategoryStore, useCurrencyStore, useSettingsStore, useTransactionStore, useWalletStore } from '@/stores'

export async function bootstrapStores(): Promise<void> {
  await seedDatabase()
  await Promise.all([
    useWalletStore.getState().load(),
    useCategoryStore.getState().load(),
    useCurrencyStore.getState().load(),
    useSettingsStore.getState().load(),
    useTransactionStore.getState().load(),
  ])
}
