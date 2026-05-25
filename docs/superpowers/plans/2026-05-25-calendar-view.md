# Calendar View Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/calendar` page reachable by tapping the date block in `HomeTitle`, showing a monthly calendar with transaction indicators and a scrollable transaction list filtered by selected date.

**Architecture:** New `src/features/calendar/` feature module with `CalendarPage` (Container/dumb/hook pattern). Two new store selectors on `transactionStore`. `HomeTitle` gains a navigation prop. `TransactionPage` gains a `?date` query-param to pre-fill the date field.

**Tech Stack:** React, Zustand, framer-motion (drag for swipe), react-router v6, Tailwind CSS, Vitest + Testing Library.

---

## File Map

**Create:**
- `src/lib/date.ts` — add `toLocalDateKey` export
- `src/features/calendar/CalendarPage/components/CalendarHeader/CalendarHeader.tsx`
- `src/features/calendar/CalendarPage/components/CalendarHeader/index.ts`
- `src/features/calendar/CalendarPage/components/CalendarGrid/CalendarGrid.tsx`
- `src/features/calendar/CalendarPage/components/CalendarGrid/index.ts`
- `src/features/calendar/CalendarPage/useCalendarPage.ts`
- `src/features/calendar/CalendarPage/CalendarPage.tsx`
- `src/features/calendar/CalendarPage/CalendarPageContainer.tsx`
- `src/features/calendar/CalendarPage/index.ts`
- `src/features/calendar/index.ts`
- `src/features/calendar/__tests__/CalendarGrid.test.tsx`
- `src/features/calendar/__tests__/useCalendarPage.test.tsx`
- `src/stores/__tests__/transactionStore.test.ts`

**Modify:**
- `src/lib/date.ts` — add `toLocalDateKey`
- `src/stores/transactionStore.ts` — add `transactionsByMonth`, `upcomingByMonth` selectors
- `src/features/transaction/TransactionPage/useTransactionPage.ts` — read `?date` param for draft init
- `src/features/home/HomePage/components/HomeTitle.tsx` — add `onNavigateToCalendar` prop
- `src/features/home/HomePage/HomePage.tsx` — pass prop through
- `src/features/home/HomePage/HomePageContainer.tsx` — wire up
- `src/features/home/HomePage/useHomePage.ts` — add navigate call
- `src/App.tsx` — register `/calendar` route
- `src/features/design/sections/FeatureSection.tsx` — add sandbox entry

---

## Task 1: Add `toLocalDateKey` to `lib/date.ts` + store selectors

**Files:**
- Modify: `src/lib/date.ts`
- Modify: `src/stores/transactionStore.ts`
- Create: `src/stores/__tests__/transactionStore.test.ts`

- [ ] **Step 1: Write failing tests for the two new selectors**

Create `src/stores/__tests__/transactionStore.test.ts`:

```ts
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

import { useTransactionStore } from '@/stores'
import type { Transaction } from '@/types/domain'

function makeTx(overrides: Partial<Transaction> & Pick<Transaction, 'id' | 'date'>): Transaction {
  return {
    type: 'expense',
    walletId: 'w1',
    currency: 'THB',
    items: [{ categoryId: 'cat1', amount: 100 }],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('transactionsByMonth', () => {
  afterEach(() => useTransactionStore.setState({ items: [] }))

  it('returns completed transactions in the given month', () => {
    useTransactionStore.setState({
      items: [
        makeTx({ id: 'tx-1', date: '2026-05-10T10:00' }),
        makeTx({ id: 'tx-2', date: '2026-04-10T10:00' }),
        makeTx({ id: 'tx-3', date: '2026-05-20T10:00', status: 'paid' }),
      ],
    })
    const result = useTransactionStore.getState().transactionsByMonth(2026, 4)
    expect(result.map((t) => t.id).sort()).toEqual(['tx-1', 'tx-3'])
  })

  it('excludes planned and overdue transactions', () => {
    useTransactionStore.setState({
      items: [
        makeTx({ id: 'tx-1', date: '2026-05-10T10:00', status: 'planned' }),
        makeTx({ id: 'tx-2', date: '2026-05-15T10:00', status: 'overdue' }),
        makeTx({ id: 'tx-3', date: '2026-05-20T10:00' }),
      ],
    })
    const result = useTransactionStore.getState().transactionsByMonth(2026, 4)
    expect(result.map((t) => t.id)).toEqual(['tx-3'])
  })

  it('returns results sorted newest first', () => {
    useTransactionStore.setState({
      items: [
        makeTx({ id: 'tx-1', date: '2026-05-01T10:00' }),
        makeTx({ id: 'tx-2', date: '2026-05-20T10:00' }),
      ],
    })
    const result = useTransactionStore.getState().transactionsByMonth(2026, 4)
    expect(result[0].id).toBe('tx-2')
    expect(result[1].id).toBe('tx-1')
  })
})

describe('upcomingByMonth', () => {
  afterEach(() => useTransactionStore.setState({ items: [] }))

  it('returns planned transactions in the given month', () => {
    useTransactionStore.setState({
      items: [
        makeTx({ id: 'tx-1', date: '2026-05-28T10:00', status: 'planned' }),
        makeTx({ id: 'tx-2', date: '2026-04-01T10:00', status: 'overdue' }),
        makeTx({ id: 'tx-3', date: '2026-05-10T10:00' }),
      ],
    })
    const result = useTransactionStore.getState().upcomingByMonth(2026, 4)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('tx-1')
  })

  it('includes overdue transactions in the given month', () => {
    useTransactionStore.setState({
      items: [
        makeTx({ id: 'tx-1', date: '2026-05-01T10:00', status: 'overdue' }),
      ],
    })
    const result = useTransactionStore.getState().upcomingByMonth(2026, 4)
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('tx-1')
  })

  it('does NOT include overdue transactions from a different month', () => {
    useTransactionStore.setState({
      items: [
        makeTx({ id: 'tx-1', date: '2026-04-01T10:00', status: 'overdue' }),
      ],
    })
    const result = useTransactionStore.getState().upcomingByMonth(2026, 4)
    expect(result).toHaveLength(0)
  })
})
```

