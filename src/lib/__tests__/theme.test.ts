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
      'jade',
      'void',
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
