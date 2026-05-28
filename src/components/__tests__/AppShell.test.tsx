import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import {
  describe,
  expect,
  it,
} from 'vitest'

import { AppShell } from '@/components'

describe('AppShell', () => {
  it('applies iOS safe-area padding when bottom navigation is visible', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <AppShell>
          <div>Page content</div>
        </AppShell>
      </MemoryRouter>,
    )

    expect(markup).toContain('padding-top:calc(1.5rem + env(safe-area-inset-top, 0px))')
    expect(markup).toContain('padding-right:calc(1rem + env(safe-area-inset-right, 0px))')
    expect(markup).toContain('padding-bottom:calc(7rem + env(safe-area-inset-bottom, 0px))')
    expect(markup).toContain('padding-left:calc(1rem + env(safe-area-inset-left, 0px))')
  })

  it('keeps safe-area bottom padding when bottom navigation is hidden', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <AppShell showBottomNav={false}>
          <div>Page content</div>
        </AppShell>
      </MemoryRouter>,
    )

    expect(markup).toContain('padding-bottom:calc(1.5rem + env(safe-area-inset-bottom, 0px))')
  })
})