- [ ] **Step 2: Run tests — expect them to fail**

```bash
bun run test -- src/stores/__tests__/transactionStore.test.ts
```

Expected: FAIL — `transactionsByMonth is not a function`

- [ ] **Step 3: Add `toLocalDateKey` to `src/lib/date.ts`**

Add after the last export in `src/lib/date.ts`:

```ts
export function toLocalDateKey(isoDate: string): string {
  if (!isoDate.includes('T')) return isoDate.slice(0, 10)
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return isoDate.slice(0, 10)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
```

- [ ] **Step 4: Add selectors to `src/stores/transactionStore.ts`**

Add to the `TransactionStore` type (after `materializeRepeatOccurrence`):

```ts
transactionsByMonth: (year: number, month: number) => Transaction[]
upcomingByMonth: (year: number, month: number) => UpcomingTransactionRow[]
```

Add implementations inside `create<TransactionStore>((set, get) => ({` (after `materializeRepeatOccurrence`):

```ts
transactionsByMonth(year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
  return get()
    .items.filter(
      (tx) =>
        localDateString(tx.date).startsWith(prefix) &&
        tx.status !== 'planned' &&
        tx.status !== 'overdue',
    )
    .sort((a, b) => b.date.localeCompare(a.date))
},
upcomingByMonth(year, month) {
  const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
  const realRows: UpcomingTransactionRow[] = get()
    .items.filter(
      (tx) =>
        (tx.status === 'planned' || tx.status === 'overdue') &&
        localDateString(tx.date).startsWith(prefix),
    )
    .map((tx) => ({
      kind: 'real',
      id: tx.id,
      date: localDateString(tx.date),
      transaction: tx,
    }))
  const repeatRows: UpcomingTransactionRow[] = projectRepeatOccurrences(get().items)
    .filter((occ) => occ.occurrenceDate.startsWith(prefix))
    .map((occ) => ({
      kind: 'virtual-repeat',
      id: occ.id,
      date: occ.occurrenceDate,
      occurrence: occ,
    }))
  return [...realRows, ...repeatRows].sort((a, b) =>
    a.date.localeCompare(b.date),
  )
},
```

- [ ] **Step 5: Run tests — expect them to pass**

```bash
bun run test -- src/stores/__tests__/transactionStore.test.ts
```

Expected: All PASS

- [ ] **Step 6: Commit**

```bash
git add src/lib/date.ts src/stores/transactionStore.ts src/stores/__tests__/transactionStore.test.ts
git commit -m "feat: add toLocalDateKey helper and transactionsByMonth/upcomingByMonth selectors"
```

---

## Task 2: TransactionPage `?date` pre-fill

**Files:**
- Modify: `src/features/transaction/TransactionPage/useTransactionPage.ts`

- [ ] **Step 1: Add `seedDate` extraction in `useTransactionPageRouting`**

In `useTransactionPageRouting()`, after the `seedType` declaration (around line 48), add:

```ts
const seedDate = !isEditMode && !isRepeatMaterialization
  ? searchParams.get('date') ?? undefined
  : undefined
```

Then add `seedDate` to the return object of `useTransactionPageRouting`:

```ts
return {
  navigate,
  backNavigate,
  existing,
  isEditMode,
  isRepeatMaterialization,
  initial,
  seedCategoryId,
  seedType,
  seedDate,       // ← add this
  repeatDate,
}
```

- [ ] **Step 2: Thread `seedDate` through to the draft**

Change the signature of `useTransactionPageDraft` to accept `seedDate`:

```ts
function useTransactionPageDraft(
  existing: Transaction | undefined,
  initial: Transaction | undefined,
  seedType: TransactionType | undefined,
  seedCategoryId: string | undefined,
  seedDate: string | undefined,   // ← add this
  wallets: TransactionPageProps['wallets'],
)
```

In `initialDraft` inside `useTransactionPageDraft`, change the `date` field:

```ts
date: initial
  ? toDatetimeLocalValue(new Date(initial.date))
  : seedDate
    ? toDatetimeLocalValue(new Date(`${seedDate}T00:00`))
    : toDatetimeLocalValue(new Date()),
```

