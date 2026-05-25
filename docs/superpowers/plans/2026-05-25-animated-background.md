# Animated Background Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the static 3-radial-gradient body background with 5 animated aurora-glow orbs that breathe (6–9s CSS keyframe cycles).

**Architecture:** A new `Background` presentational component renders 5 absolutely-positioned orb divs inside a fixed full-screen layer. Theme colors come from CSS vars (`--bg-glow-1` through `--bg-glow-5`), which are set by `applyTheme()`. Keyframe animations are defined in `index.css`.

**Tech Stack:** React, Tailwind CSS v4, CSS keyframes, Vitest + React Testing Library

---

## File Map

| Action | File | Change |
|--------|------|--------|
| Modify | `src/lib/theme.ts` | Add `bgGlow4`, `bgGlow5` to `ThemeTokens` + all 9 presets + `applyTheme` |
| Modify | `src/lib/__tests__/theme.test.ts` | Fix jade preset test, add bgGlow4/5 assertions |
| Modify | `src/index.css` | Simplify body bg, add 5 `@keyframes`, add `.orb-float-N` classes, add CSS var defaults |
| Create | `src/components/Background.tsx` | New presentational component — 5 animated orb divs |
| Create | `src/components/__tests__/Background.test.tsx` | Render test — 5 orbs present |
| Modify | `src/components/AppShell.tsx` | Import + render `<Background />` before `<main>` |
| Modify | `src/features/design/sections/SharedComponentsSection.tsx` | Add Background demo subsection |

---

### Task 1: Extend theme tokens

**Files:**
- Modify: `src/lib/theme.ts`
- Modify: `src/lib/__tests__/theme.test.ts`

- [ ] **Step 1: Update the failing test first**

Open `src/lib/__tests__/theme.test.ts`. The `'defines eight presets'` test is stale (jade was added). Also add assertions for the new tokens:

```typescript
import {
  describe,
  expect,
  it,
} from 'vitest'

import { applyTheme, themes } from '@/lib'

describe('theme utilities', () => {
  it('each theme defines income, expense, and danger tokens', () => {
    const themeKeys = Object.keys(themes) as (keyof typeof themes)[]
    for (const key of themeKeys) {
      expect(themes[key].income).toMatch(/^#[0-9a-f]{6}$/i)
      expect(themes[key].expense).toMatch(/^#[0-9a-f]{6}$/i)
      expect(themes[key].danger).toMatch(/^#[0-9a-f]{6}$/i)
    }
  })

  it('applies income, expense, and danger CSS variables', () => {
    applyTheme('forest')
    expect(document.documentElement.style.getPropertyValue('--income')).toBe('#4ade80')
    expect(document.documentElement.style.getPropertyValue('--expense')).toBe('#f87171')
    expect(document.documentElement.style.getPropertyValue('--danger')).toBe('#ef4444')
  })

  it('defines nine presets', () => {
    expect(Object.keys(themes)).toEqual([
      'forest',
      'midnight',
      'ocean',
      'sunset',
      'amber',
      'arctic',
      'sakura',
      'void',
      'jade',
    ])
  })

  it('applies CSS variables to root', () => {
    applyTheme('forest')
    expect(document.documentElement.style.getPropertyValue('--accent')).toBe('#10b981')
    expect(document.documentElement.style.getPropertyValue('--nav-border')).toBe('#10b98130')
  })

  it('each theme defines bgGlow4 and bgGlow5 tokens', () => {
    const themeKeys = Object.keys(themes) as (keyof typeof themes)[]
    for (const key of themeKeys) {
      expect(themes[key].bgGlow4).toBeDefined()
      expect(themes[key].bgGlow5).toBeDefined()
    }
  })

  it('applies bgGlow4 and bgGlow5 CSS variables', () => {
    applyTheme('forest')
    expect(document.documentElement.style.getPropertyValue('--bg-glow-4')).toBe('#10b98112')
    expect(document.documentElement.style.getPropertyValue('--bg-glow-5')).toBe('#34d39910')
  })
})
```

- [ ] **Step 2: Run tests to see failures**

```bash
npm run test -- src/lib/__tests__/theme.test.ts
```

Expected: `'defines nine presets'` PASS (jade already exists), `'each theme defines bgGlow4 and bgGlow5 tokens'` FAIL, `'applies bgGlow4 and bgGlow5 CSS variables'` FAIL.

- [ ] **Step 3: Add bgGlow4/bgGlow5 to ThemeTokens and all presets**

Replace the full content of `src/lib/theme.ts`:

