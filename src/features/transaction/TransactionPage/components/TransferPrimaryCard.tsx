import cx from 'classnames'

import { Icon } from '@/components'
import { formatAmount } from '@/lib'
import type { Wallet } from '@/types/domain'

import { ExchangeRateRow } from './ExchangeRateRow'

interface TransferPrimaryCardProps {
  wallets: Wallet[]
  walletId: string
  toWalletId: string | undefined
  currency: string
  exchangeRate: string
  toExchangeRate: string
  defaultRate: string
  transferAmount: number
  isAmountFocused: boolean
  onFromWalletClick: () => void
  onToWalletClick: () => void
  onAmountClick: () => void
  onUpdateExchangeRate: (value: string) => void
  onUpdateToExchangeRate: (value: string) => void
}

interface WalletColumnProps {
  label: string
  wallet: Wallet | undefined
  fallbackName: string
  onClick: () => void
}

function WalletColumn({
  label,
  wallet,
  fallbackName,
  onClick,
}: WalletColumnProps) {
  return (
    <button
      type="button"
      className="flex flex-1 flex-col items-center gap-2 px-3 py-4 text-center"
      onClick={onClick}
    >
      <p className="text-[9px] uppercase tracking-[1.5px] text-white/35">{label}</p>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ color: '#63758F' }}>
        <Icon name={wallet?.icon ?? 'fa-wallet'} style={{ height: 40 }} />
      </span>
      <div>
        <p className="text-sm font-bold">{wallet?.name ?? fallbackName}</p>
        {wallet && (
          <p className="mt-0.5 text-[10px] text-white/40">
            {wallet.currency} {wallet.balance.toFixed(2)}
          </p>
        )}
      </div>
    </button>
  )
}

export function TransferPrimaryCard({
  wallets,
  walletId,
  toWalletId,
  currency,
  exchangeRate,
  toExchangeRate,
  defaultRate,
  transferAmount,
  isAmountFocused,
  onFromWalletClick,
  onToWalletClick,
  onAmountClick,
  onUpdateExchangeRate,
  onUpdateToExchangeRate,
}: TransferPrimaryCardProps) {
  const fromWallet = wallets.find((w) => w.id === walletId)
  const toWallet = wallets.find((w) => w.id === toWalletId)
  const showFromExchangeRate = currency !== fromWallet?.currency
  const showToExchangeRate = currency !== toWallet?.currency

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.085] bg-white/[0.08]">
      <div className="flex items-stretch border-b border-white/[0.05]">
        <WalletColumn
          label="From"
          wallet={fromWallet}
          fallbackName="Cash"
          onClick={onFromWalletClick}
        />

        <div className="flex items-center px-1 text-white/25">
          <Icon name="fa-arrow-right" />
        </div>

        <WalletColumn
          label="To"
          wallet={toWallet}
          fallbackName="Select wallet"
          onClick={onToWalletClick}
        />
      </div>

      {showFromExchangeRate && (
        <div className="border-b border-white/[0.05]">
          <ExchangeRateRow
            label="Exchange Rate"
            value={exchangeRate}
            defaultRate={defaultRate}
            variant="flat"
            onChange={onUpdateExchangeRate}
          />
        </div>
      )}

      {showToExchangeRate && (
        <div className="border-b border-white/[0.05]">
          <ExchangeRateRow
            label="Destination Exchange Rate"
            value={toExchangeRate}
            defaultRate={defaultRate}
            variant="flat"
            onChange={onUpdateToExchangeRate}
          />
        </div>
      )}

      <button
        type="button"
        className={cx(
          'flex w-full items-center justify-between border-t px-4 py-3 transition-colors',
          isAmountFocused
            ? 'border-accent/40 bg-accent/20'
            : 'border-accent/20 bg-accent/10',
        )}
        onClick={(e) => {
          e.stopPropagation()
          onAmountClick()
        }}
      >
        <span className="text-[9px] uppercase tracking-[1px] text-white/40">Amount</span>
        <span className="text-xl font-bold text-accent-light">
          {formatAmount(transferAmount)}
          <span className="ml-1.5 text-[10px] font-normal opacity-50">{currency}</span>
        </span>
      </button>
    </div>
  )
}
