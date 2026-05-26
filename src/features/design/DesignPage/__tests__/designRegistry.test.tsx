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
  it('combines UI and shared components in one components group', () => {
    const componentGroup = DESIGN_GROUPS.find((group) => group.slug === 'components')

    expect(DESIGN_GROUPS.map((group) => group.slug)).not.toContain('ui-components')
    expect(DESIGN_GROUPS.map((group) => group.slug)).not.toContain('shared-components')
    expect(componentGroup?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'button', label: 'Button' }),
        expect.objectContaining({ id: 'background', label: 'Background' }),
        expect.objectContaining({ id: 'selector-sheet', label: 'SelectorSheet' }),
      ]),
    )
  })

  it('includes wallet summary card in balance components', () => {
    const balanceGroup = DESIGN_GROUPS.find((group) => group.slug === 'feature-balance')

    expect(balanceGroup?.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'wallet-summary-card',
          label: 'WalletSummaryCard',
        }),
      ]),
    )
  })

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
