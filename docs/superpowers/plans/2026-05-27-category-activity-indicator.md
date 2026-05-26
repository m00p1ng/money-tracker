# Category Activity Indicator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show a glowing green border on category cells that have transactions in the current month, propagating the indicator from leaf categories up through all their ancestors.

**Architecture:** Add `isCurrentMonth` to `src/lib/date.ts`. Compute `activeThisMonth: Set<string>` in `useCategorySelectionPage` by collecting leaf category IDs from current-month transactions and walking the `parentId` chain up. Pass the set as a prop to `CategorySelectionPage`; cells apply an inline glow style when their ID is in the set.

**Tech Stack:** React, TypeScript, Zustand (read-only), Vitest

---

## File Map

| File | Change |
|------|--------|
| `src/lib/date.ts` | Add `isCurrentMonth` export |
| `src/lib/__tests__/date.test.ts` | Add tests for `isCurrentMonth` |
| `src/features/transaction/CategorySelectionPage/useCategorySelectionPage.ts` | Compute `activeThisMonth: Set<string>` |
| `src/features/transaction/CategorySelectionPage/CategorySelectionPage.tsx` | Add `activeThisMonth` prop; apply glow style to cells |

---

### Task 1: Export `isCurrentMonth` from `src/lib/date.ts`

**Files:**
- Modify: `src/lib/date.ts`
- Test: `src/lib/__tests__/date.test.ts`

- [ ] **Step 1: Write the failing test**

Open `src/lib/__tests__/date.test.ts`. Add these cases to the existing `describe('date utilities', ...)` block:

```ts
it('detects a date in the current month', () => {
  const now = new Date('2026-05-15T12:00:00')
  expect(isCurrentMonth('2026-05-01', now)).toBe(true)
  expect(isCurrentMonth('2026-05-31', now)).toBe(true)
  expect(isCurrentMonth('2026-04-30', now)).toBe(false)
  expect(isCurrentMonth('2026-06-01', now)).toBe(false)
})
```

Also add `isCurrentMonth` to the import at the top of the file:

```ts
import {
  formatHeaderDate,
  formatHeaderDay,
  formatHeaderMonthYear,
  formatHeaderWeekday,
  formatShortDate,
  isCurrentMonth,
  isTodayInLocalTime,
  monthRangeLabel,
  toDatetimeLocalValue,
} from '@/lib'
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- src/lib/__tests__/date.test.ts
```

Expected: FAIL — `isCurrentMonth` is not exported.

- [ ] **Step 3: Implement `isCurrentMonth` in `src/lib/date.ts`**

Append this function before the final export in `src/lib/date.ts`:

```ts
export function isCurrentMonth(isoDate: string, now = new Date()): boolean {
  const date = new Date(isoDate)

  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test -- src/lib/__tests__/date.test.ts
```

Expected: all tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/date.ts src/lib/__tests__/date.test.ts
git commit -m "feat(lib): export isCurrentMonth date utility"
```

---

### Task 2: Compute `activeThisMonth` in `useCategorySelectionPage`

**Files:**
- Modify: `src/features/transaction/CategorySelectionPage/useCategorySelectionPage.ts`

- [ ] **Step 1: Add `activeThisMonth` to `CategorySelectionPageProps`**

Open `src/features/transaction/CategorySelectionPage/CategorySelectionPage.tsx`. Add the new prop to `CategorySelectionPageProps`:

```ts
export interface CategorySelectionPageProps {
  type: 'expense' | 'income'
  isLocked: boolean
  isEditMode: boolean
  visible: Category[]
  parentId: string | undefined
  parent: Category | undefined
  categories: Category[]
  activeThisMonth: Set<string>          // ← add this line
  confirmDeleteId: string | null
  mergeSourceId: string | null
  mergeTargetId: string | null
  onTypeChange: (newType: 'expense' | 'income' | 'transfer') => void
  onBack: () => void
  onSelect: (category: Category) => void
  onToggleEditMode: () => void
  onRequestDelete: (id: string) => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
  onSelectMergeTarget: (targetId: string) => void
  onConfirmMerge: () => void
  onCancelMerge: () => void
  onEditParent: () => void
  onAddCategory: () => void
  onReorder: (ids: string[]) => void
  onReparent: (id: string, newParentId: string | undefined) => void
}
```

- [ ] **Step 2: Compute `activeThisMonth` in the hook**

Open `src/features/transaction/CategorySelectionPage/useCategorySelectionPage.ts`.

Add `isCurrentMonth` to the imports from `@/lib`:

```ts
import { isCurrentMonth } from '@/lib'
```

Add `useTransactionStore` to the existing store imports (it's already imported — check the line):

```ts
import {
  useCategoryStore,
  useTransactionDraftStore,
  useTransactionStore,
} from '@/stores'
```

Inside `useCategorySelectionPage`, after the `const categories = ...` line, add:

```ts
const transactions = useTransactionStore((state) => state.items)