- [ ] **Step 3: Pass `seedDate` at the call site in `useTransactionPage`**

In `useTransactionPage()`, destructure `seedDate` from `useTransactionPageRouting()`:

```ts
const {
  navigate,
  backNavigate,
  existing,
  isEditMode,
  isRepeatMaterialization,
  initial,
  seedCategoryId,
  seedType,
  seedDate,       // ← add this
  repeatDate,
} = useTransactionPageRouting()
```

Then update the `useTransactionPageDraft` call:

```ts
const { draft, updateDraft, clearDraft } = useTransactionPageDraft(
  existing,
  initial,
  seedType,
  seedCategoryId,
  seedDate,      // ← add this
  wallets,
)
```

- [ ] **Step 4: Run full test suite to verify no regressions**

```bash
bun run test
```

Expected: All PASS (no test touches `seedDate`, so no changes needed in tests)

- [ ] **Step 5: Commit**

```bash
git add src/features/transaction/TransactionPage/useTransactionPage.ts
git commit -m "feat: pre-fill transaction date from ?date query param"
```

---

## Task 3: `CalendarHeader` component

**Files:**
- Create: `src/features/calendar/CalendarPage/components/CalendarHeader/CalendarHeader.tsx`
- Create: `src/features/calendar/CalendarPage/components/CalendarHeader/index.ts`

- [ ] **Step 1: Create the directory and component**

Create `src/features/calendar/CalendarPage/components/CalendarHeader/CalendarHeader.tsx`:

```tsx
import { Icon } from '@/components'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

type CalendarHeaderProps = {
  year: number
  month: number
  onPrev: () => void
  onNext: () => void
  onAdd: () => void
  onSearch: () => void
}

export function CalendarHeader({
  year,
  month,
  onPrev,
  onNext,
  onAdd,
  onSearch,
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between px-1 py-2">
      <button
        type="button"
        aria-label="Previous month"
        onClick={onPrev}
        className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-slate-300"
      >
        <Icon name="fa-chevron-left" />
      </button>
      <span className="text-base font-bold text-white">
        {MONTH_NAMES[month]} {year}
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Search"
          onClick={onSearch}
          className="grid h-9 w-9 place-items-center rounded-xl bg-white/5 text-slate-300"
        >
          <Icon name="fa-magnifying-glass" />
        </button>
        <button
          type="button"
          aria-label="Add transaction"
          onClick={onAdd}
          className="grid h-9 w-9 place-items-center rounded-xl text-white"
          style={{ background: 'linear-gradient(135deg, var(--accent-btn-1), var(--accent-btn-2))' }}
        >
          <Icon name="fa-plus" />
        </button>
      </div>
    </div>
  )
}
```

Create `src/features/calendar/CalendarPage/components/CalendarHeader/index.ts`:

```ts
export { CalendarHeader } from './CalendarHeader'
```

- [ ] **Step 2: Commit**

```bash
git add src/features/calendar/
git commit -m "feat: add CalendarHeader component"
```

---

## Task 4: `CalendarGrid` component + tests

**Files:**
- Create: `src/features/calendar/CalendarPage/components/CalendarGrid/CalendarGrid.tsx`
- Create: `src/features/calendar/CalendarPage/components/CalendarGrid/index.ts`
- Create: `src/features/calendar/__tests__/CalendarGrid.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/features/calendar/__tests__/CalendarGrid.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { CalendarGrid } from '../CalendarPage/components/CalendarGrid/CalendarGrid'

const base = {
  year: 2026,
  month: 4,
  today: '2026-05-25',
  selectedDate: null as string | null,
  indicatorMap: {} as Record<string, 'transaction' | 'upcoming' | 'both'>,
  onSelectDate: vi.fn(),
  onPrev: vi.fn(),
  onNext: vi.fn(),
}

describe('CalendarGrid', () => {
  it('renders 31 day buttons for May 2026', () => {
    render(<CalendarGrid {...base} />)
    expect(screen.getAllByRole('button', { name: /^Select/ })).toHaveLength(31)
  })

  it('renders DOW header labels', () => {
    render(<CalendarGrid {...base} />)
    for (const label of ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']) {
      expect(screen.getByText(label)).toBeInTheDocument()
    }
  })

  it('calls onSelectDate with date string when day tapped', async () => {
    const onSelectDate = vi.fn()
    const user = userEvent.setup()
    render(<CalendarGrid {...base} onSelectDate={onSelectDate} />)
    await user.click(screen.getByLabelText('Select 2026-05-10'))
    expect(onSelectDate).toHaveBeenCalledWith('2026-05-10')
  })

  it('calls onSelectDate with null when already-selected date tapped', async () => {
    const onSelectDate = vi.fn()
    const user = userEvent.setup()
    render(<CalendarGrid {...base} selectedDate="2026-05-10" onSelectDate={onSelectDate} />)
    await user.click(screen.getByLabelText('Select 2026-05-10'))
    expect(onSelectDate).toHaveBeenCalledWith(null)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
bun run test -- src/features/calendar/__tests__/CalendarGrid.test.tsx
```

Expected: FAIL — module not found

- [ ] **Step 3: Create the component**

