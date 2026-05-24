# Design Page: Add Missing Components

**Date:** 2026-05-24

## Goal

Add demos for all components that exist in the codebase but are not currently showcased on the `/design` page.

## Missing Components

### UIComponentsSection additions

| Component | File | Demo |
|---|---|---|
| `Switch` | `src/components/shared/input/Switch.tsx` | Two variants: with description, without description |
| `TextAreaInput` | `src/components/shared/input/TextAreaInput.tsx` | Plain textarea with placeholder |
| `FormActions` | `src/components/ui/FormActions.tsx` | Save-only, and with delete button |

### SharedComponentsSection additions

| Component | File | Demo |
|---|---|---|
| `SelectorSheet` | `src/components/shared/picker/SelectorSheet.tsx` | Trigger button opens bottom sheet with 3 options |

### FeatureSection additions — new "Transaction Form" group

| Component | File | Demo |
|---|---|---|
| `TransactionHeader` | `TransactionPage/components/TransactionHeader.tsx` | Expense type shown |
| `DateTimeRow` | `TransactionPage/components/DateTimeRow.tsx` | Past date (normal) + future date (planned badge) |
| `WalletSelectorRow` | `TransactionPage/components/WalletSelectorRow.tsx` | Without balance + with balance |
| `NoteField` | `TransactionPage/components/NoteField.tsx` | Static note display |
| `ExchangeRateRow` | `TransactionPage/components/ExchangeRateRow.tsx` | Static rate display |
| `ReconciliationRow` | `TransactionPage/components/ReconciliationRow.tsx` | Not cleared + cleared |
| `RepeatRow` | `TransactionPage/components/RepeatRow.tsx` | Never + Daily |
| `CalculatorKeyboardSheet` | `TransactionPage/components/CalculatorKeyboardSheet.tsx` | Button to open/close sheet |
| `TransactionSheets` | `TransactionPage/components/TransactionSheets.tsx` | Button to open date picker |

## Implementation Plan

1. **`UIComponentsSection.tsx`** — append `switch`, `textarea-input`, `form-actions` subsections
2. **`SharedComponentsSection.tsx`** — append `selector-sheet` subsection
3. **`FeatureSection.tsx`** — append "Transaction Form" group with all 9 subsections above

## Conventions

- Use `SubSection` + `VariantLabel` helpers (existing pattern in section files)
- All interactive demos use local `useState` for open/close state
- Stub wallet/currency data inline (no store access in design page)
- Follow existing import order rules (eslint-plugin-import-x)
