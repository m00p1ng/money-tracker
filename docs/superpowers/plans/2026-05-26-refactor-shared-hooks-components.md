# Refactor: Shared Hooks & Components — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate 4 duplication clusters by generalizing `useFormCrud`, wiring it into 3 form hooks, simplifying form page components, extracting `IconPickerField`, and deduplicating `WalletsPage` trailing.

**Architecture:** `useFormCrud` becomes the single source of try/catch/navigate/error-state for all form pages. Form hooks own `error` and return it as a prop. Form page components receive `error` as a prop and drop their local error state. `IconPickerField` wraps the trigger button + `IconPicker` sheet into a single self-contained component.

**Tech Stack:** React 18, TypeScript, Zustand, Vitest + Testing Library, Tailwind

---

## File Map

| File | Action |
|------|--------|
| `src/hooks/useFormCrud.ts` | Modify — generalize `T` constraint, `remove(item: T)` |
| `src/hooks/__tests__/useFormCrud.test.ts` | Modify — update `remove` assertion |
| `src/features/settings/CategoryFormPage/useCategoryFormPage.ts` | Modify — adopt `useFormCrud`, return `error` |
| `src/features/settings/CategoryFormPage/CategoryFormPage.tsx` | Modify — accept `error` prop, drop local error state, update signatures |
| `src/features/settings/CategoryFormPage/__tests__/CategoryFormPage.test.tsx` | Modify — update mock signatures, add `error` prop |
| `src/features/settings/CurrencyFormPage/useCurrencyFormPage.ts` | Modify — adopt `useFormCrud`, remove redundant `setBase` call, return `error` |
| `src/features/settings/CurrencyFormPage/CurrencyFormPage.tsx` | Modify — accept `error` prop, drop local error state, update signatures |
| `src/features/settings/CurrencyFormPage/__tests__/CurrencyFormPage.test.tsx` | Modify — update mock signatures, add `error` prop |
| `src/features/settings/WalletFormPage/useWalletFormPage.ts` | Modify — adopt `useFormCrud`, return `error` |
| `src/features/settings/WalletFormPage/WalletFormPage.tsx` | Modify — accept `error` prop, drop local error state, update signatures |
| `src/features/settings/WalletFormPage/__tests__/WalletFormPage.test.tsx` | Modify — update mock signatures, add `error` prop |
| `src/components/shared/picker/IconPickerField.tsx` | Create — trigger button + `IconPicker` state, all self-contained |
| `src/components/shared/picker/__tests__/IconPickerField.test.tsx` | Create — unit tests |
| `src/components/shared/picker/index.ts` | Modify — export `IconPickerField` |
| `src/features/design/DesignPage/designNavigation.ts` | Modify — add `icon-picker-field` nav item |
| `src/features/design/DesignPage/components/SharedComponentsSection.tsx` | Modify — add `IconPickerField` demo |
| `src/features/settings/WalletsPage/WalletsPage.tsx` | Modify — extract `WalletTrailing` local component |

---

## Task 1: Generalize `useFormCrud`

**Files:**
- Modify: `src/hooks/useFormCrud.ts`
- Modify: `src/hooks/__tests__/useFormCrud.test.ts`

- [ ] **Step 1: Update the failing test assertion**

In `src/hooks/__tests__/useFormCrud.test.ts`, change the `remove` test and the `makeOptions` helper:

```typescript
import { act, renderHook } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { useFormCrud } from '@/hooks/useFormCrud'

interface WrapperProps {
  children: React.ReactNode
}

const wrapper = ({ children }: WrapperProps) =>
  React.createElement(MemoryRouter, null, children)

type Item = { id: string; name: string }
const item: Item = { id: '1', name: 'Test' }

function makeOptions(overrides: Partial<Parameters<typeof useFormCrud<Item>>[0]> = {}) {
  return {
    existing: undefined as Item | undefined,
    add: vi.fn().mockResolvedValue(undefined),
    update: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn<(i: Item) => Promise<void>>().mockResolvedValue(undefined),
    navigateTo: '/list',
    validate: () => null as string | null,
    ...overrides,
  }
}

describe('useFormCrud', () => {
  it('calls add when existing is undefined', async () => {
    const opts = makeOptions()
    const { result } = renderHook(() => useFormCrud(opts), { wrapper })
    await act(async () => {
      await result.current.onSubmit(item)
    })
    expect(opts.add).toHaveBeenCalledWith(item)
    expect(opts.update).not.toHaveBeenCalled()
  })

  it('calls update when existing is defined', async () => {
    const opts = makeOptions({ existing: item })
    const { result } = renderHook(() => useFormCrud(opts), { wrapper })
    await act(async () => {
      await result.current.onSubmit(item)
    })
    expect(opts.update).toHaveBeenCalledWith(item)
    expect(opts.add).not.toHaveBeenCalled()
  })

  it('sets error when add throws', async () => {
    const opts = makeOptions({ add: vi.fn().mockRejectedValue(new Error('Save failed')) })
    const { result } = renderHook(() => useFormCrud(opts), { wrapper })
    await act(async () => {
      await result.current.onSubmit(item)
    })
    expect(result.current.error).toBe('Save failed')
  })

  it('calls remove with the full item when existing is defined', async () => {
    const opts = makeOptions({ existing: item })
    const { result } = renderHook(() => useFormCrud(opts), { wrapper })
    await act(async () => {
      await result.current.onDelete()
    })
    expect(opts.remove).toHaveBeenCalledWith(item)
  })

  it('does nothing on delete when existing is undefined', async () => {
    const opts = makeOptions()
    const { result } = renderHook(() => useFormCrud(opts), { wrapper })
    await act(async () => {
      await result.current.onDelete()
    })
    expect(opts.remove).not.toHaveBeenCalled()
  })

  it('sets error when validate returns a message', async () => {
    const opts = makeOptions({ validate: () => 'Name is required' })
    const { result } = renderHook(() => useFormCrud(opts), { wrapper })
    await act(async () => {
      await result.current.onSubmit(item)
    })
    expect(result.current.error).toBe('Name is required')
    expect(opts.add).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- src/hooks/__tests__/useFormCrud.test.ts
```

Expected: `calls remove with the full item` FAIL — `remove` was called with `'1'` not the full item object.

- [ ] **Step 3: Update `useFormCrud` implementation**

Replace `src/hooks/useFormCrud.ts` entirely:

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router'

type UseFormCrudOptions<T> = {
  existing: T | undefined
  add: (data: T) => Promise<void>
  update: (data: T) => Promise<void>
  remove: (item: T) => Promise<void>
  navigateTo: string
  validate?: (data: T) => string | null
}

