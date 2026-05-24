# WheelPicker Design

**Date:** 2026-05-25  
**Status:** Approved

## Summary

Replace `PickerColumn` with `WheelPicker` — a multi-column iOS-style wheel picker with a unified config-array API.

## Component API

```tsx
type WheelPickerColumn = {
  name: string
  label: string
  options: string[]
  capitalize?: boolean
}

type WheelPickerProps = {
  columns: WheelPickerColumn[]
  value: Record<string, string>
  onChange: (value: Record<string, string>) => void
}
```

### Behavior

- Renders all columns side-by-side in a CSS grid
- Grid uses `style={{ gridTemplateColumns: \`repeat(${columns.length}, 1fr)\` }}` — handles 1–N columns
- Each column: label on top, `react-mobile-picker` wheel below
- Selected item: bold + full white; others: dimmed (`text-white/30`)
- Visual style identical to current `PickerColumn`

## Files

### New

| File | Purpose |
|------|---------|
| `src/components/shared/WheelPicker.tsx` | New component replacing `PickerColumn` |

### Modified

| File | Change |
|------|--------|
| `src/components/shared/index.ts` | Remove `PickerColumn`, export `WheelPicker` |
| `src/components/index.ts` | Remove `PickerColumn`, export `WheelPicker` |
| `src/components/shared/picker/DatePicker.tsx` | Migrate two `PickerColumn` → one `WheelPicker` with 2 columns |
| `src/features/design/sections/SharedComponentsSection.tsx` | Update demo: `PickerColumn` → `WheelPicker`, rename subsection |

### Deleted

| File | Reason |
|------|--------|
| `src/components/shared/PickerColumn.tsx` | Replaced by `WheelPicker` |

## Migration: DatePicker

Before (two separate PickerColumn components sharing state):
```tsx
<PickerColumn label="Hour" name="hour" options={HOUR_OPTIONS} value={pickerValue} onChange={...} />
<PickerColumn label="Minute" name="minute" options={MINUTE_OPTIONS} value={pickerValue} onChange={...} />
```

After (one WheelPicker):
```tsx
<WheelPicker
  columns={[
    { name: 'hour', label: 'Hour', options: HOUR_OPTIONS },
    { name: 'minute', label: 'Minute', options: MINUTE_OPTIONS },
  ]}
  value={pickerValue}
  onChange={(v) => setPickerValue(v as TimeValue)}
/>
```

## Testing

No unit test exists for `PickerColumn`. `react-mobile-picker` is a library component; `WheelPicker` logic is pure prop threading. No new test required.

Design sandbox (`SharedComponentsSection`) updated to demo `WheelPicker` with same hour/minute columns.
