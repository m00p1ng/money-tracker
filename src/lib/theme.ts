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
  incomeText: string
  expense: string
  expenseText: string
  danger: string
}

export const themes: Record<ThemePreset, ThemeTokens> = {
  forest: {
    accent: '#10b981',
    accentLight: '#34d399',
    bg: '#0a0f0d',
    bgGlow1: '#10b98150',
    bgGlow2: '#06372540',
    bgGlow3: '#34d39930',
    bgGlow4: '#10b98128',
    bgGlow5: '#34d39920',
    accentBtn1: '#059669',
    accentBtn2: '#10b981',
    navBorder: '#10b98130',
    income: '#4ade80',
    incomeText: '#052e16',
    expense: '#f87171',
    expenseText: '#450a0a',
    danger: '#ef4444',
  },
  midnight: {
    accent: '#6c47ff',
    accentLight: '#8b6cff',
    bg: '#090914',
    bgGlow1: '#6c47ff55',
    bgGlow2: '#1f1b4d50',
    bgGlow3: '#8b6cff35',
    bgGlow4: '#6c47ff28',
    bgGlow5: '#8b6cff20',
    accentBtn1: '#5537d7',
    accentBtn2: '#6c47ff',
    navBorder: '#6c47ff30',
    income: '#86efac',
    incomeText: '#052e16',
    expense: '#fca5a5',
    expenseText: '#450a0a',
    danger: '#f87171',
  },
  ocean: {
    accent: '#0369a1',
    accentLight: '#38bdf8',
    bg: '#071019',
    bgGlow1: '#0369a155',
    bgGlow2: '#08334450',
    bgGlow3: '#38bdf835',
    bgGlow4: '#0369a128',
    bgGlow5: '#38bdf820',
    accentBtn1: '#075985',
    accentBtn2: '#0284c7',
    navBorder: '#0369a130',
    income: '#4ade80',
    incomeText: '#052e16',
    expense: '#f87171',
    expenseText: '#450a0a',
    danger: '#ef4444',
  },
  sunset: {
    accent: '#be123c',
    accentLight: '#fb7185',
    bg: '#16080d',
    bgGlow1: '#be123c55',
    bgGlow2: '#7f1d1d50',
    bgGlow3: '#fb718535',
    bgGlow4: '#be123c28',
    bgGlow5: '#fb718520',
    accentBtn1: '#9f1239',
    accentBtn2: '#e11d48',
    navBorder: '#be123c30',
    income: '#4ade80',
    incomeText: '#052e16',
    expense: '#fca5a5',
    expenseText: '#450a0a',
    danger: '#f87171',
  },
  amber: {
    accent: '#b45309',
    accentLight: '#f59e0b',
    bg: '#130d05',
    bgGlow1: '#b4530955',
    bgGlow2: '#78350f50',
    bgGlow3: '#f59e0b35',
    bgGlow4: '#b4530928',
    bgGlow5: '#f59e0b20',
    accentBtn1: '#92400e',
    accentBtn2: '#d97706',
    navBorder: '#b4530930',
    income: '#4ade80',
    incomeText: '#052e16',
    expense: '#fca5a5',
    expenseText: '#450a0a',
    danger: '#ef4444',
  },
  arctic: {
    accent: '#334155',
    accentLight: '#94a3b8',
    bg: '#07111f',
    bgGlow1: '#64748b50',
    bgGlow2: '#0f172a55',
    bgGlow3: '#94a3b835',
    bgGlow4: '#33415528',
    bgGlow5: '#94a3b820',
    accentBtn1: '#334155',
    accentBtn2: '#475569',
    navBorder: '#94a3b830',
    income: '#86efac',
    incomeText: '#052e16',
    expense: '#fca5a5',
    expenseText: '#450a0a',
    danger: '#f87171',
  },
  sakura: {
    accent: '#9d174d',
    accentLight: '#f472b6',
    bg: '#150811',
    bgGlow1: '#9d174d55',
    bgGlow2: '#83184350',
    bgGlow3: '#f472b635',
    bgGlow4: '#9d174d28',
    bgGlow5: '#f472b620',
    accentBtn1: '#831843',
    accentBtn2: '#be185d',
    navBorder: '#9d174d30',
    income: '#86efac',
    incomeText: '#052e16',
    expense: '#fca5a5',
    expenseText: '#450a0a',
    danger: '#f87171',
  },
  jade: {
    accent: '#047857',
    accentLight: '#34d399',
    bg: '#020b06',
    bgGlow1: '#04785755',
    bgGlow2: '#022c1a60',
    bgGlow3: '#34d39935',
    bgGlow4: '#04785728',
    bgGlow5: '#34d39920',
    accentBtn1: '#064e3b',
    accentBtn2: '#047857',
    navBorder: '#04785730',
    income: '#6ee7b7',
    incomeText: '#052e16',
    expense: '#fca5a5',
    expenseText: '#450a0a',
    danger: '#f87171',
  },
  void: {
    accent: '#4f46e5',
    accentLight: '#818cf8',
    bg: '#030712',
    bgGlow1: '#4f46e555',
    bgGlow2: '#1e1b4b60',
    bgGlow3: '#818cf835',
    bgGlow4: '#4f46e528',
    bgGlow5: '#818cf820',
    accentBtn1: '#3730a3',
    accentBtn2: '#4f46e5',
    navBorder: '#4f46e530',
    income: '#6ee7b7',
    incomeText: '#052e16',
    expense: '#fca5a5',
    expenseText: '#450a0a',
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
  root.style.setProperty('--income-text', theme.incomeText)
  root.style.setProperty('--expense', theme.expense)
  root.style.setProperty('--expense-text', theme.expenseText)
  root.style.setProperty('--danger', theme.danger)
}
