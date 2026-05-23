# Shared Components Refactor — Design Spec

**Date:** 2026-05-23  
**Status:** Approved

---

## Goal

Extract duplicated UI patterns, logic, and utilities spread across feature files into shared components, hooks, and utilities. Feature files continue importing from `@/components/ui/`, `@/lib/`, and `@/hooks/` — the `src/shared/` folder is an internal implementation detail.

---

## Directory Structure

```
src/
  shared/
    components/
      PageHeader.tsx
      BottomSheet.tsx
      ListGroup.tsx
      ListRow.tsx
      AddRow.tsx
      SectionDivider.tsx
      SectionLabel.tsx
      FormErrorMessage.tsx
      AnimatedBar.tsx
      TransactionRow.tsx
      PickerColumn.tsx
    hooks/
      useFormCrud.ts
    lib/
      color.ts
  components/
    ui/
      index.ts              ← re-exports from src/shared/components/ + existing ui files
      Button.tsx            (existing, add fullWidth prop)
      Card.tsx              (existing, unchanged)
      Field.tsx             (existing, unchanged)
      SegmentedControl.tsx  (existing, unchanged)
      TypePickerDropdown.tsx (existing, unchanged)
  hooks/
    index.ts                ← re-exports from src/shared/hooks/
  lib/
    color.ts                ← re-exports from src/shared/lib/color.ts
    (all other existing lib files unchanged)
```

**Import rule:** Feature files never import from `src/shared/` directly. All imports use `@/components/ui/`, `@/lib/`, or `@/hooks/`.

---

## Shared Components

### `PageHeader`

**Props:** `title: string`, `onBack: () => void`, `rightSlot?: React.ReactNode`

Renders the 3-column grid header (back chevron button + centered title + optional right slot). When `rightSlot` is omitted, renders an empty `<div />` spacer to preserve alignment.

**Replaces duplication in:** `WalletFormPage`, `CategoryFormPage`, `CurrencyFormPage`, `WalletsPage`, `CategoriesPage`, `CurrenciesPage`, `WalletDetailPage`, `TransactionPage` (8 files).

---

### `BottomSheet`

**Props:** `isOpen: boolean`, `onClose: () => void`, `title: string`, `children: React.ReactNode`

Renders the full `AnimatePresence` + backdrop + slide-up panel scaffold: drag handle, centered title, divider, then `children`. Animation values (`spring stiffness: 400, damping: 38`, backdrop `duration: 0.2`) are fixed constants — not configurable.

**Replaces duplication in:** `CurrencyPicker`, `WalletPicker`, `RepeatPicker`, `DatePickerSheet`, `WalletDetailPage` inline date-range sheet (5 files).

---

### `ListGroup`

**Props:** `label: string`, `children: React.ReactNode`

Renders the group label paragraph + rounded container with border. Replaces the local `SettingsGroup`, `WalletGroup`, and inline group pattern.

**Replaces duplication in:** `SettingsPage`, `WalletsPage`, `CurrenciesPage` (3 files).

---

### `ListRow`

**Props:** `icon: string`, `iconBg: string`, `iconColor: string`, `label: string`, `sub?: string`, `trailing?: React.ReactNode`, `to: string`

Renders a `<Link>` row with icon circle, label + sub-label, and trailing content (defaults to a chevron-right icon). Border between rows handled via `last:border-b-0` on the element itself.

**Replaces duplication in:** `SettingsPage` (`SettingRow`), `WalletsPage` (`WalletRow`), `CurrenciesPage` (`CurrencyRow`) (3 files).

---

### `AddRow`

**Props:** `label: string`, `to: string`

Renders the accent-colored "plus + label" link used at the bottom of list groups.

**Replaces duplication in:** `WalletsPage`, `CurrenciesPage` (2 files).

---

### `SectionDivider`

**Props:** `label: string`

Renders the `label` text + horizontal rule pattern used above grouped lists in balance pages.

**Replaces duplication in:** `BalancePage`, `WalletDetailPage` (2 files).

---

### `SectionLabel`

**Props:** `children: React.ReactNode`