export function useFormCrud<T>({
  existing,
  add,
  update,
  remove,
  navigateTo,
  validate,
}: UseFormCrudOptions<T>) {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(data: T) {
    if (validate) {
      const msg = validate(data)
      if (msg) {
        setError(msg)

        return
      }
    }
    try {
      await (existing
        ? update(data)
        : add(data))
      navigate(navigateTo)
    } catch (err) {
      setError(err instanceof Error
        ? err.message
        : 'Unable to save')
    }
  }

  async function onDelete() {
    if (!existing) {
      return
    }
    try {
      await remove(existing)
      navigate(navigateTo)
    } catch (err) {
      setError(err instanceof Error
        ? err.message
        : 'Unable to delete')
    }
  }

  return {
    error,
    onSubmit,
    onDelete,
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npm run test -- src/hooks/__tests__/useFormCrud.test.ts
```

Expected: all 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useFormCrud.ts src/hooks/__tests__/useFormCrud.test.ts
git commit -m "refactor: generalize useFormCrud remove to accept full item"
```

---

## Task 2: Migrate Category form

**Files:**
- Modify: `src/features/settings/CategoryFormPage/useCategoryFormPage.ts`
- Modify: `src/features/settings/CategoryFormPage/CategoryFormPage.tsx`
- Modify: `src/features/settings/CategoryFormPage/__tests__/CategoryFormPage.test.tsx`

- [ ] **Step 1: Update `CategoryFormPage.test.tsx` to use new signatures**

Replace `src/features/settings/CategoryFormPage/__tests__/CategoryFormPage.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import type { Category } from '@/types/domain'

import { CategoryFormPage } from '../CategoryFormPage'

const existingCategory: Category = {
  id: 'cat-1',
  name: 'Food',
  type: 'expense',
  level: 1,
  icon: 'fa-utensils',
  isDefault: false,
}

function renderPage(props: Partial<React.ComponentProps<typeof CategoryFormPage>> = {}) {
  const onSubmit = vi.fn<(form: Category) => Promise<void>>(async () => {})
  const onDelete = vi.fn<() => Promise<void>>(async () => {})
  const onBack = vi.fn()

  render(
    <CategoryFormPage
      existing={undefined}
      categories={[]}
      error={null}
      onBack={onBack}
      onSubmit={onSubmit}
      onDelete={onDelete}
      {...props}
    />,
  )

  return {
    onSubmit, onDelete, onBack,
  }
}

describe('CategoryFormPage', () => {
  it('renders new category form', () => {
    renderPage()
    expect(screen.getByText('New Category')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /icon/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('renders edit mode with delete button', () => {
    renderPage({ existing: existingCategory })
    expect(screen.getByText('Edit Category')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('opens icon picker when icon field is tapped', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /icon/i }))
    expect(screen.getByRole('heading', { name: 'Icon' })).toBeInTheDocument()
  })

  it('submits with selected icon', async () => {
    const { onSubmit } = renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ icon: 'fa-circle' })
  })

  it('displays error prop when provided', () => {
    renderPage({ error: 'Name is required' })
    expect(screen.getByText('Name is required')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify failures**

```bash
npm run test -- src/features/settings/CategoryFormPage
```

Expected: TypeScript/prop-type errors — `error` prop unknown, `onSubmit`/`onDelete` signatures mismatch.

- [ ] **Step 3: Update `useCategoryFormPage.ts`**

Replace `src/features/settings/CategoryFormPage/useCategoryFormPage.ts`:

```typescript
import { useParams } from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import { useFormCrud } from '@/hooks'
import { useCategoryStore } from '@/stores'
import type { Category } from '@/types/domain'

export function useCategoryFormPage() {
  const { id } = useParams()
  const backNavigate = useBackNavigate()
  const existing = useCategoryStore((state) => (id
    ? state.findById(id)
    : undefined))
  const categories = useCategoryStore((state) => state.items)
  const add = useCategoryStore((state) => state.add)
  const update = useCategoryStore((state) => state.update)
  const remove = useCategoryStore((state) => state.remove)

  const { error, onSubmit, onDelete } = useFormCrud<Category>({
    existing,
    add,
    update,
    remove: (item) => remove(item.id),
    navigateTo: '/settings/categories',
    validate: (form) => {
      if (!form.name.trim()) {
        return 'Name is required'
      }
      if (form.parentId) {
        const parent = categories.find((c) => c.id === form.parentId)
        if (parent && parent.type !== form.type) {
          return 'Category type must match parent type'
        }
      }

      return null
    },
  })

  return {
    existing,
    categories,
    error,
    onBack: () => backNavigate('/settings/categories'),
    onSubmit,
    onDelete,
  }
}
```

- [ ] **Step 4: Update `CategoryFormPage.tsx`**

Replace `src/features/settings/CategoryFormPage/CategoryFormPage.tsx`:

```typescript
import {
  FormEvent,
  useMemo,
  useState,
} from 'react'

import {
  Field,
  FormActions,
  FormErrorMessage,
  Icon,
  PageHeader,
  SelectInput,
  TextInput,
} from '@/components'
import { IconPicker } from '@/components/shared/picker/IconPicker'
import { createId } from '@/lib'
import type { Category, TransactionType } from '@/types/domain'

interface CategoryFormPageProps {
  existing: Category | undefined
  categories: Category[]
  error: string | null
  onBack: () => void
  onSubmit: (form: Category) => Promise<void>
  onDelete: () => Promise<void>
}

export function CategoryFormPage({
  existing,
  categories,
  error,
  onBack,
  onSubmit,
  onDelete,
}: CategoryFormPageProps) {
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const title = useMemo(() => (existing
    ? 'Edit Category'
    : 'New Category'), [existing])
  const [form, setForm] = useState<Category>(() => existing ?? {
    id: createId(),
    name: '',
    type: 'expense',
    level: 1,
    icon: 'fa-circle',
    isDefault: false,
  })

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await onSubmit(form)
  }

  async function handleDelete() {
    await onDelete()
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <PageHeader title={title} onBack={onBack} />

      <div className="flex items-center gap-3 rounded-xl bg-white/3 p-3">
        <div className={[
          'flex h-11 w-11 shrink-0 items-center justify-center',
          'rounded-[14px] bg-white/10 text-base text-slate-50',
        ].join(' ')}>
          <Icon name={form.icon} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-50">
            {form.name.trim() || 'New category'}
          </p>
          <p className="mt-0.5 text-sm text-white/40">{form.type}</p>
        </div>
      </div>

      <Field label="Name">
        <TextInput
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
      </Field>
      <Field label="Icon">
        <button
          type="button"
          aria-label="icon"
          onClick={() => setIconPickerOpen(true)}
          className={[
            'flex min-h-11 w-full items-center gap-2 rounded-lg',
            'border border-white/10 bg-white/5 px-3 text-slate-50 transition-colors',
          ].join(' ')}
        >
          <Icon name={form.icon} />
          <span className="text-sm">{form.icon}</span>
        </button>
      </Field>
      <Field label="Type">
        <SelectInput
          value={form.type}
          options={[
            { value: 'expense', label: 'Expense' },
            { value: 'income', label: 'Income' },
          ]}
          onChange={(value) => setForm({ ...form, type: value as TransactionType })}
        />
      </Field>
      <Field label="Parent">
        <SelectInput
          value={form.parentId ?? ''}
          options={[
            { value: '', label: 'Root' },
            ...categories
              .filter((c) => c.type === form.type && c.level < 5)
              .map((c) => ({ value: c.id, label: c.name })),
          ]}
          onChange={(value) => {
            const parent = categories.find((c) => c.id === value)
            setForm({
              ...form,
              parentId: parent?.id,
              level: parent
                ? ((parent.level + 1) as Category['level'])
                : 1,
              type: parent?.type ?? form.type,
            })
          }}
        />
      </Field>

      <IconPicker
        isOpen={iconPickerOpen}
        selectedIcon={form.icon}
        onSelect={(icon) => setForm({ ...form, icon })}
        onClose={() => setIconPickerOpen(false)}
      />

      <FormErrorMessage error={error} />

      <FormActions showDelete={Boolean(existing)} onDelete={handleDelete} />
    </form>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm run test -- src/features/settings/CategoryFormPage
```

Expected: all 5 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/settings/CategoryFormPage/
git commit -m "refactor(category): adopt useFormCrud, move error state to hook"
```

---

## Task 3: Migrate Currency form

**Files:**
- Modify: `src/features/settings/CurrencyFormPage/useCurrencyFormPage.ts`
- Modify: `src/features/settings/CurrencyFormPage/CurrencyFormPage.tsx`
- Modify: `src/features/settings/CurrencyFormPage/__tests__/CurrencyFormPage.test.tsx`

- [ ] **Step 1: Update `CurrencyFormPage.test.tsx` to use new signatures**

Replace `src/features/settings/CurrencyFormPage/__tests__/CurrencyFormPage.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { CurrencyFormPage } from '@/features/settings/CurrencyFormPage/CurrencyFormPage'
import type { Currency } from '@/types/domain'

const existingCurrency: Currency = {
  code: 'USD',
  symbol: '$',
  name: 'US Dollar',
  isBase: false,
  rate: 0.028,
}

function renderPage(props: Partial<React.ComponentProps<typeof CurrencyFormPage>> = {}) {
  const onSubmit = vi.fn<(form: Currency) => Promise<void>>(async () => {})
  const onDelete = vi.fn<() => Promise<void>>(async () => {})
  const onBack = vi.fn()

  render(
    <CurrencyFormPage
      existing={undefined}
      error={null}
      onBack={onBack}
      onDelete={onDelete}
      onSubmit={onSubmit}
      {...props}
    />,
  )

  return {
    onBack, onDelete, onSubmit,
  }
}

describe('CurrencyFormPage', () => {
  it('renders create mode with New Currency title', () => {
    renderPage()

    expect(screen.getByText('New Currency')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('renders edit mode with Edit Currency title and delete button', () => {
    renderPage({ existing: existingCurrency })

    expect(screen.getByText('Edit Currency')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('shows live preview with symbol, name, and code', () => {
    renderPage({ existing: existingCurrency })

    expect(screen.getByText('US Dollar')).toBeInTheDocument()
    expect(screen.getByText('USD')).toBeInTheDocument()
  })

  it('shows placeholder text in preview when name is empty in create mode', () => {
    renderPage()

    expect(screen.getByText('New currency')).toBeInTheDocument()
  })

  it('has a Switch for base currency (not a raw checkbox)', () => {
    renderPage()

    expect(screen.getByRole('checkbox', { name: 'Base currency' })).toBeInTheDocument()
  })

  it('disables rate field when base currency is toggled on', async () => {
    renderPage()

    await userEvent.click(screen.getByRole('checkbox', { name: 'Base currency' }))

    expect(screen.getByLabelText('Rate')).toBeDisabled()
  })

  it('calls delete callback in edit mode', async () => {
    const { onDelete } = renderPage({ existing: existingCurrency })

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('calls submit callback on save', async () => {
    const { onSubmit } = renderPage({ existing: existingCurrency })

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('displays error prop when provided', () => {
    renderPage({ error: 'Code is required' })

    expect(screen.getByText('Code is required')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify failures**

```bash
npm run test -- src/features/settings/CurrencyFormPage
```

Expected: TypeScript errors — `error` prop unknown, `onSubmit`/`onDelete` signatures mismatch.

- [ ] **Step 3: Update `useCurrencyFormPage.ts`**

Replace `src/features/settings/CurrencyFormPage/useCurrencyFormPage.ts`:

```typescript
import { useParams } from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import { useFormCrud } from '@/hooks'
import { useCurrencyStore } from '@/stores'
import type { Currency } from '@/types/domain'

export function useCurrencyFormPage() {
  const { code } = useParams()
  const backNavigate = useBackNavigate()
  const existing = useCurrencyStore((state) => (code
    ? state.findByCode(code)
    : undefined))
  const add = useCurrencyStore((state) => state.add)
  const update = useCurrencyStore((state) => state.update)
  const remove = useCurrencyStore((state) => state.remove)

  const { error, onSubmit, onDelete } = useFormCrud<Currency>({
    existing,
    add,
    update,
    remove: (item) => remove(item.code),
    navigateTo: '/settings/currencies',
    validate: (form) => {
      if (!form.code.trim()) {
        return 'Code is required'
      }
      if (!form.symbol.trim()) {
        return 'Symbol is required'
      }
      if (!form.name.trim()) {
        return 'Name is required'
      }
      if (form.rate <= 0) {
        return 'Rate must be greater than 0'
      }

      return null
    },
  })

  return {
    existing,
    error,
    onBack: () => backNavigate('/settings/currencies'),
    onSubmit,
    onDelete,
  }
}
```

> Note: the old hook called `setBase` explicitly after save. `currencyStore.add` and `currencyStore.update` already call `setBase` internally — the explicit call was redundant and is removed.

- [ ] **Step 4: Update `CurrencyFormPage.tsx`**

Replace `src/features/settings/CurrencyFormPage/CurrencyFormPage.tsx`:

```typescript
import { FormEvent, useState } from 'react'

import {
  Field,
  FormActions,
  FormErrorMessage,
  PageHeader,
  Switch,
  TextInput,
} from '@/components'
import type { Currency } from '@/types/domain'

interface CurrencyFormPageProps {
  existing: Currency | undefined
  error: string | null
  onBack: () => void
  onSubmit: (form: Currency) => Promise<void>
  onDelete: () => Promise<void>
}

export function CurrencyFormPage({
  existing,
  error,
  onBack,
  onSubmit,
  onDelete,
}: CurrencyFormPageProps) {
  const [form, setForm] = useState<Currency>(() => (
    existing ?? {
      code: '',
      symbol: '$',
      name: '',
      isBase: false,
      rate: 1,
    }
  ))

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await onSubmit(form)
  }

  async function handleDelete() {
    await onDelete()
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <PageHeader
        title={existing
          ? 'Edit Currency'
          : 'New Currency'}
        onBack={onBack}
      />

      {/* Live preview card */}
      <div className="flex items-center gap-3 rounded-xl bg-white/3 p-3">
        <div
          className={[
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]',
            'bg-[rgba(16,185,129,0.15)] text-lg font-bold text-[#34d399]',
          ].join(' ')}
        >
          {form.symbol || '$'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-50">
            {form.name.trim() || 'New currency'}
          </p>
          <p className="mt-0.5 text-sm text-white/40">Rate: {form.rate}</p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-white/45">
          {form.code || '—'}
        </span>
      </div>

      <Field label="Code">
        <TextInput
          value={form.code}
          disabled={Boolean(existing)}
          onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase() })}
        />
      </Field>

      <Field label="Symbol">
        <TextInput
          value={form.symbol}
          onChange={(event) => setForm({ ...form, symbol: event.target.value })}
        />
      </Field>

      <Field label="Name">
        <TextInput
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
      </Field>

      <Field label="Rate">
        <TextInput
          type="number"
          value={form.rate}
          disabled={form.isBase}
          onChange={(event) => setForm({ ...form, rate: Number(event.target.value) })}
        />
      </Field>

      <Switch
        label="Base currency"
        description="Rate is always 1.0"
        checked={form.isBase}
        onChange={(checked) => setForm({
          ...form,
          isBase: checked,
          rate: checked
            ? 1
            : form.rate,
        })}
      />

      <FormErrorMessage error={error} />

      <FormActions showDelete={Boolean(existing)} onDelete={handleDelete} />
    </form>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm run test -- src/features/settings/CurrencyFormPage
```

Expected: all 9 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/settings/CurrencyFormPage/
git commit -m "refactor(currency): adopt useFormCrud, move error state to hook"
```

---

## Task 4: Migrate Wallet form

**Files:**
- Modify: `src/features/settings/WalletFormPage/useWalletFormPage.ts`
- Modify: `src/features/settings/WalletFormPage/WalletFormPage.tsx`
- Modify: `src/features/settings/WalletFormPage/__tests__/WalletFormPage.test.tsx`

- [ ] **Step 1: Update `WalletFormPage.test.tsx` to use new signatures**

Replace `src/features/settings/WalletFormPage/__tests__/WalletFormPage.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { WalletFormPage } from '@/features/settings/WalletFormPage/WalletFormPage'
import type { Currency, Wallet } from '@/types/domain'

const currencies: Currency[] = [
  {
    code: 'THB',
    symbol: '฿',
    name: 'Thai Baht',
    isBase: true,
    rate: 1,
  },
  {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    isBase: false,
    rate: 0.028,
  },
]

const existingWallet: Wallet = {
  id: 'wallet-1',
  name: 'Visa',
  type: 'credit_card',
  currency: 'THB',
  balance: 1000,
  creditLimit: 50000,
  color: '#3b82f6',
  icon: 'fa-credit-card',
  reconciliationEnabled: true,
}

function renderPage(props: Partial<React.ComponentProps<typeof WalletFormPage>> = {}) {
  const onSubmit = vi.fn<(form: Wallet) => Promise<void>>(async () => {})
  const onDelete = vi.fn<() => Promise<void>>(async () => {})
  const onBack = vi.fn()

  render(
    <WalletFormPage
      currencies={currencies}
      error={null}
      initialType="payment"
      onBack={onBack}
      onDelete={onDelete}
      onSubmit={onSubmit}
      wallet={undefined}
      {...props}
    />,
  )

  return {
    onBack,
    onDelete,
    onSubmit,
  }
}

describe('WalletFormPage', () => {
  it('renders create mode with payment defaults', () => {
    renderPage()

    expect(screen.getByText('New Wallet')).toBeInTheDocument()
    expect(screen.getByText('New wallet')).toBeInTheDocument()
    expect(screen.getByText('Payment Account')).toBeInTheDocument()
    expect(screen.getAllByText('THB')).toHaveLength(2)
    expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument()
  })

  it('renders edit mode with delete action', () => {
    renderPage({ wallet: existingWallet })

    expect(screen.getByText('Edit Wallet')).toBeInTheDocument()
    expect(screen.getByText('Visa')).toBeInTheDocument()
    expect(screen.getAllByText('Credit Card').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument()
  })

  it('shows credit limit for credit card create mode', () => {
    renderPage({ initialType: 'credit_card' })

    expect(screen.getByText('Credit Limit')).toBeInTheDocument()
  })

  it('submits reconciliation changes', async () => {
    const { onSubmit } = renderPage()

    await userEvent.click(screen.getByRole('checkbox', { name: 'Reconciliation' }))
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      reconciliationEnabled: true,
    })
  })

  it('submits credit card type and default icon in credit card create mode', async () => {
    const { onSubmit } = renderPage({ initialType: 'credit_card' })

    await userEvent.click(screen.getByRole('button', { name: 'Save' }))

    expect(onSubmit.mock.calls[0][0]).toMatchObject({
      type: 'credit_card',
      icon: 'fa-credit-card',
    })
  })

  it('calls delete callback in edit mode', async () => {
    const { onDelete } = renderPage({ wallet: existingWallet })

    await userEvent.click(screen.getByRole('button', { name: 'Delete' }))

    expect(onDelete).toHaveBeenCalledTimes(1)
  })

  it('opens icon picker when icon field is tapped', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /icon/i }))
    expect(screen.getByRole('heading', { name: 'Icon' })).toBeInTheDocument()
  })

  it('submits with selected icon after picking', async () => {
    const { onSubmit } = renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(onSubmit.mock.calls[0][0]).toMatchObject({ icon: 'fa-wallet' })
  })

  it('displays error prop when provided', () => {
    renderPage({ error: 'Name is required' })
    expect(screen.getByText('Name is required')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify failures**

```bash
npm run test -- src/features/settings/WalletFormPage
```

Expected: TypeScript errors — `error` prop unknown, signature mismatches.

- [ ] **Step 3: Update `useWalletFormPage.ts`**

Replace `src/features/settings/WalletFormPage/useWalletFormPage.ts`:

```typescript
import {
  useParams,
  useSearchParams,
} from 'react-router'

import { useBackNavigate } from '@/context/navigationDirection'
import { useFormCrud } from '@/hooks'
import { useCurrencyStore, useWalletStore } from '@/stores'
import type { Wallet, WalletType } from '@/types/domain'

export function useWalletFormPage() {
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const backNavigate = useBackNavigate()
  const currencies = useCurrencyStore((state) => state.items)
  const wallet = useWalletStore((state) => (id
    ? state.findById(id)
    : undefined))
  const add = useWalletStore((state) => state.add)
  const update = useWalletStore((state) => state.update)
  const remove = useWalletStore((state) => state.remove)
  const initialType: WalletType = (searchParams.get('type') as WalletType) || wallet?.type || 'payment'

  const { error, onSubmit, onDelete } = useFormCrud<Wallet>({
    existing: wallet,
    add,
    update,
    remove: (item) => remove(item.id),
    navigateTo: '/settings/wallets',
    validate: (form) => {
      if (!form.name.trim()) {
        return 'Name is required'
      }
      if (form.type === 'credit_card' && form.creditLimit !== undefined && form.creditLimit <= 0) {
        return 'Credit limit must be greater than 0'
      }

      return null
    },
  })

  return {
    wallet,
    currencies,
    error,
    initialType,
    onBack: () => backNavigate('/settings/wallets'),
    onSubmit,
    onDelete,
  }
}
```

- [ ] **Step 4: Update `WalletFormPage.tsx`**

Replace `src/features/settings/WalletFormPage/WalletFormPage.tsx`:

```typescript
import {
  FormEvent,
  useMemo,
  useState,
} from 'react'

import {
  Field,
  FormActions,
  FormErrorMessage,
  Icon,
  PageHeader,
  Switch,
  TextInput,
} from '@/components'
import { CurrencyPicker } from '@/components/shared/picker/CurrencyPicker'
import { IconPicker } from '@/components/shared/picker/IconPicker'
import { createId, hexToRgba } from '@/lib'
import type {
  Currency,
  Wallet,
  WalletType,
} from '@/types/domain'

interface WalletFormPageProps {
  wallet: Wallet | undefined
  currencies: Currency[]
  error: string | null
  initialType: WalletType
  onBack: () => void
  onSubmit: (form: Wallet) => Promise<void>
  onDelete: () => Promise<void>
}

const DEFAULT_CURRENCY = 'THB'

function walletTypeLabel(type: WalletType) {
  return type === 'credit_card'
    ? 'Credit Card'
    : 'Payment Account'
}

export function WalletFormPage({
  wallet,
  currencies,
  error,
  initialType,
  onBack,
  onSubmit,
  onDelete,
}: WalletFormPageProps) {
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [form, setForm] = useState<Wallet>(() => wallet ?? {
    id: createId(),
    name: '',
    type: initialType,
    currency: currencies[0]?.code ?? DEFAULT_CURRENCY,
    balance: 0,
    color: '#10b981',
    icon: initialType === 'credit_card'
      ? 'fa-credit-card'
      : 'fa-wallet',
  })
  const title = useMemo(() => (wallet
    ? 'Edit Wallet'
    : 'New Wallet'), [wallet])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await onSubmit(form)
  }

  async function handleDelete() {
    await onDelete()
  }

  const reconciliationEnabled = form.reconciliationEnabled ?? false
  const reconciliationDescription = reconciliationEnabled
    ? 'Included in reconciliation checks'
    : 'Excluded from reconciliation checks'

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <PageHeader title={title} onBack={onBack} />
      <div className="flex items-center gap-3 rounded-xl bg-white/3 p-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-base"
          style={{
            background: hexToRgba(form.color, 0.15),
            color: form.color,
          }}
        >
          <Icon name={form.icon} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-50">
            {form.name.trim() || 'New wallet'}
          </p>
          <p className="mt-0.5 text-sm text-white/40">{walletTypeLabel(form.type)}</p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-white/45">{form.currency}</span>
      </div>

      <Field label="Name">
        <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>

      <Field label="Currency">
        <button
          type="button"
          onClick={() => setCurrencyPickerOpen(true)}
          className={[
            'flex min-h-11 w-full items-center rounded-lg border border-white/10',
            'bg-white/5 px-3 text-slate-50 transition-colors',
          ].join(' ')}
        >
          {form.currency}
        </button>
      </Field>
      <CurrencyPicker
        isOpen={currencyPickerOpen}
        currencies={currencies}
        selectedCode={form.currency}
        onSelect={(code) => setForm({ ...form, currency: code })}
        onClose={() => setCurrencyPickerOpen(false)}
      />
      <Field label="Icon">
        <button
          type="button"
          aria-label="icon"
          onClick={() => setIconPickerOpen(true)}
          className={[
            'flex min-h-11 w-full items-center gap-2 rounded-lg',
            'border border-white/10 bg-white/5 px-3 text-slate-50 transition-colors',
          ].join(' ')}
        >
          <Icon name={form.icon} />
          <span className="text-sm">{form.icon}</span>
        </button>
      </Field>
      <IconPicker
        isOpen={iconPickerOpen}
        selectedIcon={form.icon}
        onSelect={(icon) => setForm({ ...form, icon })}
        onClose={() => setIconPickerOpen(false)}
      />
      <Field label="Starting Balance">
        <TextInput
          type="number"
          value={form.balance}
          onChange={(e) => setForm({ ...form, balance: Number(e.target.value) })}
        />
      </Field>

      {form.type === 'credit_card'
        ? (
          <Field label="Credit Limit">
            <TextInput
              type="number"
              value={form.creditLimit ?? ''}
              onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) || undefined })}
            />
          </Field>
        )
        : null}

      <Switch
        checked={reconciliationEnabled}
        description={reconciliationDescription}
        label="Reconciliation"
        onChange={(checked) => setForm({ ...form, reconciliationEnabled: checked })}
      />

      <FormErrorMessage error={error} />

      <FormActions showDelete={Boolean(wallet)} onDelete={handleDelete} />
    </form>
  )
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npm run test -- src/features/settings/WalletFormPage
```

Expected: all 9 tests PASS.

- [ ] **Step 6: Commit**

```bash
git add src/features/settings/WalletFormPage/
git commit -m "refactor(wallet): adopt useFormCrud, move error state to hook"
```

---

## Task 5: Create `IconPickerField` component

**Files:**
- Create: `src/components/shared/picker/IconPickerField.tsx`
- Create: `src/components/shared/picker/__tests__/IconPickerField.test.tsx`
- Modify: `src/components/shared/picker/index.ts`
- Modify: `src/features/design/DesignPage/designNavigation.ts`

- [ ] **Step 1: Write the failing test**

Create `src/components/shared/picker/__tests__/IconPickerField.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { IconPickerField } from '../IconPickerField'