```typescript
import type { ThemePreset } from '@/types/domain'

export type ThemeTokens = {
  accent: string
  accentLight: string
  bg: string
  bgGlow1: string
  bgGlow2: string
  bgGlow3: string
  bgGlow4: string
  bgGlow5: string
  accentBtn1: string
  accentBtn2: string
  navBorder: string
  income: string
  expense: string
  danger: string
}

export const themes: Record<ThemePreset, ThemeTokens> = {
  forest: {
    accent: '#10b981',
    accentLight: '#34d399',
    bg: '#0a0f0d',
    bgGlow1: '#10b98120',
    bgGlow2: '#06372520',
    bgGlow3: '#34d39915',
    bgGlow4: '#10b98112',
    bgGlow5: '#34d39910',
    accentBtn1: '#059669',
    accentBtn2: '#10b981',
    navBorder: '#10b98130',
    income: '#4ade80',
    expense: '#f87171',
    danger: '#ef4444',
  },
  midnight: {
    accent: '#6c47ff',
    accentLight: '#8b6cff',
    bg: '#090914',
    bgGlow1: '#6c47ff25',
    bgGlow2: '#1f1b4d25',
    bgGlow3: '#8b6cff15',
    bgGlow4: '#6c47ff12',
    bgGlow5: '#8b6cff10',
    accentBtn1: '#5537d7',
    accentBtn2: '#6c47ff',
    navBorder: '#6c47ff30',
    income: '#86efac',
    expense: '#fca5a5',
    danger: '#f87171',
  },
  ocean: {
    accent: '#0369a1',
    accentLight: '#38bdf8',
    bg: '#071019',
    bgGlow1: '#0369a125',
    bgGlow2: '#08334425',
    bgGlow3: '#38bdf815',
    bgGlow4: '#0369a112',
    bgGlow5: '#38bdf810',
    accentBtn1: '#075985',
    accentBtn2: '#0284c7',
    navBorder: '#0369a130',
    income: '#4ade80',
    expense: '#f87171',
    danger: '#ef4444',
  },
  sunset: {
    accent: '#be123c',
    accentLight: '#fb7185',
    bg: '#16080d',
    bgGlow1: '#be123c25',
    bgGlow2: '#7f1d1d25',
    bgGlow3: '#fb718515',
    bgGlow4: '#be123c12',
    bgGlow5: '#fb718510',
    accentBtn1: '#9f1239',
    accentBtn2: '#e11d48',
    navBorder: '#be123c30',
    income: '#4ade80',
    expense: '#fca5a5',
    danger: '#f87171',
  },
  amber: {
    accent: '#b45309',
    accentLight: '#f59e0b',
    bg: '#130d05',
    bgGlow1: '#b4530925',
    bgGlow2: '#78350f25',
    bgGlow3: '#f59e0b15',
    bgGlow4: '#b4530912',
    bgGlow5: '#f59e0b10',
    accentBtn1: '#92400e',
    accentBtn2: '#d97706',
    navBorder: '#b4530930',
    income: '#4ade80',
    expense: '#fca5a5',
    danger: '#ef4444',
  },
  arctic: {
    accent: '#334155',
    accentLight: '#94a3b8',
    bg: '#07111f',
    bgGlow1: '#64748b25',
    bgGlow2: '#0f172a30',
    bgGlow3: '#94a3b815',
    bgGlow4: '#33415512',
    bgGlow5: '#94a3b810',
    accentBtn1: '#334155',
    accentBtn2: '#475569',
    navBorder: '#94a3b830',
    income: '#86efac',
    expense: '#fca5a5',
    danger: '#f87171',
  },
  sakura: {
    accent: '#9d174d',
    accentLight: '#f472b6',
    bg: '#150811',
    bgGlow1: '#9d174d25',
    bgGlow2: '#83184325',
    bgGlow3: '#f472b615',
    bgGlow4: '#9d174d12',
    bgGlow5: '#f472b610',
    accentBtn1: '#831843',
    accentBtn2: '#be185d',
    navBorder: '#9d174d30',
    income: '#86efac',
    expense: '#fca5a5',
    danger: '#f87171',
  },
  jade: {
    accent: '#047857',
    accentLight: '#34d399',
    bg: '#020b06',
    bgGlow1: '#04785725',
    bgGlow2: '#022c1a40',
    bgGlow3: '#34d39915',
    bgGlow4: '#04785712',
    bgGlow5: '#34d39910',
    accentBtn1: '#064e3b',
    accentBtn2: '#047857',
    navBorder: '#04785730',
    income: '#6ee7b7',
    expense: '#fca5a5',
    danger: '#f87171',
  },
  void: {
    accent: '#4f46e5',
    accentLight: '#818cf8',
    bg: '#030712',
    bgGlow1: '#4f46e525',
    bgGlow2: '#1e1b4b40',
    bgGlow3: '#818cf815',
    bgGlow4: '#4f46e512',
    bgGlow5: '#818cf810',
    accentBtn1: '#3730a3',
    accentBtn2: '#4f46e5',
    navBorder: '#4f46e530',
    income: '#6ee7b7',
    expense: '#fca5a5',
    danger: '#f87171',
  },
}

export function applyTheme(preset: ThemePreset): void {
  const theme = themes[preset]
  const root = document.documentElement
  root.style.setProperty('--accent', theme.accent)
  root.style.setProperty('--accent-light', theme.accentLight)
  root.style.setProperty('--bg', theme.bg)
  root.style.setProperty('--bg-glow-1', theme.bgGlow1)
  root.style.setProperty('--bg-glow-2', theme.bgGlow2)
  root.style.setProperty('--bg-glow-3', theme.bgGlow3)
  root.style.setProperty('--bg-glow-4', theme.bgGlow4)
  root.style.setProperty('--bg-glow-5', theme.bgGlow5)
  root.style.setProperty('--accent-btn-1', theme.accentBtn1)
  root.style.setProperty('--accent-btn-2', theme.accentBtn2)
  root.style.setProperty('--nav-border', theme.navBorder)
  root.style.setProperty('--income', theme.income)
  root.style.setProperty('--expense', theme.expense)
  root.style.setProperty('--danger', theme.danger)
}
```

