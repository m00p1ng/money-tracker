# Transaction Status Badge + Row Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a clickable Paid/Overdue/Planned status badge to the date row, store it as `Transaction.status` in the draft, and remove all gray label text from TransactionPage rows.

**Architecture:** `status: TransactionStatus` added to `TransactionDraft`. `useTransactionPage` exposes `status` and `onToggleStatus` threaded down to `DateTimeRow` as a clickable badge. `buildTransaction` accepts `status` directly instead of deriving it from `markedPaid`. Row components lose their small gray sub-labels and get larger icons to match `TransactionRow`.

**Tech Stack:** React, TypeScript, Zustand, Tailwind CSS

---

## File Map

| File | Change |
|------|--------|
| `src/features/transaction/transactionForm.ts` | Remove `markedPaid` param, accept `status: TransactionStatus` directly |
| `src/features/transaction/__tests__/transactionForm.test.ts` | Update call sites from `markedPaid` to `status` |
| `src/stores/transactionDraftStore.ts` | Add `status: TransactionStatus` to `TransactionDraft` |
| `src/features/transaction/TransactionPage/useTransactionPage.ts` | Remove `isPlanned` derivation; read `status` from draft; add `onToggleStatus`; update save handler |
| `src/features/transaction/TransactionPage/TransactionPage.tsx` | Replace `isPlanned: boolean` with `status: TransactionStatus`; add `onToggleStatus` prop |
| `src/features/transaction/TransactionPage/components/TransactionDetailsCard.tsx` | Replace `isPlanned` with `status`/`onToggleStatus`; fix RepeatRow/ReconciliationRow conditions |
| `src/features/transaction/TransactionPage/components/DateTimeRow.tsx` | Replace `isPlanned` with `status`/`onToggleStatus`; render clickable text-only badge |
| `src/features/transaction/TransactionPage/components/WalletSelectorRow.tsx` | Remove label `<p>`, icon `h-8 w-8` → `h-10 w-10` |
| `src/features/transaction/TransactionPage/components/ReconciliationRow.tsx` | Remove label `<p>`, icon `h-8 w-8` → `h-10 w-10` |
| `src/features/transaction/TransactionPage/components/RepeatRow.tsx` | Remove label `<p>`, icon `h-8 w-8` → `h-10 w-10` |
| `src/features/transaction/TransactionPage/components/ExchangeRateRow.tsx` | Remove label `<p>`, icon `h-8 w-8` → `h-10 w-10` |
| `src/features/transaction/TransactionPage/components/TransactionPrimaryCard.tsx` | Remove `<span>Total</span>` label |

---

### Task 1: Update `buildTransaction` to accept `status` directly

`buildTransaction` currently calls `deriveTransactionStatus({ date, markedPaid })` internally. We replace the `markedPaid?: boolean` param with `status?: TransactionStatus` (defaults to `'paid'`). Keep `deriveTransactionStatus` exported — it's used by external callers.

**Files:**
- Modify: `src/features/transaction/transactionForm.ts`
- Modify: `src/features/transaction/__tests__/transactionForm.test.ts`

- [ ] **Step 1: Write failing tests**

Open `src/features/transaction/__tests__/transactionForm.test.ts` and update the two tests that use `markedPaid`:

```typescript
// BEFORE (around line 173):
it('builds a planned transfer transaction for saving', () => {
  const transaction = buildTransaction({
    ...
    markedPaid: false,
    ...
  })
  ...
})

it('drops repeat from paid transfers', () => {
  const transaction = buildTransaction({
    ...
    markedPaid: true,
    ...
  })
  ...
})
```

Replace with:

```typescript
it('builds a planned transfer transaction for saving', () => {
  const transaction = buildTransaction({
    type: 'transfer',
    walletId: 'wallet-thb',
    toWalletId: 'wallet-usd',
    currency: 'USD',
    exchangeRate: 36.1234,
    toExchangeRate: 1,
    transferAmount: 25,
    items: [],
    date: '2026-05-24T10:00',
    status: 'planned',
    repeat: { preset: 'monthly' },
    now: '2026-05-23T10:00:00.000Z',
    createId: () => 'tx-transfer',
  })

  expect(transaction).toMatchObject({
    id: 'tx-transfer',
    type: 'transfer',
    walletId: 'wallet-thb',
    toWalletId: 'wallet-usd',
    currency: 'USD',
    exchangeRate: 36.1234,
    toExchangeRate: 1,
    status: 'planned',
    repeat: { preset: 'monthly' },
    items: [{ categoryId: 'transfer', amount: 25 }],
  })
})

it('drops repeat from paid transfers', () => {
  const transaction = buildTransaction({
    type: 'transfer',
    walletId: 'wallet-thb',
    toWalletId: 'wallet-usd',
    currency: 'USD',
    transferAmount: 25,
    items: [],
    date: '2026-05-24T10:00',
    status: 'paid',
    repeat: { preset: 'monthly' },
    now: '2026-05-23T10:00:00.000Z',
    createId: () => 'tx-paid-transfer',
  })

  expect(transaction.status).toBe('paid')
  expect(transaction.repeat).toBeUndefined()
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npm run test -- src/features/transaction/__tests__/transactionForm.test.ts
```

Expected: TypeScript error — `status` not in `buildTransaction` input type, `markedPaid` unknown.

- [ ] **Step 3: Update `buildTransaction` in `transactionForm.ts`**

Replace the `buildTransaction` input type and body. The full function becomes:

```typescript
export function buildTransaction(input: {
  id?: string
  type: TransactionType
  walletId: string
  toWalletId?: string
  currency: string
  items: TransactionItem[]
  transferAmount?: number
  exchangeRate?: number
  toExchangeRate?: number
  date: string
  note?: string
  status?: TransactionStatus
  repeat?: RepeatConfig
  cleared?: boolean
  now: string
  createId: () => string
}): Transaction {
  const status = input.status ?? 'paid'
  const items = input.type === 'transfer'
    ? [{ categoryId: 'transfer', amount: input.transferAmount ?? 0 }]
    : input.items
  const transferFields = input.type === 'transfer'
    ? {
      toWalletId: input.toWalletId,
      exchangeRate: input.exchangeRate,
      toExchangeRate: input.toExchangeRate,
    }
    : {}

  return {
    id: input.id ?? input.createId(),
    type: input.type,
    walletId: input.walletId,
    currency: input.currency,
    items,
    date: new Date(input.date).toISOString(),
    note: input.note?.trim() || undefined,
    createdAt: input.now,
    ...transferFields,
    status,
    repeat: status === 'paid'
      ? undefined
      : input.repeat,
    cleared: status === 'paid'
      ? (input.cleared ?? false)
      : false,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test -- src/features/transaction/__tests__/transactionForm.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/features/transaction/transactionForm.ts src/features/transaction/__tests__/transactionForm.test.ts
git commit -m "refactor(transaction): pass status directly to buildTransaction"
```

---

### Task 2: Add `status` to `TransactionDraft`

**Files:**
- Modify: `src/stores/transactionDraftStore.ts`

- [ ] **Step 1: Add `status` to `TransactionDraft` type**

In `src/stores/transactionDraftStore.ts`, add the import and field:

```typescript
import { create } from 'zustand'

import type {
  RepeatConfig,
  TransactionItem,
  TransactionStatus,
  TransactionType,
} from '@/types/domain'

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
  cleared: boolean
  status: TransactionStatus
}
```

