import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { Icon } from '../../components/Icon'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { SegmentedControl } from '../../components/ui/SegmentedControl'
import { createCalcState, pressCalcKey } from '../../lib/calculator'
import { createId } from '../../lib/id'
import { toDatetimeLocalValue } from '../../lib/date'
import { useCategoryStore } from '../../stores/categoryStore'
import { useTransactionStore } from '../../stores/transactionStore'
import { useWalletStore } from '../../stores/walletStore'
import type { TransactionItem, TransactionType } from '../../types/domain'
import { AmountDisplay } from './AmountDisplay'
import { CalculatorKeyboard } from './CalculatorKeyboard'
import { CategoryItemsCard } from './CategoryItemsCard'
import { buildTransaction, validateDraft } from './transactionForm'

export function TransactionPage() {
  const navigate = useNavigate()
  const add = useTransactionStore((state) => state.add)
  const wallets = useWalletStore((state) => state.items)
  const categories = useCategoryStore((state) => state.items)
  const [type, setType] = useState<TransactionType>('expense')
  const [walletId] = useState('wallet-cash')
  const [items, setItems] = useState<TransactionItem[]>([])
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [date, setDate] = useState(toDatetimeLocalValue(new Date()))
  const [note, setNote] = useState('')
  const [calc, setCalc] = useState(createCalcState())
  const wallet = wallets.find((item) => item.id === walletId)
  const total = items.reduce((sum, item) => sum + item.amount, 0)
  const firstLeaf = useMemo(() => categories.find((category) => category.type === type && category.parentId), [categories, type])

  function addCategory() {
    if (!firstLeaf) return
    setItems((current) => [...current, { categoryId: firstLeaf.id, amount: 0 }])
    setFocusedIndex(items.length)
    setCalc(createCalcState())
  }

  function press(key: string) {
    const next = pressCalcKey(calc, key)
    setCalc(next)
    setItems((current) => current.map((item, index) => (index === focusedIndex ? { ...item, amount: next.result } : item)))
  }

  async function save() {
    const errors = validateDraft({ walletId, items })
    if (errors.length > 0) {
      alert(errors[0])
      return
    }
    await add(buildTransaction({ type, walletId, currency: 'THB', items, date, note, now: new Date().toISOString(), createId }))
    navigate('/')
  }

  return (
    <div className="space-y-4 pb-64">
      <header className="grid grid-cols-[44px_1fr_44px] items-center gap-3">
        <Button aria-label="Back" onClick={() => navigate('/')} className="px-0" type="button"><Icon name="fa-chevron-left" /></Button>
        <SegmentedControl value={type} onChange={setType} segments={[{ label: 'Expense', value: 'expense' }, { label: 'Income', value: 'income' }]} />
        <Button aria-label="Save" onClick={save} className="px-0" variant="accent" type="button"><Icon name="fa-check" /></Button>
      </header>
      <AmountDisplay amount={total} expression={calc.expression} type={type} />
      <Card>
        <p className="text-sm text-slate-500">Wallet</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-2"><Icon name="fa-wallet" />{wallet?.name ?? 'Cash'}</span>
          <span className="text-slate-400">฿{wallet?.balance.toFixed(2) ?? '0.00'}</span>
        </div>
      </Card>
      <CategoryItemsCard items={items} focusedIndex={focusedIndex} onFocus={(index) => { setFocusedIndex(index); setCalc(createCalcState(items[index]?.amount ?? 0)) }} onAdd={addCategory} onRemove={(index) => setItems((current) => current.filter((_, itemIndex) => itemIndex !== index))} />
      <Card>
        <label className="block text-sm text-slate-500" htmlFor="tx-date">Date & Time</label>
        <input id="tx-date" className="mt-2 w-full rounded-lg bg-white/5 px-3 py-3 text-slate-100" type="datetime-local" value={date} onChange={(event) => setDate(event.target.value)} />
      </Card>
      <Card>
        <label className="block text-sm text-slate-500" htmlFor="tx-note">Note</label>
        <textarea id="tx-note" className="mt-2 min-h-24 w-full rounded-lg bg-white/5 px-3 py-3 text-slate-100" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add note" />
      </Card>
      <CalculatorKeyboard onPress={press} />
    </div>
  )
}
