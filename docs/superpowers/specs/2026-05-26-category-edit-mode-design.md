# Category Edit Mode Design

## Overview

Add edit mode to `CategorySelectionPage`. Replaces the separate `/settings/categories` route. All category management happens in-context from the category selection grid.

---

## Header Changes

**Normal mode:** PageHeader `rightSlot` shows "Edit" button (text, `text-slate-400`).

**Edit mode:** `rightSlot` shows "Done" button (text, `text-blue-400`). Tapping Done exits edit mode.

The `TypePickerDropdown` title and back button remain unchanged in both modes.

---

## Category Cell in Edit Mode

Each cell gets a close badge (red ×) at the **top-left corner** (`position:absolute; top:-4px; left:-4px`). Badge is 18×18px, red circle, white ×.

Tapping the close badge opens the confirm sheet for that category.

Tapping the cell body in edit mode:
- **No sub-categories** → navigate to inline edit form (icon + name only)
- **Has sub-categories** → drill into sub-categories as normal (edit mode persists)

When drilled into sub-categories, the parent header row (icon + name) is tappable in edit mode → navigate to inline edit form for the parent.

---

## Confirm Sheet (new shared component)

New component: `ConfirmSheet`. Props:

```ts
type ConfirmSheetProps = {
  isOpen: boolean
  title: string
  description?: string
  primaryLabel: string
  primaryColor?: 'danger' | 'default'  // default: 'danger'
  onPrimary: () => void
  onCancel: () => void
}
```

Renders as a `BottomSheet` with:
- Optional description text (muted, centered)
- Primary action button
- Cancel button

### Scenario 1 — No transactions under category

```
title: Delete "{name}"?
primaryLabel: Delete
primaryColor: danger
```

Tapping Delete → remove category from store → close sheet.

### Scenario 2 — Has transactions under category

```
title: Delete "{name}"?
description: "This category has transactions. Choose a category to merge them into before deleting."
primaryLabel: Merge & Delete
primaryColor: danger
```

Tapping "Merge & Delete" → open merge target picker sheet.

---

## Merge Target Picker

A separate bottom sheet that opens after "Merge & Delete" is tapped.

Shows all categories of the same type as an **indented list** (no connector lines):
- Level 1 categories: `padding-left: 8px`
- Level 2 categories: `padding-left: 28px`
- Level 3+: `padding-left: 48px`

The category being deleted is shown grayed out (`opacity-30`, non-tappable).

Tapping a target category → show a second `ConfirmSheet`:
```
title: Merge "{source}" into "{target}"?
primaryLabel: Merge & Delete
primaryColor: danger
```

Confirming → reassign all transactions with `categoryId === source.id` to `target.id` → delete source category → close sheets → exit edit mode.

Cancel at any point closes both sheets, returns to edit mode.

---

## Inline Category Edit Form

New page/sheet (navigate forward) for editing icon + name only. Route: `/transaction/category/edit/:id`.

Fields:
- Name (text input)
- Icon (icon picker)

No type, no parent, no level changes — prevents structural corruption.

Save → `categoryStore.update()` → navigate back.

---

## Drag: Reorder + Reparent (one-mode)

In edit mode, cells support drag via `@dnd-kit/core` + `@dnd-kit/sortable`.

**Reorder:** Drag a cell and drop into a gap between other cells → reorders position. Position stored as `position` field on `Category` (already exists on `Wallet`, add to `Category`).

**Reparent:** Drag a cell and drop *onto* another cell → the dragged category becomes a child of the drop target. Drop target highlights with blue border during hover.

Constraints:
- Cannot reparent onto itself or its own descendants.
- Cannot reparent if resulting level would exceed 5.
- After reparent, level is recalculated as `parent.level + 1`.

Visual during drag:
- Dragged cell: semi-transparent (`opacity-40`), dashed border.
- Drop target cell (for reparent): blue border + blue tint background.
- Gap indicator (for reorder): thin blue line between cells.

---

## Remove Categories from Settings

Remove the "Categories" `ListRow` from `SettingsPage`. Remove the `/settings/categories` and `/settings/categories/:id` routes. The `CategoriesPage` and related components become dead code — delete them.

---

## Category `position` Field

Add optional `position?: number` to `Category` type. Seed data sets sequential positions. Store renders categories sorted by `position` (fallback: insertion order). `categoryStore.reorder(id, newPosition)` method updates positions.

---

## Components to Create / Modify

| File | Change |
|------|--------|
| `src/components/shared/ConfirmSheet.tsx` | New shared component |
| `src/features/transaction/CategorySelectionPage/CategorySelectionPage.tsx` | Edit mode props, close badges, drag |
| `src/features/transaction/CategorySelectionPage/useCategorySelectionPage.ts` | Edit mode state, delete/merge/reorder/reparent logic |
| `src/features/transaction/CategorySelectionPage/MergeTargetSheet.tsx` | New: tree list picker sheet |
| `src/features/transaction/CategoryEditPage/` | New folder: inline icon+name edit form |
| `src/stores/categoryStore.ts` | Add `reorder()`, `reparent()`, `mergeAndDelete()` methods |
| `src/types/domain.ts` | Add `position?: number` to `Category` (already exists on `Wallet`) |
| `src/features/settings/SettingsPage/SettingsPage.tsx` | Remove Categories row |
| `src/features/settings/CategoriesPage/` | Delete entire folder |
| `src/features/settings/CategoryFormPage/` | Delete entire folder |
| `src/App.tsx` | Remove `/settings/categories/new` + `/settings/categories/:id` routes; add `/transaction/category/edit/:id` |
