# Category Drag: iOS-like Reorder Animation + Reparent Fix

**Date:** 2026-05-26  
**File:** `src/features/transaction/CategorySelectionPage/CategorySelectionPage.tsx`

## Problem

Two bugs in `SortableCategoryCell`:

1. **Items don't slide during drag** — dnd-kit applies its transform via `style={{ transform, transition }}` on the `motion.div` root. framer-motion manages transforms internally and overrides this, so the dnd-kit transform never applies. Other items freeze in place instead of sliding to make room.

2. **Reparent never triggers** — `handleDragOver` reads `active.rect.current.translated` to compute center overlap. This rect is `null` early in the drag lifecycle, causing the entire condition block to be skipped. `reparentTargetId` stays `null` → no green glow → no reparent on drop.

## Solution: Approach A — Separate div layers + linger-based reparent

### Fix 1: Separate dnd-kit node from framer-motion node

Wrap `SortableCategoryCell` in a plain `div` that owns all dnd-kit concerns:

```
div ← setNodeRef, style (transform+transition), attributes, listeners
└── motion.div ← entry animation variants (no scale in animate)
    └── motion.div ← wiggle animation
        └── delete button + motion.button (reparent glow)
```

- dnd-kit's CSS transition string (`transform 250ms ease`) runs without interference
- Items slide in realtime as you drag — iOS-like feel
- framer-motion handles only entry animation and wiggle, no transform conflict

### Fix 2: Linger-based reparent detection

Replace broken rect-math with a 400ms hover timer.

**State/refs in `CategorySelectionPage`:**

| Name | Type | Purpose |
|------|------|---------|
| `reparentTargetId` | `useState<string \| null>` | Drives green glow UI |
| `reparentTargetIdRef` | `useRef<string \| null>` | Stale-closure-safe mirror for `handleDragEnd` |
| `hoveredIdRef` | `useRef<string \| null>` | Tracks current `over.id` |
| `lingerTimerRef` | `useRef<ReturnType<typeof setTimeout> \| null>` | setTimeout handle |

**`handleDragOver` logic:**
1. If no `over` or `over.id === active.id` → clear timer, clear reparentTargetId, return
2. If `over.id !== hoveredIdRef.current` → update `hoveredIdRef`, clear timer, clear reparentTargetId
3. Start timer: after 400ms, set `reparentTargetId = over.id` (and mirror ref)

**`handleDragEnd` logic:**
1. Read `reparentTargetIdRef.current` (not state — avoids stale closure)
2. If set and `!== active.id` → `onReparent(active.id, reparentTargetId)`
3. Else if `oldIndex !== newIndex` → `onReorder(...)`
4. Always: clear timer, clear all refs/state

**Cleanup:** clear timer in `handleDragEnd` and via `useEffect` cleanup on unmount.

## Scope

**Only file changed:** `CategorySelectionPage.tsx`

No changes to:
- `useCategorySelectionPage.ts`
- `categoryStore.ts`
- Container or any other component
- All props/callbacks (`onReorder`, `onReparent`) stay identical

## What stays the same

- DragOverlay (lifted item visual)
- Ghost placeholder (dashed border, opacity 40%)
- Wiggle animation in edit mode
- Delete button (red ×)
- Reparent glow style (green border + shadow on target)
- Sensor config (PointerSensor distance:8, TouchSensor delay:200)
- `closestCenter` collision detection

## Behavior

| Action | Result |
|--------|--------|
| Drag starts | Item lifts into DragOverlay, original slot shows ghost |
| Drag over grid | Other items slide smoothly to make room (CSS transition) |
| Hover same item 400ms | Green glow appears on target |
| Drop on glowing target | `onReparent` called |
| Drop on non-glowing item | `onReorder` called if position changed |
| Drop on same position | No-op |
