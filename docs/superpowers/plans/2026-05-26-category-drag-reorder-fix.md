# Category Drag Reorder Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix two bugs in `CategorySelectionPage` — items not sliding during drag (dnd-kit/framer-motion transform conflict) and reparent never triggering (broken rect-math replaced with linger-based detection).

**Architecture:** Separate dnd-kit's `setNodeRef`/`style`/`attributes`/`listeners` onto a plain `div` wrapper so framer-motion's transform system no longer conflicts. Replace `handleDragOver` rect-math reparent detection with a 400ms hover timer using refs, with a ref-mirrored state value to avoid stale closures in `handleDragEnd`.

**Tech Stack:** React, dnd-kit (`@dnd-kit/core`, `@dnd-kit/sortable`), framer-motion

---

## File Map

| File | Action |
|------|--------|
| `src/features/transaction/CategorySelectionPage/CategorySelectionPage.tsx` | Modify — all changes in this file only |

---

### Task 1: Fix `SortableCategoryCell` — separate dnd-kit node from framer-motion

**Files:**
- Modify: `src/features/transaction/CategorySelectionPage/CategorySelectionPage.tsx`

The root `motion.div` currently holds both dnd-kit's `ref`/`style` and framer-motion's `variants`. framer-motion manages transforms internally and overrides the CSS transform dnd-kit writes, so items never slide during drag.

Fix: move dnd-kit's node concerns to a plain `div` wrapper, keep `motion.div` for entry animation only.

- [ ] **Step 1: Replace `SortableCategoryCell` return JSX**

Open `src/features/transaction/CategorySelectionPage/CategorySelectionPage.tsx`.

Find the `return` block inside `SortableCategoryCell` (currently line ~110). Replace it entirely:

```tsx
return (
  <div
    ref={setNodeRef}
    style={style}
    {...(isEditMode ? { ...attributes, ...listeners } : {})}
    className="relative"
  >
    <motion.div
      variants={cellVariants}
      className="relative"
    >
      <motion.div
        animate={
          isEditMode && !isDragging
            ? {
              rotate: [-1.5, 1.5, -1.5],
              transition: {
                repeat: Infinity,
                duration: 0.45,
                ease: 'easeInOut',
                delay: index * 0.06,
              },
            }
            : { rotate: 0 }
        }
        className="relative"
      >
        {isEditMode && (
          <button
            aria-label={`Remove ${category.name}`}
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation(); onRequestDelete(category.id)
            }}
            className={[
              'absolute -left-1.5 -top-1.5 z-10 flex h-[18px] w-[18px]',
              'items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white',
            ].join(' ')}
          >
            ×
          </button>
        )}
        <motion.button
          onClick={() => onSelect(category)}
          type="button"
          animate={isReparentTarget
            ? { scale: 1.05 }
            : { scale: 1 }}
          transition={{
            type: 'spring', stiffness: 400, damping: 25,
          }}
          style={
            isReparentTarget
              ? {
                borderColor: 'rgba(52,211,153,0.6)',
                backgroundColor: 'rgba(16,185,129,0.10)',
                boxShadow: '0 0 16px rgba(16,185,129,0.35)',
              }
              : undefined
          }
          className={[
            'flex w-full flex-col items-center gap-3 rounded-2xl',
            'border px-2 py-3.5',
            isDragging
              ? 'border-dashed border-white/20 bg-white/2 opacity-40'
              : 'border-white/[0.07] bg-white/4',
          ].join(' ')}
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-xl text-slate-50">
            <Icon name={category.icon} />
          </span>
          <span className="text-center text-[12px] font-semibold leading-tight">{category.name}</span>
        </motion.button>
      </motion.div>
    </motion.div>
  </div>
)
```

Key changes vs original:
- Outer element is plain `div` (not `motion.div`) — owns `ref`, `style`, `attributes`, `listeners`
- First `motion.div` has `variants={cellVariants}` but NO `style`, `ref`, or drag props
- Inner `motion.div` keeps wiggle `animate` unchanged
- Everything else (delete button, reparent glow, ghost styling) unchanged

- [ ] **Step 2: Verify lint passes**

```bash
npm run lint -- --fix
```

Expected: 0 errors.

- [ ] **Step 3: Run dev server and smoke test**

```bash
npm run dev
```

Open the app in browser. Go to any transaction → category selection → tap Edit. Drag a category cell. **Verify:** other cells slide smoothly to make room as you drag (previously they froze). The dragged item should appear in DragOverlay (lifted). Original slot shows ghost (dashed, dim).

- [ ] **Step 4: Commit**

```bash
git add src/features/transaction/CategorySelectionPage/CategorySelectionPage.tsx
git commit -m "fix(category-selection): separate dnd-kit node from framer-motion to fix drag slide"
```

---

### Task 2: Replace rect-math reparent detection with linger timer

**Files:**
- Modify: `src/features/transaction/CategorySelectionPage/CategorySelectionPage.tsx`

`handleDragOver` reads `active.rect.current.translated` which is `null` early in the drag lifecycle, causing the entire reparent check to be skipped. Replace with a 400ms hover timer using refs.

- [ ] **Step 1: Update React import and add refs to `CategorySelectionPage`**

At the top of the file, update the React import to include `useEffect` and `useRef`:

```tsx
import { useEffect, useRef, useState } from 'react'
```

Then inside `CategorySelectionPage` function body, after `const [reparentTargetId, setReparentTargetId] = useState...`, add three refs:

