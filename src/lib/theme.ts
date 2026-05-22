import type { ThemePreset } from '../types/domain'

export type ThemeTokens = {
  accent: string
  accentLight: string
  bg: string
  bgGlow1: string
  bgGlow2: string
  accentBtn1: string
  accentBtn2: string
  navBorder: string
}

export const themes: Record<ThemePreset, ThemeTokens> = {
  forest: {
    accent: '#10b981',
    accentLight: '#34d399',
    bg: '#0a0f0d',
    bgGlow1: '#10b98120',
    bgGlow2: '#06372520',
    accentBtn1: '#059669',
    accentBtn2: '#10b981',
    navBorder: '#10b98130',
  },
  midnight: {
    accent: '#6c47ff',
    accentLight: '#8b6cff',
    bg: '#090914',
    bgGlow1: '#6c47ff25',
    bgGlow2: '#1f1b4d25',
    accentBtn1: '#5537d7',
    accentBtn2: '#6c47ff',
    navBorder: '#6c47ff30',
  },
  ocean: {
    accent: '#0369a1',
    accentLight: '#38bdf8',
    bg: '#071019',
    bgGlow1: '#0369a125',
    bgGlow2: '#08334425',
    accentBtn1: '#075985',
    accentBtn2: '#0284c7',
    navBorder: '#0369a130',
  },
  sunset: {
    accent: '#be123c',
    accentLight: '#fb7185',
    bg: '#16080d',
    bgGlow1: '#be123c25',
    bgGlow2: '#7f1d1d25',
    accentBtn1: '#9f1239',
    accentBtn2: '#e11d48',
    navBorder: '#be123c30',
  },
  amber: {
    accent: '#b45309',
    accentLight: '#f59e0b',
    bg: '#130d05',
    bgGlow1: '#b4530925',
    bgGlow2: '#78350f25',
    accentBtn1: '#92400e',
    accentBtn2: '#d97706',
    navBorder: '#b4530930',
  },
  arctic: {
    accent: '#334155',
    accentLight: '#94a3b8',
    bg: '#07111f',
    bgGlow1: '#64748b25',
    bgGlow2: '#0f172a30',
    accentBtn1: '#334155',
    accentBtn2: '#475569',
    navBorder: '#94a3b830',
  },
  sakura: {
    accent: '#9d174d',
    accentLight: '#f472b6',
    bg: '#150811',
    bgGlow1: '#9d174d25',
    bgGlow2: '#83184325',
    accentBtn1: '#831843',
    accentBtn2: '#be185d',
    navBorder: '#9d174d30',
  },
  void: {
    accent: '#111827',
    accentLight: '#6b7280',
    bg: '#030712',
    bgGlow1: '#37415125',
    bgGlow2: '#11182740',
    accentBtn1: '#111827',
    accentBtn2: '#1f2937',
    navBorder: '#6b728030',
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
  root.style.setProperty('--accent-btn-1', theme.accentBtn1)
  root.style.setProperty('--accent-btn-2', theme.accentBtn2)
  root.style.setProperty('--nav-border', theme.navBorder)
}
