# Calendar View Design

**Date:** 2026-05-25  
**Feature:** Transaction calendar page — browse and view transactions by date

---

## Overview

New `/calendar` page accessible by tapping the date block in `HomeTitle`. Shows a full-width monthly calendar with transaction indicators, and a scrollable transaction list filtered to the selected date (or full month when no date selected).

The calendar grid is `position: sticky; top: 0` within the page scroll container so it stays visible while the transaction list scrolls beneath it.

---

## Routes & Navigation

- New route `/calendar` registered in `App.tsx` as a deep route — uses iOS slide transition (same as `/balance/wallet/:id`)
- `HomeTitle` receives `onNavigateToCalendar: () => void` prop; tapping the date/day/month block triggers forward navigation
- `HomePageContainer` / `useHomePage` wires up the navigate call via `react-router`'s `useNavigate`

---

## File Structure

```
src/features/calendar/
  CalendarPage/
    CalendarPage.tsx           # dumb — props only, no store access
    CalendarPageContainer.tsx  # smart — reads stores, passes props down
    useCalendarPage.ts         # all state + data logic
    index.ts
    components/
      CalendarGrid/
        CalendarGrid.tsx       # renders 7-col grid, day cells, indicators
        index.ts
      CalendarHeader/
        CalendarHeader.tsx     # month label, prev/next, search icon (mock), +
        index.ts
  index.ts
```

---

## State (`useCalendarPage`)

```ts
currentYear: number    // default: today's year
currentMonth: number   // default: today's month (0-indexed)
selectedDate: string | null  // 'YYYY-MM-DD', default today's date, null = unselected
```

- Tap unselected date → set `selectedDate` to that date string
- Tap already-selected date → set `selectedDate = null`
- Month navigation (prev/next buttons or swipe) → update `currentYear`/`currentMonth`, keep `selectedDate` unless it falls outside new month (clear it if so)

---

## Store Changes (`transactionStore`)

Two new selectors:

```ts
transactionsByMonth(year: number, month: number): Transaction[]
// Transactions whose local date falls in that year/month AND status is NOT 'planned' or 'overdue'
// (i.e., status is 'paid', undefined, or cleared — completed transactions only)
// Sorted newest first

upcomingByMonth(year: number, month: number): UpcomingTransactionRow[]
// planned/overdue real rows + virtual repeat occurrences whose date falls in that year/month
// Overdue transactions from prior months do NOT appear (filtered by their own date, not today)
// Same shape as existing upcomingTransactions()
```

---

## Components

### `CalendarHeader`

Stateless, props-driven.

```
◀   May 2026   🔍   +
```

Props:
```ts
year: number
month: number          // 0-indexed
onPrev: () => void
onNext: () => void
onAdd: () => void      // navigates to /transaction/new?date=YYYY-MM-DD
onSearch: () => void   // no-op for now (mock icon)
```

### `CalendarGrid`

Renders the 7-column calendar grid. No store access.

Props:
```ts
year: number
month: number
today: string                  // 'YYYY-MM-DD'
selectedDate: string | null
indicatorMap: Record<string, 'transaction' | 'upcoming' | 'both'>
onSelectDate: (date: string | null) => void
```

**Day cell visual states** (precedence top-to-bottom):

| State | Visual |
|-------|--------|
| Selected | Solid green fill, white text |
| Today (unselected) | Outline ring (accent border), white bold text |
| Has real transaction | Green tint background, green text |
| Has upcoming only | Amber tint background, amber text |
| Has both | Green tint (real transaction takes priority) |
| Empty day | Default muted text |

**Swipe to change month:** `framer-motion` `drag="x"` on the grid wrapper with `dragConstraints={{ left: 0, right: 0 }}`. On `onDragEnd`, offset > 50px → `onPrev`; offset < -50px → `onNext`. Position resets after.

**Header row:** Su Mo Tu We Th Fr Sa

**Leading empty cells:** offset first day of month to correct column.

### Transaction List (in `CalendarPage`)

Scrollable section below the fixed calendar.

**List header:** Shows "May 25" (date selected) or "May 2026" (full month) + transaction count.

**When `selectedDate != null`:**
- Combine `transactionsByMonth` filtered to selected date + `upcomingByMonth` filtered to selected date
- Sort newest first
- Each row uses existing `TransactionRow` component

**When `selectedDate == null`:**
- Combine full month from both selectors
- Flat list, sort newest first
- Secondary label on each row shows date string (e.g., "May 20") instead of category parent

**Row data mapping:**

Real transactions → same shape as `useTodayTransactions` (icon from category, green/red amount color).

Upcoming rows → same `TransactionRow` shape:
- `amountColor`: amber (`text-warning` or inline amber)
- Secondary label: date string when in full-month view; "Today / Tomorrow / Overdue / Repeat" badge when date selected

---

## "+" Button Behavior

Navigates to `/transaction/new?date=YYYY-MM-DD` where date = `selectedDate ?? today`.

**Required change to `TransactionPage`:** reads `?date` query param via `useSearchParams` to pre-fill the date field in `transactionDraftStore` initial state. If param absent, defaults to today (existing behavior unchanged).

---

## Design Sandbox

Add `CalendarPage` demo to `src/features/design/sections/` under `FeatureSection`. Follow existing `SubSection` + `VariantLabel` pattern.

---

## Out of Scope

- Search functionality (`onSearch` is a no-op mock icon)
- Multi-day selection
- Week view
- Deep-link to specific month via URL params
