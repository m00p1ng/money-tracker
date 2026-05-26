# Category Activity Indicator

## Overview

When a category has transactions in the current month, show a glowing border on its cell in `CategorySelectionPage`. The indicator propagates from the leaf category up to every ancestor, so parent categories are highlighted even when the matching transactions live in a child.

## Data Computation

In `useCategorySelectionPage.ts`:

1. Read all transactions from `useTransactionStore`
2. Filter to transactions where `isCurrentMonth(tx.date)` — reuse the existing helper from `transactionStore.ts` (extract to `src/lib/` or inline the same logic)
3. Collect all `categoryId` values from `tx.items` of those transactions into a working set
4. For each collected `categoryId`, walk the `parentId` chain upward through `categories` until no parent remains, adding every ancestor ID to the set
5. Expose result as `activeThisMonth: Set<string>` in the props returned by the hook

## Component Changes

### `CategorySelectionPageProps`

Add one prop:

```ts
activeThisMonth: Set<string>
```

### `SortableCategoryCellProps`

Add one prop:

```ts
isActive: boolean
```

Derive at call site: `isActive={activeThisMonth.has(category.id)}`

### Cell rendering (non-edit mode `motion.button` + edit-mode `SortableCategoryCell`)

When `isActive` is true, apply inline style to the card element:

```ts
{
  borderColor: 'rgba(52,211,153,0.5)',
  boxShadow: '0 0 10px rgba(52,211,153,0.2), inset 0 0 8px rgba(52,211,153,0.05)',
  backgroundColor: 'rgba(16,185,129,0.06)',
}
```

No scale change. Always-on — not an animated state.

## Scope Constraints

- **Non-edit mode only.** Edit mode already uses a green highlight for reparent targets; adding a second always-on green glow would create visual conflict.
- **Grid cells only.** `ParentCategoryHeader` is not highlighted — the child cells already represent the propagated signal.
- No new routes, stores, or DB changes required.

## Data Flow

```
transactionStore.items
  → filter isCurrentMonth
  → collect categoryIds from tx.items
  → walk parentId chain for each
  → Set<string> activeThisMonth
  → CategorySelectionPageProps
  → category cell isActive prop
  → inline style (glowing border)
```