describe('IconPickerField', () => {
  it('renders trigger button showing current icon name', () => {
    render(<IconPickerField value="fa-wallet" onChange={vi.fn()} />)
    expect(screen.getByRole('button', { name: /icon/i })).toBeInTheDocument()
    expect(screen.getByText('fa-wallet')).toBeInTheDocument()
  })

  it('picker is closed initially', () => {
    render(<IconPickerField value="fa-wallet" onChange={vi.fn()} />)
    expect(screen.queryByRole('heading', { name: 'Icon' })).not.toBeInTheDocument()
  })

  it('opens picker when trigger is clicked', async () => {
    render(<IconPickerField value="fa-wallet" onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /icon/i }))
    expect(screen.getByRole('heading', { name: 'Icon' })).toBeInTheDocument()
  })

  it('calls onChange when an icon is selected', async () => {
    const onChange = vi.fn()
    render(<IconPickerField value="fa-wallet" onChange={onChange} />)
    await userEvent.click(screen.getByRole('button', { name: /icon/i }))
    await userEvent.click(screen.getByRole('button', { name: 'fa-car' }))
    expect(onChange).toHaveBeenCalledWith('fa-car')
  })

  it('closes picker after icon is selected', async () => {
    render(<IconPickerField value="fa-wallet" onChange={vi.fn()} />)
    await userEvent.click(screen.getByRole('button', { name: /icon/i }))
    await userEvent.click(screen.getByRole('button', { name: 'fa-car' }))
    expect(screen.queryByRole('heading', { name: 'Icon' })).not.toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- src/components/shared/picker/__tests__/IconPickerField.test.tsx
```

Expected: FAIL — `IconPickerField` not found / cannot find module.

- [ ] **Step 3: Create `IconPickerField.tsx`**

Create `src/components/shared/picker/IconPickerField.tsx`:

```typescript
import { useState } from 'react'

import { Icon } from '@/components'

import { IconPicker } from './IconPicker'

interface IconPickerFieldProps {
  value: string
  onChange: (icon: string) => void
}

export function IconPickerField({ value, onChange }: IconPickerFieldProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        aria-label="icon"
        onClick={() => setOpen(true)}
        className={[
          'flex min-h-11 w-full items-center gap-2 rounded-lg',
          'border border-white/10 bg-white/5 px-3 text-slate-50 transition-colors',
        ].join(' ')}
      >
        <Icon name={value} />
        <span className="text-sm">{value}</span>
      </button>
      <IconPicker
        isOpen={open}
        selectedIcon={value}
        onSelect={onChange}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test -- src/components/shared/picker/__tests__/IconPickerField.test.tsx
```

Expected: all 5 tests PASS.

- [ ] **Step 5: Export from index**

In `src/components/shared/picker/index.ts`, add:

```typescript
export { CurrencyPicker } from './CurrencyPicker'
export { DatePicker } from './DatePicker'
export { IconPicker } from './IconPicker'
export { IconPickerField } from './IconPickerField'
export { DateRangePresetPicker } from './DateRangePresetPicker'
export { DateTimePicker } from './DateTimePicker'
export { RepeatPicker } from './RepeatPicker'
export { SelectorSheet, type SelectorOption } from './SelectorSheet'
export { WalletPicker } from './WalletPicker'
```

- [ ] **Step 6: Add nav entry**

In `src/features/design/DesignPage/designNavigation.ts`, add `icon-picker-field` to the `shared-components` group items after `icon-picker` (note: `icon-picker` is in `SharedComponentsSection` but wasn't in the nav — add both):

```typescript
      { id: 'bottom-sheet', label: 'BottomSheet' },
      { id: 'icon-picker', label: 'IconPicker' },
      { id: 'icon-picker-field', label: 'IconPickerField' },
      { id: 'selector-sheet', label: 'SelectorSheet' },
```

The full updated `shared-components` items array in `designNavigation.ts`:

```typescript
  {
    slug: 'shared-components',
    label: 'Shared Components',
    items: [
      { id: 'background', label: 'Background' },
      { id: 'section-label', label: 'SectionLabel' },
      { id: 'form-error-message', label: 'FormErrorMessage' },
      { id: 'page-header', label: 'PageHeader' },
      { id: 'animated-bar', label: 'AnimatedBar' },
      { id: 'transaction-row', label: 'TransactionRow' },
      { id: 'list-group', label: 'ListGroup + ListRow' },
      { id: 'add-row', label: 'AddRow' },
      { id: 'wheel-picker', label: 'WheelPicker' },
      { id: 'bottom-sheet', label: 'BottomSheet' },
      { id: 'icon-picker', label: 'IconPicker' },
      { id: 'icon-picker-field', label: 'IconPickerField' },
      { id: 'selector-sheet', label: 'SelectorSheet' },
    ],
  },
```

- [ ] **Step 7: Commit**

```bash
git add src/components/shared/picker/IconPickerField.tsx \
        src/components/shared/picker/__tests__/IconPickerField.test.tsx \
        src/components/shared/picker/index.ts \
        src/features/design/DesignPage/designNavigation.ts
git commit -m "feat: add IconPickerField shared component"
```

---

## Task 6: Wire `IconPickerField` into form pages and design demo

**Files:**
- Modify: `src/features/settings/CategoryFormPage/CategoryFormPage.tsx`
- Modify: `src/features/settings/WalletFormPage/WalletFormPage.tsx`
- Modify: `src/features/design/DesignPage/components/SharedComponentsSection.tsx`

- [ ] **Step 1: Replace icon block in `CategoryFormPage.tsx`**

In `src/features/settings/CategoryFormPage/CategoryFormPage.tsx`:

Remove the `IconPicker` import:
```typescript
import { IconPicker } from '@/components/shared/picker/IconPicker'
```

Add `IconPickerField` import:
```typescript
import { IconPickerField } from '@/components/shared/picker/IconPickerField'
```

Remove the `iconPickerOpen` state line:
```typescript
const [iconPickerOpen, setIconPickerOpen] = useState(false)
```

Replace the `<Field label="Icon">` block and the `<IconPicker>` call:

Before:
```tsx
      <Field label="Icon">
        <button
          type="button"
          aria-label="icon"
          onClick={() => setIconPickerOpen(true)}
          className={[
            'flex min-h-11 w-full items-center gap-2 rounded-lg',
            'border border-white/10 bg-white/5 px-3 text-slate-50 transition-colors',
          ].join(' ')}
        >
          <Icon name={form.icon} />
          <span className="text-sm">{form.icon}</span>
        </button>
      </Field>
      ...
      <IconPicker
        isOpen={iconPickerOpen}
        selectedIcon={form.icon}
        onSelect={(icon) => setForm({ ...form, icon })}
        onClose={() => setIconPickerOpen(false)}
      />
```

After:
```tsx
      <Field label="Icon">
        <IconPickerField value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
      </Field>
```

Also remove the `Icon` import if it's now only used in the preview card — actually `Icon` is still used in the live preview `<Icon name={form.icon} />`, so keep it.

The final `CategoryFormPage.tsx` after this change:

```typescript
import {
  FormEvent,
  useMemo,
  useState,
} from 'react'

import {
  Field,
  FormActions,
  FormErrorMessage,
  Icon,
  PageHeader,
  SelectInput,
  TextInput,
} from '@/components'
import { IconPickerField } from '@/components/shared/picker/IconPickerField'
import { createId } from '@/lib'
import type { Category, TransactionType } from '@/types/domain'

interface CategoryFormPageProps {
  existing: Category | undefined
  categories: Category[]
  error: string | null
  onBack: () => void
  onSubmit: (form: Category) => Promise<void>
  onDelete: () => Promise<void>
}

export function CategoryFormPage({
  existing,
  categories,
  error,
  onBack,
  onSubmit,
  onDelete,
}: CategoryFormPageProps) {
  const title = useMemo(() => (existing
    ? 'Edit Category'
    : 'New Category'), [existing])
  const [form, setForm] = useState<Category>(() => existing ?? {
    id: createId(),
    name: '',
    type: 'expense',
    level: 1,
    icon: 'fa-circle',
    isDefault: false,
  })

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await onSubmit(form)
  }

  async function handleDelete() {
    await onDelete()
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <PageHeader title={title} onBack={onBack} />

      <div className="flex items-center gap-3 rounded-xl bg-white/3 p-3">
        <div className={[
          'flex h-11 w-11 shrink-0 items-center justify-center',
          'rounded-[14px] bg-white/10 text-base text-slate-50',
        ].join(' ')}>
          <Icon name={form.icon} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-50">
            {form.name.trim() || 'New category'}
          </p>
          <p className="mt-0.5 text-sm text-white/40">{form.type}</p>
        </div>
      </div>

      <Field label="Name">
        <TextInput
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
      </Field>
      <Field label="Icon">
        <IconPickerField value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
      </Field>
      <Field label="Type">
        <SelectInput
          value={form.type}
          options={[
            { value: 'expense', label: 'Expense' },
            { value: 'income', label: 'Income' },
          ]}
          onChange={(value) => setForm({ ...form, type: value as TransactionType })}
        />
      </Field>
      <Field label="Parent">
        <SelectInput
          value={form.parentId ?? ''}
          options={[
            { value: '', label: 'Root' },
            ...categories
              .filter((c) => c.type === form.type && c.level < 5)
              .map((c) => ({ value: c.id, label: c.name })),
          ]}
          onChange={(value) => {
            const parent = categories.find((c) => c.id === value)
            setForm({
              ...form,
              parentId: parent?.id,
              level: parent
                ? ((parent.level + 1) as Category['level'])
                : 1,
              type: parent?.type ?? form.type,
            })
          }}
        />
      </Field>

      <FormErrorMessage error={error} />

      <FormActions showDelete={Boolean(existing)} onDelete={handleDelete} />
    </form>
  )
}
```

- [ ] **Step 2: Replace icon block in `WalletFormPage.tsx`**

In `src/features/settings/WalletFormPage/WalletFormPage.tsx`:

Remove `IconPicker` import:
```typescript
import { IconPicker } from '@/components/shared/picker/IconPicker'
```

Add `IconPickerField` import:
```typescript
import { IconPickerField } from '@/components/shared/picker/IconPickerField'
```

Remove the `iconPickerOpen` state line:
```typescript
const [iconPickerOpen, setIconPickerOpen] = useState(false)
```

Replace the `<Field label="Icon">` block and adjacent `<IconPicker>`:

Before:
```tsx
      <Field label="Icon">
        <button
          type="button"
          aria-label="icon"
          onClick={() => setIconPickerOpen(true)}
          className={[
            'flex min-h-11 w-full items-center gap-2 rounded-lg',
            'border border-white/10 bg-white/5 px-3 text-slate-50 transition-colors',
          ].join(' ')}
        >
          <Icon name={form.icon} />
          <span className="text-sm">{form.icon}</span>
        </button>
      </Field>
      <IconPicker
        isOpen={iconPickerOpen}
        selectedIcon={form.icon}
        onSelect={(icon) => setForm({ ...form, icon })}
        onClose={() => setIconPickerOpen(false)}
      />
```

After:
```tsx
      <Field label="Icon">
        <IconPickerField value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
      </Field>
```

The `Icon` import stays (still used in the preview card). The final `WalletFormPage.tsx`:

```typescript
import {
  FormEvent,
  useMemo,
  useState,
} from 'react'

import {
  Field,
  FormActions,
  FormErrorMessage,
  Icon,
  PageHeader,
  Switch,
  TextInput,
} from '@/components'
import { CurrencyPicker } from '@/components/shared/picker/CurrencyPicker'
import { IconPickerField } from '@/components/shared/picker/IconPickerField'
import { createId, hexToRgba } from '@/lib'
import type {
  Currency,
  Wallet,
  WalletType,
} from '@/types/domain'

interface WalletFormPageProps {
  wallet: Wallet | undefined
  currencies: Currency[]
  error: string | null
  initialType: WalletType
  onBack: () => void
  onSubmit: (form: Wallet) => Promise<void>
  onDelete: () => Promise<void>
}

const DEFAULT_CURRENCY = 'THB'

function walletTypeLabel(type: WalletType) {
  return type === 'credit_card'
    ? 'Credit Card'
    : 'Payment Account'
}

export function WalletFormPage({
  wallet,
  currencies,
  error,
  initialType,
  onBack,
  onSubmit,
  onDelete,
}: WalletFormPageProps) {
  const [currencyPickerOpen, setCurrencyPickerOpen] = useState(false)
  const [form, setForm] = useState<Wallet>(() => wallet ?? {
    id: createId(),
    name: '',
    type: initialType,
    currency: currencies[0]?.code ?? DEFAULT_CURRENCY,
    balance: 0,
    color: '#10b981',
    icon: initialType === 'credit_card'
      ? 'fa-credit-card'
      : 'fa-wallet',
  })
  const title = useMemo(() => (wallet
    ? 'Edit Wallet'
    : 'New Wallet'), [wallet])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    await onSubmit(form)
  }

  async function handleDelete() {
    await onDelete()
  }

  const reconciliationEnabled = form.reconciliationEnabled ?? false
  const reconciliationDescription = reconciliationEnabled
    ? 'Included in reconciliation checks'
    : 'Excluded from reconciliation checks'

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <PageHeader title={title} onBack={onBack} />
      <div className="flex items-center gap-3 rounded-xl bg-white/3 p-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-base"
          style={{
            background: hexToRgba(form.color, 0.15),
            color: form.color,
          }}
        >
          <Icon name={form.icon} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-50">
            {form.name.trim() || 'New wallet'}
          </p>
          <p className="mt-0.5 text-sm text-white/40">{walletTypeLabel(form.type)}</p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-white/45">{form.currency}</span>
      </div>

      <Field label="Name">
        <TextInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>

      <Field label="Currency">
        <button
          type="button"
          onClick={() => setCurrencyPickerOpen(true)}
          className={[
            'flex min-h-11 w-full items-center rounded-lg border border-white/10',
            'bg-white/5 px-3 text-slate-50 transition-colors',
          ].join(' ')}
        >
          {form.currency}
        </button>
      </Field>
      <CurrencyPicker
        isOpen={currencyPickerOpen}
        currencies={currencies}
        selectedCode={form.currency}
        onSelect={(code) => setForm({ ...form, currency: code })}
        onClose={() => setCurrencyPickerOpen(false)}
      />
      <Field label="Icon">
        <IconPickerField value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
      </Field>
      <Field label="Starting Balance">
        <TextInput
          type="number"
          value={form.balance}
          onChange={(e) => setForm({ ...form, balance: Number(e.target.value) })}
        />
      </Field>

      {form.type === 'credit_card'
        ? (
          <Field label="Credit Limit">
            <TextInput
              type="number"
              value={form.creditLimit ?? ''}
              onChange={(e) => setForm({ ...form, creditLimit: Number(e.target.value) || undefined })}
            />
          </Field>
        )
        : null}

      <Switch
        checked={reconciliationEnabled}
        description={reconciliationDescription}
        label="Reconciliation"
        onChange={(checked) => setForm({ ...form, reconciliationEnabled: checked })}
      />

      <FormErrorMessage error={error} />

      <FormActions showDelete={Boolean(wallet)} onDelete={handleDelete} />
    </form>
  )
}
```

- [ ] **Step 3: Add `IconPickerField` demo to `SharedComponentsSection.tsx`**

In `src/features/design/DesignPage/components/SharedComponentsSection.tsx`:

Add the import after the `IconPicker` import line:
```typescript
import { IconPickerField } from '@/components/shared/picker/IconPickerField'
```

Add a new `SubSection` after the existing `icon-picker` SubSection (before `selector-sheet`):

```tsx
      <SubSection id="icon-picker-field" title="IconPickerField">
        <div className="space-y-3">
          <IconPickerField value={iconValue} onChange={setIconValue} />
          <VariantLabel label={`selected: ${iconValue}`} />
        </div>
      </SubSection>
