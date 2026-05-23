# Phase 4.4 — Consistent Color Tokens (Income / Expense / Danger)

## Goal

Replace all hardcoded Tailwind color classes for financial amounts and destructive UI with semantic CSS variables (`--income`, `--expense`, `--danger`) that integrate with the existing theme system.

## Decisions

- **Theme-tinted colors**: income/expense shift slightly per theme to harmonize with each palette
- **Expense always red-toned**: even on purple/pink themes, expense stays in the red family
- **Two semantic roles**: `--expense` (financial loss) and `--danger` (destructive UI) are separate tokens
- **Approach**: extend `ThemeTokens` + `applyTheme()` — follows existing pattern exactly

## Token Layer

### New fields in `ThemeTokens` (`src/lib/theme.ts`)

```ts
type ThemeTokens = {
  // ...existing fields...
  income: string   // --income
  expense: string  // --expense
  danger: string   // --danger
}
```

### `applyTheme()` additions

```ts
root.style.setProperty('--income', theme.income)
root.style.setProperty('--expense', theme.expense)
root.style.setProperty('--danger', theme.danger)
```

### `index.css` `:root` defaults (forest values)

```css
--income: #4ade80;
--expense: #f87171;
--danger: #ef4444;
```

### `index.css` `@theme` block additions

```css
--color-income: var(--income);
--color-expense: var(--expense);
--color-danger: var(--danger);
```

### `tailwind.config.ts` additions

```ts
income: 'var(--income)',
expense: 'var(--expense)',
danger: 'var(--danger)',
```

## Per-Theme Color Values

| Theme    | `--income` | `--expense` | `--danger` |
|----------|-----------|------------|-----------|
| forest   | `#4ade80` | `#f87171`  | `#ef4444` |
| midnight | `#86efac` | `#fca5a5`  | `#f87171` |
| ocean    | `#4ade80` | `#f87171`  | `#ef4444` |
| sunset   | `#4ade80` | `#fca5a5`  | `#f87171` |
| amber    | `#4ade80` | `#fca5a5`  | `#ef4444` |
| arctic   | `#86efac` | `#fca5a5`  | `#f87171` |
| sakura   | `#86efac` | `#fca5a5`  | `#f87171` |
| void     | `#6ee7b7` | `#fca5a5`  | `#f87171` |

**Income logic**: green-400 (`#4ade80`) on vivid/warm themes; green-300 (`#86efac`) on cool/muted themes; emerald-300 (`#6ee7b7`) on void.

**Expense logic**: red-400 (`#f87171`) on forest/ocean; rose-300 (`#fca5a5`) on warm/muted/dark themes — always clearly red-family.

**Danger logic**: red-500 (`#ef4444`) on themes with vivid accents; red-400 (`#f87171`) on muted themes for legibility.

## Component Changes

### Financial amounts → `text-income` / `text-expense`

| File | Change |
|------|--------|
| `src/features/transaction/AmountDisplay.tsx` | `text-emerald-300` → `text-income`; `text-rose-300` → `text-expense` |
| `src/features/home/SummaryCards.tsx` | `text-emerald-400/300` → `text-income`; `text-rose-400/300` → `text-expense` |
| `src/features/home/TodayTransactions.tsx` | `amountColor` prop: `text-emerald-300` → `text-income`; `text-rose-300` → `text-expense` |
| `src/features/balance/BalancePage.tsx` | `text-emerald-300/400` → `text-income`; `text-red-300` → `text-expense` |
| `src/features/balance/WalletDetailPage.tsx` | `text-emerald-300/400` → `text-income`; `text-red-300/400` → `text-expense` (transaction amounts only) |

**Excluded — keep as accent/UI chrome, do not change:**
- `WalletDetailPage.tsx`: `bg-emerald-500/15 text-emerald-300` (preset selection indicator) → change to `bg-accent/15 text-accent-light`
- `WalletDetailPage.tsx`: `text-emerald-400` on checkmark icon → change to `text-accent`
- `TransactionPage.tsx:353`: `bg-emerald-400/15 text-emerald-400` on repeat icon → change to `bg-accent/15 text-accent`

### Destructive UI → `text-danger` / `bg-danger/N`

| File | Change |
|------|--------|
| `src/components/ui/Button.tsx` | danger variant: `text-red-300 bg-red-500/15` → `text-danger bg-danger/15` |
| `src/components/ui/Field.tsx` | error: `text-red-300` → `text-danger` |
| `src/components/shared/FormErrorMessage.tsx` | `text-red-300` → `text-danger` |
| `src/features/transaction/CategoryItemsCard.tsx` | delete row: `text-red-400 bg-red-500/10` → `text-danger bg-danger/10` |
| `src/features/transaction/CalculatorKeyboard.tsx` | delete key: red classes → `text-danger` + `border-danger/20 bg-danger/10` |
| `src/features/transaction/TransactionPage.tsx` | delete button: `text-red-300 bg-red-500/15` → `text-danger bg-danger/15` |

## Build Sequence

1. Update `ThemeTokens` type and all 8 theme objects in `src/lib/theme.ts`
2. Update `applyTheme()` to set 3 new CSS vars
3. Update `src/index.css` — `:root` defaults + `@theme` block
4. Update `tailwind.config.ts` — 3 new color aliases
5. Update financial amount components (6 files)
6. Update destructive UI components (6 files)
7. Run `bun run build` to verify no Tailwind class errors
