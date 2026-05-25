# Refactor: Shared Hooks & Components

**Date:** 2026-05-26  
**Scope:** Eliminate 4 duplication clusters across form hooks, form page components, and shared UI

---

## Problem

Four duplication clusters identified:

| # | Location | What's duplicated |
|---|----------|-------------------|
| 1 | 3 form hooks | `onSubmit`/`onDelete` try/catch/navigate — `useFormCrud` exists but unused |
| 2 | 3 form page components | `useState(null)` error + `handleSubmit`/`handleDelete` passing `setError` callback |
| 3 | `CategoryFormPage` + `WalletFormPage` | Icon trigger button JSX + `useState(false)` + `IconPicker` |
| 4 | `WalletsPage` | Two identical `trailing` JSX blocks (currency + chevron) |

---

## Design

### 1. Generalize `useFormCrud` (`src/hooks/useFormCrud.ts`)

**Two signature changes:**

- Drop `T extends { id: string }` constraint → plain `T`
- Change `remove: (id: string) => Promise<void>` → `remove: (item: T) => Promise<void>`

Internally: `remove(existing.id)` → `remove(existing)`

Callers pass adapter lambdas:
```typescript
// id-keyed stores (Category, Wallet)
remove: (item) => storeRemove(item.id)

// code-keyed store (Currency)
remove: (item) => storeRemove(item.code)
```

**Note:** `useCurrencyFormPage` currently calls `setBase` explicitly after save. `currencyStore.add`/`update` already call `setBase` internally — the explicit call is redundant and will be removed.

---

### 2. Migrate 3 form hooks to `useFormCrud`

Files: `useCategoryFormPage.ts`, `useCurrencyFormPage.ts`, `useWalletFormPage.ts`

Each hook:
- Replaces its hand-rolled try/catch/navigate with `useFormCrud`
- Moves field validation into the `validate` callback (closure captures store state where needed)
- Gets `error` from `useFormCrud` and returns it

`onSubmit` changes from `(form, setError)` → `(form)`.  
`onDelete` changes from `(setError)` → `()`.

Example (`useCategoryFormPage`):
```typescript
const { error, onSubmit, onDelete } = useFormCrud({
  existing,
  add,
  update,
  remove: (item) => remove(item.id),
  navigateTo: '/settings/categories',
  validate: (form) => {
    if (!form.name.trim()) return 'Name is required'
    if (form.parentId) {
      const parent = categories.find((c) => c.id === form.parentId)
      if (parent && parent.type !== form.type) return 'Category type must match parent type'
    }
    return null
  },
})
return { existing, categories, onBack, error, onSubmit, onDelete }
```

---

### 3. Simplify form page components

Files: `CategoryFormPage.tsx`, `CurrencyFormPage.tsx`, `WalletFormPage.tsx`

**Remove from each:**
- `const [error, setError] = useState<string | null>(null)`
- `setError` parameter from `onSubmit`/`onDelete` prop types

**Add to each props interface:**
- `error: string | null`

**Updated prop signatures:**
```typescript
onSubmit: (form: T) => Promise<void>
onDelete: () => Promise<void>
```

`handleSubmit`/`handleDelete` remain as thin wrappers for `event.preventDefault()` and form state passing.

---

### 4. Extract `IconPickerField` component

**New file:** `src/components/shared/picker/IconPickerField.tsx`

```typescript
interface IconPickerFieldProps {
  value: string
  onChange: (icon: string) => void
}
```

Manages its own `useState(false)` open state internally. Renders the trigger button (identical JSX in both form pages) + `<IconPicker>`.

Usage in both form pages:
```tsx
<Field label="Icon">
  <IconPickerField value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
</Field>
```

Export from `src/components/shared/picker/index.ts`.  
Add demo to `SharedComponentsSection` per design sandbox convention.

---

### 5. Deduplicate `WalletsPage` trailing (`WalletsPage.tsx`)

Extract local component (not exported):
```typescript
function WalletTrailing({ currency }: { currency: string }) {
  return (
    <div className="flex items-center gap-2 text-white/25">
      <span className="text-xs text-white/40">{currency}</span>
      <Icon name="fa-chevron-right" className="text-base" />
    </div>
  )
}
```

Both `ListRow`s use `trailing={<WalletTrailing currency={w.currency} />}`.

---

## Files Changed

| File | Change |
|------|--------|
| `src/hooks/useFormCrud.ts` | Generalize `T` constraint and `remove` signature |
| `src/features/settings/CategoryFormPage/useCategoryFormPage.ts` | Adopt `useFormCrud`, return `error` |
| `src/features/settings/CurrencyFormPage/useCurrencyFormPage.ts` | Adopt `useFormCrud`, remove redundant `setBase`, return `error` |
| `src/features/settings/WalletFormPage/useWalletFormPage.ts` | Adopt `useFormCrud`, return `error` |
| `src/features/settings/CategoryFormPage/CategoryFormPage.tsx` | Accept `error` prop, remove `useState(null)`, update signatures |
| `src/features/settings/CurrencyFormPage/CurrencyFormPage.tsx` | Accept `error` prop, remove `useState(null)`, update signatures |
| `src/features/settings/WalletFormPage/WalletFormPage.tsx` | Accept `error` prop, remove `useState(null)`, update signatures |
| `src/components/shared/picker/IconPickerField.tsx` | New component |
| `src/components/shared/picker/index.ts` | Export `IconPickerField` |
| `src/features/design/DesignPage/components/SharedComponentsSection.tsx` | Add `IconPickerField` demo |
| `src/features/settings/WalletsPage/WalletsPage.tsx` | Extract `WalletTrailing` local component |

---

## Testing

- Existing tests for `useFormCrud` must pass with generalized signature
- Existing form page tests verify submit/delete/validation flows
- New `IconPickerField` — add unit test alongside other picker tests
- Pre-completion: `npm run lint --fix && npm run test && npm run build`
