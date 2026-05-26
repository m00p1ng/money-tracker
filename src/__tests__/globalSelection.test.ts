import {
  describe,
  expect,
  it,
} from 'vitest'

import stylesheet from '@/index.css?raw'

describe('global text selection styles', () => {
  it('disables user selection across the web app', () => {
    expect(stylesheet).toMatch(/\*\s*,\s*\*::before\s*,\s*\*::after\s*{[^}]*user-select:\s*none/s)
  })
})