- [ ] **Step 4: Run tests — all pass**

```bash
npm run test -- src/lib/__tests__/theme.test.ts
```

Expected: 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/theme.ts src/lib/__tests__/theme.test.ts
git commit -m "feat: add bgGlow4/bgGlow5 tokens to all theme presets"
```

---

### Task 2: Update CSS — keyframes, animation classes, body simplification

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Replace `src/index.css` with the updated version**

```css
@import "tailwindcss";

@theme {
  --color-accent: var(--accent);
  --color-accent-light: var(--accent-light);
  --color-app-bg: var(--bg);
  --color-income: var(--income);
  --color-expense: var(--expense);
  --color-danger: var(--danger);
}

:root {
  --accent: #10b981;
  --accent-light: #34d399;
  --bg: #0a0f0d;
  --bg-glow-1: #10b98159;
  --bg-glow-2: #10b98133;
  --bg-glow-3: #10b9811a;
  --bg-glow-4: #10b98112;
  --bg-glow-5: #34d39910;
  --accent-btn-1: #059669;
  --accent-btn-2: #10b981;
  --nav-border: #10b98130;
  --income: #4ade80;
  --expense: #f87171;
  --danger: #ef4444;
  color: #f8fafc;
  background: var(--bg);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background: var(--bg);
}

button,
input,
textarea {
  font: inherit;
}

*, *::before, *::after {
  transition:
    background-color 300ms ease,
    color 300ms ease,
    border-color 300ms ease,
    box-shadow 300ms ease;
}

@keyframes orbFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(30px, -20px) scale(1.12); }
}

@keyframes orbFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-20px, 28px) scale(0.88); }
}

@keyframes orbFloat3 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(15px, 12px) scale(1.06); }
  66% { transform: translate(-12px, -8px) scale(0.94); }
}

@keyframes orbFloat4 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(-25px, -18px) scale(1.08); }
}

@keyframes orbFloat5 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(18px, 22px) scale(0.92); }
}

.orb-float-1 { animation: orbFloat1 8s ease-in-out infinite; }
.orb-float-2 { animation: orbFloat2 9s ease-in-out infinite; }
.orb-float-3 { animation: orbFloat3 7s ease-in-out infinite; }
.orb-float-4 { animation: orbFloat4 6s ease-in-out infinite; }
.orb-float-5 { animation: orbFloat5 8.5s ease-in-out infinite; }
```

- [ ] **Step 2: Run lint to confirm no issues**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/index.css
git commit -m "feat: add orb keyframes and simplify body background"
```

---

### Task 3: Create Background component

**Files:**
- Create: `src/components/Background.tsx`
- Create: `src/components/__tests__/Background.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/components/__tests__/Background.test.tsx`:

```typescript
import { render } from '@testing-library/react'
import {
  describe,
  expect,
  it,
} from 'vitest'

import { Background } from '@/components/Background'

describe('Background', () => {
  it('renders five orb elements', () => {
    const { container } = render(<Background />)
    const orbs = container.querySelectorAll('[data-orb]')
    expect(orbs).toHaveLength(5)
  })

  it('renders a fixed full-screen container', () => {
    const { container } = render(<Background />)
    const wrapper = container.firstElementChild
    expect(wrapper?.classList.contains('fixed')).toBe(true)
    expect(wrapper?.classList.contains('inset-0')).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test -- src/components/__tests__/Background.test.tsx
```

