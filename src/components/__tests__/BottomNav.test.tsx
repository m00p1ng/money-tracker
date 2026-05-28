import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import { BottomNav } from '@/components/BottomNav/BottomNav'

describe('BottomNav', () => {
  it('reserves safe-area padding around the fixed navigation', () => {
    const markup = renderToStaticMarkup(
      <MemoryRouter>
        <BottomNav pathname="/" onSettingsPress={vi.fn()} />
      </MemoryRouter>,
    )

    expect(markup).toContain('padding-right:env(safe-area-inset-right, 0px)')
    expect(markup).toContain('padding-bottom:calc(0.75rem + env(safe-area-inset-bottom, 0px))')
    expect(markup).toContain('padding-left:env(safe-area-inset-left, 0px)')
  })
})
