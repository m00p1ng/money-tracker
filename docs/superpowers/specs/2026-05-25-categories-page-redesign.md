# CategoriesPage Redesign

## Overview

Replace the raw `Card`-based list with the standard settings page pattern: `TypePickerDropdown` in the `PageHeader` title slot to filter by transaction type, `ListGroup` + `ListRow` for category rows, and `AddRow` at the bottom.

## Current State

`CategoriesPage` uses `Card` components in a plain loop with no icon/color display, no type filtering, and a plain text "+ Add" link. Inconsistent with `WalletsPage` and `CurrenciesPage`.

## Design

### Layout

```
PageHeader
  title: <TypePickerDropdown value={activeType} onChange={setActiveType} />
  onBack: navigate to /settings

ListGroup (no label)
  ListRow per root category (filtered to activeType)
    icon + color from category
    label: category.name
    sub: "N sub-categories" | "No sub-categories"
    to: /settings/categories/:id
  AddRow
    label: "Add {Expense|Income|Transfer} Category"
    to: /settings/categories/new?type={activeType}
```

### Sub-count

Computed in `useCategoriesPage`: for each root category, count `categories` items where `parentId === category.id`. Display as `"${n} sub-categories"` or `"No sub-categories"` when zero.

### Type state

`activeType: TransactionType` — local `useState` in `useCategoriesPage`, default `'expense'`.

### Add route

`/settings/categories/new?type=expense` — passes active type as query param so `CategoryFormPage` can pre-fill the type field.

## Components

No new components. Reuses:

- `TypePickerDropdown` (from `@/components/ui`)
- `ListGroup`, `ListRow`, `AddRow` (from `@/components/shared`)
- `PageHeader` (from `@/components/shared`)

## Files Changed

| File | Change |
|------|--------|
| `src/features/settings/CategoriesPage/CategoriesPage.tsx` | Full rewrite — new layout |
| `src/features/settings/CategoriesPage/useCategoriesPage.ts` | Add `activeType` state, `subCountMap`, type-filtered list |

No changes to `CategoriesPageContainer`, `CategoryFormPage`, routing, or stores.
