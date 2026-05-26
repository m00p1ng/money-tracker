# Wallet Type Selector — Design Spec

Date: 2026-05-26

## Problem

The WalletFormPage has no UI for selecting wallet type. The type is seeded from a URL search param (`?type=`) or existing wallet data, but users cannot change it from within the form.

## Solution

Add a "Type" `SelectInput` field to `WalletFormPage` between the Name and Currency fields.

## Behaviour

- Options: `payment → "Payment Account"`, `credit_card → "Credit Card"`
- When the user changes type on a **new** wallet:
  - `form.type` updates
  - `form.icon` resets to the default for the new type (`fa-wallet` for payment, `fa-credit-card` for credit_card)
- The selector is **disabled** when editing an existing wallet (`wallet` prop is defined)
- The Credit Limit field continues to conditionally render based on `form.type` (no change needed)

## Components

- **`WalletFormPage.tsx`** — add a `<Field label="Type"><SelectInput ... /></Field>` block. Pass `disabled={Boolean(wallet)}`. Handle `onChange` to update both `form.type` and reset `form.icon`.
- No changes to `useWalletFormPage.ts`, container, or domain types.

## Out of Scope

- Adding new wallet types
- Migrating existing wallet data when type changes
