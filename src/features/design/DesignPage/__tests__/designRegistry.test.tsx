import {
  cleanup,
  render,
} from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import {
  afterEach,
  describe,
  expect,
  it,
} from 'vitest'

import { DESIGN_GROUPS } from '../designRegistry'

afterEach(cleanup)

describe('DESIGN_GROUPS', () => {
  it('keeps sidebar items aligned with rendered section ids', () => {
    for (const group of DESIGN_GROUPS) {
      const SectionComponent = group.component

      render(
        <MemoryRouter>
          <SectionComponent />
        </MemoryRouter>,
      )

      for (const item of group.items) {
        expect(
          document.getElementById(item.id),
          `${group.slug} missing section id "${item.id}" for sidebar label "${item.label}"`,
        ).not.toBeNull()
      }

      cleanup()
    }
  })
})
