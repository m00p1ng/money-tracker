import {
  closestCenter,
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useDroppable,
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
import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  ConfirmSheet,
  Icon,
  PageHeader,
  TypePickerDropdown,
} from '@/components'
import type {
  Category,
  TransactionType,
} from '@/types/domain'

import { MergeTargetSheet } from './MergeTargetSheet'

const PARENT_DROP_ID = '__category-parent-drop__'

type RectLike = {
  top: number
  bottom: number
  left: number
  right: number
}

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

function rectsOverlap(first: RectLike | null | undefined, second: RectLike | null | undefined) {
  if (!first || !second) {
    return false
  }

  return first.left < second.right
    && first.right > second.left
    && first.top < second.bottom
    && first.bottom > second.top
}

export interface CategorySelectionPageProps {
  type: 'expense' | 'income'
  isLocked: boolean
  isEditMode: boolean
  visible: Category[]
  parentId: string | undefined
  parent: Category | undefined
  categories: Category[]
  activeThisMonth: Set<string>
  categoriesWithTransactions: Set<string>
  confirmDeleteId: string | null
  mergeSourceId: string | null
  mergeTargetId: string | null
  onTypeChange: (newType: TransactionType) => void
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
  onAddCategory: () => void
  onReorder: (ids: string[]) => void
  onReparent: (id: string, newParentId: string | undefined) => void
}

interface SortableCategoryCellProps {
  category: Category
  index: number
  isEditMode: boolean
  isActive: boolean
  isReparentTarget: boolean
  onRequestDelete: (id: string) => void
  onSelect: (category: Category) => void
}

function SortableCategoryCell({
  category,
  index,
  isEditMode,
  isActive,
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
    <div
      ref={setNodeRef}
      style={style}
      {...(isEditMode
        ? { ...attributes, ...listeners }
        : {})}
      className="relative"
    >
      <motion.div
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
                'absolute -left-1.5 -top-1.5 z-10 flex h-4.5 w-4.5',
                'items-center justify-center rounded-full bg-red-500 text-white',
              ].join(' ')}
            >
              <Icon name="fa-xmark" className="text-[10px]" />
            </button>
          )}
          <motion.button
            onClick={() => onSelect(category)}
            type="button"
            animate={isReparentTarget
              ? { scale: 1.05 }
              : { scale: 1 }}
            transition={{
              type: 'spring', stiffness: 400, damping: 25,
            }}
            style={
              isReparentTarget
                ? {
                  borderColor: 'color-mix(in srgb, var(--accent) 60%, transparent)',
                  backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                  boxShadow: '0 0 16px color-mix(in srgb, var(--accent) 35%, transparent)',
                }
                : isActive
                  ? {
                    borderColor: 'color-mix(in srgb, var(--accent) 50%, transparent)',
                    backgroundColor: 'color-mix(in srgb, var(--accent) 6%, transparent)',
                    boxShadow: [
                      '0 0 10px color-mix(in srgb, var(--accent) 20%, transparent)',
                      'inset 0 0 8px color-mix(in srgb, var(--accent) 5%, transparent)',
                    ].join(', '),
                  }
                  : undefined
            }
            className={[
              'flex w-full flex-col items-center gap-3 rounded-2xl',
              'border px-2 py-3.5',
              isDragging
                ? 'border-dashed border-white/20 bg-white/2 opacity-40'
                : 'border-white/[0.07] bg-white/4',
            ].join(' ')}
          >
            <span
              className="grid h-11 w-11 place-items-center rounded-xl text-xl text-slate-50"
              style={{
                background: isActive
                  ? 'color-mix(in srgb, var(--accent) 20%, transparent)'
                  : 'rgba(255,255,255,0.1)',
              }}
            >
              <Icon name={category.icon} />
            </span>
            <span className="text-center text-[12px] font-semibold leading-tight">{category.name}</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}

interface ParentCategoryHeaderProps {
  parent: Category
  isEditMode: boolean
  isPromoteTarget: boolean
  onEditParent: () => void
}

