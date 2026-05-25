import { render } from '@testing-library/react'
import {
  describe,
  expect,
  it,
} from 'vitest'

import { Background } from '@/components/Background'

describe('Background', () => {
  it('renders five orb elements', () => {
    const { container } = render(<Background />)
    const orbs = container.querySelectorAll('[data-orb]')
    expect(orbs).toHaveLength(5)
  })

  it('renders a fixed full-screen container', () => {
    const { container } = render(<Background />)
    const wrapper = container.firstElementChild
    expect(wrapper?.classList.contains('fixed')).toBe(true)
    expect(wrapper?.classList.contains('inset-0')).toBe(true)
  })
})
