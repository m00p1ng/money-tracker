import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'

import {
  ConfirmSheet,
  Icon,
  TypePickerDropdown,
} from '@/components'
import { PageHeader } from '@/components/shared/PageHeader'
import type { Category } from '@/types/domain'

import { MergeTargetSheet } from './MergeTargetSheet'

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
}

const cellVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 380,
      damping: 28,
    },
  },
}

export interface CategorySelectionPageProps {
  type: 'expense' | 'income'
  isLocked: boolean
  isEditMode: boolean
  visible: Category[]
  parentId: string | undefined
  parent: Category | undefined
  categories: Category[]
  confirmDeleteId: string | null
  mergeSourceId: string | null
  mergeTargetId: string | null
  onTypeChange: (newType: 'expense' | 'income' | 'transfer') => void
  onBack: () => void
  onSelect: (category: Category) => void
  onToggleEditMode: () => void
  onRequestDelete: (id: string) => void
  onConfirmDelete: () => void
  onCancelDelete: () => void
  onSelectMergeTarget: (targetId: string) => void
  onConfirmMerge: () => void
  onCancelMerge: () => void
  onEditParent: () => void
  onReorder: (ids: string[]) => void
  onReparent: (id: string, newParentId: string) => void
}

interface SortableCategoryCellProps {
  category: Category
  index: number
  isEditMode: boolean
  isReparentTarget: boolean
  onRequestDelete: (id: string) => void
  onSelect: (category: Category) => void
}

function SortableCategoryCell({
  category,
  index,
  isEditMode,
  isReparentTarget,
  onRequestDelete,
  onSelect,
}: SortableCategoryCellProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...(isEditMode
        ? { ...attributes, ...listeners }
        : {})}
      variants={cellVariants}
      className="relative"
    >
      <motion.div
        animate={
          isEditMode && !isDragging
            ? {
              rotate: [-1.5, 1.5, -1.5],
              transition: {
                repeat: Infinity,
                duration: 0.45,
                ease: 'easeInOut',
                delay: index * 0.06,
              },
            }
            : { rotate: 0 }
        }
        className="relative"
      >
        {isEditMode && (
          <button
            aria-label={`Remove ${category.name}`}
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation(); onRequestDelete(category.id)
            }}
            className={[
              'absolute -left-1.5 -top-1.5 z-10 flex h-[18px] w-[18px]',
              'items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white',
            ].join(' ')}
          >
            ×
          </button>
        )}
        <button
          onClick={() => onSelect(category)}
          type="button"
          className={[
            'flex w-full flex-col items-center gap-3 rounded-2xl',
            'border px-2 py-3.5',
            isDragging
              ? 'border-dashed border-white/20 bg-white/2 opacity-40'
              : '',
            isReparentTarget
              ? 'border-blue-400/60 bg-blue-400/10'
              : isDragging
                ? ''
                : 'border-white/[0.07] bg-white/4',
          ].join(' ')}
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-xl text-slate-50">
            <Icon name={category.icon} />
          </span>
          <span className="text-center text-[12px] font-semibold leading-tight">{category.name}</span>
        </button>
      </motion.div>
    </motion.div>
  )
}