Create `src/features/calendar/CalendarPage/components/CalendarGrid/CalendarGrid.tsx`:

```tsx
import { motion } from 'framer-motion'

export type DayIndicator = 'transaction' | 'upcoming' | 'both'

type CalendarGridProps = {
  year: number
  month: number
  today: string
  selectedDate: string | null
  indicatorMap: Record<string, DayIndicator>
  onSelectDate: (date: string | null) => void
  onPrev: () => void
  onNext: () => void
}

const DOW_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function twoDigit(n: number): string {
  return String(n).padStart(2, '0')
}

function makeDateKey(year: number, month: number, day: number): string {
  return `${year}-${twoDigit(month + 1)}-${twoDigit(day)}`
}

type DayState = 'selected' | 'today' | 'transaction' | 'upcoming' | 'default'

function getDayState(
  dateStr: string,
  selectedDate: string | null,
  today: string,
  indicatorMap: Record<string, DayIndicator>,
): DayState {
  if (dateStr === selectedDate) return 'selected'
  if (dateStr === today) return 'today'
  const indicator = indicatorMap[dateStr]
  if (indicator === 'transaction' || indicator === 'both') return 'transaction'
  if (indicator === 'upcoming') return 'upcoming'
  return 'default'
}

function dayNumClass(state: DayState): string {
  const base = 'flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium'
  switch (state) {
    case 'selected':
      return `${base} bg-emerald-500 font-bold text-white`
    case 'today':
      return `${base} border-2 border-emerald-500 font-bold text-white`
    case 'transaction':
      return `${base} bg-emerald-500/20 text-emerald-400`
    case 'upcoming':
      return `${base} bg-amber-500/20 text-amber-400`
    default:
      return `${base} text-slate-400`
  }
}

export function CalendarGrid({
  year,
  month,
  today,
  selectedDate,
  indicatorMap,
  onSelectDate,
  onPrev,
  onNext,
}: CalendarGridProps) {
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return (
    <motion.div
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={(_, info) => {
        if (info.offset.x > 50) onPrev()
        else if (info.offset.x < -50) onNext()
      }}
    >
      <div className="mb-1 grid grid-cols-7">
        {DOW_LABELS.map((label) => (
          <div key={label} className="py-1 text-center text-xs text-slate-500">
            {label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {Array.from({ length: firstDow }, (_, i) => (
          <div key={`empty-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const dateStr = makeDateKey(year, month, day)
          const state = getDayState(dateStr, selectedDate, today, indicatorMap)
          return (
            <button
              key={dateStr}
              type="button"
              aria-label={`Select ${dateStr}`}
              onClick={() => onSelectDate(dateStr === selectedDate ? null : dateStr)}
              className="flex flex-col items-center py-0.5"
            >
              <span className={dayNumClass(state)}>{day}</span>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}
```

Create `src/features/calendar/CalendarPage/components/CalendarGrid/index.ts`:

```ts
export { CalendarGrid } from './CalendarGrid'
export type { DayIndicator } from './CalendarGrid'
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
bun run test -- src/features/calendar/__tests__/CalendarGrid.test.tsx
```

Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/calendar/
git commit -m "feat: add CalendarGrid component"
```

---

## Task 5: `useCalendarPage` hook + tests

**Files:**
- Create: `src/features/calendar/CalendarPage/useCalendarPage.ts`
- Create: `src/features/calendar/__tests__/useCalendarPage.test.tsx`

- [ ] **Step 1: Write failing tests**

Create `src/features/calendar/__tests__/useCalendarPage.test.tsx`:

