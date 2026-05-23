import { describe, expect, it } from 'vitest'

import { createId } from '@/lib'


describe('id utilities', () => {
  it('returns a non-empty string', () => {
    const id = createId()
    expect(typeof id).toBe('string')
    expect(id.length).toBeGreaterThan(0)
  })
})
