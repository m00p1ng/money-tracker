# Balance Page Edit Mode Design

**Date:** 2026-05-26

## Overview

Add edit mode to BalancePage for wallet management. Edit mode enables drag-to-reorder and tap-to-edit wallet. WalletFormPage moves from settings to balance feature. Settings wallet management (WalletsPage + route) removed.

## Data Layer

### Wallet type (`src/types/domain.ts`)
Add optional `position` field:
```ts
export type Wallet = {
  // ...existing fields...
  position?: number
}
```

### WalletStore (`src/stores/walletStore.ts`)
Add `reorder(ids: string[]) => Promise<void>`:
- Iterates ids, sets `position = index` on each wallet
- Bulk-updates via `db.wallets.bulkPut()`
- Updates store state in one `set()` call

### Sorting
`useBalancePage` sorts wallets by `position` (ascending, undefined last) before splitting into payment/credit_card groups.

## Routing

### New routes (`App.tsx`)
```
/balance/wallets/new         → WalletFormPage (balance feature)
/balance/wallets/:id         → WalletFormPage (balance feature)
```

### Removed routes
```
/settings/wallets
/settings/wallets/new
/settings/wallets/:id
```

### WalletFormPage relocation
- Move `src/features/settings/WalletFormPage/` → `src/features/balance/WalletFormPage/`
- Update `useWalletFormPage.ts`: `navigateTo` changes from `/settings/wallets` to `/balance`
- Update `onBack` to navigate to `/balance`
- Update `src/features/settings/index.ts` — remove WalletFormPage export
- Update `src/features/balance/index.ts` — add WalletFormPage export

## BalancePage Edit Mode

### State (`useBalancePage`)
New fields returned:
- `isEditMode: boolean`
- `onToggleEditMode: () => void`
- `onAddWallet: (type: WalletType) => void` — navigates to `/balance/wallets/new?type=...`
- `onEditWallet: (id: string) => void` — navigates to `/balance/wallets/:id`
- `onReorder: (ids: string[]) => Promise<void>` — calls `walletStore.reorder()`

### PageHeader slots
Normal mode:
- Left: nothing (no back)
- Right: `rightSlot` = "Edit" button (icon `fa-pen` or text "Edit")

Edit mode:
- Left: replaced by `leftSlot` — "+" add button (opens type picker or navigates directly)
- Right: `rightSlot` = "Done" button (text)

**PageHeader needs `leftSlot` prop added** (`src/components/shared/PageHeader.tsx`):
```tsx
type PageHeaderProps = {
  title: React.ReactNode
  onBack?: () => void
  leftSlot?: React.ReactNode   // new — only used when onBack is absent
  rightSlot?: React.ReactNode
}
```
When `onBack` is provided, it takes precedence over `leftSlot`.

### Add wallet in edit mode
Single "+" button. Since wallets can be payment or credit_card, tapping "+" navigates to `/balance/wallets/new?type=payment` (default). User can switch type in the form. Alternatively: show a small action sheet — but keep it simple, default to payment type.

### Wallet list in edit mode
Each wallet row replaces its trailing content with a drag handle (`fa-grip-lines` icon). Tapping the row body navigates to WalletFormPage. The `to` prop is replaced with `onClick` in edit mode.

### Drag and drop
Library: `@dnd-kit/core` + `@dnd-kit/sortable`

- `DndContext` wraps each `ListGroup` section independently (payment group + credit card group reorder within their own group)
- `SortableContext` with `verticalListSortingStrategy`
- Each wallet row wrapped in `useSortable` hook
- `onDragEnd` → calls `onReorder(newIds)` for the affected group
- Touch sensor + pointer sensor enabled (PWA)

**Note:** Reordering is per-group (payment accounts reorder among themselves; credit cards reorder among themselves). Cross-group dragging is out of scope.

## Settings Cleanup

### SettingsPage (`src/features/settings/SettingsPage/`)
- Remove "Wallets" `ListRow` (the one linking to `/settings/wallets`)
- Remove `walletCount` prop from `SettingsPageProps`
- Update container to not pass `walletCount`

### Remove WalletsPage
- Delete `src/features/settings/WalletsPage/` entirely
- Remove from `src/features/settings/index.ts`

## File Changes Summary

| Action | Path |
|--------|------|
| Modify | `src/types/domain.ts` |
| Modify | `src/stores/walletStore.ts` |
| Modify | `src/components/shared/PageHeader.tsx` |
| Move   | `src/features/settings/WalletFormPage/` → `src/features/balance/WalletFormPage/` |
| Modify | `src/features/balance/WalletFormPage/useWalletFormPage.ts` |
| Modify | `src/features/balance/index.ts` |
| Modify | `src/features/settings/index.ts` |
| Modify | `src/features/balance/BalancePage/useBalancePage.ts` |
| Modify | `src/features/balance/BalancePage/BalancePage.tsx` |
| Modify | `src/features/balance/BalancePage/BalancePageContainer.tsx` |
| Modify | `src/features/settings/SettingsPage/SettingsPage.tsx` |
| Modify | `src/features/settings/SettingsPage/SettingsPageContainer.tsx` |
| Delete | `src/features/settings/WalletsPage/` |
| Modify | `src/App.tsx` |
| Install | `@dnd-kit/core` + `@dnd-kit/sortable` |

## Out of Scope
- Cross-group drag (payment ↔ credit card reordering)
- Add wallet type picker sheet (default to payment type)
- WalletFormPage color picker (existing behavior unchanged)