```tsx
const [reparentTargetId, setReparentTargetId] = useState<string | null>(null)
const reparentTargetIdRef = useRef<string | null>(null)
const hoveredIdRef = useRef<string | null>(null)
const lingerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
```

`reparentTargetIdRef` is a stale-closure-safe mirror — always kept in sync when `reparentTargetId` state changes. `hoveredIdRef` tracks the last `over.id` seen. `lingerTimerRef` holds the pending setTimeout handle.

- [ ] **Step 2: Add timer cleanup effect**

Add this effect inside `CategorySelectionPage`, after the refs:

```tsx
useEffect(() => {
  return () => {
    if (lingerTimerRef.current !== null) {
      clearTimeout(lingerTimerRef.current)
    }
  }
}, [])
```

This prevents setState-after-unmount if the component unmounts mid-drag.

- [ ] **Step 3: Replace `handleDragStart`**

Replace existing `handleDragStart`:

```tsx
function handleDragStart(event: DragStartEvent) {
  setActiveId(event.active.id as string)
  if (lingerTimerRef.current !== null) {
    clearTimeout(lingerTimerRef.current)
    lingerTimerRef.current = null
  }
  hoveredIdRef.current = null
  reparentTargetIdRef.current = null
  setReparentTargetId(null)
}
```

- [ ] **Step 4: Replace `handleDragOver` with linger-based detection**

Replace the entire existing `handleDragOver`:

```tsx
function handleDragOver(event: DragOverEvent) {
  const { active, over } = event

  if (!over || over.id === active.id) {
    if (lingerTimerRef.current !== null) {
      clearTimeout(lingerTimerRef.current)
      lingerTimerRef.current = null
    }
    hoveredIdRef.current = null
    reparentTargetIdRef.current = null
    setReparentTargetId(null)
    return
  }

  if (over.id !== hoveredIdRef.current) {
    hoveredIdRef.current = over.id as string
    if (lingerTimerRef.current !== null) {
      clearTimeout(lingerTimerRef.current)
      lingerTimerRef.current = null
    }
    reparentTargetIdRef.current = null
    setReparentTargetId(null)

    lingerTimerRef.current = setTimeout(() => {
      lingerTimerRef.current = null
      reparentTargetIdRef.current = over.id as string
      setReparentTargetId(over.id as string)
    }, 400)
  }
}
```

Logic:
- No `over` or hovering self → clear everything
- New `over.id` → reset timer, start 400ms countdown
- Same `over.id` → timer already running, do nothing
- After 400ms → set reparent target (both state for glow UI and ref for stale-closure-safe read)

- [ ] **Step 5: Replace `handleDragEnd` to use ref instead of state**

Replace existing `handleDragEnd`:

```tsx
function handleDragEnd(event: DragEndEvent) {
  const { active, over } = event
  setActiveId(null)

  if (lingerTimerRef.current !== null) {
    clearTimeout(lingerTimerRef.current)
    lingerTimerRef.current = null
  }
  hoveredIdRef.current = null

  const pendingReparent = reparentTargetIdRef.current
  reparentTargetIdRef.current = null
  setReparentTargetId(null)

  if (!over || active.id === over.id) {
    return
  }

  if (pendingReparent && pendingReparent !== active.id) {
    onReparent(active.id as string, pendingReparent)
    return
  }

  const oldIndex = visible.findIndex((c) => c.id === active.id)
  const newIndex = visible.findIndex((c) => c.id === over.id)
  if (oldIndex !== newIndex) {
    const newOrder = arrayMove(visible, oldIndex, newIndex)
    onReorder(newOrder.map((c) => c.id))
  }
}
```

Key: reads `reparentTargetIdRef.current` (the ref, not state) — always reflects the latest value regardless of when `handleDragEnd` was closed over.

- [ ] **Step 6: Verify lint passes**

```bash
npm run lint -- --fix
```

Expected: 0 errors.

- [ ] **Step 7: Verify reparent in browser**

With dev server running, go to category selection → Edit mode. Drag a category and hold it over another category for 1+ second. **Verify:** green glow appears on the target after ~400ms. Drop it — the category should move into the target as a child (disappears from this level). Navigate into the target category to confirm it's there.

Also verify reorder still works: drag and drop quickly (before 400ms) to a new position — category should reorder without triggering reparent.

- [ ] **Step 8: Commit**

```bash
git add src/features/transaction/CategorySelectionPage/CategorySelectionPage.tsx
git commit -m "fix(category-selection): linger-based reparent detection replaces broken rect-math"
```

---

### Task 3: Final verification

**Files:**
- No changes

- [ ] **Step 1: Run full check suite**

```bash
npm run lint -- --fix && npm run test && npm run build
```

Expected: lint clean, all tests pass, build succeeds.

- [ ] **Step 2: Full manual test matrix**

| Scenario | Expected |
|----------|----------|
| Edit mode, drag cell left 2 positions | Other cells slide, item lands in new slot |
| Edit mode, drag cell right 2 positions | Other cells slide, item lands in new slot |
| Edit mode, hold over same cell 400ms+ | Green glow appears |
| Edit mode, hold over same cell <400ms, release | Reorder (no reparent) |
| Edit mode, hold over different cell 400ms, release | `onReparent` fires — item disappears, found inside target |
| Edit mode, drag cell over itself | Nothing happens |
| Non-edit mode | No drag behavior, normal tap-to-select works |
| Delete button during drag | Not triggerable (pointer events stopped) |
