import React from 'react'
import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
import { vi } from 'vitest'

vi.mock('framer-motion', () => {
  const passthrough =
    (tag: string) =>
      React.forwardRef(({ children, ...props }: React.HTMLAttributes<HTMLElement> & Record<string, unknown>, ref: React.Ref<HTMLElement>) =>
        React.createElement(tag, { ...props, ref }, children),
      )
  return {
    motion: new Proxy(
      {},
      { get: (_t, prop: string) => passthrough(prop) },
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    useReducedMotion: () => false,
  }
})