(Rest of the file is unchanged — store methods work with `Partial<TransactionDraft>` so no other edits needed.)

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck
```

Expected: errors in `useTransactionPage.ts` because `initialDraft` doesn't include `status` yet. That's fine — fixed in Task 3.

- [ ] **Step 3: Commit after Task 3 fixes typecheck** *(deferred — commit together with Task 3)*

---

### Task 3: Update `useTransactionPage.ts` — replace `isPlanned` with `status`

**Files:**
- Modify: `src/features/transaction/TransactionPage/useTransactionPage.ts`

- [ ] **Step 1: Add `TransactionStatus` import**

At the top of `useTransactionPage.ts`, add `TransactionStatus` to the domain import:

```typescript
import type {
  RepeatConfig,
  Transaction,
  TransactionStatus,
  TransactionType,
  Wallet,
} from '@/types/domain'
```

- [ ] **Step 2: Initialize `status` in `initialDraft`**

In `useTransactionPageDraft`, add `status` to `initialDraft` (inside the `useMemo`). The date variable is computed earlier in the same memo block:

```typescript
const initialDraft = useMemo(() => {
  const date = initial
    ? toDatetimeLocalValue(new Date(initial.date))
    : seedDate
      ? toDatetimeLocalValue(new Date(`${seedDate}T00:00`))
      : toDatetimeLocalValue(new Date())

  const initialStatus: TransactionStatus = existing?.status
    ?? (new Date(date) > new Date() ? 'planned' : 'paid')

  return {
    id: existing?.id,
    type: initialType,
    walletId: initialWalletId,
    toWalletId: initial?.toWalletId ?? wallets.find((w) => w.id !== initialWalletId)?.id,
    items: initial?.items ?? (seedCategoryId
      ? [{ categoryId: seedCategoryId, amount: 0 }]
      : []),
    focusedIndex: seedCategoryId
      ? 0
      : null,
    date,
    note: initial?.note ?? '',
    currency: initial?.currency ?? wallets.find((w) => w.id === initialWalletId)?.currency ?? 'THB',
    exchangeRate: String(initial?.exchangeRate ?? ''),
    toExchangeRate: String(initial?.toExchangeRate ?? ''),
    repeatConfig: initial?.repeat ?? { preset: 'never' },
    transferAmount: initial?.type === 'transfer'
      ? initial.items[0]?.amount ?? 0
      : 0,
    cleared: existing?.cleared ?? false,
    status: initialStatus,
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])
```

- [ ] **Step 3: Replace `isPlanned` with `status` in the main hook body**

In the `useTransactionPage` function (around line 303), replace:

```typescript
// REMOVE this line:
const isPlanned = new Date(date) > new Date()
```

And add `status` to the destructure from `draft`:

```typescript
const {
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
  cleared,
  status,
} = draft
```

- [ ] **Step 4: Update `useTransactionSaveHandler` options type and call**

Replace the `isPlanned: boolean` field with `status: TransactionStatus` in the options type:

```typescript
type UseTransactionSaveHandlerOptions = {
  draft: ReturnType<typeof useTransactionPageDraft>['draft']
  wallet: Wallet | undefined
  wallets: Wallet[]
  defaultRate: string
  status: TransactionStatus
  isRepeatMaterialization: boolean
  repeatDate: string | undefined
  existing: Transaction | undefined
  isEditMode: boolean
  add: (transaction: Transaction) => Promise<void>
  update: (transaction: Transaction) => Promise<void>
  clearDraft: () => void
  navigate: ReturnType<typeof useNavigate>
}
```

In the `useTransactionSaveHandler` function body, replace:

```typescript
// REMOVE:
const markedPaid = isRepeatMaterialization
  ? true
  : !isPlanned

// ADD:
const effectiveStatus = isRepeatMaterialization ? 'paid' : status
```

And update the `buildTransaction` call: replace `markedPaid` with `status: effectiveStatus`:

```typescript
const transaction = buildTransaction({
  id: existing?.id,
  type,
  walletId,
  toWalletId,
  currency,
  items,
  transferAmount,
  exchangeRate: currency !== wallet?.currency
    ? Number(exchangeRate || defaultRate)
    : undefined,
  toExchangeRate: type === 'transfer'
    ? Number(toExchangeRate || defaultRate)
    : undefined,
  date: isRepeatMaterialization && repeatDate
    ? `${repeatDate}T00:00`
    : date,
  status: effectiveStatus,
  repeat: repeatConfig.preset === 'never'
    ? undefined
    : repeatConfig,
  note,
  cleared,
  now: existing?.createdAt ?? new Date().toISOString(),
  createId,
})
```

- [ ] **Step 5: Add `onToggleStatus` and pass `status` to page props**

In the `onSave` call and return object of `useTransactionPage`, replace `isPlanned` with `status` and add `onToggleStatus`:

Replace the call to `useTransactionSaveHandler`:

```typescript
const onSave = useTransactionSaveHandler({
  draft,
  wallet,
  wallets,
  defaultRate,
  status,
  isRepeatMaterialization,
  repeatDate,
  existing,
  isEditMode,
  add,
  update,
  clearDraft,
  navigate,
})
```

In the return object, replace `isPlanned,` with:

```typescript
status,
onToggleStatus: () => {
  const now = new Date()
  const txDate = new Date(date)
  updateDraft({
    status: status === 'paid'
      ? txDate < now ? 'overdue' : 'planned'
      : 'paid',
  })
},
```

- [ ] **Step 6: Run typecheck**

```bash
npm run typecheck
```

Expected: errors in `TransactionPage.tsx` and `TransactionDetailsCard.tsx` because `isPlanned` prop is gone. Fixed in Task 4.

- [ ] **Step 7: Commit after Task 4 clears typecheck** *(deferred)*

---

### Task 4: Thread `status` through `TransactionPage` → `TransactionDetailsCard` → `DateTimeRow`

**Files:**
- Modify: `src/features/transaction/TransactionPage/TransactionPage.tsx`
- Modify: `src/features/transaction/TransactionPage/components/TransactionDetailsCard.tsx`
- Modify: `src/features/transaction/TransactionPage/components/DateTimeRow.tsx`

- [ ] **Step 1: Update `TransactionPageProps` and component**

In `TransactionPage.tsx`, replace `isPlanned: boolean` with `status` and add `onToggleStatus`:

```typescript
// In TransactionPageProps interface — replace:
isPlanned: boolean
// With:
status: TransactionStatus
onToggleStatus: () => void
```

Add `TransactionStatus` to the domain type imports at the top:

```typescript
import type {
  Currency,
  RepeatConfig,
  TransactionItem,
  TransactionStatus,
  TransactionType,
  Wallet,
} from '@/types/domain'
```

In the destructure list, replace `isPlanned,` with `status,` and add `onToggleStatus,`.

In the JSX, update `TransactionDetailsCard` usage (around line 198):

```tsx
<TransactionDetailsCard
  date={date}
  status={status}
  walletReconciliationEnabled={type !== 'transfer' && walletReconciliationEnabled}
  cleared={cleared}
  repeatConfig={repeatConfig}
  note={note}
  onUpdateDate={() => setDatePickerOpen(true)}
  onToggleStatus={onToggleStatus}
  onToggleCleared={onToggleCleared}
  onUpdateRepeatConfig={() => setRepeatPickerOpen(true)}
  onUpdateNote={onUpdateNote}
  onFocusNoteField={onFocusNoteField}
/>
```

- [ ] **Step 2: Update `TransactionDetailsCard`**

Full replacement of `src/features/transaction/TransactionPage/components/TransactionDetailsCard.tsx`:

```typescript
import type { RepeatConfig, TransactionStatus } from '@/types/domain'

import { DateTimeRow } from './DateTimeRow'
import { NoteField } from './NoteField'
import { ReconciliationRow } from './ReconciliationRow'
import { RepeatRow } from './RepeatRow'

interface TransactionDetailsCardProps {
  date: string
  status: TransactionStatus
  walletReconciliationEnabled: boolean
  cleared: boolean
  repeatConfig: RepeatConfig
  note: string
  onUpdateDate: () => void
  onToggleStatus: () => void
  onToggleCleared: () => void
  onUpdateRepeatConfig: () => void
  onUpdateNote: (value: string) => void
  onFocusNoteField: () => void
}

export function TransactionDetailsCard({
  date,
  status,
  walletReconciliationEnabled,
  cleared,
  repeatConfig,
  note,
  onUpdateDate,
  onToggleStatus,
  onToggleCleared,
  onUpdateRepeatConfig,
  onUpdateNote,
  onFocusNoteField,
}: TransactionDetailsCardProps) {
  return (
    <div className={[
      'divide-y divide-white/[0.05] overflow-hidden',
      'rounded-2xl border border-white/[0.07] bg-white/[0.04]',
    ].join(' ')}>
      <DateTimeRow
        date={date}
        status={status}
        variant="flat"
        onClick={onUpdateDate}
        onToggleStatus={onToggleStatus}
      />

      {status === 'paid' && walletReconciliationEnabled && (
        <ReconciliationRow cleared={cleared} variant="flat" onToggle={onToggleCleared} />
      )}

      {status !== 'paid' && (
        <RepeatRow repeatConfig={repeatConfig} variant="flat" onClick={onUpdateRepeatConfig} />
      )}

      <NoteField
        note={note}
        variant="flat"
        onUpdateNote={onUpdateNote}
        onFocusNoteField={onFocusNoteField}
      />
    </div>
  )
}
```

Note: the wrapping `<div>` with `mb-1.5` section header label is removed — no "Details" heading.

- [ ] **Step 3: Update `DateTimeRow`**

Full replacement of `src/features/transaction/TransactionPage/components/DateTimeRow.tsx`:

```typescript
import cx from 'classnames'

import { Icon } from '@/components'
import { formatDatetimeLocalDisplay } from '@/lib'
import type { TransactionStatus } from '@/types/domain'

interface DateTimeRowProps {
  date: string
  status: TransactionStatus
  variant?: 'standalone' | 'flat'
  onClick: () => void
  onToggleStatus: () => void
}

const statusBadgeStyle: Record<TransactionStatus, { border: string; bg: string; text: string; label: string }> = {
  paid: {
    border: 'border-green-500/25',
    bg: 'bg-green-500/12',
    text: 'text-green-400',
    label: 'Paid',
  },
  overdue: {
    border: 'border-danger/25',
    bg: 'bg-danger/12',
    text: 'text-danger',
    label: 'Overdue',
  },
  planned: {
    border: 'border-amber-400/25',
    bg: 'bg-amber-400/12',
    text: 'text-amber-400',
    label: 'Planned',
  },
}

export function DateTimeRow({
  date,
  status,
  variant = 'standalone',
  onClick,
  onToggleStatus,
}: DateTimeRowProps) {
  const badge = statusBadgeStyle[status]

  return (
    <button
      aria-label="Date & Time"
      className={cx(
        'flex w-full items-center gap-1 px-4 py-3 text-left',
        variant === 'standalone' && 'rounded-2xl border border-white/[0.07] bg-white/4',
      )}
      onClick={onClick}
      type="button"
    >
      <span className={[
        'flex h-10 w-10 shrink-0 items-center justify-center',
        'rounded-xl bg-accent/15 text-accent text-xs',
      ].join(' ')}>
        <Icon name="fa-calendar" />
      </span>
      <span className="min-w-0 flex-1 px-1">
        <span className="block font-medium">{formatDatetimeLocalDisplay(date)}</span>
      </span>
      <button
        type="button"
        aria-label={`Status: ${badge.label}`}
        className={cx(
          'shrink-0 rounded-lg border px-2.5 py-1 text-sm font-bold',
          badge.border,
          badge.bg,
          badge.text,
        )}
        onClick={(e) => {
          e.stopPropagation()
          onToggleStatus()
        }}
      >
        {badge.label}
      </button>
    </button>
  )
}
```

- [ ] **Step 4: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 5: Run tests**

```bash
npm run test
```

Expected: all pass.

- [ ] **Step 6: Commit**

```bash
git add \
  src/stores/transactionDraftStore.ts \
  src/features/transaction/TransactionPage/useTransactionPage.ts \
  src/features/transaction/TransactionPage/TransactionPage.tsx \
  src/features/transaction/TransactionPage/components/TransactionDetailsCard.tsx \
  src/features/transaction/TransactionPage/components/DateTimeRow.tsx
git commit -m "feat(transaction): add status badge to date row"
```

---

### Task 5: Row redesign — remove labels, resize icons

Remove small gray `<p>` label text from each row component. Increase icon containers from `h-8 w-8` → `h-10 w-10`. Remove "Total" text label from primary card.

**Files:**
- Modify: `src/features/transaction/TransactionPage/components/WalletSelectorRow.tsx`
- Modify: `src/features/transaction/TransactionPage/components/ReconciliationRow.tsx`
- Modify: `src/features/transaction/TransactionPage/components/RepeatRow.tsx`
- Modify: `src/features/transaction/TransactionPage/components/ExchangeRateRow.tsx`
- Modify: `src/features/transaction/TransactionPage/components/TransactionPrimaryCard.tsx`

- [ ] **Step 1: Update `WalletSelectorRow.tsx`**

Remove `<p className="text-xs text-white/35">{label}</p>` and change icon size. The `label` prop is only used for `aria-label` now — keep it for accessibility.

```typescript
import cx from 'classnames'

import { Icon } from '@/components'
import { formatAmount } from '@/lib'
import type { Wallet } from '@/types/domain'

interface WalletSelectorRowProps {
  ariaLabel: string
  label: string
  wallet: Wallet | undefined
  fallbackName: string
  fallbackColor: string
  showBalance?: boolean
  variant?: 'standalone' | 'flat'
  onClick: () => void
}

export function WalletSelectorRow({
  ariaLabel,
  label,
  wallet,
  fallbackName,
  fallbackColor,
  showBalance = false,
  variant = 'standalone',
  onClick,
}: WalletSelectorRowProps) {
  const color = wallet?.color ?? fallbackColor

  return (
    <button
      aria-label={ariaLabel}
      className={cx(
        'flex w-full items-center gap-1 px-4 py-3 text-left',
        variant === 'standalone' && 'rounded-2xl border border-white/[0.07] bg-white/4',
      )}
      onClick={onClick}
      type="button"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs"
        style={{ background: `${color}25`, color }}
      >
        <Icon name={wallet?.icon ?? 'fa-wallet'} />
      </div>
      <div className="min-w-0 flex-1 px-1">
        <p className="truncate font-medium">
          {wallet?.name ?? fallbackName}
          {showBalance
            ? ` · ${formatAmount(wallet?.balance ?? 0, wallet?.currency)}`
            : ''}
        </p>
      </div>
      <Icon name="fa-chevron-right" className="text-white/20 text-sm" />
    </button>
  )
}
```

- [ ] **Step 2: Update `ReconciliationRow.tsx`**

Remove `<p className="text-xs text-white/35">Reconciliation</p>` and `mt-0.5`. Change icon size to `h-10 w-10`:

```typescript
import cx from 'classnames'

import { Icon } from '@/components'

interface ReconciliationRowProps {
  cleared: boolean
  variant?: 'standalone' | 'flat'
  onToggle: () => void
}

export function ReconciliationRow({
  cleared,
  variant = 'standalone',
  onToggle,
}: ReconciliationRowProps) {
  return (
    <button
      type="button"
      className={cx(
        'flex w-full items-center gap-1 px-4 py-3 text-left',
        variant === 'standalone' && 'rounded-2xl border border-white/[0.07] bg-white/4',
      )}
      style={variant === 'standalone' && cleared
        ? { borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)' }
        : undefined}
      onClick={onToggle}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs"
        style={{
          background: cleared
            ? 'color-mix(in srgb, var(--accent) 15%, transparent)'
            : 'rgba(255,255,255,0.04)',
          color: cleared
            ? 'var(--accent-light)'
            : 'rgba(255,255,255,0.35)',
        }}
      >
        <Icon name={cleared ? 'fa-circle-check' : 'fa-circle'} />
      </div>
      <div className="min-w-0 flex-1 px-1">
        <p
          className="font-semibold"
          style={cleared ? { color: 'var(--accent-light)' } : undefined}
        >
          {cleared ? 'Cleared' : 'Not cleared'}
        </p>
      </div>
    </button>
  )
}
```

- [ ] **Step 3: Update `RepeatRow.tsx`**

Remove `<p className="text-xs text-white/35">Repeat</p>` and `mt-0.5`. Change icon size to `h-10 w-10`:

```typescript
import cx from 'classnames'

import { Icon } from '@/components'
import type { RepeatConfig } from '@/types/domain'

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
    const unit = config.customEvery === 1
      ? config.customUnit
      : `${config.customUnit}s`

    return `Every ${config.customEvery} ${unit}`
  }

  return 'Never'
}