```

The `iconValue`/`setIconValue` state is already declared in the component from the existing `icon-picker` demo — reuse it here.

- [ ] **Step 4: Run all affected tests**

```bash
npm run test -- src/features/settings/CategoryFormPage src/features/settings/WalletFormPage
```

Expected: all tests PASS (icon picker tests still pass since `IconPickerField` delegates to `IconPicker`).

- [ ] **Step 5: Commit**

```bash
git add src/features/settings/CategoryFormPage/CategoryFormPage.tsx \
        src/features/settings/WalletFormPage/WalletFormPage.tsx \
        src/features/design/DesignPage/components/SharedComponentsSection.tsx
git commit -m "refactor: use IconPickerField in form pages, add design demo"
```

---

## Task 7: Deduplicate `WalletsPage` trailing

**Files:**
- Modify: `src/features/settings/WalletsPage/WalletsPage.tsx`

- [ ] **Step 1: Extract `WalletTrailing` and update `WalletsPage.tsx`**

Replace `src/features/settings/WalletsPage/WalletsPage.tsx`:

```typescript
import {
  AddRow,
  Icon,
  ListGroup,
  ListRow,
  PageHeader,
} from '@/components'
import type { Wallet } from '@/types/domain'

interface WalletsPageProps {
  payments: Wallet[]
  cards: Wallet[]
  onBack: () => void
}

