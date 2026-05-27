import sumBy from 'lodash/sumBy'

import { ExchangeRateRow } from '@/components'
import { formatSignedAmount } from '@/lib'
import type { TransactionItem, Wallet } from '@/types/domain'

import CategoryItemsCard from './CategoryItemsCard'
import { WalletSelectorRow } from './WalletSelectorRow'

interface TransactionPrimaryCardProps {
  wallet: Wallet | undefined
  items: TransactionItem[]
  focusedIndex: number | null
  currency: string
  exchangeRate: string
  defaultRate: string
  onWalletClick: () => void
  onFocusItem: (index: number) => void
  onRemoveItem: (index: number) => void
  onChangeCategory: (index: number) => void
  onAddCategory: () => void
  onUpdateExchangeRate: (value: string) => void
}

export function TransactionPrimaryCard({
  wallet,
  items,
  focusedIndex,
  currency,
  exchangeRate,
  defaultRate,
  onWalletClick,
  onFocusItem,
  onRemoveItem,
  onChangeCategory,
  onAddCategory,
  onUpdateExchangeRate,
}: TransactionPrimaryCardProps) {
  const total = sumBy(items, 'amount')
  const showExchangeRate = currency !== wallet?.currency

  return (
    <div className="overflow-hidden rounded-2xl border border-white/8.5 bg-white/8">
      <WalletSelectorRow
        ariaLabel="Wallet"
        wallet={wallet}
        fallbackName="Cash"
        showBalance
        variant="flat"
        onClick={onWalletClick}
      />

      <div className="border-t border-white/5">
        <CategoryItemsCard
          items={items}
          focusedIndex={focusedIndex}
          currency={wallet?.currency ?? currency}
          onFocus={onFocusItem}
          onAdd={onAddCategory}
          onRemove={onRemoveItem}
          onChangeCategory={onChangeCategory}
        />
      </div>

      {showExchangeRate && (
        <div className="border-t border-white/5">
          <ExchangeRateRow
            label="Exchange Rate"
            value={exchangeRate}
            defaultRate={defaultRate}
            variant="flat"
            onChange={onUpdateExchangeRate}
          />
        </div>
      )}

      <div className="flex items-center justify-between border-t border-white/20 pl-6 px-4 py-2">
        <span className="text-lg font-bold">
          Total
        </span>
        <span className="text-lg font-bold">
          {formatSignedAmount(total, wallet?.currency ?? currency)}
        </span>
      </div>
    </div>
  )
}
