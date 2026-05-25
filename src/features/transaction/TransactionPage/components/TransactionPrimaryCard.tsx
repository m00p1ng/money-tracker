import { formatAmount } from '@/lib'
import type { TransactionItem, TransactionType, Wallet } from '@/types/domain'

import CategoryItemsCardContainer from './CategoryItemsCard'
import { ExchangeRateRow } from './ExchangeRateRow'
import { WalletSelectorRow } from './WalletSelectorRow'

interface TransactionPrimaryCardProps {
  type: Extract<TransactionType, 'expense' | 'income'>
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

const totalStyle: Record<'expense' | 'income', { text: string; bg: string; border: string }> = {
  expense: {
    text: 'text-danger',
    bg: 'bg-danger/10',
    border: 'border-danger/20',
  },
  income: {
    text: 'text-green-500',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
  },
}

export function TransactionPrimaryCard({
  type,
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
  const total = items.reduce((sum, item) => sum + item.amount, 0)
  const style = totalStyle[type]
  const showExchangeRate = currency !== wallet?.currency

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.085] bg-white/[0.08]">
      <WalletSelectorRow
        ariaLabel="Wallet"
        label="Wallet"
        wallet={wallet}
        fallbackName="Cash"
        fallbackColor="#38bdf8"
        showBalance
        variant="flat"
        onClick={onWalletClick}
      />

      <div className="border-t border-white/[0.05]">
        <CategoryItemsCardContainer
          items={items}
          focusedIndex={focusedIndex}
          onFocus={onFocusItem}
          onAdd={onAddCategory}
          onRemove={onRemoveItem}
          onChangeCategory={onChangeCategory}
        />
      </div>

      {showExchangeRate && (
        <div className="border-t border-white/[0.05]">
          <ExchangeRateRow
            label="Exchange Rate"
            value={exchangeRate}
            defaultRate={defaultRate}
            variant="flat"
            onChange={onUpdateExchangeRate}
          />
        </div>
      )}

      <div className={`flex items-center justify-between border-t px-4 py-3 ${style.bg} ${style.border}`}>
        <span className="text-[9px] uppercase tracking-[1px] text-white/40">Total</span>
        <span className={`text-xl font-bold ${style.text}`}>
          {formatAmount(total)}
          <span className="ml-1.5 text-[10px] font-normal opacity-50">{currency}</span>
        </span>
      </div>
    </div>
  )
}
