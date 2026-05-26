import React from 'react'
import '@testing-library/jest-dom/vitest'
import 'fake-indexeddb/auto'
import { vi } from 'vitest'

vi.mock('@dnd-kit/core', async () => {
  const actual = await vi.importActual<typeof import('@dnd-kit/core')>('@dnd-kit/core')
  return {
    ...actual,
    DndContext: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
  }
})

vi.mock('@dnd-kit/sortable', async () => {
  const actual = await vi.importActual<typeof import('@dnd-kit/sortable')>('@dnd-kit/sortable')
  return {
    ...actual,
    SortableContext: ({ children }: { children: React.ReactNode }) => React.createElement('div', null, children),
    useSortable: () => ({
      attributes: {},
      listeners: {},
      setNodeRef: () => {},
      transform: null,
      transition: undefined,
      isDragging: false,
    }),
  }
})

vi.mock('framer-motion', () => {
  const passthrough =
    (tag: string) =>
      React.forwardRef((
        { children, ...props }: React.HTMLAttributes<HTMLElement> & Record<string, unknown>,
        ref: React.Ref<HTMLElement>,
      ) =>
        React.createElement(tag, { ...props, ref }, children))

  return {
    motion: new Proxy(
      {},
      { get: (_t, prop: string) => passthrough(prop) },
    ),
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
    animate: (
      value: { set?: (next: number) => void },
      next: number,
    ) => {
      value.set?.(next)

      return { stop: vi.fn() }
    },
    useMotionValue: (initial: number) => {
      let value = initial

      return {
        get: () => value,
        set: (next: number) => {
          value = next
        },
      }
    },
    useReducedMotion: () => false,
    useTransform: () => 0,
  }
})