const activeThisMonth = useMemo<Set<string>>(() => {
  const active = new Set<string>()

  for (const tx of transactions) {
    if (!isCurrentMonth(tx.date)) continue
    for (const item of tx.items) {
      let id: string | undefined = item.categoryId
      while (id) {
        if (active.has(id)) break
        active.add(id)
        id = categories.find((c) => c.id === id)?.parentId
      }
    }
  }

  return active
}, [transactions, categories])
```

Add `useMemo` to the React import at the top of the file:

```ts
import { useMemo, useState } from 'react'
```

- [ ] **Step 3: Add `activeThisMonth` to the returned props object**

In the `return { ... }` block at the bottom of `useCategorySelectionPage`, add:

```ts
activeThisMonth,
```

- [ ] **Step 4: Run typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/features/transaction/CategorySelectionPage/useCategorySelectionPage.ts \
        src/features/transaction/CategorySelectionPage/CategorySelectionPage.tsx
git commit -m "feat(CategorySelectionPage): compute activeThisMonth set in hook"
```

---

### Task 3: Apply glow style to active category cells (non-edit mode only)

Edit mode already uses green highlights for reparent targets — the glow only appears in normal (non-edit) mode to avoid conflict.

**Files:**
- Modify: `src/features/transaction/CategorySelectionPage/CategorySelectionPage.tsx`

- [ ] **Step 1: Thread `activeThisMonth` through the component**

In `CategorySelectionPage.tsx`, destructure `activeThisMonth` from props in the `CategorySelectionPage` function signature:

```ts
export function CategorySelectionPage({
  type,
  isLocked,
  isEditMode,
  visible,
  parentId,
  parent,
  categories,
  activeThisMonth,          // ← add this
  confirmDeleteId,
  mergeSourceId,
  mergeTargetId,
  onTypeChange,
  onBack,
  onSelect,
  onToggleEditMode,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  onSelectMergeTarget,
  onConfirmMerge,
  onCancelMerge,
  onEditParent,
  onAddCategory,
  onReorder,
  onReparent,
}: CategorySelectionPageProps) {
```

- [ ] **Step 2: Apply glow style to the non-edit mode `motion.button`**

Find the non-edit-mode cell — it's inside the ternary `isEditMode ? <SortableCategoryCell ...> : <motion.button ...>` in the grid map. Apply the glow `style` prop:

```tsx
<motion.button
  key={category.id}
  variants={cellVariants}
  whileTap={{ scale: 0.96 }}
  onClick={() => onSelect(category)}
  type="button"
  style={
    activeThisMonth.has(category.id)
      ? {
        borderColor: 'rgba(52,211,153,0.5)',
        backgroundColor: 'rgba(16,185,129,0.06)',
        boxShadow: '0 0 10px rgba(52,211,153,0.2), inset 0 0 8px rgba(52,211,153,0.05)',
      }
      : undefined
  }
  className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/4 px-2 py-3.5"
>
```

- [ ] **Step 3: Run lint, tests, and build**

```bash
npm run lint -- --fix && npm run test && npm run build
```

Expected: no lint errors, all tests pass, build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/features/transaction/CategorySelectionPage/CategorySelectionPage.tsx
git commit -m "feat(CategorySelectionPage): show glow indicator on active categories"
```
