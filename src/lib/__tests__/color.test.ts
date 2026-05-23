import { describe, it, expect } from 'vitest'

import { hexToRgba } from '@/lib'


describe('hexToRgba', () => {
  it('converts a hex color to rgba', () => {
    expect(hexToRgba('#10b981', 0.15)).toBe('rgba(16,185,129,0.15)')
  })

  it('handles full opacity', () => {
    expect(hexToRgba('#ffffff', 1)).toBe('rgba(255,255,255,1)')
  })

  it('handles zero opacity', () => {
    expect(hexToRgba('#000000', 0)).toBe('rgba(0,0,0,0)')
  })
})
