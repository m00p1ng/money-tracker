import { describe, expect, it } from 'vitest'
import { applyTheme, themes } from '../theme'

describe('theme utilities', () => {
  it('defines eight presets', () => {
    expect(Object.keys(themes)).toEqual([
      'forest',
      'midnight',
      'ocean',
      'sunset',
      'amber',
      'arctic',
      'sakura',
      'void',
    ])
  })

  it('applies CSS variables to root', () => {
    applyTheme('forest')
    expect(document.documentElement.style.getPropertyValue('--accent')).toBe('#10b981')
    expect(document.documentElement.style.getPropertyValue('--nav-border')).toBe('#10b98130')
  })
})
