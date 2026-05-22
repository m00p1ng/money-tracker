import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Icon } from '../../components/Icon'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { createCalcState, pressCalcKey } from '../../lib/calculator'
import { createId } from '../../lib/id'
import { formatDatetimeLocalDisplay, toDatetimeLocalValue } from '../../lib/date'
import { useCategoryStore } from '../../stores/categoryStore'
import { useTransactionStore } from '../../stores/transactionStore'
import { useWalletStore } from '../../stores/walletStore'
import type { TransactionItem, TransactionType } from '../../types/domain'
import { CalculatorKeyboard } from './CalculatorKeyboard'
import { CategoryItemsCard } from './CategoryItemsCard'
import { CategoryPicker } from './CategoryPicker'
import { buildTransaction, validateDraft } from './transactionForm'

export function TransactionPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const existing = useTransactionStore((state) => (id ? state.findById(id) : undefined))
  const add = useTransactionStore((state) => state.add)
  const update = useTransactionStore((state) => state.update)
  const remove = useTransactionStore((state) => state.remove)
  const wallets = useWalletStore((state) => state.items)
  const categories = useCategoryStore((state) => state.items)
  const isEditMode = Boolean(id && existing)
  const [type, setType] = useState<TransactionType>(existing?.type ?? 'expense')
  const [walletId] = useState(existing?.walletId ?? 'wallet-cash')
  const [items, setItems] = useState<TransactionItem[]>(existing?.items ?? [])
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [date, setDate] = useState(existing ? toDatetimeLocalValue(new Date(existing.date)) : toDatetimeLocalValue(new Date()))
  const [note, setNote] = useState(existing?.note ?? '')
  const [calc, setCalc] = useState(createCalcState())
  const [isPickerOpen, setPickerOpen] = useState(false)
  const wallet = wallets.find((item) => item.id === walletId)
  const firstLeaf = useMemo(() => categories.find((category) => category.type === type && category.parentId), [categories, type])

  function addCategory(categoryId?: string) {
    const selectedId = categoryId ?? firstLeaf?.id
    if (!selectedId) return
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
    const errors = validateDraft({ walletId, items })
    if (errors.length > 0) {
      alert(errors[0])
      return
    }
    const transaction = buildTransaction({
      id: existing?.id,
      type,
      walletId,
      currency: 'THB',
      items,
      date,
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
    if (!existing) return
    if (!confirm('Delete this transaction?')) return
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
        <SegmentedControl value={type} onChange={setType} segments={[{ label: 'Expense', value: 'expense' }, { label: 'Income', value: 'income' }]} />
        <button
          aria-label="Save"
          onClick={save}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_2px_10px_rgba(16,185,129,0.4)]"
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

      <CategoryItemsCard items={items} focusedIndex={focusedIndex} onFocus={handleFocusItem} onAdd={() => setPickerOpen(true)} onRemove={handleRemoveItem} />

      <label htmlFor="tx-date" className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] px-4 py-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-400/15 text-emerald-400 text-xs">
          <Icon name="fa-calendar" />
        </div>
        <div className="relative min-w-0 flex-1">
          <p className="text-[11px] text-white/35">Date & Time</p>
          <p className="mt-0.5 text-sm font-medium">{formatDatetimeLocalDisplay(date)}</p>
          <input
            id="tx-date"
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
