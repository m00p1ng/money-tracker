# CurrencyFormPage Redesign

**Date:** 2026-05-25
**Status:** Approved

## Goal

Redesign `CurrencyFormPage` to match the visual and structural consistency of `WalletFormPage`. The current form uses a `Card` wrapper around fields, a raw checkbox for base currency, and manual `Button` components — all inconsistent with the rest of the settings forms.

## Changes

### `CurrencyFormPage.tsx` (only file changed)

**Remove:**
- `Card` wrapper around fields
- Raw `<input type="checkbox">` + surrounding `<label>` for base currency
- Manual `<Button type="submit">` + `<Button type="button" variant="danger">` pair

**Add:**
- Live preview card at the top (matches WalletFormPage pattern):
  - Left: symbol in a green-tinted rounded badge (`bg-[rgba(16,185,129,0.15)] text-[#34d399]`)
  - Center: currency name (fallback: "New currency") + "Rate: X.XX"
  - Right: currency code (fallback: "—")
- `Switch` component for "Base currency" with description `"Rate is always 1.0"`; when toggled on, the Rate `TextInput` is disabled and its value is locked to `1`
- `FormActions` component (replaces manual buttons); `showDelete={Boolean(existing)}`

**Fields (flat, no Card wrapper, matching WalletFormPage):**
1. Code — disabled when editing an existing currency (unchanged behavior)
2. Symbol
3. Name
4. Rate — `type="number"`, disabled when `form.isBase === true`

**Error display:** `FormErrorMessage` remains, placed between Switch and FormActions.

### `useCurrencyFormPage.ts`

No changes. Logic is correct as-is.

### `CurrencyFormPageContainer.tsx`

No changes.

## Components Used

All existing shared components — no new components needed:

| Component | Source |
|-----------|--------|
| `PageHeader` | `@/components` |
| `Field` | `@/components` |
| `TextInput` | `@/components` |
| `Switch` | `@/components` |
| `FormActions` | `@/components` |
| `FormErrorMessage` | `@/components` |

## Behavior Notes

- When `isBase` is toggled on: `rate` is set to `1` and the Rate field is disabled
- When `isBase` is toggled off: Rate field re-enables, user can edit
- Preview card updates live as user types (no extra state needed — reads from `form`)

## Out of Scope

- No changes to validation logic
- No changes to store interactions
- No new fields or data model changes