```tsx
import { act, renderHook } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest'

import { useCategoryStore, useTransactionStore, useWalletStore } from '@/stores'
import type { Transaction } from '@/types/domain'

import { useCalendarPage } from '../CalendarPage/useCalendarPage'

function makeTx(overrides: Partial<Transaction> & Pick<Transaction, 'id' | 'date'>): Transaction {
  return {
    type: 'expense',
    walletId: 'w1',
    currency: 'THB',
    items: [{ categoryId: 'cat1', amount: 100 }],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function wrapper({ children }: { children: React.ReactNode }) {
  return <MemoryRouter>{children}</MemoryRouter>
}

describe('useCalendarPage', () => {
  afterEach(() => {
    useTransactionStore.setState({ items: [] })
    useCategoryStore.setState({ items: [] })
    useWalletStore.setState({ items: [] })
  })

  it('defaults selectedDate to today', () => {
    const { result } = renderHook(() => useCalendarPage(), { wrapper })
    const today = new Date()
    const y = today.getFullYear()
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const d = String(today.getDate()).padStart(2, '0')
    expect(result.current.selectedDate).toBe(`${y}-${m}-${d}`)
  })

  it('toggles selectedDate to null when tapping the already-selected date', () => {
    const { result } = renderHook(() => useCalendarPage(), { wrapper })
    const todayKey = result.current.selectedDate!
    act(() => result.current.onSelectDate(null))
    expect(result.current.selectedDate).toBeNull()
    act(() => result.current.onSelectDate(todayKey))
    expect(result.current.selectedDate).toBe(todayKey)
  })

  it('clears selectedDate when navigating to a different month', () => {
    const { result } = renderHook(() => useCalendarPage(), { wrapper })
    act(() => result.current.onNext())
    expect(result.current.selectedDate).toBeNull()
  })

  it('builds indicatorMap with transaction entry for a date with completed tx', () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    useTransactionStore.setState({
      items: [makeTx({ id: 'tx-1', date: `${y}-${m}-10T10:00` })],
    })
    const { result } = renderHook(() => useCalendarPage(), { wrapper })
    expect(result.current.indicatorMap[`${y}-${m}-10`]).toBe('transaction')
  })

  it('builds indicatorMap with upcoming entry for a planned tx', () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    useTransactionStore.setState({
      items: [makeTx({ id: 'tx-1', date: `${y}-${m}-28T10:00`, status: 'planned' })],
    })
    const { result } = renderHook(() => useCalendarPage(), { wrapper })
    expect(result.current.indicatorMap[`${y}-${m}-28`]).toBe('upcoming')
  })

  it('sets indicatorMap to both when a date has both completed and upcoming', () => {
    const now = new Date()
    const y = now.getFullYear()
    const m = String(now.getMonth() + 1).padStart(2, '0')
    useTransactionStore.setState({
      items: [
        makeTx({ id: 'tx-1', date: `${y}-${m}-15T10:00` }),
        makeTx({ id: 'tx-2', date: `${y}-${m}-15T10:00`, status: 'planned' }),
      ],
    })
    const { result } = renderHook(() => useCalendarPage(), { wrapper })
    expect(result.current.indicatorMap[`${y}-${m}-15`]).toBe('both')
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
bun run test -- src/features/calendar/__tests__/useCalendarPage.test.tsx
```

Expected: FAIL — module not found

- [ ] **Step 3: Create `useCalendarPage.ts`**

Create `src/features/calendar/CalendarPage/useCalendarPage.ts`:

