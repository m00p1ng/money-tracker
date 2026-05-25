# DateRangeHeader Redesign

**Date:** 2026-05-25
**Scope:** `WalletDetailPage` date range control

---

## Goal

Replace the current two-card + ellipsis layout with a connected chevron bar that:
- Shows Begin and End dates as individually tappable sections
- Allows custom date selection via a date-only wheel picker
- Keeps quick preset shortcuts via the existing `DateRangePresetPicker`

---

## Visual Design

Single unified card matching the flat glass style of the app:

```
┌──────────────────┬──────────────────┬──────┐
│ BEGIN            › END              │  ⋯   │
│ 1 May 2026       │ 31 May 2026      │      │
└──────────────────┴──────────────────┘──────┘
```

- Container: `rounded-2xl border border-white/[0.085] bg-white/[0.08]`, full width
- Begin and End sections: `flex-1`, label in `text-[10px] uppercase tracking-wide text-white/40`, date in `text-sm font-semibold`
- Chevron separator: `fa-chevron-right` icon, `text-white/20`, between sections
- Vertical divider before "…" button: `border-l border-white/[0.07]`
- "…" button: fixed width `w-11`, centered `fa-ellipsis` icon

---

## Behavior

| Tap target | Action |
|---|---|
| Begin section | Opens `DateOnlyPicker` for start date |
| End section | Opens `DateOnlyPicker` for end date |
| "…" button | Opens `DateRangePresetPicker` (existing presets sheet) |

Selecting a preset from the sheet calls `setRange(getPresetRange(preset))`, overwriting both dates. Individual date picks update only that boundary.

---

## State Changes — `WalletDetailPage`

```ts
// Before
const [preset, setPreset] = useState<DateRangePreset>('this-month')
const [isPresetSheetOpen, setPresetSheetOpen] = useState(false)
const range = getPresetRange(preset)

// After
const [range, setRange] = useState<DateRange>(getPresetRange('this-month'))
const [isPresetSheetOpen, setPresetSheetOpen] = useState(false)
const [isStartPickerOpen, setStartPickerOpen] = useState(false)
const [isEndPickerOpen, setEndPickerOpen] = useState(false)
```

`DateRangePreset` import and usage removed from `WalletDetailPage`.

---

## New Component: `DateOnlyPicker`

Location: `src/components/shared/picker/DateOnlyPicker/`

Reuses `WheelPicker` + `BottomSheet` but with a single date column (no hour/minute).

```ts
interface DateOnlyPickerProps {
  isOpen: boolean
  title: string           // "Start Date" or "End Date"
  value: string           // YYYY-MM-DD
  onChange: (date: string) => void
  onClose: () => void
}
```

Internal `useDateOnlyPicker(value, onChange, onClose)` hook generates date options spanning ±1 year from today (same range as existing `useDatePicker`). Confirm button calls `onChange(selectedDateKey)` then `onClose()`.

Exported from `src/components/shared/picker/index.ts`.

---

## `DateRangeHeader` Prop Changes

```ts
// Before
interface DateRangeHeaderProps {
  range: DateRange
  onOpenPreset: () => void
}

// After
interface DateRangeHeaderProps {
  range: DateRange
  onClickStart: () => void
  onClickEnd: () => void
  onOpenPreset: () => void
}
```

Component becomes a pure presentational component. No internal state.

---

## Files to Create

| File | Purpose |
|---|---|
| `src/components/shared/picker/DateOnlyPicker/DateOnlyPicker.tsx` | Presentational picker sheet |
| `src/components/shared/picker/DateOnlyPicker/useDateOnlyPicker.ts` | Date column logic |
| `src/components/shared/picker/DateOnlyPicker/index.ts` | Barrel export |

## Files to Modify

| File | Change |
|---|---|
| `src/features/balance/WalletDetailPage/components/DateRangeHeader.tsx` | New visual + new props |
| `src/features/balance/WalletDetailPage/WalletDetailPage.tsx` | State change + wire pickers; drop `DateRangePreset` type import, keep `getPresetRange` for initial state |
| `src/components/shared/picker/index.ts` | Export `DateOnlyPicker` |

---

## Out of Scope

- Custom date validation (end before start) — not addressed in this iteration
- Persisting the selected range across navigation
