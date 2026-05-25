# Remove Category Color Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the `color` field entirely from the `Category` type and all associated UI and seed data.

**Architecture:** Strip `color` from the domain type, remove all color-based styling in category UI components, and clean up the seed data. `hexToRgba` is retained because it is used by wallet components.

**Tech Stack:** TypeScript, React, Dexie (IndexedDB), Vitest

---

### Task 1: Remove `color` from the `Category` type

**Files:**
- Modify: `src/types/domain.ts:49-58`

- [ ] **Step 1: Remove the `color` field**

In `src/types/domain.ts`, change the `Category` type from:

```ts
export type Category = {
  id: string
  name: string
  type: TransactionType
  parentId?: string
  level: 1 | 2 | 3 | 4 | 5
  icon: string
  color: string
  isDefault: boolean
}
```

to:

```ts
export type Category = {
  id: string
  name: string
  type: TransactionType
  parentId?: string
  level: 1 | 2 | 3 | 4 | 5
  icon: string
  isDefault: boolean
}
```

- [ ] **Step 2: Run typecheck to see all breakage sites**

```bash
npm run typecheck 2>&1 | head -60
```

Expected: Several errors pointing to files that reference `category.color` or `form.color`. Note them — they will be fixed in subsequent tasks.

---

### Task 2: Remove color from `CategoryFormPage`

**Files:**
- Modify: `src/features/settings/CategoryFormPage/CategoryFormPage.tsx`

- [ ] **Step 1: Remove `color` default and `hexToRgba` import**

In `src/features/settings/CategoryFormPage/CategoryFormPage.tsx`:

Change the import on line 17 from:
```ts
import { createId, hexToRgba } from '@/lib'
```
to:
```ts
import { createId } from '@/lib'
```

Remove `color: '#10b981',` from the `useState` initializer (lines 40-48):

```ts
const [form, setForm] = useState<Category>(() => existing ?? {
  id: createId(),
  name: '',
  type: 'expense',
  level: 1,
  icon: 'fa-circle',
  isDefault: false,
})
```

- [ ] **Step 2: Remove color styling from icon preview badge**

Replace the `<div>` with inline color styles (lines 64-72):

```tsx
<div
  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] text-base"
  style={{
    background: hexToRgba(form.color, 0.15),
    color: form.color,
  }}
>
  <Icon name={form.icon} />
</div>
```

with:

```tsx
<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-white/10 text-base text-slate-50">
  <Icon name={form.icon} />
</div>
```

- [ ] **Step 3: Run typecheck**

```bash
npm run typecheck 2>&1 | grep CategoryFormPage
```

Expected: No errors for this file.

---

### Task 3: Remove color from `CategorySelectionPage`

**Files:**
- Modify: `src/features/transaction/CategorySelectionPage/CategorySelectionPage.tsx`

- [ ] **Step 1: Remove color styling from category grid cells**

In `src/features/transaction/CategorySelectionPage/CategorySelectionPage.tsx`, find the `<span>` around line 76-79:

```tsx
<span
  className="grid h-11 w-11 place-items-center rounded-xl text-xl"
  style={{ backgroundColor: `${category.color}25`, color: category.color }}
>
```

Replace with:

```tsx
<span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-xl text-slate-50">
```

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck 2>&1 | grep CategorySelection
```

Expected: No errors for this file.

---

### Task 4: Remove color from seed data

**Files:**
- Modify: `src/db/seed.ts`

- [ ] **Step 1: Remove all `color` properties from seed categories**

Open `src/db/seed.ts` and remove every `color: '...'` line from all category objects. There should be one per category entry.

- [ ] **Step 2: Run typecheck**

```bash
npm run typecheck 2>&1 | grep seed
```

Expected: No errors for this file.

---

### Task 5: Full verification and commit

- [ ] **Step 1: Run full typecheck**

```bash
npm run typecheck
```

Expected: No errors.

- [ ] **Step 2: Run lint with autofix**

```bash
npm run lint -- --fix
```

Expected: No errors.

- [ ] **Step 3: Run tests**

```bash
npm run test
```

Expected: All tests pass.

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 5: Commit**

```bash
git add src/types/domain.ts \
  src/features/settings/CategoryFormPage/CategoryFormPage.tsx \
  src/features/transaction/CategorySelectionPage/CategorySelectionPage.tsx \
  src/db/seed.ts
git commit -m "feat: remove color field from Category"
```
