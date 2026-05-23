import cx from 'classnames'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

import { Icon } from '@/components'
import {
  CurrencyPicker,
  DatePickerSheet,
  RepeatPicker,
  TypePickerDropdown,
  WalletPicker,
} from '@/components/ui'
import { CalculatorKeyboard } from '@/features/transaction/CalculatorKeyboard/CalculatorKeyboard'
import { CategoryItemsCardContainer } from '@/features/transaction/CategoryItemsCard/CategoryItemsCardContainer'
import {
  createCalcState,
  pressCalcKey,
  formatDatetimeLocalDisplay,
} from '@/lib'
import type {
  RepeatConfig,
  TransactionType,
  Wallet,
  Currency,
  TransactionItem,
} from '@/types/domain'

type WalletPickerTarget = 'wallet' | 'toWallet'

function formatRepeat(config: RepeatConfig): string {
  if (config.preset === 'daily') {
    return 'Daily'
  }
  if (config.preset === '2weeks') {
    return 'Every 2 Weeks'
  }
  if (config.preset === 'monthly') {
    return 'Monthly'
  }
  if (config.preset === 'yearly') {
    return 'Yearly'
  }
  if (config.preset === 'custom' && config.customEvery && config.customUnit) {
    const unit = config.customEvery === 1 ? config.customUnit : `${config.customUnit}s`
    return `Every ${config.customEvery} ${unit}`
  }
  return 'Never'
}

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
  onSave: () => Promise<void>
  onBack: () => void
  onDelete: () => Promise<void>
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
  onSave,
  onBack,
  onDelete,
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
    <div className={cx('space-y-2', focusedIndex !== null ? 'pb-64' : 'pb-6')}>
      <header className="grid grid-cols-[36px_1fr_36px] items-center gap-3">
        <button
          aria-label="Back"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300"
          type="button"
        >
          <Icon name="fa-chevron-left" />
        </button>
        <TypePickerDropdown
          value={type}
          onChange={(v) => onChangeType(v as TransactionType)}
        />
        <button
          aria-label="Save"
          onClick={onSave}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
          style={{
            background: 'linear-gradient(135deg, var(--accent-btn-1), var(--accent-btn-2))',
            boxShadow: '0 2px 10px color-mix(in srgb, var(--accent) 40%, transparent)',
          }}
          type="button"
        >
          <Icon name="fa-check" />
        </button>
      </header>

      {type === 'transfer' ? (
        <div className="space-y-2">
          <button
            aria-label="From Wallet"
            className={[
              'flex w-full items-center gap-3 rounded-2xl',
              'border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-left',
            ].join(' ')}
            onClick={() => setWalletPickerTarget('wallet')}
            type="button"
          >
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs"
              style={{ background: `${wallet?.color ?? '#38bdf8'}25`, color: wallet?.color ?? '#38bdf8' }}
            >
              <Icon name={wallet?.icon ?? 'fa-wallet'} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-white/35">From Wallet</p>
              <p className="text-sm font-medium">{wallet?.name ?? 'Cash'}</p>
            </div>
            <Icon name="fa-chevron-right" className="text-white/20 text-[11px]" />
          </button>
          <button
            aria-label="To Wallet"
            className={[
              'flex w-full items-center gap-3 rounded-2xl',
              'border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-left',
            ].join(' ')}
            onClick={() => setWalletPickerTarget('toWallet')}
            type="button"
          >
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs"
              style={{ background: `${toWallet?.color ?? '#a855f7'}25`, color: toWallet?.color ?? '#a855f7' }}
            >
              <Icon name={toWallet?.icon ?? 'fa-wallet'} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-white/35">To Wallet</p>
              <p className="text-sm font-medium">{toWallet?.name ?? 'Select wallet'}</p>
            </div>
            <Icon name="fa-chevron-right" className="text-white/20 text-[11px]" />
          </button>
          {currency !== wallet?.currency ? (
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
              <div className={[
                'flex h-8 w-8 flex-shrink-0 items-center justify-center',
                'rounded-xl bg-amber-400/15 text-amber-400 text-xs',
              ].join(' ')}>
                <Icon name="fa-arrow-right-arrow-left" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-white/35">Exchange Rate</p>
                <input
                  aria-label="Exchange Rate"
                  className="mt-0.5 w-full bg-transparent text-sm font-medium outline-none placeholder:text-white/30"
                  inputMode="decimal"
                  placeholder={defaultRate || 'Enter rate…'}
                  value={exchangeRate}
                  onChange={(event) => onUpdateExchangeRate(event.target.value)}
                />
              </div>
            </div>
          ) : null}
          {type === 'transfer' && currency !== wallets.find((item) => item.id === toWalletId)?.currency ? (
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
              <div className={[
                'flex h-8 w-8 flex-shrink-0 items-center justify-center',
                'rounded-xl bg-amber-400/15 text-amber-400 text-xs',
              ].join(' ')}>
                <Icon name="fa-arrow-right-arrow-left" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-white/35">Destination Exchange Rate</p>
                <input
                  aria-label="Destination Exchange Rate"
                  className="mt-0.5 w-full bg-transparent text-sm font-medium outline-none placeholder:text-white/30"
                  inputMode="decimal"
                  placeholder={defaultRate || 'Enter rate…'}
                  value={toExchangeRate}
                  onChange={(event) => onUpdateToExchangeRate(event.target.value)}
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <button
            aria-label="Wallet"
            className={[
              'flex w-full items-center gap-3 rounded-2xl',
              'border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-left',
            ].join(' ')}
            onClick={() => setWalletPickerTarget('wallet')}
            type="button"
          >
            <div
              className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs"
              style={{ background: `${wallet?.color ?? '#38bdf8'}25`, color: wallet?.color ?? '#38bdf8' }}
            >
              <Icon name={wallet?.icon ?? 'fa-wallet'} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-white/35">Wallet</p>
              <p className="text-sm font-medium">
                {wallet?.name ?? 'Cash'} · {wallet?.currency ?? ''} {wallet?.balance.toFixed(2) ?? '0.00'}
              </p>
            </div>
            <Icon name="fa-chevron-right" className="text-white/20 text-[11px]" />
          </button>
          <CategoryItemsCardContainer
            items={items}
            focusedIndex={focusedIndex}
            onFocus={handleFocusItem}
            onAdd={onAddCategory}
            onRemove={onRemoveItem}
            onChangeCategory={onChangeCategory}
          />
          {currency !== wallet?.currency ? (
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
              <div className={[
                'flex h-8 w-8 flex-shrink-0 items-center justify-center',
                'rounded-xl bg-amber-400/15 text-amber-400 text-xs',
              ].join(' ')}>
                <Icon name="fa-arrow-right-arrow-left" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-white/35">Exchange Rate</p>
                <input
                  aria-label="Exchange Rate"
                  className="mt-0.5 w-full bg-transparent text-sm font-medium outline-none placeholder:text-white/30"
                  inputMode="decimal"
                  placeholder={defaultRate || 'Enter rate…'}
                  value={exchangeRate}
                  onChange={(event) => onUpdateExchangeRate(event.target.value)}
                />
              </div>
            </div>
          ) : null}
        </>
      )}

      <button
        aria-label="Date & Time"
        className={[
          'flex w-full items-center gap-3 rounded-2xl',
          'border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-left',
        ].join(' ')}
        onClick={() => setDatePickerOpen(true)}
        type="button"
      >
        <div className={[
          'flex h-8 w-8 flex-shrink-0 items-center justify-center',
          'rounded-xl bg-accent/15 text-accent text-xs',
        ].join(' ')}>
          <Icon name="fa-calendar" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-white/35">Date & Time</p>
          <p className="mt-0.5 text-sm font-medium">{formatDatetimeLocalDisplay(date)}</p>
        </div>
        {isPlanned && (
          <div className={[
            'flex items-center gap-1.5 rounded-lg border border-amber-400/25',
            'bg-amber-400/12 px-2.5 py-1 text-[11px] font-bold text-amber-400',
          ].join(' ')}>
            <Icon name="fa-clock" className="text-[10px]" />
            Planned
          </div>
        )}
      </button>

      {isPlanned && (
        <button
          aria-label="Repeat"
          className={[
            'flex w-full items-center gap-3 rounded-2xl',
            'border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-left',
          ].join(' ')}
          style={repeatConfig.preset !== 'never'
            ? { borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)' }
            : undefined}
          onClick={() => setRepeatPickerOpen(true)}
          type="button"
        >
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs"
            style={{
              background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
              color: 'var(--accent-light)',
            }}
          >
            <Icon name="fa-rotate" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-white/35">Repeat</p>
            <p
              className="mt-0.5 text-sm font-semibold"
              style={repeatConfig.preset !== 'never' ? { color: 'var(--accent-light)' } : undefined}
            >
              {formatRepeat(repeatConfig)}
            </p>
          </div>
          <Icon name="fa-chevron-right" className="text-white/20 text-[11px]" />
        </button>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
        <div className={[
          'mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center',
          'rounded-xl bg-white/[0.07] text-slate-400 text-xs',
        ].join(' ')}>
          <Icon name="fa-pen-to-square" />
        </div>
        <div className="min-w-0 flex-1">
          <label className="text-[11px] text-white/35" htmlFor="tx-note">Note</label>
          <textarea
            aria-label="Note"
            id="tx-note"
            className={[
              'mt-0.5 min-h-16 w-full resize-none bg-transparent',
              'text-sm text-slate-100 outline-none placeholder:text-white/30',
            ].join(' ')}
            value={note}
            onChange={(event) => onUpdateNote(event.target.value)}
            onFocus={onFocusNoteField}
            placeholder="Add note…"
          />
        </div>
      </div>

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

      <DatePickerSheet
        isOpen={isDatePickerOpen}
        value={new Date(date.replace('T', ' '))}
        onChange={(d) => {
          onUpdateDate(d)
        }}
        onClose={() => setDatePickerOpen(false)}
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
        onClose={() => setWalletPickerTarget(null)}
      />

      <CurrencyPicker
        isOpen={isCurrencyPickerOpen}
        currencies={currencies}
        selectedCode={currency}
        onSelect={(code) => onUpdateCurrency(code)}
        onClose={() => setCurrencyPickerOpen(false)}
      />

      <RepeatPicker
        isOpen={isRepeatPickerOpen}
        value={repeatConfig}
        onConfirm={(config) => {
          onUpdateRepeatConfig(config)
          setRepeatPickerOpen(false)
        }}
        onClose={() => setRepeatPickerOpen(false)}
      />

      <AnimatePresence>
        {focusedIndex !== null && (
          <motion.div
            key="keyboard"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 35,
            }}
            className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2"
          >
            <CalculatorKeyboard onPress={handlePress} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
