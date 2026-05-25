# iOS-Style Page Transitions

**Date:** 2026-05-25

## Goal

Replace the current sequential (wait-mode) page transitions with iOS-style simultaneous push/pop slides for deep routes, and a simple cross-fade for tab-level navigation.

## Scope

Single file change: `src/App.tsx`. No new files or components required.

## Tab Transitions (cross-fade)

Replace the current `tabVariants` (which includes vertical `y` movement) with a pure opacity fade matching iOS tab bar behavior:

```ts
const tabVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.15 } },
}
```

## Deep-Route Transitions (iOS push/pop)

Replace `makePageVariants` to use full horizontal translation with no scale or opacity, matching UINavigationController behavior:

```ts
function makePageVariants(direction: 'forward' | 'back'): Variants {
  const enterX = direction === 'back' ? '-100%' : '100%'
  const exitX  = direction === 'back' ? '100%' : '-100%'
  return {
    initial: { x: enterX },
    animate: { x: 0, transition: { type: 'spring', stiffness: 350, damping: 35, mass: 1 } },
    exit:    { x: exitX, transition: { type: 'spring', stiffness: 350, damping: 35, mass: 1 } },
  }
}
```

Spring config produces ~300–350ms total, matching iOS default push timing.

## AnimatePresence + Layout

- Change `mode="wait"` → `mode="sync"` so exit and enter animate simultaneously
- Wrap `AnimatePresence` in a container `div` with `position: relative; overflow: hidden` to clip sliding pages
- The `motion.div` gets `position: absolute; width: 100%; top: 0` so the two pages stack during transition
- The container also needs `minHeight: '100%'` to fill the viewport (previously on the motion.div)

## What Does Not Change

- `NavigationDirectionProvider` and `useBackNavigate` — no changes needed
- `useRouteVariants` hook logic — still selects tab vs page variants by pathname
- `AppShell`, `BottomNav`, all page components — untouched
- Test mocks for framer-motion — unaffected
