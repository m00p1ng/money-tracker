import { seedDatabase } from '@/db/seed'
import { useCategoryStore } from '@/stores/categoryStore'
import { useCurrencyStore } from '@/stores/currencyStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useTransactionStore } from '@/stores/transactionStore'
import { useWalletStore } from '@/stores/walletStore'

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