export function CategorySelectionPage({
  type,
  isLocked,
  isEditMode,
  visible,
  parentId,
  parent,
  categories,
  confirmDeleteId,
  mergeSourceId,
  mergeTargetId,
  onTypeChange,
  onBack,
  onSelect,
  onToggleEditMode,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  onSelectMergeTarget,
  onConfirmMerge,
  onCancelMerge,
  onEditParent,
  onReorder,
  onReparent,
}: CategorySelectionPageProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [reparentTargetId, setReparentTargetId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
    setReparentTargetId(null)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event
    if (!over || over.id === active.id) {
      setReparentTargetId(null)

      return
    }
    const activeRect = active.rect.current.translated
    const overRect = over.rect
    if (activeRect && overRect) {
      const overCenterX = overRect.left + overRect.width / 2
      const overCenterY = overRect.top + overRect.height / 2
      const activeCenterX = activeRect.left + activeRect.width / 2
      const activeCenterY = activeRect.top + activeRect.height / 2
      const dx = Math.abs(activeCenterX - overCenterX)
      const dy = Math.abs(activeCenterY - overCenterY)
      if (dx < overRect.width * 0.35 && dy < overRect.height * 0.35) {
        setReparentTargetId(over.id as string)

        return
      }
    }
    setReparentTargetId(null)
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (!over || active.id === over.id) {
      setReparentTargetId(null)

      return
    }

    if (reparentTargetId && reparentTargetId !== active.id) {
      onReparent(active.id as string, reparentTargetId)
      setReparentTargetId(null)

      return
    }

    setReparentTargetId(null)
    const oldIndex = visible.findIndex((c) => c.id === active.id)
    const newIndex = visible.findIndex((c) => c.id === over.id)
    if (oldIndex !== newIndex) {
      const newOrder = arrayMove(visible, oldIndex, newIndex)
      onReorder(newOrder.map((c) => c.id))
    }
  }

  const activeCategory = visible.find((c) => c.id === activeId)

  const editButton = (
    <button
      type="button"
      onClick={onToggleEditMode}
      className={[
        'flex h-9 items-center justify-center rounded-lg px-3',
        'text-sm font-medium text-slate-300 active:bg-white/5',
      ].join(' ')}
    >
      Edit
    </button>
  )

  const doneButton = (
    <button
      type="button"
      onClick={onToggleEditMode}
      className="flex h-9 items-center justify-center rounded-lg px-3 text-sm font-semibold active:bg-white/5"
      style={{ color: 'var(--accent-light)' }}
    >
      Done
    </button>
  )

  const grid = (
    <motion.div
      key={`${parentId ?? 'root'}-${type}`}
      variants={gridVariants}
      initial="hidden"
      animate="visible"
      exit={{
        opacity: 0, x: -16, transition: { duration: 0.15 },
      }}
      className="grid grid-cols-3 gap-2.5"
    >
      {visible.map((category, index) => (
        isEditMode
          ? (
            <SortableCategoryCell
              key={category.id}
              category={category}
              index={index}
              isEditMode={isEditMode}
              isReparentTarget={reparentTargetId === category.id}
              onRequestDelete={onRequestDelete}
              onSelect={onSelect}
            />
          )
          : (
            <motion.button
              key={category.id}
              variants={cellVariants}
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(category)}
              type="button"
              className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/4 px-2 py-3.5"
            >
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-xl text-slate-50">
                <Icon name={category.icon} />
              </span>
              <span className="text-center text-[12px] font-semibold leading-tight">{category.name}</span>
            </motion.button>
          )
      ))}
    </motion.div>
  )

  return (
    <div className="space-y-4">
      <PageHeader
        title={<TypePickerDropdown value={type} onChange={onTypeChange} locked={isLocked} />}
        onBack={onBack}
        rightSlot={isEditMode
          ? doneButton
          : editButton}
      />

      {parent && (
        <div
          role={isEditMode
            ? 'button'
            : undefined}
          onClick={isEditMode
            ? onEditParent
            : undefined}
          className={[
            'flex items-center gap-3 px-1 text-lg font-bold text-slate-100',
            isEditMode
              ? 'cursor-pointer active:opacity-70'
              : '',
          ].join(' ')}
        >
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-xl">
            <Icon name={parent.icon} />
          </span>
          <span>{parent.name}</span>
        </div>
      )}

      <AnimatePresence mode="wait">
        {isEditMode
          ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={visible.map((c) => c.id)} strategy={rectSortingStrategy}>
                {grid}
              </SortableContext>
              <DragOverlay>
                {activeCategory && (
                  <div className={[
                    'flex flex-col items-center gap-3 rounded-2xl border',
                    'border-blue-400/40 bg-slate-800/90 px-2 py-3.5 opacity-90 shadow-xl',
                  ].join(' ')}>
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-white/10 text-xl text-slate-50">
                      <Icon name={activeCategory.icon} />
                    </span>
                    <span className="text-center text-[12px] font-semibold leading-tight">
                      {activeCategory.name}
                    </span>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          )
          : grid}
      </AnimatePresence>

      <ConfirmSheet
        isOpen={confirmDeleteId !== null}
        title={`Delete "${categories.find((c) => c.id === confirmDeleteId)?.name ?? ''}"?`}
        primaryLabel="Delete"
        onPrimary={onConfirmDelete}
        onCancel={onCancelDelete}
      />

      <MergeTargetSheet
        isOpen={mergeSourceId !== null && mergeTargetId === null}
        sourceId={mergeSourceId}
        categories={categories}
        onSelect={onSelectMergeTarget}
        onCancel={onCancelMerge}
      />

      <ConfirmSheet
        isOpen={mergeTargetId !== null}
        title={`Merge "${categories.find((c) => c.id === mergeSourceId)?.name ?? ''}" into "${categories.find((c) => c.id === mergeTargetId)?.name ?? ''}"?`}
        description="All transactions will be moved and the category will be deleted."
        primaryLabel="Merge & Delete"
        onPrimary={onConfirmMerge}
        onCancel={onCancelMerge}
      />
    </div>
  )
}
