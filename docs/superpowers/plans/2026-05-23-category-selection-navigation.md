# Category Selection Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the inline `CategoryPicker` bottom sheet with full-page navigation to `CategorySelectionPage`, preserving transaction form state via a Zustand draft store.

**Architecture:** A new in-memory Zustand `transactionDraftStore` holds all transaction form state. `TransactionPage` initializes and reads from this store. When the user taps a category or "Add Category", we navigate to `/transaction/category?changingIndex=N&type=expense` (or `addCategory=true`). `CategorySelectionPage` reads those params, writes the result to the draft store, and navigates back.

**Tech Stack:** React, React Router v7, Zustand, TypeScript, Vitest + Testing Library

---

## File Map

| Action | File |
|--------|------|
| Create | `src/stores/transactionDraftStore.ts` |
| Create | `src/stores/__tests__/transactionDraftStore.test.ts` |
| Modify | `src/features/transaction/TransactionPage.tsx` |
| Modify | `src/features/transaction/CategorySelectionPage.tsx` |
| Modify | `src/features/transaction/__tests__/CategorySelectionPage.test.tsx` |
| Modify | `src/features/transaction/__tests__/transactionKeyboard.test.tsx` (if broken by store change) |

---

### Task 1: Create `transactionDraftStore`

**Files:**
- Create: `src/stores/transactionDraftStore.ts`
- Create: `src/stores/__tests__/transactionDraftStore.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `src/stores/__tests__/transactionDraftStore.test.ts`:

```ts
import { beforeEach, describe, expect, it } from 'vitest'
import { useTransactionDraftStore } from '../transactionDraftStore'

beforeEach(() => {
  useTransactionDraftStore.getState().clear()
})