function ParentCategoryHeader({
  parent,
  isEditMode,
  isPromoteTarget,
  onEditParent,
}: ParentCategoryHeaderProps) {
  const { setNodeRef } = useDroppable({ id: PARENT_DROP_ID })

  return (
    <motion.div
      ref={isEditMode
        ? setNodeRef
        : undefined}
      role={isEditMode
        ? 'button'
        : undefined}
      onClick={isEditMode
        ? onEditParent
        : undefined}
      animate={isPromoteTarget
        ? { scale: 1.02 }
        : { scale: 1 }}
      transition={{
        type: 'spring', stiffness: 400, damping: 25,
      }}
      style={
        isPromoteTarget
          ? {
            borderColor: 'color-mix(in srgb, var(--accent) 60%, transparent)',
            backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)',
            boxShadow: '0 0 16px color-mix(in srgb, var(--accent) 35%, transparent)',
          }
          : undefined
      }
      className={[
        'flex items-center gap-3 rounded-2xl border border-transparent px-1 py-1',
        'text-lg font-bold text-slate-100',
        isEditMode
          ? 'cursor-pointer active:opacity-70'
          : '',
      ].join(' ')}
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10 text-xl">
        <Icon name={parent.icon} />
      </span>
      <span>{parent.name}</span>
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
  activeThisMonth,
  categoriesWithTransactions,
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
  onAddCategory,
  onReorder,
  onReparent,
}: CategorySelectionPageProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [reparentTargetId, setReparentTargetId] = useState<string | null>(null)
  const reparentTargetIdRef = useRef<string | null>(null)
  const hoveredIdRef = useRef<string | null>(null)
  const lingerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (lingerTimerRef.current !== null) {
        clearTimeout(lingerTimerRef.current)
      }
    }
  }, [])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 10 } }),
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string)
    if (lingerTimerRef.current !== null) {
      clearTimeout(lingerTimerRef.current)
      lingerTimerRef.current = null
    }
    hoveredIdRef.current = null
    reparentTargetIdRef.current = null
    setReparentTargetId(null)
  }

  function hasChildCategories(categoryId: string) {
    return categories.some((category) => category.parentId === categoryId)
  }

  function clearPendingReparent() {
    if (lingerTimerRef.current !== null) {
      clearTimeout(lingerTimerRef.current)
      lingerTimerRef.current = null
    }
    hoveredIdRef.current = null
    reparentTargetIdRef.current = null
    setReparentTargetId(null)
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event

    if (hasChildCategories(active.id as string)) {
      clearPendingReparent()

      return
    }

    if (!over || over.id === active.id || over.id === PARENT_DROP_ID) {
      clearPendingReparent()

      if (over?.id === PARENT_DROP_ID) {
        reparentTargetIdRef.current = PARENT_DROP_ID
        setReparentTargetId(PARENT_DROP_ID)
      }

      return
    }

    if (!rectsOverlap(active.rect.current.translated, over.rect)) {
      clearPendingReparent()

      return
    }

    if (over.id !== hoveredIdRef.current) {
      hoveredIdRef.current = over.id as string
      if (lingerTimerRef.current !== null) {
        clearTimeout(lingerTimerRef.current)
        lingerTimerRef.current = null
      }
      reparentTargetIdRef.current = null
      setReparentTargetId(null)

      lingerTimerRef.current = setTimeout(() => {
        lingerTimerRef.current = null
        reparentTargetIdRef.current = over.id as string
        setReparentTargetId(over.id as string)
      }, 400)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveId(null)

    if (lingerTimerRef.current !== null) {
      clearTimeout(lingerTimerRef.current)
      lingerTimerRef.current = null
    }
    hoveredIdRef.current = null

    const pendingReparent = reparentTargetIdRef.current
    reparentTargetIdRef.current = null
    setReparentTargetId(null)

    if (!over || active.id === over.id) {
      return
    }

    if (over.id === PARENT_DROP_ID && parent) {
      if (hasChildCategories(active.id as string)) {
        return
      }
      onReparent(active.id as string, parent.parentId)

      return
    }

    if (pendingReparent && pendingReparent !== active.id) {
      if (hasChildCategories(active.id as string)) {
        return
      }
      if (categoriesWithTransactions.has(pendingReparent)) {
        return
      }
      onReparent(active.id as string, pendingReparent)

      return
    }

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
              isActive={activeThisMonth.has(category.id)}
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
              style={
                activeThisMonth.has(category.id)
                  ? {
                    borderColor: 'color-mix(in srgb, var(--accent) 50%, transparent)',
                    backgroundColor: 'color-mix(in srgb, var(--accent) 6%, transparent)',
                    boxShadow: [
                      '0 0 10px color-mix(in srgb, var(--accent) 20%, transparent)',
                      'inset 0 0 8px color-mix(in srgb, var(--accent) 5%, transparent)',
                    ].join(', '),
                  }
                  : undefined
              }
              className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/4 px-2 py-3.5"
            >
              <span
                className="grid h-11 w-11 place-items-center rounded-xl text-xl text-slate-50"
                style={{
                  background: activeThisMonth.has(category.id)
                    ? 'color-mix(in srgb, var(--accent) 20%, transparent)'
                    : 'rgba(255,255,255,0.1)',
                }}
              >
                <Icon name={category.icon} />
              </span>
              <span className="text-center text-[12px] font-semibold leading-tight">{category.name}</span>
            </motion.button>
          )
      ))}
      {isEditMode && (
        <motion.button
          key="add-category"
          variants={cellVariants}
          whileTap={{ scale: 0.96 }}
          onClick={onAddCategory}
          type="button"
          className={[
            'flex flex-col items-center gap-3 rounded-2xl border border-dashed',
            'border-white/12 bg-white/3 px-2 py-3.5 text-accent-light',
            'active:bg-white/5',
          ].join(' ')}
        >
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent/10 text-xl">
            <Icon name="fa-plus" />
          </span>
          <span className="text-center text-[12px] font-semibold leading-tight">Add Category</span>
        </motion.button>
      )}
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

      {isEditMode
        ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
          >
            {parent && (
              <ParentCategoryHeader
                parent={parent}
                isEditMode={isEditMode}
                isPromoteTarget={reparentTargetId === PARENT_DROP_ID}
                onEditParent={onEditParent}
              />
            )}
            <AnimatePresence mode="wait">
              <SortableContext items={visible.map((c) => c.id)} strategy={rectSortingStrategy}>
                {grid}
              </SortableContext>
            </AnimatePresence>
            <DragOverlay>
              {activeCategory && (
                <div className={[
                  'flex flex-col items-center gap-3 rounded-2xl border',
                  'border-(--accent)/40 bg-slate-800/90 px-2 py-3.5 opacity-90 shadow-xl',
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
        : (
          <>
            {parent && (
              <ParentCategoryHeader
                parent={parent}
                isEditMode={isEditMode}
                isPromoteTarget={false}
                onEditParent={onEditParent}
              />
            )}
            <AnimatePresence mode="wait">
              {grid}
            </AnimatePresence>
          </>
        )}

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
