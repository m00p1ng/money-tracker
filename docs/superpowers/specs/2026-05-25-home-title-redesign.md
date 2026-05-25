# Home Title Redesign

## Goal

Replace the two-line header (`Mon, 25 May 2026` / `Overview`) with a new typographic layout:

```
25 | Monday     [+]
   | May 2026
```

## Layout

CSS Grid with 3 columns: `[day] [divider] [weekday + month-year stack]`. Add button stays right via `justify-between` on outer flex.

| Element | Style |
|---------|-------|
| Day `"25"` | `text-5xl font-bold`, white gradient (same as current `Overview` h1), `row-span-2` |
| Divider | `w-px`, `bg-white/30`, `row-span-2`, single DOM element |
| Weekday `"Monday"` | `text-sm font-medium text-white` |
| Month-year `"May 2026"` | `text-sm text-slate-400` |

## Date Helpers

Add to `src/lib/date.ts`:

- `formatHeaderDay(date: Date): string` → `"25"` (numeric day)
- `formatHeaderWeekday(date: Date): string` → `"Monday"` (long weekday)
- `formatHeaderMonthYear(date: Date): string` → `"May 2026"` (long month + year)

Existing `formatHeaderDate` remains (referenced in tests).

## Files Changed

- `src/lib/date.ts` — add 3 formatters
- `src/features/home/HomePage/HomePage.tsx` — replace header markup
- `src/features/home/__tests__/HomePage.test.tsx` — update snapshot/assertions
- `src/lib/__tests__/date.test.ts` — add tests for new formatters
