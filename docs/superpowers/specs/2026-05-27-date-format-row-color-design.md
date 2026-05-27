# Date Format & DateTimeRow Color Design

## Overview

Two small UI changes to `DateTimeRow`:
1. Compact date format: `27 May 2026` → `27/05/26`
2. Date text color matches status badge color (same green/red/amber per status)

## Changes

### 1. Date Format (`src/lib/date.ts`)

Update `displayDateFormatter` from `month: 'short', year: 'numeric'` to `month: '2-digit', year: '2-digit'`. `en-GB` locale with all fields as `2-digit` produces `DD/MM/YY` natively.

`formatDatetimeLocalDisplay` is the only consumer — only used in `DateTimeRow`. No other call sites.

### 2. Date Text Color (`DateTimeRow.tsx`)

Apply `badge.text` Tailwind class to the date `<span>`. The `statusBadgeStyle` map already defines per-status text colors (`text-green-400`, `text-danger`, `text-amber-400`). Reuse that — no new constants needed.

Scope: only the `<span className="block font-medium">` element. No background tint, no border change on the row itself.

## File Changes

| File | Change |
|------|--------|
| `src/lib/date.ts` | `displayDateFormatter`: `month: 'short' → '2-digit'`, `year: 'numeric' → '2-digit'` |
| `src/features/transaction/TransactionPage/components/DateTimeRow.tsx` | Add `badge.text` to date `<span>` via `cx()` |

## Result

| Status | Date text color | Badge color |
|--------|----------------|-------------|
| Paid | `text-green-400` | `text-green-400` |
| Overdue | `text-danger` | `text-danger` |
| Planned | `text-amber-400` | `text-amber-400` |
