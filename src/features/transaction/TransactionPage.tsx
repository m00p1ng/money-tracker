import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Icon } from '../../components/Icon'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { createCalcState, pressCalcKey } from '../../lib/calculator'
import { createId } from '../../lib/id'
import { formatDatetimeLocalDisplay, toDatetimeLocalValue } from '../../lib/date'
import { useCategoryStore } from '../../stores/categoryStore'
import { useCurrencyStore } from '../../stores/currencyStore'
import { useTransactionStore } from '../../stores/transactionStore'
import { useWalletStore } from '../../stores/walletStore'
import type { RepeatConfig, TransactionItem, TransactionType } from '../../types/domain'
import { CalculatorKeyboard } from './CalculatorKeyboard'
import { CategoryItemsCard } from './CategoryItemsCard'
import { CategoryPicker } from './CategoryPicker'
import { CurrencyPicker } from './CurrencyPicker'
import { RepeatPicker } from './RepeatPicker'
import { WalletPicker } from './WalletPicker'
import { buildTransaction, validateDraft, validateExchangeRate } from './transactionForm'

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

export function TransactionPage() {
  const navigate = useNavigate()
  const { id, sourceId, date: repeatDate } = useParams()
  const existing = useTransactionStore((state) => (id ? state.findById(id) : undefined))
  const sourceRepeat = useTransactionStore((state) => (sourceId ? state.findById(sourceId) : undefined))
  const add = useTransactionStore((state) => state.add)
  const update = useTransactionStore((state) => state.update)
  const remove = useTransactionStore((state) => state.remove)
  const wallets = useWalletStore((state) => state.items)
  const categories = useCategoryStore((state) => state.items)
  const currencies = useCurrencyStore((state) => state.items)
  const isEditMode = Boolean(id && existing)
  const isRepeatMaterialization = Boolean(sourceId && repeatDate)
  const initial = isRepeatMaterialization ? sourceRepeat : existing
  const [type, setType] = useState<TransactionType>(initial?.type ?? 'expense')
  const [walletId, setWalletId] = useState(initial?.walletId ?? wallets[0]?.id ?? 'wallet-cash')
  const [toWalletId, setToWalletId] = useState<string | undefined>(initial?.toWalletId ?? wallets.find((wallet) => wallet.id !== walletId)?.id)
  const [items, setItems] = useState<TransactionItem[]>(initial?.items ?? [])
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [date, setDate] = useState(initial ? toDatetimeLocalValue(new Date(initial.date)) : toDatetimeLocalValue(new Date()))
  const [note, setNote] = useState(initial?.note ?? '')
  const [calc, setCalc] = useState(createCalcState())
  const [isPickerOpen, setPickerOpen] = useState(false)
  const [walletPickerTarget, setWalletPickerTarget] = useState<WalletPickerTarget | null>(null)
  const [isRepeatPickerOpen, setRepeatPickerOpen] = useState(false)
  const [isCurrencyPickerOpen, setCurrencyPickerOpen] = useState(false)
  const [currency, setCurrency] = useState(initial?.currency ?? wallets.find((w) => w.id === walletId)?.currency ?? 'THB')
  const [exchangeRate, setExchangeRate] = useState(String(initial?.exchangeRate ?? ''))
  const [toExchangeRate, setToExchangeRate] = useState(String(initial?.toExchangeRate ?? ''))
  const [repeatConfig, setRepeatConfig] = useState<RepeatConfig>(initial?.repeat ?? { preset: 'never' })
  const [transferAmount, setTransferAmount] = useState(initial?.type === 'transfer' ? initial.items[0]?.amount ?? 0 : 0)
  const wallet = wallets.find((item) => item.id === walletId)
  const toWallet = wallets.find((item) => item.id === toWalletId)
  const selectedCurrency = currencies.find((item) => item.code === currency)
  const defaultRate = selectedCurrency?.rate ? String(selectedCurrency.rate) : ''
  const firstLeaf = useMemo(() => categories.find((category) => category.type === type && category.parentId), [categories, type])
  const isPlanned = new Date(date) > new Date()

  function addCategory(categoryId?: string) {
    const selectedId = categoryId ?? firstLeaf?.id
    if (!selectedId) {
      return
    }
    setItems((current) => [...current, { categoryId: selectedId, amount: 0 }])
    setFocusedIndex(items.length)
    setCalc(createCalcState())
  }

  function press(key: string) {
    if (key === 'THB') {
      setCurrencyPickerOpen(true)
      return
    }
    const next = pressCalcKey(calc, key)
    setCalc(next)
    setItems((current) => current.map((item, index) => (index === focusedIndex ? { ...item, amount: next.result } : item)))
  }

  function handleFocusItem(index: number) {
    setFocusedIndex(index)
    setCalc(createCalcState(items[index]?.amount ?? 0))
  }

  function handleRemoveItem(index: number) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))
  }

  async function save() {
    const errors = validateDraft({ type, walletId, toWalletId, items, transferAmount })
    if (currency !== wallet?.currency) {
      const rateError = validateExchangeRate(exchangeRate || defaultRate)
      if (rateError) {
        errors.push(rateError)
      }
    }
    if (type === 'transfer' && currency !== wallets.find((item) => item.id === toWalletId)?.currency) {
      const rateError = validateExchangeRate(toExchangeRate || defaultRate)
      if (rateError) {
        errors.push(rateError)
      }
    }
    if (errors.length > 0) {
      alert(errors[0])
      return
    }
    const markedPaid = isRepeatMaterialization ? true : !isPlanned
    const transaction = buildTransaction({
      id: existing?.id,
      type,
      walletId,
      toWalletId,
      currency,
      items,
      transferAmount,
      exchangeRate: currency !== wallet?.currency ? Number(exchangeRate || defaultRate) : undefined,
      toExchangeRate: type === 'transfer' ? Number(toExchangeRate || defaultRate) : undefined,
      date: isRepeatMaterialization && repeatDate ? `${repeatDate}T00:00` : date,
      markedPaid,
      repeat: repeatConfig.preset === 'never' ? undefined : repeatConfig,
      note,
      now: existing?.createdAt ?? new Date().toISOString(),
      createId,
    })
    if (isEditMode) {
      await update(transaction)
    } else {
      await add(transaction)
    }
    navigate('/')
  }

  async function deleteTransaction() {
    if (!existing) {
      return
    }
    if (!window.confirm('Delete this transaction?')) {
      return
    }
    await remove(existing.id)
    navigate('/')
  }

  return (
    <div className="space-y-2 pb-64">
      <header className="grid grid-cols-[36px_1fr_36px] items-center gap-3">
        <button
          aria-label="Back"
          onClick={() => navigate('/')}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-300"
          type="button"
        >
          <Icon name="fa-chevron-left" />
        </button>
        <SegmentedControl
          value={type}
          onChange={setType}
          segments={[
            { label: 'Expense', value: 'expense' },
            { label: 'Income', value: 'income' },
            { label: 'Transfer', value: 'transfer' },
          ]}
        />
        <button
          aria-label="Save"
          onClick={save}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent-btn-1), var(--accent-btn-2))', boxShadow: '0 2px 10px color-mix(in srgb, var(--accent) 40%, transparent)' }}
          type="button"
        >
          <Icon name="fa-check" />
        </button>
      </header>

      {type === 'transfer' ? (
        <div className="space-y-2">
          <button
            aria-label="From Wallet"
            className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-left"
            onClick={() => setWalletPickerTarget('wallet')}
            type="button"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs" style={{ background: `${wallet?.color ?? '#38bdf8'}25`, color: wallet?.color ?? '#38bdf8' }}>
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
            className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-left"
            onClick={() => setWalletPickerTarget('toWallet')}
            type="button"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs" style={{ background: `${toWallet?.color ?? '#a855f7'}25`, color: toWallet?.color ?? '#a855f7' }}>
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
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400 text-xs">
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
                  onChange={(event) => setExchangeRate(event.target.value)}
                />
              </div>
            </div>
          ) : null}
          {type === 'transfer' && currency !== wallets.find((item) => item.id === toWalletId)?.currency ? (
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400 text-xs">
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
                  onChange={(event) => setToExchangeRate(event.target.value)}
                />
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <button
            aria-label="Wallet"
            className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-left"
            onClick={() => setWalletPickerTarget('wallet')}
            type="button"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs" style={{ background: `${wallet?.color ?? '#38bdf8'}25`, color: wallet?.color ?? '#38bdf8' }}>
              <Icon name={wallet?.icon ?? 'fa-wallet'} />
            </div>
            <div className="flex-1">
              <p className="text-[11px] text-white/35">Wallet</p>
              <p className="text-sm font-medium">{wallet?.name ?? 'Cash'} · {wallet?.currency ?? ''} {wallet?.balance.toFixed(2) ?? '0.00'}</p>
            </div>
            <Icon name="fa-chevron-right" className="text-white/20 text-[11px]" />
          </button>
          <CategoryItemsCard items={items} focusedIndex={focusedIndex} onFocus={handleFocusItem} onAdd={() => setPickerOpen(true)} onRemove={handleRemoveItem} />
          {currency !== wallet?.currency ? (
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400 text-xs">
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
                  onChange={(event) => setExchangeRate(event.target.value)}
                />
              </div>
            </div>
          ) : null}
        </>
      )}

      <label htmlFor="tx-date" className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-400 text-xs">
          <Icon name="fa-calendar" />
        </div>
        <div className="relative min-w-0 flex-1">
          <p className="text-[11px] text-white/35">Date & Time</p>
          <p className="mt-0.5 text-sm font-medium">{formatDatetimeLocalDisplay(date)}</p>
          <input
            id="tx-date"
            aria-label="Date & Time"
            className="absolute inset-0 cursor-pointer opacity-0"
            type="datetime-local"
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
        {isPlanned && (
          <div className="flex items-center gap-1.5 rounded-lg border border-amber-400/25 bg-amber-400/12 px-2.5 py-1 text-[11px] font-bold text-amber-400">
            <Icon name="fa-clock" className="text-[10px]" />
            Planned
          </div>
        )}
      </label>

      {isPlanned && (
        <button
          aria-label="Repeat"
          className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-left"
          style={repeatConfig.preset !== 'never' ? { borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)' } : undefined}
          onClick={() => setRepeatPickerOpen(true)}
          type="button"
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs" style={{ background: 'color-mix(in srgb, var(--accent) 15%, transparent)', color: 'var(--accent-light)' }}>
            <Icon name="fa-rotate" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] text-white/35">Repeat</p>
            <p className="mt-0.5 text-sm font-semibold" style={repeatConfig.preset !== 'never' ? { color: 'var(--accent-light)' } : undefined}>
              {formatRepeat(repeatConfig)}
            </p>
          </div>
          <Icon name="fa-chevron-right" className="text-white/20 text-[11px]" />
        </button>
      )}

      <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-slate-400 text-xs">
          <Icon name="fa-pen-to-square" />
        </div>
        <div className="min-w-0 flex-1">
          <label className="text-[11px] text-white/35" htmlFor="tx-note">Note</label>
          <textarea
            id="tx-note"
            className="mt-0.5 min-h-16 w-full resize-none bg-transparent text-sm text-slate-100 outline-none placeholder:text-white/30"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add note…"
          />
        </div>
      </div>

      {isEditMode ? (
        <button
          aria-label="Delete transaction"
          className="w-full rounded-xl bg-red-500/15 py-3 text-sm font-medium text-red-300"
          onClick={deleteTransaction}
          type="button"
        >
          Delete
        </button>
      ) : null}

      {walletPickerTarget !== null ? (
        <WalletPicker
          wallets={wallets}
          selectedId={walletPickerTarget === 'toWallet' ? (toWalletId ?? '') : walletId}
          onSelect={(id) => {
            if (walletPickerTarget === 'toWallet') {
              setToWalletId(id)
            } else {
              setWalletId(id)
            }
          }}
          onClose={() => setWalletPickerTarget(null)}
        />
      ) : null}

      {isCurrencyPickerOpen ? (
        <CurrencyPicker
          currencies={currencies}
          selectedCode={currency}
          onSelect={setCurrency}
          onClose={() => setCurrencyPickerOpen(false)}
        />
      ) : null}

      {isRepeatPickerOpen ? (
        <RepeatPicker
          value={repeatConfig}
          onConfirm={(config) => {
            setRepeatConfig(config)
            setRepeatPickerOpen(false)
          }}
          onClose={() => setRepeatPickerOpen(false)}
        />
      ) : null}

      {isPickerOpen ? (
        <CategoryPicker
          categories={categories}
          type={type}
          onClose={() => setPickerOpen(false)}
          onSelect={(category) => {
            addCategory(category.id)
            setPickerOpen(false)
          }}
        />
      ) : null}

      <CalculatorKeyboard onPress={press} />
    </div>
  )
}
