import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import { act, render } from '@testing-library/react'
import {
  afterEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'

import type { CategorySelectionPageProps } from '@/features/transaction/CategorySelectionPage/CategorySelectionPage'
import { CategorySelectionPage } from '@/features/transaction/CategorySelectionPage/CategorySelectionPage'
import type { Category } from '@/types/domain'

let dndHandlers: {
  onDragStart?: (event: DragStartEvent) => void
  onDragOver?: (event: DragOverEvent) => void
  onDragEnd?: (event: DragEndEvent) => void
} = {}

vi.mock('@dnd-kit/core', async () => {
  const actual = await vi.importActual<typeof import('@dnd-kit/core')>('@dnd-kit/core')

  return {
    ...actual,
    DndContext: ({
      children,
      onDragStart,
      onDragOver,
      onDragEnd,
    }: {
      children: React.ReactNode
      onDragStart?: (event: DragStartEvent) => void
      onDragOver?: (event: DragOverEvent) => void
      onDragEnd?: (event: DragEndEvent) => void
    }) => {
      dndHandlers = {
        onDragStart,
        onDragOver,
        onDragEnd,
      }

      return <div>{children}</div>
    },
    DragOverlay: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useDroppable: () => ({ setNodeRef: vi.fn() }),
    useSensor: vi.fn(),
    useSensors: vi.fn(),
  }
})

vi.mock('@dnd-kit/sortable', async () => {
  const actual = await vi.importActual<typeof import('@dnd-kit/sortable')>('@dnd-kit/sortable')

  return {
    ...actual,
    SortableContext: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    useSortable: () => ({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: undefined,
      isDragging: false,
    }),
  }
})

const categories: Category[] = [
  {
    id: 'food',
    name: 'Food',
    type: 'expense',
    level: 1,
    icon: 'fa-utensils',
    isDefault: true,
    position: 0,
  },
  {
    id: 'transport',
    name: 'Transport',
    type: 'expense',
    level: 1,
    icon: 'fa-car',
    isDefault: true,
    position: 1,
  },
]

function renderEditPage(overrides: Partial<CategorySelectionPageProps> = {}) {
  const props: CategorySelectionPageProps = {
    type: 'expense',
    isLocked: false,
    isEditMode: true,
    visible: categories,
    parentId: undefined,
    parent: undefined,
    categories,
    activeThisMonth: new Set<string>(),
    categoriesWithTransactions: new Set<string>(),
    confirmDeleteId: null,
    mergeSourceId: null,
    mergeTargetId: null,
    onTypeChange: vi.fn(),
    onBack: vi.fn(),
    onSelect: vi.fn(),
    onToggleEditMode: vi.fn(),
    onRequestDelete: vi.fn(),
    onConfirmDelete: vi.fn(),
    onCancelDelete: vi.fn(),
    onSelectMergeTarget: vi.fn(),
    onConfirmMerge: vi.fn(),
    onCancelMerge: vi.fn(),
    onEditParent: vi.fn(),
    onAddCategory: vi.fn(),
    onReorder: vi.fn(),
    onReparent: vi.fn(),
    ...overrides,
  }

  render(<CategorySelectionPage {...props} />)

  return props
}

function dragEvent(
  activeId: string,
  overId: string,
  activeRect = {
    top: 0,
    bottom: 50,
    left: 0,
    right: 50,
    width: 50,
    height: 50,
  },
): DragOverEvent & DragEndEvent {
  return {
    active: {
      id: activeId,
      rect: {
        current: {
          translated: activeRect,
        },
      },
    },
    over: {
      id: overId,
      rect: {
        top: 80,
        bottom: 130,
        left: 0,
        right: 50,
        width: 50,
        height: 50,
      },
    },
  } as DragOverEvent & DragEndEvent
}

afterEach(() => {
  dndHandlers = {}
  vi.useRealTimers()
})

describe('CategorySelectionPage drag edit mode', () => {
  it('reorders instead of reparenting when lingering near but not overlapping another category', () => {
    vi.useFakeTimers()
    const props = renderEditPage()

    act(() => {
      dndHandlers.onDragStart?.({ active: { id: 'food' } } as DragStartEvent)
      dndHandlers.onDragOver?.(dragEvent('food', 'transport'))
      vi.advanceTimersByTime(400)
      dndHandlers.onDragEnd?.(dragEvent('food', 'transport'))
    })

    expect(props.onReparent).not.toHaveBeenCalled()
    expect(props.onReorder).toHaveBeenCalledWith(['transport', 'food'])
  })

  it('reparents when the dragged category lingers while overlapping another category', () => {
    vi.useFakeTimers()
    const props = renderEditPage()
    const overlappingRect = {
      top: 90,
      bottom: 140,
      left: 0,
      right: 50,
      width: 50,
      height: 50,
    }

    act(() => {
      dndHandlers.onDragStart?.({ active: { id: 'food' } } as DragStartEvent)
      dndHandlers.onDragOver?.(dragEvent('food', 'transport', overlappingRect))
      vi.advanceTimersByTime(400)
      dndHandlers.onDragEnd?.(dragEvent('food', 'transport', overlappingRect))
    })

    expect(props.onReparent).toHaveBeenCalledWith('food', 'transport')
    expect(props.onReorder).not.toHaveBeenCalled()
  })
})
