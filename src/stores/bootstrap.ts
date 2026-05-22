import { seedDatabase } from '../db/seed'
import { useCategoryStore } from './categoryStore'
import { useCurrencyStore } from './currencyStore'
import { useSettingsStore } from './settingsStore'
import { useTransactionStore } from './transactionStore'
import { useWalletStore } from './walletStore'

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
