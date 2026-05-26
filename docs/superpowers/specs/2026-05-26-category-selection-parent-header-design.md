# CategorySelectionPage: Parent Category Header

## Goal

When user drills into sub-categories, show parent category icon + name in the page header instead of TypePickerDropdown.

## Current Behavior

Header always renders `TypePickerDropdown` regardless of drill depth (`parentId` state).

## Desired Behavior

- Root level (`parentId` undefined): header title = `TypePickerDropdown` (unchanged)
- Sub-category level (`parentId` set): header title = parent category icon + name

## Design

### Approach

Pass `parent: Category | undefined` as a new prop on `CategorySelectionPageProps`. The component decides which title to render based on `parent`.

### Props Change

```ts
// CategorySelectionPage.tsx
export interface CategorySelectionPageProps {
  type: 'expense' | 'income'
  isLocked: boolean
  visible: Category[]
  parentId: string | undefined
  parent: Category | undefined          // NEW
  onTypeChange: (newType: 'expense' | 'income' | 'transfer') => void
  onBack: () => void
  onSelect: (category: Category) => void
}
```

### Header Render Logic

```tsx
title={
  parent
    ? (
      <span className="flex items-center gap-2">
        <Icon name={parent.icon} />
        <span>{parent.name}</span>
      </span>
    )
    : <TypePickerDropdown value={type} onChange={onTypeChange} locked={isLocked} />
}
```

### Hook Change

`parent` is already computed in `useCategorySelectionPage`. Add it to the return object.

```ts
return {
  type,
  isLocked,
  visible,
  parentId,
  parent,       // NEW
  onTypeChange,
  onBack,
  onSelect,
}
```

## Files to Modify

| File | Change |
|------|--------|
| `CategorySelectionPage.tsx` | Add `parent` prop, conditional header title |
| `useCategorySelectionPage.ts` | Add `parent` to return |

## No New Tests Needed

Logic is purely presentational. `parent` derivation already exists in hook; only the return value changes.
