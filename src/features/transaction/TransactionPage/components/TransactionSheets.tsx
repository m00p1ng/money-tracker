import {
  CurrencyPicker,
  DatePicker,
  RepeatPicker,
  WalletPicker,
} from '@/components'
import type {
  Currency,
  RepeatConfig,
  Wallet,
} from '@/types/domain'

export type WalletPickerTarget = 'wallet' | 'toWallet'

interface TransactionSheetsProps {
  date: string
  walletPickerTarget: WalletPickerTarget | null
  isRepeatPickerOpen: boolean
  isCurrencyPickerOpen: boolean
  isDatePickerOpen: boolean
  wallets: Wallet[]
  currencies: Currency[]
  walletId: string
  toWalletId: string | undefined
  currency: string
  repeatConfig: RepeatConfig
  onUpdateDate: (date: Date) => void
  onUpdateWallet: (id: string) => void
  onUpdateToWallet: (id: string) => void
  onUpdateCurrency: (code: string) => void
  onUpdateRepeatConfig: (config: RepeatConfig) => void
  onCloseWalletPicker: () => void
  onCloseCurrencyPicker: () => void
  onCloseDatePicker: () => void
  onCloseRepeatPicker: () => void
}

export function TransactionSheets({
  date,
  walletPickerTarget,
  isRepeatPickerOpen,
  isCurrencyPickerOpen,
  isDatePickerOpen,
  wallets,
  currencies,
  walletId,
  toWalletId,
  currency,
  repeatConfig,
  onUpdateDate,
  onUpdateWallet,
  onUpdateToWallet,
  onUpdateCurrency,
  onUpdateRepeatConfig,
  onCloseWalletPicker,
  onCloseCurrencyPicker,
  onCloseDatePicker,
  onCloseRepeatPicker,
}: TransactionSheetsProps) {
  return (
    <>
      <DatePicker
        isOpen={isDatePickerOpen}
        value={new Date(date.replace('T', ' '))}
        onChange={(value) => {
          onUpdateDate(value)
        }}
        onClose={onCloseDatePicker}
      />

      <WalletPicker
        isOpen={walletPickerTarget !== null}
        wallets={wallets}
        selectedId={walletPickerTarget === 'toWallet' ? (toWalletId ?? '') : walletId}
        onSelect={(selectedId) => {
          if (walletPickerTarget === 'toWallet') {
            onUpdateToWallet(selectedId)
          } else {
            onUpdateWallet(selectedId)
          }
        }}
        onClose={onCloseWalletPicker}
      />

      <CurrencyPicker
        isOpen={isCurrencyPickerOpen}
        currencies={currencies}
        selectedCode={currency}
        onSelect={(code) => onUpdateCurrency(code)}
        onClose={onCloseCurrencyPicker}
      />

      <RepeatPicker
        isOpen={isRepeatPickerOpen}
        value={repeatConfig}
        onConfirm={(config) => {
          onUpdateRepeatConfig(config)
          onCloseRepeatPicker()
        }}
        onClose={onCloseRepeatPicker}
      />
    </>
  )
}
