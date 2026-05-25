# iOS Page Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current sequential wait-mode page transitions with iOS-style simultaneous push/pop slides for deep routes and a cross-fade for tab navigation.

**Architecture:** All changes are in `src/App.tsx`. Switch `AnimatePresence` from `mode="wait"` to `mode="sync"`, update animation variants, and add a positioning container so both pages can slide simultaneously without layout shift.

**Tech Stack:** React, framer-motion, react-router

---

## File Map

| File | Change |
|------|--------|
| `src/App.tsx` | Modify `tabVariants`, `makePageVariants`, `AnimatePresence` mode, and add positioning container |

---

### Task 1: Update `tabVariants` to cross-fade only

**Files:**
- Modify: `src/App.tsx:33-49`

- [ ] **Step 1: Replace `tabVariants`**

In `src/App.tsx`, replace lines 33–49:

```ts
const tabVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npm run build 2>&1 | head -30
```

Expected: no errors (or only unrelated pre-existing errors).

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: replace tab variants with cross-fade"
```

---

### Task 2: Update `makePageVariants` to full-width iOS slide

**Files:**
- Modify: `src/App.tsx:51-82`

- [ ] **Step 1: Replace `makePageVariants`**

In `src/App.tsx`, replace lines 51–82:

```ts
function makePageVariants(direction: 'forward' | 'back'): Variants {
  const enterX = direction === 'back' ? '-100%' : '100%'
  const exitX = direction === 'back' ? '100%' : '-100%'

  return {
    initial: { x: enterX },
    animate: {
      x: 0,
      transition: { type: 'spring', stiffness: 350, damping: 35, mass: 1 },
    },
    exit: {
      x: exitX,
      transition: { type: 'spring', stiffness: 350, damping: 35, mass: 1 },
    },
  }
}
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
npm run build 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: update page variants to iOS full-width slide"
```

---

### Task 3: Switch AnimatePresence to sync mode and add positioning container

**Files:**
- Modify: `src/App.tsx:126-160`

- [ ] **Step 1: Replace the return block of `RoutedApp`**

Replace lines 126–160 in `src/App.tsx`:

```tsx
  return (
    <AppShell showBottomNav={showBottomNav}>
      <div style={{ position: 'relative', overflow: 'hidden', minHeight: '100%' }}>
        <AnimatePresence mode="sync" initial={false}>
          <motion.div
            key={location.pathname}
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ position: 'absolute', width: '100%', top: 0 }}
          >
            <Routes location={location}>
              <Route path="/" element={<HomePage />} />
              <Route path="/balance" element={<BalancePage />} />
              <Route path="/balance/wallet/:id" element={<WalletDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/settings/wallets" element={<WalletsPage />} />
              <Route path="/settings/wallets/new" element={<WalletFormPage />} />
              <Route path="/settings/wallets/:id" element={<WalletFormPage />} />
              <Route path="/settings/categories" element={<CategoriesPage />} />
              <Route path="/settings/categories/new" element={<CategoryFormPage />} />
              <Route path="/settings/categories/:id" element={<CategoryFormPage />} />
              <Route path="/settings/currencies" element={<CurrenciesPage />} />
              <Route path="/settings/currencies/new" element={<CurrencyFormPage />} />
              <Route path="/settings/currencies/:code" element={<CurrencyFormPage />} />
              <Route path="/settings/theme" element={<ThemePage />} />
              <Route path="/transaction/category" element={<CategorySelectionPage />} />
              <Route path="/transaction/new" element={<TransactionPage />} />
              <Route path="/transaction/repeat/:sourceId/:date" element={<TransactionPage />} />
              <Route path="/transaction/:id" element={<TransactionPage />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </div>
    </AppShell>
  )
```

Note: `minHeight: '100%'` moves from `motion.div` to the outer container div. The `motion.div` uses `position: absolute; width: 100%; top: 0` so both exiting and entering pages stack during the transition.

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | head -30
```

Expected: no errors.

- [ ] **Step 3: Run tests**

```bash
npm run test
```

Expected: all tests pass. The framer-motion mock passes through elements, so the absolute positioning has no effect in tests.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: switch to sync AnimatePresence with iOS push/pop transitions"
```

---

### Task 4: Manual verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Verify tab transitions**

Navigate between `/`, `/balance`, `/settings` using the bottom nav. Expected: smooth cross-fade, no sliding movement.

- [ ] **Step 3: Verify push transition**

From any tab, navigate into a sub-page (e.g. Settings → Wallets). Expected: new page slides in from the right while the previous page slides out to the left simultaneously.

- [ ] **Step 4: Verify pop transition**

Press the back button on a sub-page. Expected: current page slides out to the right while the previous page slides in from the left simultaneously.

- [ ] **Step 5: Verify no content clipping issues**

Scroll a long list page, then navigate away and back. Expected: content is not clipped during or after the transition.
