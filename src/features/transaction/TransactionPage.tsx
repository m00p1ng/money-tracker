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
import type { RepeatPreset, TransactionItem, TransactionType } from '../../types/domain'
import { CalculatorKeyboard } from './CalculatorKeyboard'
import { CategoryItemsCard } from './CategoryItemsCard'
import { CategoryPicker } from './CategoryPicker'
import { buildTransaction, validateDraft, validateExchangeRate } from './transactionForm'

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
  const [walletId, setWalletId] = useState(initial?.walletId ?? 'wallet-cash')
  const [toWalletId, setToWalletId] = useState<string | undefined>(initial?.toWalletId ?? wallets.find((wallet) => wallet.id !== walletId)?.id)
  const [items, setItems] = useState<TransactionItem[]>(initial?.items ?? [])
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [date, setDate] = useState(initial ? toDatetimeLocalValue(new Date(initial.date)) : toDatetimeLocalValue(new Date()))
  const [note, setNote] = useState(initial?.note ?? '')
  const [calc, setCalc] = useState(createCalcState())
  const [isPickerOpen, setPickerOpen] = useState(false)
  const [currency, setCurrency] = useState(initial?.currency ?? wallets.find((w) => w.id === walletId)?.currency ?? 'THB')
  const [exchangeRate, setExchangeRate] = useState(String(initial?.exchangeRate ?? ''))
  const [toExchangeRate, setToExchangeRate] = useState(String(initial?.toExchangeRate ?? ''))
  const [markedPaid, setMarkedPaid] = useState(initial?.status !== 'planned' && initial?.status !== 'overdue')
  const [repeatPreset, setRepeatPreset] = useState<RepeatPreset>(initial?.repeat?.preset ?? 'never')
  const [transferAmount, setTransferAmount] = useState(initial?.type === 'transfer' ? initial.items[0]?.amount ?? 0 : 0)
  const wallet = wallets.find((item) => item.id === walletId)
  const selectedCurrency = currencies.find((item) => item.code === currency)
  const defaultRate = selectedCurrency?.rate ? String(selectedCurrency.rate) : ''
  const firstLeaf = useMemo(() => categories.find((category) => category.type === type && category.parentId), [categories, type])

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
      markedPaid: isRepeatMaterialization ? true : markedPaid,
      repeat: repeatPreset === 'never' ? undefined : { preset: repeatPreset },
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
    <div className="space-y-3 pb-64">
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

      <div className="flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-sky-400/15 text-sky-400 text-xs">
          <Icon name="fa-wallet" />
        </div>
        <div>
          <p className="text-[11px] text-white/35">Wallet</p>
          <p className="text-sm font-medium">{wallet?.name ?? 'Cash'} · ฿{wallet?.balance.toFixed(2) ?? '0.00'}</p>
        </div>
      </div>

      {type === 'transfer' ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] text-white/35">From Wallet</p>
            <select aria-label="From Wallet" value={walletId} onChange={(event) => setWalletId(event.target.value)} className="mt-1 w-full bg-transparent text-sm">
              {wallets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
            <p className="text-[11px] text-white/35">To Wallet</p>
            <select aria-label="To Wallet" value={toWalletId} onChange={(event) => setToWalletId(event.target.value)} className="mt-1 w-full bg-transparent text-sm">
              {wallets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </div>
        </div>
      ) : (
        <CategoryItemsCard items={items} focusedIndex={focusedIndex} onFocus={handleFocusItem} onAdd={() => setPickerOpen(true)} onRemove={handleRemoveItem} />
      )}

      <select aria-label="Currency" value={currency} onChange={(event) => setCurrency(event.target.value)} className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-sm">
        {currencies.map((item) => <option key={item.code} value={item.code}>{item.code}</option>)}
      </select>
      {currency !== wallet?.currency ? (
        <input aria-label="Exchange Rate" value={exchangeRate} onChange={(event) => setExchangeRate(event.target.value)} className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-sm" inputMode="decimal" />
      ) : null}
      {type === 'transfer' && currency !== wallets.find((item) => item.id === toWalletId)?.currency ? (
        <input aria-label="Destination Exchange Rate" value={toExchangeRate} onChange={(event) => setToExchangeRate(event.target.value)} className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-sm" inputMode="decimal" />
      ) : null}
      <label className="flex items-center gap-2 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-sm">
        <input type="checkbox" checked={markedPaid} onChange={(event) => setMarkedPaid(event.target.checked)} />
        Paid
      </label>
      {!markedPaid ? (
        <select aria-label="Repeat" value={repeatPreset} onChange={(event) => setRepeatPreset(event.target.value as RepeatPreset)} className="w-full rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-sm">
          <option value="never">Never</option>
          <option value="daily">Daily</option>
          <option value="2weeks">Every 2 Weeks</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      ) : null}

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
      </label>

      <div className="flex items-start gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
        <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.07] text-slate-400 text-xs">
          <Icon name="fa-pencil" />
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
