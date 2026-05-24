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
  DateTimeRow,
  ExchangeRateRow,
  NoteField,
  ReconciliationRow,
  RepeatRow,
  TransactionHeader,
  TransactionSheets,
  WalletSelectorRow,
  type WalletPickerTarget,
} from './components'
import { CategoryItemsCard } from './components'

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

  const wallet = wallets.find((item) => item.id === walletId)
  const toWallet = wallets.find((item) => item.id === toWalletId)

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

  return (
    <div
      className={cx('space-y-2', focusedIndex !== null ? 'pb-64' : 'pb-6')}
      onClick={focusedIndex !== null ? onDismissKeyboard : undefined}
    >
      <TransactionHeader
        type={type}
        onChangeType={onChangeType}
        onBack={onBack}
        onSave={onSave}
      />

      {type === 'transfer' ? (
        <div className="space-y-2">
          <WalletSelectorRow
            ariaLabel="From Wallet"
            label="From Wallet"
            wallet={wallet}
            fallbackName="Cash"
            fallbackColor="#38bdf8"
            onClick={() => setWalletPickerTarget('wallet')}
          />

          <WalletSelectorRow
            ariaLabel="To Wallet"
            label="To Wallet"
            wallet={toWallet}
            fallbackName="Select wallet"
            fallbackColor="#a855f7"
            onClick={() => setWalletPickerTarget('toWallet')}
          />

          {currency !== wallet?.currency ? (
            <ExchangeRateRow
              label="Exchange Rate"
              value={exchangeRate}
              defaultRate={defaultRate}
              onChange={onUpdateExchangeRate}
            />
          ) : null}

          {type === 'transfer' && currency !== wallets.find((item) => item.id === toWalletId)?.currency ? (
            <ExchangeRateRow
              label="Destination Exchange Rate"
              value={toExchangeRate}
              defaultRate={defaultRate}
              onChange={onUpdateToExchangeRate}
            />
          ) : null}
        </div>
      ) : (
        <>
          <WalletSelectorRow
            ariaLabel="Wallet"
            label="Wallet"
            wallet={wallet}
            fallbackName="Cash"
            fallbackColor="#38bdf8"
            showBalance
            onClick={() => setWalletPickerTarget('wallet')}
          />

          <CategoryItemsCard
            items={items}
            focusedIndex={focusedIndex}
            onFocus={handleFocusItem}
            onAdd={onAddCategory}
            onRemove={onRemoveItem}
            onChangeCategory={onChangeCategory}
          />

          {currency !== wallet?.currency ? (
            <ExchangeRateRow
              label="Exchange Rate"
              value={exchangeRate}
              defaultRate={defaultRate}
              onChange={onUpdateExchangeRate}
            />
          ) : null}
        </>
      )}

      <DateTimeRow
        date={date}
        isPlanned={isPlanned}
        onClick={() => setDatePickerOpen(true)}
      />

      {!isPlanned && type !== 'transfer' && walletReconciliationEnabled && (
        <ReconciliationRow cleared={cleared} onToggle={onToggleCleared} />
      )}

      {isPlanned && (
        <RepeatRow
          repeatConfig={repeatConfig}
          onClick={() => setRepeatPickerOpen(true)}
        />
      )}

      <NoteField
        note={note}
        onUpdateNote={onUpdateNote}
        onFocusNoteField={onFocusNoteField}
      />

      {isEditMode ? (
        <button
          aria-label="Delete transaction"
          className="w-full rounded-xl bg-danger/15 py-3 text-sm font-medium text-danger"
          onClick={onDelete}
          type="button"
        >
          Delete
        </button>
      ) : null}

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
