import {
  act,
  cleanup,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router'
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import {
  collectDesignNavItems,
  useDesignPage,
} from '../useDesignPage'

type ObserverCallback = IntersectionObserverCallback

const observerCallbacks: ObserverCallback[] = []

class MockIntersectionObserver {
  readonly root: Element | Document | null
  readonly rootMargin = ''
  readonly thresholds = []
  readonly callback: ObserverCallback

  constructor(callback: ObserverCallback, options?: IntersectionObserverInit) {
    this.callback = callback
    this.root = options?.root ?? null
    observerCallbacks.push(callback)
  }

  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
}

function DesignPageHarness() {
  const {
    activeId,
    contentRef,
  } = useDesignPage()

  return React.createElement(
    React.Fragment,
    null,
    React.createElement('div', { 'data-testid': 'active-id' }, activeId),
    React.createElement(
      'div',
      { ref: contentRef },
      React.createElement('section', {
        id: 'colors',
        'data-design-section': true,
        'data-design-section-label': 'Colors',
      }),
      React.createElement('section', {
        id: 'typography',
        'data-design-section': true,
        'data-design-section-label': 'Typography',
      }),
    ),
  )
}

afterEach(() => {
  cleanup()
  observerCallbacks.length = 0
  vi.unstubAllGlobals()
})

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

describe('useDesignPage', () => {
  it('keeps the first onscreen section active when multiple sections intersect', async () => {
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)

    render(React.createElement(
      MemoryRouter,
      { initialEntries: ['/design/tokens'] },
      React.createElement(DesignPageHarness),
    ),
    )

    await waitFor(() => expect(observerCallbacks.length).toBeGreaterThanOrEqual(2))

    act(() => {
      observerCallbacks[0]([
        { isIntersecting: true } as IntersectionObserverEntry,
      ], {} as IntersectionObserver)
      observerCallbacks[1]([
        { isIntersecting: true } as IntersectionObserverEntry,
      ], {} as IntersectionObserver)
    })

    expect(screen.getByTestId('active-id')).toHaveTextContent('colors')
  })
})