```ts
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import { formatAmount, formatHeaderMonthYear, formatShortDate, toLocalDateKey } from '@/lib'
import {
  useCategoryStore,
  useTransactionStore,
  useWalletStore,
} from '@/stores'
import type { UpcomingTransactionRow } from '@/stores/transactionStore'
import type { Transaction } from '@/types/domain'

import type { DayIndicator } from './components/CalendarGrid/CalendarGrid'

export type CalendarRowData = {
  key: string
  to: string
  icon: string
  iconBg: string
  iconColor: string
  primaryLabel: string
  secondaryLabel: string
  amount: string
  amountColor: string
}

function todayDateKey(): string {
  return toLocalDateKey(new Date().toISOString())
}

function badgeLabelFor(day: string): string {
  const today = todayDateKey()
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = toLocalDateKey(tomorrowDate.toISOString())
  if (day < today) return 'Overdue'
  if (day === today) return 'Today'
  if (day === tomorrow) return 'Tomorrow'
  return day
}

export function useCalendarPage() {
  const navigate = useNavigate()
  const backNavigate = useBackNavigate()
  const now = new Date()
  const todayKey = todayDateKey()

  const [currentYear, setCurrentYear] = useState(now.getFullYear())
  const [currentMonth, setCurrentMonth] = useState(now.getMonth())
  const [selectedDate, setSelectedDate] = useState<string | null>(todayKey)

  const transactionsByMonth = useTransactionStore((state) => state.transactionsByMonth)
  const upcomingByMonth = useTransactionStore((state) => state.upcomingByMonth)
  const findCategory = useCategoryStore((state) => state.findById)
  const parentOf = useCategoryStore((state) => state.parentOf)
  const findWallet = useWalletStore((state) => state.findById)

  const monthTransactions = transactionsByMonth(currentYear, currentMonth)
  const monthUpcoming = upcomingByMonth(currentYear, currentMonth)

  const indicatorMap: Record<string, DayIndicator> = {}
  for (const tx of monthTransactions) {
    const key = toLocalDateKey(tx.date)
    indicatorMap[key] = 'transaction'
  }
  for (const row of monthUpcoming) {
    indicatorMap[row.date] = indicatorMap[row.date] === 'transaction' ? 'both' : 'upcoming'
  }

  function makeRealRow(tx: Transaction, secondaryLabel: string): CalendarRowData {
    const firstItem = tx.items[0]
    const category = firstItem ? findCategory(firstItem.categoryId) : undefined
    const amountPrefix = tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''
    return {
      key: tx.id,
      to: `/transaction/${tx.id}`,
      icon: category?.icon ?? 'fa-ellipsis',
      iconBg: `${category?.color ?? '#64748b'}25`,
      iconColor: category?.color ?? '#94a3b8',
      primaryLabel: category?.name ?? 'Unknown',
      secondaryLabel,
      amount: `${amountPrefix}${formatAmount(firstItem?.amount ?? 0, tx.currency)}`,
      amountColor: tx.type === 'income' ? 'text-income' : tx.type === 'expense' ? 'text-expense' : 'text-slate-400',
    }
  }

  function makeUpcomingRow(row: UpcomingTransactionRow, secondaryLabel: string): CalendarRowData {
    const tx = row.kind === 'real' ? row.transaction : row.occurrence.transaction
    const firstItem = tx.items[0]
    const category = firstItem ? findCategory(firstItem.categoryId) : undefined
    const fromWallet = findWallet(tx.walletId)
    const toWallet = tx.toWalletId ? findWallet(tx.toWalletId) : undefined
    const primaryLabel =
      tx.type === 'transfer'
        ? `${fromWallet?.name ?? 'Wallet'} → ${toWallet?.name ?? 'Wallet'}`
        : category?.name ?? 'Transaction'
    const to =
      row.kind === 'real'
        ? `/transaction/${tx.id}`
        : `/transaction/repeat/${row.occurrence.sourceId}/${row.occurrence.occurrenceDate}`
    return {
      key: row.id,
      to,
      icon: tx.type === 'transfer' ? 'fa-right-left' : category?.icon ?? 'fa-clock',
      iconBg: `${category?.color ?? '#64748b'}25`,
      iconColor: category?.color ?? '#94a3b8',
      primaryLabel,
      secondaryLabel,
      amount: formatAmount(firstItem?.amount ?? 0, tx.currency),
      amountColor: 'text-amber-400',
    }
  }

  const listRows: CalendarRowData[] = selectedDate
    ? [
        ...monthTransactions
          .filter((tx) => toLocalDateKey(tx.date) === selectedDate)
          .map((tx) => {
            const category = tx.items[0] ? findCategory(tx.items[0].categoryId) : undefined
            const parent = category ? parentOf(category) : undefined
            return makeRealRow(tx, parent?.name ?? tx.type)
          }),
        ...monthUpcoming
          .filter((row) => row.date === selectedDate)
          .map((row) =>
            makeUpcomingRow(
              row,
              `${badgeLabelFor(row.date)}${row.kind === 'virtual-repeat' ? ' · Repeat' : ''}`,
            ),
          ),
      ]
    : (() => {
        const realEntries = monthTransactions.map((tx) => ({
          dateKey: toLocalDateKey(tx.date),
          row: makeRealRow(tx, formatShortDate(new Date(`${toLocalDateKey(tx.date)}T00:00`))),
        }))
        const upcomingEntries = monthUpcoming.map((row) => ({
          dateKey: row.date,
          row: makeUpcomingRow(row, formatShortDate(new Date(`${row.date}T00:00`))),
        }))
        return [...realEntries, ...upcomingEntries]
          .sort((a, b) => b.dateKey.localeCompare(a.dateKey))
          .map(({ row }) => row)
      })()

  const listHeader = selectedDate
    ? formatShortDate(new Date(`${selectedDate}T00:00`))
    : formatHeaderMonthYear(new Date(currentYear, currentMonth, 1))

  function onSelectDate(date: string | null) {
    setSelectedDate(date)
  }

  function onPrev() {
    if (currentMonth === 0) {
      setCurrentYear((y) => y - 1)
      setCurrentMonth(11)
    } else {
      setCurrentMonth((m) => m - 1)
    }
    setSelectedDate(null)
  }

  function onNext() {
    if (currentMonth === 11) {
      setCurrentYear((y) => y + 1)
      setCurrentMonth(0)
    } else {
      setCurrentMonth((m) => m + 1)
    }
    setSelectedDate(null)
  }

  function onAdd() {
    navigate(`/transaction/new?date=${selectedDate ?? todayKey}`)
  }

  function onBack() {
    backNavigate('/')
  }

  return {
    currentYear,
    currentMonth,
    today: todayKey,
    selectedDate,
    indicatorMap,
    listRows,
    listHeader,
    onSelectDate,
    onPrev,
    onNext,
    onAdd,
    onBack,
    onSearch: () => {},
  }
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
bun run test -- src/features/calendar/__tests__/useCalendarPage.test.tsx
```

Expected: All PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/calendar/
git commit -m "feat: add useCalendarPage hook"
```

---

## Task 6: `CalendarPage` + `CalendarPageContainer` + barrel files

**Files:**
- Create: `src/features/calendar/CalendarPage/CalendarPage.tsx`
- Create: `src/features/calendar/CalendarPage/CalendarPageContainer.tsx`
- Create: `src/features/calendar/CalendarPage/index.ts`
- Create: `src/features/calendar/index.ts`

- [ ] **Step 1: Create `CalendarPage.tsx`**

Create `src/features/calendar/CalendarPage/CalendarPage.tsx`:

```tsx
import { Link } from 'react-router'

import { PageHeader, TransactionRow } from '@/components'
import { SectionLabel } from '@/components'

import { CalendarGrid } from './components/CalendarGrid'
import { CalendarHeader } from './components/CalendarHeader'
import type { CalendarRowData } from './useCalendarPage'
import type { DayIndicator } from './components/CalendarGrid/CalendarGrid'

type CalendarPageProps = {
  currentYear: number
  currentMonth: number
  today: string
  selectedDate: string | null
  indicatorMap: Record<string, DayIndicator>
  listRows: CalendarRowData[]
  listHeader: string
  onSelectDate: (date: string | null) => void
  onPrev: () => void
  onNext: () => void
  onAdd: () => void
  onBack: () => void
  onSearch: () => void
}