Expected: FAIL — `Background` not found.

- [ ] **Step 3: Create the Background component**

Create `src/components/Background.tsx`:

```typescript
export function Background() {
  return (
    <div
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: -1 }}
    >
      <div
        data-orb="1"
        className="absolute rounded-full orb-float-1"
        style={{
          width: 340,
          height: 340,
          top: -100,
          left: -80,
          background: 'radial-gradient(circle, var(--bg-glow-1), transparent 70%)',
          filter: 'blur(60px)',
          willChange: 'transform',
        }}
      />
      <div
        data-orb="2"
        className="absolute rounded-full orb-float-2"
        style={{
          width: 280,
          height: 280,
          top: 60,
          right: -60,
          background: 'radial-gradient(circle, var(--bg-glow-2), transparent 70%)',
          filter: 'blur(60px)',
          willChange: 'transform',
        }}
      />
      <div
        data-orb="3"
        className="absolute rounded-full orb-float-3"
        style={{
          width: 240,
          height: 240,
          bottom: -80,
          left: '20%',
          background: 'radial-gradient(circle, var(--bg-glow-3), transparent 70%)',
          filter: 'blur(60px)',
          willChange: 'transform',
        }}
      />
      <div
        data-orb="4"
        className="absolute rounded-full orb-float-4"
        style={{
          width: 200,
          height: 200,
          top: '30%',
          left: '40%',
          background: 'radial-gradient(circle, var(--bg-glow-4), transparent 70%)',
          filter: 'blur(60px)',
          willChange: 'transform',
        }}
      />
      <div
        data-orb="5"
        className="absolute rounded-full orb-float-5"
        style={{
          width: 180,
          height: 180,
          bottom: '10%',
          right: '25%',
          background: 'radial-gradient(circle, var(--bg-glow-5), transparent 70%)',
          filter: 'blur(60px)',
          willChange: 'transform',
        }}
      />
    </div>
  )
}
```

- [ ] **Step 4: Run tests — pass**

```bash
npm run test -- src/components/__tests__/Background.test.tsx
```

Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Background.tsx src/components/__tests__/Background.test.tsx
git commit -m "feat: add animated Background component with 5 aurora orbs"
```

---

### Task 4: Wire Background into AppShell

**Files:**
- Modify: `src/components/AppShell.tsx`

- [ ] **Step 1: Update AppShell to render Background**

Replace the content of `src/components/AppShell.tsx`:

```typescript
import cx from 'classnames'
import type { PropsWithChildren } from 'react'

import { BottomNav } from '@/components'
import { Background } from '@/components/Background'

type AppShellProps = PropsWithChildren<{
  showBottomNav?: boolean
}>

export function AppShell({ children, showBottomNav = true }: AppShellProps) {
  return (
    <div className="min-h-screen text-slate-50">
      <Background />
      <main
        className={cx(
          'mx-auto min-h-screen w-full max-w-107.5 px-4 pt-6',
          showBottomNav
            ? 'pb-28'
            : 'pb-6',
        )}
      >
        {children}
      </main>
      {showBottomNav
        ? <BottomNav />
        : null}
    </div>
  )
}
```

- [ ] **Step 2: Run the full test suite**

```bash
npm run test
```

Expected: all tests PASS.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/components/AppShell.tsx
git commit -m "feat: render Background in AppShell"
```

---

### Task 5: Add design sandbox entry

**Files:**
- Modify: `src/features/design/sections/SharedComponentsSection.tsx`

- [ ] **Step 1: Add Background import and SubSection demo**

Add the import at the top of `src/features/design/sections/SharedComponentsSection.tsx` (after the existing `@/components` import):

```typescript
import { Background } from '@/components/Background'
```

Add this SubSection at the top of the `return` block, just after `<div className="space-y-10">` and the `<h2>`:

```tsx
<SubSection id="background" title="Background">
  <div className="relative h-48 overflow-hidden rounded-2xl border border-white/6">
    <Background />
    <div className="relative z-10 flex h-full items-center justify-center">
      <span className="text-sm text-white/40">Animated background layer</span>
    </div>
  </div>
  <VariantLabel label="fixed aurora orbs (5 orbs, 6–9s breathe)" />
</SubSection>
```

- [ ] **Step 2: Run the full test suite**

```bash
npm run test
```

Expected: all tests PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/design/sections/SharedComponentsSection.tsx
git commit -m "feat: add Background demo to design sandbox"
```
