# Wallet Type Selector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Type dropdown field to WalletFormPage so users can select wallet type when creating a new wallet; disabled when editing.

**Architecture:** Single-file change to `WalletFormPage.tsx` — add a `<Field label="Type"><SelectInput /></Field>` block between Name and Currency fields. When type changes, also reset icon to the type default. No changes needed to the hook, container, or domain types.

**Tech Stack:** React, TypeScript, existing `SelectInput` + `Field` components

---

### Task 1: Add failing tests for the type selector

**Files:**
- Modify: `src/features/balance/WalletFormPage/__tests__/WalletFormPage.test.tsx`

- [ ] **Step 1: Add tests**

Add these tests inside the existing `describe('WalletFormPage', ...)` block in `src/features/balance/WalletFormPage/__tests__/WalletFormPage.test.tsx`:

```tsx
it('renders a Type selector field', () => {
  renderPage()
  expect(screen.getByText('Type')).toBeInTheDocument()
  expect(screen.getByText('Payment Account')).toBeInTheDocument()
})

it('type selector is disabled in edit mode', () => {
  renderPage({ wallet: existingWallet })
  const typeButton = screen.getAllByRole('button').find(
    (btn) => btn.textContent?.includes('Credit Card') && btn.closest('[class*="relative"]'),
  )
  expect(typeButton).toBeDisabled()
})

it('changing type to credit_card shows credit limit and resets icon', async () => {
  const { onSubmit } = renderPage({ initialType: 'payment' })

  // open the type dropdown
  await userEvent.click(screen.getByText('Payment Account'))
  // select credit_card
  await userEvent.click(screen.getByText('Credit Card'))

  expect(screen.getByText('Credit Limit')).toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(onSubmit.mock.calls[0][0]).toMatchObject({
    type: 'credit_card',
    icon: 'fa-credit-card',
  })
})

it('changing type to payment hides credit limit and resets icon', async () => {
  const { onSubmit } = renderPage({ initialType: 'credit_card' })

  await userEvent.click(screen.getByText('Credit Card'))
  await userEvent.click(screen.getAllByText('Payment Account')[0])

  expect(screen.queryByText('Credit Limit')).not.toBeInTheDocument()

  await userEvent.click(screen.getByRole('button', { name: 'Save' }))
  expect(onSubmit.mock.calls[0][0]).toMatchObject({
    type: 'payment',
    icon: 'fa-wallet',
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
npm run test -- src/features/balance/WalletFormPage/__tests__/WalletFormPage.test.tsx
```

Expected: the 4 new tests fail.

---

### Task 2: Implement the Type selector in WalletFormPage

**Files:**
- Modify: `src/features/balance/WalletFormPage/WalletFormPage.tsx`

- [ ] **Step 1: Add `SelectInput` import**

In the imports section of `WalletFormPage.tsx`, add `SelectInput` to the `@/components/shared/input/SelectInput` import (it is not currently exported from `@/components`):

```tsx
import { SelectInput } from '@/components/shared/input/SelectInput'
```

- [ ] **Step 2: Add wallet type options constant**

After the `DEFAULT_CURRENCY` constant and before `walletTypeLabel`, add:

```tsx
const WALLET_TYPE_OPTIONS = [
  { value: 'payment', label: 'Payment Account' },
  { value: 'credit_card', label: 'Credit Card' },
]
```

- [ ] **Step 3: Add a type change handler**

Inside the `WalletFormPage` function body, before `return`, add:

```tsx
const DEFAULT_ICON: Record<string, string> = {
  payment: 'fa-wallet',
  credit_card: 'fa-credit-card',
}

function handleTypeChange(type: string) {
  setForm((prev) => ({
    ...prev,
    type: type as WalletType,
    icon: DEFAULT_ICON[type] ?? prev.icon,
  }))
}
```

- [ ] **Step 4: Add the Type field to the form JSX**

In `WalletFormPage.tsx`, add the Type field between the Name field and the Currency field:

```tsx
<Field label="Type">
  <SelectInput
    options={WALLET_TYPE_OPTIONS}
    value={form.type}
    onChange={handleTypeChange}
    disabled={Boolean(wallet)}
  />
</Field>
```

- [ ] **Step 5: Run tests**

```bash
npm run test -- src/features/balance/WalletFormPage/__tests__/WalletFormPage.test.tsx
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/features/balance/WalletFormPage/WalletFormPage.tsx src/features/balance/WalletFormPage/__tests__/WalletFormPage.test.tsx
git commit -m "feat: add wallet type selector to WalletFormPage"
```

---

### Task 3: Lint, full test, and build verification

- [ ] **Step 1: Run lint + fix**

```bash
npm run lint -- --fix
```

Expected: no errors.

- [ ] **Step 2: Run all tests**

```bash
npm run test
```

Expected: all pass.

- [ ] **Step 3: Run build**

```bash
npm run build
```

Expected: build succeeds with no type errors.