interface RepeatRowProps {
  repeatConfig: RepeatConfig
  variant?: 'standalone' | 'flat'
  onClick: () => void
}

export function RepeatRow({
  repeatConfig,
  variant = 'standalone',
  onClick,
}: RepeatRowProps) {
  const isActive = repeatConfig.preset !== 'never'

  return (
    <button
      aria-label="Repeat"
      className={cx(
        'flex w-full items-center gap-1 px-4 py-3 text-left',
        variant === 'standalone' && 'rounded-2xl border border-white/[0.07] bg-white/4',
      )}
      style={variant === 'standalone' && isActive
        ? { borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)' }
        : undefined}
      onClick={onClick}
      type="button"
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs"
        style={{
          background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
          color: 'var(--accent-light)',
        }}
      >
        <Icon name="fa-rotate" />
      </div>
      <div className="min-w-0 flex-1 px-1">
        <p
          className="font-semibold"
          style={isActive ? { color: 'var(--accent-light)' } : undefined}
        >
          {formatRepeat(repeatConfig)}
        </p>
      </div>
      <Icon name="fa-chevron-right" className="text-white/20 text-sm" />
    </button>
  )
}
```

- [ ] **Step 4: Update `ExchangeRateRow.tsx`**

Remove the `<p>` label above the input. Change icon size to `h-10 w-10`. Remove `mt-0.5` from input. The `label` prop is still used for `aria-label` on the input:

```typescript
import cx from 'classnames'

