# Category Drag Animations Design

**Date:** 2026-05-26
**Scope:** `src/features/transaction/CategorySelectionPage/CategorySelectionPage.tsx`

## Overview

Two animation enhancements to the edit mode drag UX:

1. **iOS wiggle** — all cells jiggle continuously when edit mode activates
2. **Reparent target highlight** — accent green glow + scale when dragging a cell over a potential parent

## 1. iOS Wiggle Animation

### Behavior
- Triggers immediately when `isEditMode` becomes `true`
- All `SortableCategoryCell` components animate simultaneously
- Each cell rotates: `-1.5deg → 1.5deg → -1.5deg`, repeat `Infinity`, ~0.45s duration, `easeInOut`
- Cells are out of phase via index-based delay: `delay = index * 0.06` seconds
- Wiggle pauses on the actively dragged cell (`isDragging === true`) — overlay takes over
- Wiggle stops cleanly when `isEditMode` becomes `false` (`animate={{ rotate: 0 }}`)

### Implementation
- Add `index: number` prop to `SortableCategoryCellProps`
- Apply wiggle via framer-motion `animate` prop on the existing `motion.div` wrapper in `SortableCategoryCell`
- Condition: `isEditMode && !isDragging`

```tsx
animate={
  isEditMode && !isDragging
    ? {
        rotate: [-1.5, 1.5, -1.5],
        transition: { repeat: Infinity, duration: 0.45, ease: 'easeInOut', delay: index * 0.06 },
      }
    : { rotate: 0 }
}
```

- Pass `index` from the `visible.map((category, index) => ...)` call in the grid

## 2. Reparent Target Highlight

### Behavior
- Activates when `isReparentTarget === true` (cell is the drop target for a reparent operation)
- Visual: accent green glow border + green tint background + scale up
- 150ms spring transition in/out

### Implementation
Replace current blue highlight (`border-blue-400/60 bg-blue-400/10`) on the inner `<button>` with:

**Classes (remove blue, add neutral base):**
```
border-white/[0.07] bg-white/4
```

**Framer-motion `animate` on the `<button>` (converted to `motion.button`):**
```tsx
animate={
  isReparentTarget
    ? { scale: 1.05 }
    : { scale: 1 }
}
transition={{ type: 'spring', stiffness: 400, damping: 25, duration: 0.15 }}
```

**Inline style for glow (when `isReparentTarget`):**
```tsx
style={
  isReparentTarget
    ? {
        borderColor: 'rgba(52,211,153,0.6)',   // --accent-light
        backgroundColor: 'rgba(16,185,129,0.10)', // --accent
        boxShadow: '0 0 16px rgba(16,185,129,0.35)',
      }
    : undefined
}
```

Note: Scale applied to the button (not the `motion.div` wrapper) to avoid conflicting with dnd-kit's transform on the wrapper.

## Files to Modify

| File | Change |
|------|--------|
| `CategorySelectionPage.tsx` | Add `index` prop to `SortableCategoryCellProps`; add wiggle `animate` to wrapper `motion.div`; replace static blue highlight with `motion.button` + green glow styles |

No other files need changes.

## Non-Goals
- No changes to non-edit mode cells
- No changes to `DragOverlay` appearance
- No changes to store, hooks, or container
