# Wallet Form Design System Redesign

**Date:** 2026-05-24  
**Status:** Approved for implementation planning

## Goal

Redesign `src/features/settings/WalletFormPage/WalletFormPage.tsx` so it matches the current design system more closely while staying focused on the wallet form workflow.

The redesign may introduce small shared components when they directly improve this page and create reusable settings-form patterns. It should not turn into a broad refactor of all settings forms.

## Chosen Direction

Use a focused settings-card layout.

`WalletFormPage` keeps the existing mobile-first structure:

- `PageHeader` at the top.
- One primary `Card` for wallet details.
- Primary save action below the card.
- Separate danger delete action only when editing an existing wallet.

The card gains a compact wallet preview row so the form visually relates to `WalletsPage` and the rest of the settings surfaces.

## Component Structure

### WalletFormPage

`WalletFormPage` remains the presentational form component. It owns local form state and displays errors passed back from submit/delete callbacks. Store access, navigation, and validation remain in `useWalletFormPage`.

The page renders:

1. `PageHeader`
2. `Card`
   - wallet preview row
   - name field
   - type segmented control
   - currency dropdown
   - starting balance field
   - credit limit field, only for credit cards
   - reconciliation switch field
   - form error message
3. `FormActions`
   - save button
   - delete button in edit mode

### Wallet Preview Row

The preview row is local to the wallet form unless another form needs the same pattern later.

It shows:

- the wallet icon in a tinted square using `hexToRgba(form.color, 0.15)` and `form.color`
- wallet name, falling back to `New wallet` when empty
- type label: `Payment Account` or `Credit Card`
- current currency code

This mirrors the visual language used by `WalletsPage` without making the row navigational.

### SwitchField

Introduce a small shared `SwitchField` component for settings-style boolean options.

Proposed API:

```tsx
interface SwitchFieldProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}
```

Behavior:

- renders a labeled boolean setting row
- uses a visually hidden checkbox for form semantics
- uses the current toggle styling:
  - enabled track: `bg-accent`
  - disabled track: `bg-white/15`
  - white thumb with shadow
- shows optional description text below the label

`WalletFormPage` uses it for reconciliation.

### FormActions

Introduce a small shared `FormActions` component for stacked settings form actions.

Proposed API:

```tsx
interface FormActionsProps {
  submitLabel?: string
  deleteLabel?: string
  showDelete?: boolean
  onDelete?: () => void
}
```

Behavior:

- renders a full-width accent submit button
- renders the submit button with `type="submit"`
- renders a full-width danger delete button with `type="button"` only when `showDelete` is true
- keeps the existing button variants and spacing
- does not own async state or validation

This gives wallet, category, and currency forms a path to converge later without updating them in this task.

## Form Behavior

Wallet type changes from `SelectInput` to `SegmentedControl` because the options are a small mutually exclusive set:

- `payment`
- `credit_card`

Currency remains `SelectInput` so it continues to use the custom dropdown added to the design system.

Balance fields remain numeric `TextInput` fields:

- `balance` always visible
- `creditLimit` visible only when `form.type === 'credit_card'`

Reconciliation remains a boolean value, defaulting to `false` when absent:

```ts
const reconciliationEnabled = form.reconciliationEnabled ?? false
```

Changing type should update only the default wallet icon:

- when switching to `credit_card`, change `fa-wallet` to `fa-credit-card`
- when switching to `payment`, change `fa-credit-card` to `fa-wallet`
- leave any other icon value untouched

No icon picker, color picker, or custom wallet identity editor is included in this redesign.

## Data Flow

No store or routing behavior changes.

`useWalletFormPage` continues to provide:

- `wallet`
- `currencies`
- `initialType`
- `onBack`
- `onSubmit`
- `onDelete`

`WalletFormPage` continues to:

- initialize a `Wallet` object for create mode
- initialize from the existing wallet for edit mode
- call `onSubmit(form, setError)` on form submit
- call `onDelete(setError)` for delete
- render `FormErrorMessage` for returned errors

Validation remains in `useWalletFormPage`.

## Error Handling

Keep existing behavior:

- empty name returns `Name is required`
- credit card limit must be greater than 0 when provided
- store errors are shown through `FormErrorMessage`
- delete errors are shown through `FormErrorMessage`

The redesign does not add field-level validation messages beyond the existing shared error display.

## Styling

Use existing design tokens and components:

- `PageHeader`
- `Card`
- `Field`
- `TextInput`
- `SelectInput`
- `SegmentedControl`
- `Button`
- `FormErrorMessage`
- `Icon`
- `hexToRgba`

Visual rules:

- retain mobile-first spacing with `space-y-5` around the page and compact spacing inside the card
- keep card shape consistent with existing `Card`
- use `rounded-lg` for form controls and `rounded-2xl` for card-level surfaces
- use wallet color only in the preview icon treatment
- do not introduce a new color palette

## Testing

Add focused tests for the wallet form redesign:

- create-mode render shows `New Wallet`, default payment type, default currency, and save action
- edit-mode render shows `Edit Wallet` and delete action
- switching to credit card shows credit limit
- switching back to payment hides credit limit
- reconciliation switch toggles the value submitted to `onSubmit`
- save and delete actions call the provided callbacks

Prefer component tests near the settings feature if an existing pattern exists. Otherwise, add the smallest React Testing Library tests needed to cover the behavior.

## Out Of Scope

- Redesigning `CategoryFormPage` or `CurrencyFormPage`
- Adding icon/color customization
- Changing wallet store behavior
- Changing route structure
- Adding async loading states
- Adding field-level validation beyond existing behavior
- Broad settings-form architecture refactors

## Success Criteria

- Wallet form visually matches the design system and selected focused-card direction.
- Type selection uses `SegmentedControl`.
- Reconciliation toggle is extracted into a reusable shared component.
- Save/delete action layout is reusable through a small shared component.
- Existing wallet create, update, delete, and validation behavior remains intact.
- Tests cover the behavior changed by the redesign.
