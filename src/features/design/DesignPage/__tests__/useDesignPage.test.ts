import {
  describe,
  expect,
  it,
} from 'vitest'

import { collectDesignNavItems } from '../useDesignPage'

describe('collectDesignNavItems', () => {
  it('collects nav items from rendered design section markers', () => {
    const root = document.createElement('div')
    root.innerHTML = `
      <section id="first" data-design-section data-design-section-label="First Section"></section>
      <section id="removed-from-registry" data-design-section data-design-section-label="Live Only"></section>
    `

    expect(collectDesignNavItems(root)).toEqual([
      { id: 'first', label: 'First Section' },
      { id: 'removed-from-registry', label: 'Live Only' },
    ])
  })
})
