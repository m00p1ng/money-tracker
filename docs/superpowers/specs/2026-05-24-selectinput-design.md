# SelectInput — Custom Dropdown Design

**Date:** 2026-05-24  
**Status:** Approved

## Problem

The existing `SelectInput` wraps a native `<select>` with shared `inputClassName`. The browser-default arrow indicator does not match the dark design system, and option styling is fully browser-controlled.

## Decision

Replace the native `<select>` with a fully custom dropdown. Keeps native semantics were never load-bearing here — all usages are controlled components in settings forms, not part of a `<form>` submit payload.

## API

```tsx
export type SelectOption = { value: string; label: string }

interface SelectInputProps {
  options:      SelectOption[]
  value:        string
  onChange:     (value: string) => void
  disabled?:    boolean
  placeholder?: string  // shown when value matches no option
}
```

`SelectOption` is exported from `Field.tsx` and re-exported via `src/components/ui/index.ts`.

## Visual States

| State | Trigger border | Trigger text | Chevron | Panel |
|---|---|---|---|---|
| Closed | `border-white/10` | `text-slate-50` | Down, `text-slate-500` | Hidden |
| Open | `border-[var(--accent)]` | `text-slate-50` | Up (rotated 180°) | Visible, slides in |
| Option — default | — | `text-white/60` | — | — |
| Option — hover | — | `text-slate-50` | — | `bg-white/6` |
| Option — selected | — | `text-accent-light` | Checkmark right | `bg-accent/10` |
| Disabled | `border-white/5` | `text-slate-50/30` | Down, dimmed | Never opens |

## Animation

framer-motion `AnimatePresence` + `motion.div` on the dropdown panel:

```ts
initial:    { opacity: 0, y: -4 }
animate:    { opacity: 1, y: 0 }
exit:       { opacity: 0, y: -4 }
transition: { duration: 0.15, ease: 'easeOut' }
```

Chevron rotation via CSS `transition: transform 0.2s`.

## Behaviour

- Click trigger → toggle open
- Click option → call `onChange(value)`, close panel
- Click outside (mousedown outside container ref) → close panel
- `Escape` key → close panel
- Dropdown always opens below trigger (forms have enough vertical space; no flip logic needed)

## Implementation

**Files changed:**

| File | Change |
|---|---|
| `src/components/ui/Field.tsx` | Replace `SelectInput` implementation; export `SelectOption` type |
| `src/components/ui/index.ts` | Re-export `SelectOption` |
| `src/features/settings/WalletFormPage/WalletFormPage.tsx` | Update Type + Currency `SelectInput` usages |
| `src/features/settings/CategoryFormPage/CategoryFormPage.tsx` | Update Type + Parent `SelectInput` usages |
| `src/features/design/sections/UIComponentsSection.tsx` | Update sandbox demo |

No new files. All logic lives inside `SelectInput` in `Field.tsx`.

**Outside-click pattern:**
```ts
const ref = useRef<HTMLDivElement>(null)
useEffect(() => {
  if (!isOpen) return
  function handler(e: MouseEvent) {
    if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false)
  }
  document.addEventListener('mousedown', handler)
  return () => document.removeEventListener('mousedown', handler)
}, [isOpen])
```

## Out of Scope

- Keyboard arrow-key navigation between options (can be added later)
- Multi-select
- Option groups
- Upward-flip positioning