import { Icon } from '@/components'

interface ExchangeRateRowProps {
  label: string
  value: string
  defaultRate: string
  variant?: 'standalone' | 'flat'
  onChange: (value: string) => void
}

export function ExchangeRateRow({
  label,
  value,
  defaultRate,
  variant = 'standalone',
  onChange,
}: ExchangeRateRowProps) {
  return (
    <div className={cx(
      'flex items-center gap-1 px-4 py-3',
      variant === 'standalone' && 'rounded-2xl border border-white/[0.07] bg-white/[0.04]',
    )}>
      <div className={[
        'flex h-10 w-10 shrink-0 items-center justify-center',
        'rounded-xl bg-amber-400/15 text-amber-400 text-xs',
      ].join(' ')}>
        <Icon name="fa-arrow-right-arrow-left" />
      </div>
      <div className="flex-1 px-1">
        <input
          aria-label={label}
          className="w-full bg-transparent font-medium outline-none placeholder:text-white/30"
          inputMode="decimal"
          placeholder={defaultRate || 'Enter rate…'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Update `TransactionPrimaryCard.tsx` — remove "Total" label**

In `TransactionPrimaryCard.tsx`, find the total row (around line 107) and remove the `<span>` label:

```typescript
// Replace this:
<div className={`flex items-center justify-between border-t px-4 py-3 ${style.bg} ${style.border}`}>
  <span className="text-[9px] uppercase tracking-[1px] text-white/40">Total</span>
  <span className={`text-xl font-bold ${style.text}`}>
    {formatSignedAmount(total, wallet?.currency ?? currency)}
  </span>
</div>

// With:
<div className={`flex items-center justify-end border-t px-4 py-3 ${style.bg} ${style.border}`}>
  <span className={`text-xl font-bold ${style.text}`}>
    {formatSignedAmount(total, wallet?.currency ?? currency)}
  </span>
</div>
```

- [ ] **Step 6: Run typecheck and tests**

```bash
npm run typecheck && npm run test
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add \
  src/features/transaction/TransactionPage/components/WalletSelectorRow.tsx \
  src/features/transaction/TransactionPage/components/ReconciliationRow.tsx \
  src/features/transaction/TransactionPage/components/RepeatRow.tsx \
  src/features/transaction/TransactionPage/components/ExchangeRateRow.tsx \
  src/features/transaction/TransactionPage/components/TransactionPrimaryCard.tsx
git commit -m "refactor(transaction): remove row labels and resize icons"
```

---

### Task 6: Final verification

- [ ] **Step 1: Run lint + tests + build**

```bash
npm run lint --fix && npm run test && npm run build
```

Expected: all pass, no errors.

- [ ] **Step 2: Verify in browser**

Start dev server:
```bash
npm run dev
```

Check:
1. Open any transaction → date row shows "Paid" badge (green text, no icon)
2. Click badge on today's transaction → toggles to correct alternate (future=Planned, past=Overdue)
3. Click Overdue/Planned badge → returns to Paid
4. No small gray labels visible on any row (Wallet, Date & Time, Reconciliation, Repeat, Exchange Rate)
5. No "Details" section header above the details card
6. No "Total" label in primary card
7. Reconciliation row hides when status is not Paid
8. Repeat row shows when status is Planned or Overdue
9. Edit existing transaction → status badge pre-fills from saved `transaction.status`
