import cx from 'classnames'
import { useState } from 'react'

import { createCalcState, pressCalcKey } from '@/lib'
import type {
  Currency,
  RepeatConfig,
  TransactionItem,
  TransactionType,
  Wallet,
} from '@/types/domain'

import {
  CalculatorKeyboardSheet,
  TransactionDetailsCard,
  TransactionHeader,
  TransactionPrimaryCard,
  TransactionSheets,
  TransferPrimaryCard,
  type WalletPickerTarget,
} from './components'

export interface TransactionPageProps {
  type: TransactionType
  walletId: string
  toWalletId: string | undefined
  items: TransactionItem[]
  focusedIndex: number | null
  date: string
  note: string
  currency: string
  exchangeRate: string
  toExchangeRate: string
  repeatConfig: RepeatConfig
  transferAmount: number
  wallets: Wallet[]
  currencies: Currency[]
  isEditMode: boolean
  isPlanned: boolean
  defaultRate: string
  cleared: boolean
  walletReconciliationEnabled: boolean
  onChangeType: (v: TransactionType) => void
  onUpdateExchangeRate: (value: string) => void
  onUpdateToExchangeRate: (value: string) => void
  onUpdateDate: (d: Date) => void
  onUpdateNote: (value: string) => void
  onFocusNoteField: () => void
  onUpdateRepeatConfig: (config: RepeatConfig) => void
  onUpdateWallet: (id: string) => void
  onUpdateToWallet: (id: string) => void
  onUpdateCurrency: (code: string) => void
  onFocusItem: (index: number) => void
  onRemoveItem: (index: number) => void
  onChangeCategory: (index: number) => void
  onAddCategory: () => void
  onPressCalcKey: (key: string, currentCalcResult: number) => void
  onOpenCurrencyPicker: () => void
  onToggleCleared: () => void
  onSave: () => Promise<void>
  onBack: () => void
  onDelete: () => Promise<void>
  onDismissKeyboard: () => void
}

export function TransactionPage({
  type,
  walletId,
  toWalletId,
  items,
  focusedIndex,
  date,
  note,
  currency,
  exchangeRate,
  toExchangeRate,
  repeatConfig,
  transferAmount,
  wallets,
  currencies,
  isEditMode,
  isPlanned,
  defaultRate,
  cleared,
  walletReconciliationEnabled,
  onChangeType,
  onUpdateExchangeRate,
  onUpdateToExchangeRate,
  onUpdateDate,
  onUpdateNote,
  onFocusNoteField,
  onUpdateRepeatConfig,
  onUpdateWallet,
  onUpdateToWallet,
  onUpdateCurrency,
  onFocusItem,
  onRemoveItem,
  onChangeCategory,
  onAddCategory,
  onPressCalcKey,
  onOpenCurrencyPicker,
  onToggleCleared,
  onSave,
  onBack,
  onDelete,
  onDismissKeyboard,
}: TransactionPageProps) {
  const [calc, setCalc] = useState(createCalcState())
  const [walletPickerTarget, setWalletPickerTarget] = useState<WalletPickerTarget | null>(null)
  const [isRepeatPickerOpen, setRepeatPickerOpen] = useState(false)
  const [isCurrencyPickerOpen, setCurrencyPickerOpen] = useState(false)
  const [isDatePickerOpen, setDatePickerOpen] = useState(false)

  function handlePress(key: string) {
    if (focusedIndex === null) {
      return
    }

    if (key === 'THB') {
      setCurrencyPickerOpen(true)
      onOpenCurrencyPicker()

      return
    }

    const next = pressCalcKey(calc, key)
    setCalc(next)
    onPressCalcKey(key, next.result)
  }

  function handleFocusItem(index: number) {
    onFocusItem(index)
    setCalc(createCalcState(items[index]?.amount ?? 0))
  }

  const wallet = wallets.find((w) => w.id === walletId)

  return (
    <div
      className={cx('space-y-2', focusedIndex !== null
        ? 'pb-64'
        : 'pb-6')}
      onClick={focusedIndex !== null
        ? onDismissKeyboard
        : undefined}
    >
      <TransactionHeader
        type={type}
        onChangeType={onChangeType}
        onBack={onBack}
        onSave={onSave}
      />

      {type === 'transfer'
        ? (
          <TransferPrimaryCard
            wallets={wallets}
            walletId={walletId}
            toWalletId={toWalletId}
            currency={currency}
            exchangeRate={exchangeRate}
            toExchangeRate={toExchangeRate}
            defaultRate={defaultRate}
            transferAmount={transferAmount}
            onFromWalletClick={() => setWalletPickerTarget('wallet')}
            onToWalletClick={() => setWalletPickerTarget('toWallet')}
            onUpdateExchangeRate={onUpdateExchangeRate}
            onUpdateToExchangeRate={onUpdateToExchangeRate}
          />
        )
        : (
          <TransactionPrimaryCard
            type={type}
            wallet={wallet}
            items={items}
            focusedIndex={focusedIndex}
            currency={currency}
            exchangeRate={exchangeRate}
            defaultRate={defaultRate}
            onWalletClick={() => setWalletPickerTarget('wallet')}
            onFocusItem={handleFocusItem}
            onRemoveItem={onRemoveItem}
            onChangeCategory={onChangeCategory}
            onAddCategory={onAddCategory}
            onUpdateExchangeRate={onUpdateExchangeRate}
          />
        )}

      <TransactionDetailsCard
        date={date}
        isPlanned={isPlanned}
        walletReconciliationEnabled={type !== 'transfer' && walletReconciliationEnabled}
        cleared={cleared}
        repeatConfig={repeatConfig}
        note={note}
        onUpdateDate={() => setDatePickerOpen(true)}
        onToggleCleared={onToggleCleared}
        onUpdateRepeatConfig={() => setRepeatPickerOpen(true)}
        onUpdateNote={onUpdateNote}
        onFocusNoteField={onFocusNoteField}
      />

      {isEditMode && (
        <button
          aria-label="Delete transaction"
          className="w-full rounded-xl border border-danger/20 bg-danger/[0.07] py-3 text-sm font-semibold text-danger"
          onClick={onDelete}
          type="button"
        >
          Delete
        </button>
      )}

      <TransactionSheets
        date={date}
        walletPickerTarget={walletPickerTarget}
        isRepeatPickerOpen={isRepeatPickerOpen}
        isCurrencyPickerOpen={isCurrencyPickerOpen}
        isDatePickerOpen={isDatePickerOpen}
        wallets={wallets}
        currencies={currencies}
        walletId={walletId}
        toWalletId={toWalletId}
        currency={currency}
        repeatConfig={repeatConfig}
        onUpdateDate={onUpdateDate}
        onUpdateWallet={onUpdateWallet}
        onUpdateToWallet={onUpdateToWallet}
        onUpdateCurrency={onUpdateCurrency}
        onUpdateRepeatConfig={onUpdateRepeatConfig}
        onCloseWalletPicker={() => setWalletPickerTarget(null)}
        onCloseCurrencyPicker={() => setCurrencyPickerOpen(false)}
        onCloseDatePicker={() => setDatePickerOpen(false)}
        onCloseRepeatPicker={() => setRepeatPickerOpen(false)}
      />

      <CalculatorKeyboardSheet
        isOpen={focusedIndex !== null}
        onPress={handlePress}
      />
    </div>
  )
}