describe('transactionDraftStore', () => {
  it('starts with null draft', () => {
    expect(useTransactionDraftStore.getState().draft).toBeNull()
  })

  it('init sets the draft', () => {
    useTransactionDraftStore.getState().init({
      type: 'expense',
      walletId: 'w1',
      items: [],
      focusedIndex: null,
      date: '2026-01-01T00:00',
      note: '',
      currency: 'THB',
      exchangeRate: '',
      toExchangeRate: '',
      repeatConfig: { preset: 'never' },
      transferAmount: 0,
    })
    expect(useTransactionDraftStore.getState().draft?.type).toBe('expense')
    expect(useTransactionDraftStore.getState().draft?.walletId).toBe('w1')
  })

  it('update patches the draft', () => {
    useTransactionDraftStore.getState().init({
      type: 'expense',
      walletId: 'w1',
      items: [],
      focusedIndex: null,
      date: '2026-01-01T00:00',
      note: '',
      currency: 'THB',
      exchangeRate: '',
      toExchangeRate: '',
      repeatConfig: { preset: 'never' },
      transferAmount: 0,
    })
    useTransactionDraftStore.getState().update({ note: 'coffee' })
    expect(useTransactionDraftStore.getState().draft?.note).toBe('coffee')
    expect(useTransactionDraftStore.getState().draft?.walletId).toBe('w1')
  })

  it('update does nothing when draft is null', () => {
    useTransactionDraftStore.getState().update({ note: 'nope' })
    expect(useTransactionDraftStore.getState().draft).toBeNull()
  })

  it('clear resets draft to null', () => {
    useTransactionDraftStore.getState().init({
      type: 'income',
      walletId: 'w2',
      items: [],
      focusedIndex: null,
      date: '2026-01-01T00:00',
      note: '',
      currency: 'THB',
      exchangeRate: '',
      toExchangeRate: '',
      repeatConfig: { preset: 'never' },
      transferAmount: 0,
    })
    useTransactionDraftStore.getState().clear()
    expect(useTransactionDraftStore.getState().draft).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx vitest run src/stores/__tests__/transactionDraftStore.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: Create the store**

Create `src/stores/transactionDraftStore.ts`:

```ts
import { create } from 'zustand'
import type { RepeatConfig, TransactionItem, TransactionType } from '../types/domain'

export type TransactionDraft = {
  id?: string
  type: TransactionType
  walletId: string
  toWalletId?: string
  items: TransactionItem[]
  focusedIndex: number | null
  date: string
  note: string
  currency: string
  exchangeRate: string
  toExchangeRate: string
  repeatConfig: RepeatConfig
  transferAmount: number
}

type TransactionDraftStore = {
  draft: TransactionDraft | null
  init: (draft: TransactionDraft) => void
  update: (patch: Partial<TransactionDraft>) => void
  clear: () => void
}

export const useTransactionDraftStore = create<TransactionDraftStore>((set, get) => ({
  draft: null,
  init(draft) {
    set({ draft })
  },
  update(patch) {
    const current = get().draft
    if (!current) return
    set({ draft: { ...current, ...patch } })
  },
  clear() {
    set({ draft: null })
  },
}))
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/stores/__tests__/transactionDraftStore.test.ts
```

Expected: All 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/stores/transactionDraftStore.ts src/stores/__tests__/transactionDraftStore.test.ts
git commit -m "feat: add transactionDraftStore for navigation-safe form state"
```

---

### Task 2: Migrate `TransactionPage` to use draft store

**Files:**
- Modify: `src/features/transaction/TransactionPage.tsx`

- [ ] **Step 1: Replace local state with draft store**

Open `src/features/transaction/TransactionPage.tsx`. Replace all `useState` calls for form fields with draft store usage. The `calc` state stays local (it's keyboard-only, not needed by `CategorySelectionPage`).

Replace the imports section — add:

```ts
import { useTransactionDraftStore } from '../../stores/transactionDraftStore'
```

Remove `CategoryPicker` import:
```ts
import { CategoryPicker } from './CategoryPicker'
```

- [ ] **Step 2: Replace component body**

Replace the entire `TransactionPage` function body. Remove all `useState` for form fields and replace with draft store. Keep `calc` as local state. Here is the full updated component:

```tsx
export function TransactionPage() {
  const navigate = useNavigate()
  const { id, sourceId, date: repeatDate } = useParams()
  const existing = useTransactionStore((state) => (id ? state.findById(id) : undefined))
  const sourceRepeat = useTransactionStore((state) => (sourceId ? state.findById(sourceId) : undefined))
  const add = useTransactionStore((state) => state.add)
  const update = useTransactionStore((state) => state.update)
  const remove = useTransactionStore((state) => state.remove)
  const wallets = useWalletStore((state) => state.items)
  const currencies = useCurrencyStore((state) => state.items)
  const isEditMode = Boolean(id && existing)
  const isRepeatMaterialization = Boolean(sourceId && repeatDate)
  const initial = isRepeatMaterialization ? sourceRepeat : existing
  const [searchParams] = useSearchParams()
  const seedCategoryId = !isEditMode && !isRepeatMaterialization ? searchParams.get('categoryId') ?? undefined : undefined
  const seedType = !isEditMode && !isRepeatMaterialization ? (searchParams.get('type') ?? 'expense') as TransactionType : undefined

  const draftStore = useTransactionDraftStore()
  const draft = draftStore.draft
  const updateDraft = draftStore.update
  const initDraft = draftStore.init
  const clearDraft = draftStore.clear

  const [calc, setCalc] = useState(createCalcState())

  // Initialize draft on mount if not already initialized (e.g., coming back from CategorySelectionPage)
  useEffect(() => {
    if (draftStore.draft !== null) return
    const initialType = (seedType ?? initial?.type ?? 'expense') as TransactionType
    const initialWalletId = initial?.walletId ?? wallets[0]?.id ?? 'wallet-cash'
    initDraft({
      id: existing?.id,
      type: initialType,
      walletId: initialWalletId,
      toWalletId: initial?.toWalletId ?? wallets.find((w) => w.id !== initialWalletId)?.id,
      items: initial?.items ?? (seedCategoryId ? [{ categoryId: seedCategoryId, amount: 0 }] : []),
      focusedIndex: seedCategoryId ? 0 : null,
      date: initial ? toDatetimeLocalValue(new Date(initial.date)) : toDatetimeLocalValue(new Date()),
      note: initial?.note ?? '',
      currency: initial?.currency ?? wallets.find((w) => w.id === initialWalletId)?.currency ?? 'THB',
      exchangeRate: String(initial?.exchangeRate ?? ''),
      toExchangeRate: String(initial?.toExchangeRate ?? ''),
      repeatConfig: initial?.repeat ?? { preset: 'never' },
      transferAmount: initial?.type === 'transfer' ? initial.items[0]?.amount ?? 0 : 0,
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!draft) return null

  const type = draft.type
  const walletId = draft.walletId
  const toWalletId = draft.toWalletId
  const items = draft.items
  const focusedIndex = draft.focusedIndex
  const date = draft.date
  const note = draft.note
  const currency = draft.currency
  const exchangeRate = draft.exchangeRate
  const toExchangeRate = draft.toExchangeRate
  const repeatConfig = draft.repeatConfig
  const transferAmount = draft.transferAmount

  const wallet = wallets.find((item) => item.id === walletId)
  const toWallet = wallets.find((item) => item.id === toWalletId)
  const selectedCurrency = currencies.find((item) => item.code === currency)
  const defaultRate = selectedCurrency?.rate ? String(selectedCurrency.rate) : ''
  const firstLeaf = categories.find((category) => category.type === type && category.parentId)
  const isPlanned = new Date(date) > new Date()

  function addCategory(categoryId?: string) {
    const selectedId = categoryId ?? firstLeaf?.id
    if (!selectedId) return
    const newItems = [...items, { categoryId: selectedId, amount: 0 }]
    updateDraft({ items: newItems, focusedIndex: newItems.length - 1 })
    setCalc(createCalcState())
  }

  function press(key: string) {
    if (focusedIndex === null) return
    if (key === 'THB') {
      // open currency picker — handled below via local state
      setCurrencyPickerOpen(true)
      return
    }
    const next = pressCalcKey(calc, key)
    setCalc(next)
    updateDraft({ items: items.map((item, index) => (index === focusedIndex ? { ...item, amount: next.result } : item)) })
  }

  function handleFocusItem(index: number) {
    updateDraft({ focusedIndex: index })
    setCalc(createCalcState(items[index]?.amount ?? 0))
  }

  function handleRemoveItem(index: number) {
    updateDraft({ items: items.filter((_, i) => i !== index) })
  }

  function handleChangeCategory(index: number) {
    navigate(`/transaction/category?changingIndex=${index}&type=${type}`)
  }

  function handleAddCategory() {
    navigate(`/transaction/category?addCategory=true&type=${type}`)
  }

  async function save() {
    const errors = validateDraft({ type, walletId, toWalletId, items, transferAmount })
    if (currency !== wallet?.currency) {
      const rateError = validateExchangeRate(exchangeRate || defaultRate)
      if (rateError) errors.push(rateError)
    }
    if (type === 'transfer' && currency !== wallets.find((item) => item.id === toWalletId)?.currency) {
      const rateError = validateExchangeRate(toExchangeRate || defaultRate)
      if (rateError) errors.push(rateError)
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
    clearDraft()
    navigate('/')
  }

  async function deleteTransaction() {
    if (!existing) return
    if (!window.confirm('Delete this transaction?')) return
    await remove(existing.id)
    clearDraft()
    navigate('/')
  }
  // ... (JSX remains — see step 3)
}
```

- [ ] **Step 3: Add `useEffect` import and remove unused state**

Add `useEffect` to the React import at the top:
```ts
import { useEffect, useMemo, useState } from 'react'
```

Remove `useMemo` if no longer used (check — `firstLeaf` used to use `useMemo`; in the new code above it's a plain variable, so remove `useMemo` from the import).

Final React import:
```ts
import { useEffect, useState } from 'react'
```

- [ ] **Step 4: Update JSX — remove `CategoryPicker` and inline picker state**

Remove these two state lines:
```ts
const [isPickerOpen, setPickerOpen] = useState(false)
const [changingCategoryIndex, setChangingCategoryIndex] = useState<number | null>(null)
```

Keep only these local states (for UI-only pickers that don't need to survive navigation):
```ts
const [calc, setCalc] = useState(createCalcState())
const [walletPickerTarget, setWalletPickerTarget] = useState<WalletPickerTarget | null>(null)
const [isRepeatPickerOpen, setRepeatPickerOpen] = useState(false)
const [isCurrencyPickerOpen, setCurrencyPickerOpen] = useState(false)
const [isDatePickerOpen, setDatePickerOpen] = useState(false)
```

Update the `CategoryItemsCard` call in JSX (around line 299) to use the new handlers:
```tsx
<CategoryItemsCard
  items={items}
  focusedIndex={focusedIndex}
  onFocus={handleFocusItem}
  onAdd={handleAddCategory}
  onRemove={handleRemoveItem}
  onChangeCategory={handleChangeCategory}
/>
```

Remove the entire `CategoryPicker` block from JSX (was lines 437–456):
```tsx
{isPickerOpen ? (
  <CategoryPicker ... />
) : null}
```

Also update wallet/repeat/currency pickers to use `updateDraft` instead of `setWalletId` etc.:

Replace `setWalletId(id)` → `updateDraft({ walletId: id })`  
Replace `setToWalletId(id)` → `updateDraft({ toWalletId: id })`  
Replace `setRepeatConfig(config)` → `updateDraft({ repeatConfig: config })`  
Replace `setCurrency` in `CurrencyPicker.onSelect` → `(code) => updateDraft({ currency: code })`  
Replace `setDate(...)` in `DatePickerSheet.onChange` → `(d) => updateDraft({ date: toDatetimeLocalValue(d) })`  

Back button should also clear draft:
```tsx
onClick={() => { clearDraft(); navigate('/') }}
```

Note textarea and exchange rate inputs: replace `onChange` handlers that called `setNote`/`setExchangeRate`/`setToExchangeRate` to use `updateDraft`:
```tsx
onChange={(e) => updateDraft({ note: e.target.value })}
onChange={(e) => updateDraft({ exchangeRate: e.target.value })}
onChange={(e) => updateDraft({ toExchangeRate: e.target.value })}
```

Also update the SegmentedControl `onChange` for type:
```tsx
onChange={(v) => updateDraft({ type: v as TransactionType })}
```

- [ ] **Step 5: Run existing tests to check for breakage**

```bash
npx vitest run src/features/transaction/__tests__/
```

Expected: Same pass/fail ratio as before (1 pre-existing failure in `transactionEdit.test.tsx`). Fix any new failures.

- [ ] **Step 6: Commit**

```bash
git add src/features/transaction/TransactionPage.tsx
git commit -m "feat: migrate TransactionPage form state to transactionDraftStore"
```

---

### Task 3: Update `CategorySelectionPage` to handle returning to `TransactionPage`

**Files:**
- Modify: `src/features/transaction/CategorySelectionPage.tsx`
- Modify: `src/features/transaction/__tests__/CategorySelectionPage.test.tsx`

- [ ] **Step 1: Write new/updated failing tests**

Add to `src/features/transaction/__tests__/CategorySelectionPage.test.tsx`:

```ts
import { useTransactionDraftStore } from '../../../stores/transactionDraftStore'

// Add a route stub for going back
function renderPageWithDraft(search = '') {
  useTransactionDraftStore.getState().init({
    type: 'expense',
    walletId: 'w1',
    items: [{ categoryId: 'exp-food-coffee', amount: 50 }],
    focusedIndex: 0,
    date: '2026-01-01T00:00',
    note: '',
    currency: 'THB',
    exchangeRate: '',
    toExchangeRate: '',
    repeatConfig: { preset: 'never' },
    transferAmount: 0,
  })
  return render(
    <MemoryRouter initialEntries={[`/transaction/category${search}`]}>
      <Routes>
        <Route path="/transaction/category" element={<CategorySelectionPage />} />
        <Route path="/transaction/new" element={<div data-testid="tx-page" />} />
        <Route path="/transaction/back" element={<div data-testid="back-page" />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('CategorySelectionPage with draft store', () => {
  beforeEach(() => {
    useTransactionDraftStore.getState().clear()
    useCategoryStore.setState({ items: categories })
  })

  it('updates item at changingIndex and navigates back on leaf select', async () => {
    renderPageWithDraft('?changingIndex=0&type=expense')
    await userEvent.click(screen.getByText('Food & Drink'))
    await userEvent.click(screen.getByText('Coffee'))
    const draft = useTransactionDraftStore.getState().draft
    expect(draft?.items[0].categoryId).toBe('exp-food-coffee')
    // navigated back (no longer on category page)
    expect(screen.queryByText('Food & Drink')).not.toBeInTheDocument()
  })

  it('appends new item when addCategory=true on leaf select', async () => {
    renderPageWithDraft('?addCategory=true&type=expense')
    await userEvent.click(screen.getByText('Food & Drink'))
    await userEvent.click(screen.getByText('Coffee'))
    const draft = useTransactionDraftStore.getState().draft
    expect(draft?.items).toHaveLength(2)
    expect(draft?.items[1].categoryId).toBe('exp-food-coffee')
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npx vitest run src/features/transaction/__tests__/CategorySelectionPage.test.tsx
```

Expected: New tests fail (CategorySelectionPage doesn't read changingIndex or write to draft store yet).

- [ ] **Step 3: Update `CategorySelectionPage`**

Replace the `handleSelect` function and add draft store integration. Also read `changingIndex`/`addCategory` from search params:

```tsx
import { useTransactionDraftStore } from '../../stores/transactionDraftStore'

export function CategorySelectionPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const categories = useCategoryStore((state) => state.items)
  const updateDraft = useTransactionDraftStore((state) => state.update)
  const draft = useTransactionDraftStore((state) => state.draft)

  const changingIndexParam = searchParams.get('changingIndex')
  const changingIndex = changingIndexParam !== null ? Number(changingIndexParam) : null
  const isAddCategory = searchParams.get('addCategory') === 'true'
  const seedType = (searchParams.get('type') ?? 'expense') as 'expense' | 'income'

  const [type, setType] = useState<'expense' | 'income'>(seedType)
  const [parentId, setParentId] = useState<string | undefined>()

  const visible = categories.filter((c) => c.type === type && c.parentId === parentId)
  const parent = parentId ? categories.find((c) => c.id === parentId) : undefined

  function handleTypeChange(newType: string) {
    if (newType === 'transfer') {
      navigate('/transaction/new?type=transfer')
      return
    }
    setType(newType as 'expense' | 'income')
    setParentId(undefined)
  }

  function handleBack() {
    if (parentId) {
      setParentId(parent?.parentId)
    } else {
      navigate(-1)
    }
  }

  function handleSelect(category: Category) {
    const hasChildren = categories.some((c) => c.parentId === category.id)
    if (hasChildren) {
      setParentId(category.id)
      return
    }

    // We came from TransactionPage with a draft — update draft and go back
    if (draft && (changingIndex !== null || isAddCategory)) {
      if (changingIndex !== null) {
        const newItems = draft.items.map((item, i) =>
          i === changingIndex ? { ...item, categoryId: category.id } : item,
        )
        updateDraft({ items: newItems })
      } else {
        // addCategory
        updateDraft({ items: [...draft.items, { categoryId: category.id, amount: 0 }] })
      }
      navigate(-1)
      return
    }

    // Standalone flow (launched from HomePage)
    navigate(`/transaction/new?type=${type}&categoryId=${category.id}`)
  }

  // JSX unchanged — same grid/tab structure
  return ( /* ... keep existing JSX unchanged ... */ )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/features/transaction/__tests__/CategorySelectionPage.test.tsx
```

Expected: All tests pass (both old and new).

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run src/features/transaction/__tests__/
```

Expected: Same pass/fail as baseline (only the pre-existing `transactionEdit` failure).

- [ ] **Step 6: Commit**

```bash
git add src/features/transaction/CategorySelectionPage.tsx src/features/transaction/__tests__/CategorySelectionPage.test.tsx
git commit -m "feat: CategorySelectionPage writes to draft store and navigates back"
```

---

### Task 4: Clean up — remove unused `CategoryPicker` usage

**Files:**
- Modify: `src/features/transaction/TransactionPage.tsx` (confirm `CategoryPicker` import removed)

- [ ] **Step 1: Verify `CategoryPicker` is no longer imported or used in `TransactionPage`**

```bash
grep -n "CategoryPicker" src/features/transaction/TransactionPage.tsx
```

Expected: no output (zero matches).

- [ ] **Step 2: Run full test suite one final time**

```bash
npx vitest run
```

Expected: Same result as baseline — only the one pre-existing failure in `transactionEdit.test.tsx`.

- [ ] **Step 3: Commit**

```bash
git add src/features/transaction/TransactionPage.tsx
git commit -m "chore: remove CategoryPicker usage from TransactionPage"
```
