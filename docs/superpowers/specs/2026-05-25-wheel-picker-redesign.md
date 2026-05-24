# WheelPicker Redesign — Remove react-mobile-picker

**Date:** 2026-05-25  
**Status:** Approved

## Goal

Replace `react-mobile-picker` with `@ncdai/react-wheel-picker`. Keep the existing `WheelPicker` public API unchanged — only the internals change. Remove `react-mobile-picker` from `package.json`.

## Library

| | react-mobile-picker (current) | @ncdai/react-wheel-picker (new) |
|--|--|--|
| Version | 1.2.0 | 1.2.2 |
| Extra deps | none | none |
| License | — | MIT |
| Unpacked | 24KB | 38KB |
| Inertia scroll | no | yes |
| Infinite loop | no | yes |
| CSS required | no | yes (`/style.css`) |

## Public API — unchanged

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

No changes to `DatePicker`, `SharedComponentsSection`, or any other consumer.

## Internal Implementation

Import the new library as `WheelPickerBase` to avoid name collision:

```tsx
import { WheelPicker as WheelPickerBase } from '@ncdai/react-wheel-picker'
import '@ncdai/react-wheel-picker/style.css'
```

Map each column's `string[]` options to the library's `{ value, label }` format:

```tsx
options={col.options.map((opt) => ({ value: opt, label: opt }))}
```

Per-column controlled value extracted from the shared Record and merged back on change:

```tsx
value={value[col.name]}
onValueChange={(v) => onChange({ ...value, [col.name]: String(v) })}
```

Picker config:
- `optionItemHeight={40}` — matches previous 40px item height
- `visibleCount={4}` — must be multiple of 4; gives 3 visible items with center selected

## Visual Styling — Accent Tint

The library exposes `classNames` for the selection indicator:

```tsx
classNames={{
  highlightWrapper: 'bg-(--accent)/15 border-y border-(--accent)/30',
  highlightItem: 'font-bold text-white',
  optionItem: 'text-white/30 font-medium text-[15px]',
}}
```

The library's built-in CSS provides:
- Gradient fade mask (`transparent → opaque → transparent`) for iOS fade-out
- `perspective: 2000px` for subtle 3D drum-roll feel
- `user-select: none`

Column container (our code — unchanged):
```tsx
<div className="overflow-hidden rounded-xl border border-white/[0.07] bg-white/4">
  <p className="pt-2 text-center text-[10px] uppercase tracking-[1px] text-white/30">{col.label}</p>
  {/* WheelPickerBase here */}
</div>
```

Grid layout (unchanged): `repeat(N, 1fr)` with `gap-2.5`.

## Files Changed

| Action | File |
|--------|------|
| Modify | `src/components/shared/WheelPicker.tsx` — swap internals |
| Modify | `package.json` — add `@ncdai/react-wheel-picker`, remove `react-mobile-picker` |

## Testing

No unit test for `WheelPicker` (pure UI wrapper — verified in design sandbox). Confirm visual correctness by running dev server and checking `/design` → WheelPicker section + DatePicker sheet.
