import { formatSignedAmount } from '@/lib'
import type {
  TransactionItem,
  TransactionType,
  Wallet,
} from '@/types/domain'

import CategoryItemsCardContainer from './CategoryItemsCard'
import { ExchangeRateRow } from './ExchangeRateRow'
import { WalletSelectorRow } from './WalletSelectorRow'

interface TransactionPrimaryCardProps {
  type: Exclude<TransactionType, 'transfer'>
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

const totalStyle: Partial<Record<Exclude<TransactionType, 'transfer'>, {
  text: string
  bg: string
  border: string
}>> = {
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

const DEFAULT_STYLE = {
  text: 'text-slate-400',
  bg: 'bg-white/5',
  border: 'border-white/10',
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
  const style = totalStyle[type] ?? DEFAULT_STYLE
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
        <CategoryItemsCardContainer
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

      <div className={`flex items-center justify-end border-t px-4 py-3 ${style.bg} ${style.border}`}>
        <span className={`text-xl font-bold ${style.text}`}>
          {formatSignedAmount(total, wallet?.currency ?? currency)}
        </span>
      </div>
    </div>
  )
}