Renders the small uppercase tracking label (`text-[11px] uppercase tracking-[1.5px] text-white/30`). Used for section headings in home, settings, and list pages.

**Replaces duplication in:** `TodayTransactions`, `UpcomingTransactions`, `SettingsPage`, `WalletsPage`, `CurrenciesPage` (5 files).

---

### `FormErrorMessage`

**Props:** `error: string | null`

Renders `<p className="text-sm text-red-300">{error}</p>` when `error` is truthy, otherwise renders nothing.

**Replaces duplication in:** `WalletFormPage`, `CategoryFormPage`, `CurrencyFormPage` (3 files).

---

### `AnimatedBar`

**Props:** `value: number`, `maxValue: number`, `colorFrom: string`, `colorTo: string`, `textColor: string`, `delay?: number`

Renders the framer-motion animated width bar. Width is computed as `Math.min((value / maxValue) * 100, 100)%`. Displays the formatted value inside the bar using the existing `formatAmount` utility.

**Replaces duplication in:** `BalancePage`, `WalletDetailPage` (2 files, 4+ instances total).

---

### `TransactionRow`

**Props:** `to: string`, `icon: string`, `iconBg: string`, `iconColor: string`, `primaryLabel: string`, `secondaryLabel: string`, `amount: string`, `amountColor: string`

Renders the icon + primary/secondary label + amount link card used in transaction lists.

**Replaces duplication in:** `TodayTransactions`, `UpcomingTransactions`, `WalletDetailPage` (3 files).

---

### `PickerColumn`

**Props:** `label: string`, `name: string`, `options: string[]`, `value: Record<string, string>`, `onChange: (value: Record<string, string>) => void`

Renders the react-mobile-picker column with label, container styles, and item rendering (selected = bold white, unselected = white/30).

**Replaces duplication in:** `RepeatPicker`, `DatePickerSheet` (2 files).

---

## Hook

### `useFormCrud<T>`

```ts
useFormCrud<T extends { id: string }>(options: {
  existing: T | undefined
  add: (data: T) => void
  update: (data: T) => void
  remove: (id: string) => void
  navigateTo: string
}): {
  error: string | null
  onSubmit: (e: React.FormEvent) => void
  onDelete: () => void
}
```

Encapsulates: validate → try `existing ? update() : add()` → navigate on success → `setError` on failure. Also handles delete guard (`if (!existing) return`) and navigate after delete.

**Replaces duplication in:** `WalletFormPage`, `CategoryFormPage`, `CurrencyFormPage` (3 files).

---

## Utility

### `src/shared/lib/color.ts`

Exports `hexToRgba(hex: string, alpha: number): string`. Identical implementation currently duplicated in `BalancePage` and `WalletDetailPage`.

---

## `Button` Extension

Add `fullWidth?: boolean` prop to the existing `Button` component. When true, adds `w-full` to the button's className. This replaces the inline full-width confirm button style in `RepeatPicker` and `DatePickerSheet`.

---

## Files Changed Summary

| File | Change |
|------|--------|
| `src/shared/components/*.tsx` (11 files) | New |
| `src/shared/hooks/useFormCrud.ts` | New |
| `src/shared/lib/color.ts` | New |
| `src/components/ui/index.ts` | New (barrel re-exports) |
| `src/hooks/index.ts` | New (barrel re-exports) |
| `src/lib/color.ts` | New (re-export) |
| `src/components/ui/Button.tsx` | Extend (fullWidth prop) |
| `src/features/settings/*.tsx` (5 files) | Consume shared components |
| `src/features/transaction/*.tsx` (5 files) | Consume shared components |
| `src/features/home/*.tsx` (3 files) | Consume shared components |
| `src/features/balance/*.tsx` (2 files) | Consume shared components |

---

## Testing

- No new tests required for purely presentational components (they have no logic).
- `useFormCrud` should have unit tests covering: successful add, successful update, successful delete, error on add failure, error on delete when no existing item.
- `hexToRgba` should have a unit test for correct output format.
- Existing tests must continue to pass after all replacements.