function WalletTrailing({ currency }: { currency: string }) {
  return (
    <div className="flex items-center gap-2 text-white/25">
      <span className="text-xs text-white/40">{currency}</span>
      <Icon name="fa-chevron-right" className="text-base" />
    </div>
  )
}

export function WalletsPage({
  payments,
  cards,
  onBack,
}: WalletsPageProps) {
  return (
    <div className="space-y-5">
      <PageHeader title="Wallets" onBack={onBack} />

      <ListGroup label="Payment Accounts">
        {payments.map((w) => (
          <ListRow
            key={w.id}
            icon={w.icon}
            label={w.name}
            sub="Payment Account"
            to={`/settings/wallets/${w.id}`}
            trailing={<WalletTrailing currency={w.currency} />}
          />
        ))}
        <AddRow label="Add Payment Account" to="/settings/wallets/new?type=payment" />
      </ListGroup>

      <ListGroup label="Credit Cards">
        {cards.map((w) => (
          <ListRow
            key={w.id}
            icon={w.icon}
            label={w.name}
            sub="Credit Card"
            to={`/settings/wallets/${w.id}`}
            trailing={<WalletTrailing currency={w.currency} />}
          />
        ))}
        <AddRow label="Add Credit Card" to="/settings/wallets/new?type=credit_card" />
      </ListGroup>
    </div>
  )
}
```

- [ ] **Step 2: Run full test suite**

```bash
npm run test
```

Expected: all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/settings/WalletsPage/WalletsPage.tsx
git commit -m "refactor(wallets): extract WalletTrailing local component"
```

---

## Task 8: Final verification

- [ ] **Step 1: Lint, test, build**

```bash
npm run lint -- --fix && npm run test && npm run build
```

Expected:
- Lint: no errors
- Tests: all PASS
- Build: no TypeScript errors, successful bundle

- [ ] **Step 2: Commit lint fixes if any**

If `lint --fix` modified files:
```bash
git add -p
git commit -m "style: fix lint issues from refactor"
```