export function CalendarPage({
  currentYear,
  currentMonth,
  today,
  selectedDate,
  indicatorMap,
  listRows,
  listHeader,
  onSelectDate,
  onPrev,
  onNext,
  onAdd,
  onBack,
  onSearch,
}: CalendarPageProps) {
  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 space-y-1 bg-transparent px-4 pt-4 pb-2 backdrop-blur">
        <PageHeader title="Calendar" onBack={onBack} />
        <CalendarHeader
          year={currentYear}
          month={currentMonth}
          onPrev={onPrev}
          onNext={onNext}
          onAdd={onAdd}
          onSearch={onSearch}
        />
        <CalendarGrid
          year={currentYear}
          month={currentMonth}
          today={today}
          selectedDate={selectedDate}
          indicatorMap={indicatorMap}
          onSelectDate={onSelectDate}
          onPrev={onPrev}
          onNext={onNext}
        />
      </div>
      <div className="space-y-2 px-4 pb-6 pt-4">
        <div className="flex items-center justify-between">
          <SectionLabel>{listHeader}</SectionLabel>
          {listRows.length > 0 && (
            <span className="text-xs text-slate-500">{listRows.length}</span>
          )}
        </div>
        {listRows.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No transactions</p>
        ) : (
          <div className="space-y-2">
            {listRows.map((row) => (
              <TransactionRow
                key={row.key}
                to={row.to}
                icon={row.icon}
                iconBg={row.iconBg}
                iconColor={row.iconColor}
                primaryLabel={row.primaryLabel}
                secondaryLabel={row.secondaryLabel}
                amount={row.amount}
                amountColor={row.amountColor}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `CalendarPageContainer.tsx`**

Create `src/features/calendar/CalendarPage/CalendarPageContainer.tsx`:

```tsx
import { CalendarPage } from './CalendarPage'
import { useCalendarPage } from './useCalendarPage'

export function CalendarPageContainer() {
  const props = useCalendarPage()

  return <CalendarPage {...props} />
}
```

- [ ] **Step 3: Create barrel files**

Create `src/features/calendar/CalendarPage/index.ts`:

```ts
export { CalendarPageContainer as default } from './CalendarPageContainer'
export { CalendarPage } from './CalendarPage'
```

Create `src/features/calendar/index.ts`:

```ts
export { default as CalendarPage, CalendarPage as CalendarPageView } from './CalendarPage'
```

- [ ] **Step 4: Run typecheck**

```bash
bun run typecheck
```

Expected: No errors. Fix any type issues before continuing.

- [ ] **Step 5: Commit**

```bash
git add src/features/calendar/
git commit -m "feat: add CalendarPage component and container"
```

---

## Task 7: Register route + wire `HomeTitle` navigation

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/features/home/HomePage/components/HomeTitle.tsx`
- Modify: `src/features/home/HomePage/HomePage.tsx`
- Modify: `src/features/home/HomePage/HomePageContainer.tsx`
- Modify: `src/features/home/HomePage/useHomePage.ts`

- [ ] **Step 1: Add `/calendar` route to `App.tsx`**

In `src/App.tsx`, add the import at the top with other feature imports:

```ts
import { CalendarPage } from '@/features/calendar'
```

In the `<Routes>` block inside `RoutedApp`, add after the `<Route path="/" ...>` line:

```tsx
<Route path="/calendar" element={<CalendarPage />} />
```

- [ ] **Step 2: Add `onNavigateToCalendar` prop to `HomeTitle`**

Replace the entire contents of `src/features/home/HomePage/components/HomeTitle.tsx`:

```tsx
import { Icon } from '@/components'
import {
  formatHeaderDay,
  formatHeaderMonthYear,
  formatHeaderWeekday,
} from '@/lib'

type HomeTitleProps = {
  onAddTransaction: () => void
  onNavigateToCalendar: () => void
}

export function HomeTitle({ onAddTransaction, onNavigateToCalendar }: HomeTitleProps) {
  return (
    <div className="flex items-center justify-between">
      <button
        type="button"
        onClick={onNavigateToCalendar}
        className="grid grid-cols-[auto_1px_auto] items-center gap-x-3"
        aria-label="Open calendar"
      >
        <span
          className="row-span-2 bg-linear-to-r from-white to-white/75 bg-clip-text text-5xl font-bold text-transparent"
        >
          {formatHeaderDay(new Date())}
        </span>
        <div className="row-span-2 self-stretch bg-white/30" />
        <span className="text-sm font-medium text-white">{formatHeaderWeekday(new Date())}</span>
        <span className="text-sm font-medium text-white">{formatHeaderMonthYear(new Date())}</span>
      </button>
      <button
        aria-label="Add transaction"
        onClick={onAddTransaction}
        className="grid h-11 w-11 place-items-center rounded-xl text-white"
        style={{ background: 'linear-gradient(135deg, var(--accent-btn-1), var(--accent-btn-2))' }}
        type="button"
      >
        <Icon name="fa-plus" />
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Pass `onNavigateToCalendar` through `HomePage`**

In `src/features/home/HomePage/HomePage.tsx`, update `HomePageProps`:

```ts
type HomePageProps = {
  onAddTransaction: () => void
  onNavigateToCalendar: () => void
}
```

And pass it to `HomeTitle`:

```tsx
<HomeTitle onAddTransaction={onAddTransaction} onNavigateToCalendar={onNavigateToCalendar} />
```

- [ ] **Step 4: Add `onNavigateToCalendar` to `useHomePage`**

Replace the entire contents of `src/features/home/HomePage/useHomePage.ts`:

```ts
import { useNavigate } from 'react-router'

import { useNavigationDirection } from '@/context/navigationDirection'

export function useHomePage() {
  const navigate = useNavigate()
  const { setDirection } = useNavigationDirection()

  function onAddTransaction() {
    setDirection('forward')
    navigate('/transaction/category')
  }

  function onNavigateToCalendar() {
    setDirection('forward')
    navigate('/calendar')
  }

  return { onAddTransaction, onNavigateToCalendar }
}
```

- [ ] **Step 5: Run full test suite**

```bash
bun run test
```

Expected: All PASS. If `HomePage.test.tsx` fails because `HomeTitle` now requires `onNavigateToCalendar`, update that test to pass the prop:

In `src/features/home/__tests__/HomePage.test.tsx`, the test renders `<HomePage />` which goes through the container. The container reads from `useHomePage` — since tests wrap in `MemoryRouter`, the hook should work. If it doesn't (e.g., missing `NavigationDirectionProvider`), wrap the test render in `<NavigationDirectionProvider>`:

```tsx
import { NavigationDirectionProvider } from '@/context/navigationDirection'
// wrap: <NavigationDirectionProvider><MemoryRouter>...</MemoryRouter></NavigationDirectionProvider>
```

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/features/home/
git commit -m "feat: register /calendar route and wire HomeTitle navigation"
```

---

## Task 8: Design sandbox entry

**Files:**
- Modify: `src/features/design/sections/FeatureSection.tsx`

- [ ] **Step 1: Add CalendarPage import and demo to `FeatureSection.tsx`**

At the top of `src/features/design/sections/FeatureSection.tsx`, add to the existing imports:

```ts
import { CalendarPageView } from '@/features/calendar'
```

Inside the `FeatureSection` component body, add a new `SubSection` for the calendar (after the existing feature entries):

```tsx
<SubSection id="calendar-page" title="CalendarPage">
  <VariantLabel label="Default (today selected)" />
  <div className="overflow-hidden rounded-2xl border border-white/10">
    <CalendarPageView
      currentYear={2026}
      currentMonth={4}
      today="2026-05-25"
      selectedDate="2026-05-25"
      indicatorMap={{
        '2026-05-01': 'transaction',
        '2026-05-06': 'transaction',
        '2026-05-15': 'both',
        '2026-05-25': 'transaction',
        '2026-05-28': 'upcoming',
      }}
      listRows={[
        {
          key: 'demo-1',
          to: '#',
          icon: 'fa-utensils',
          iconBg: '#65a30d25',
          iconColor: '#65a30d',
          primaryLabel: 'Food & Drink',
          secondaryLabel: 'Lifestyle',
          amount: '-฿120.00',
          amountColor: 'text-expense',
        },
      ]}
      listHeader="25 May"
      onSelectDate={() => {}}
      onPrev={() => {}}
      onNext={() => {}}
      onAdd={() => {}}
      onBack={() => {}}
      onSearch={() => {}}
    />
  </div>
</SubSection>
```

- [ ] **Step 2: Run typecheck**

```bash
bun run typecheck
```

Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/features/design/sections/FeatureSection.tsx
git commit -m "feat: add CalendarPage to design sandbox"
```

---

## Self-Review

### Spec coverage

| Spec requirement | Task |
|---|---|
| Tap HomeTitle → navigate to `/calendar` | Task 7 |
| Full-width calendar grid | Task 4, 6 |
| Month header with `<`, month/year, search, `+` | Task 3 |
| Swipe to prev/next month | Task 4 (`framer-motion` drag) |
| Month navigation buttons | Task 5 (`onPrev`/`onNext`) |
| Transaction indicators (green tint) | Task 4 (`transaction` state) |
| Upcoming indicators (amber tint) | Task 4 (`upcoming` state) |
| Today ring when unselected | Task 4 (`today` state) |
| Today solid fill when selected | Task 4 (`selected` state) |
| Default select today | Task 5 (`useState(todayKey)`) |
| Tap date → select, tap again → unselect | Task 5 (`onSelectDate`) |
| List: selected date shows filtered rows | Task 5 (`listRows` when `selectedDate`) |
| List: unselected shows full month flat | Task 5 (`listRows` when `!selectedDate`) |
| Sort: newest first | Task 1 (`transactionsByMonth` sort), Task 5 (flat merge sort) |
| Date as secondary label in full-month view | Task 5 (`formatShortDate`) |
| `+` pre-fills selected date in transaction form | Task 5 (`onAdd`), Task 2 (`seedDate`) |
| Show transaction + upcoming together | Task 5 (merges both selectors) |
| Design sandbox entry | Task 8 |
