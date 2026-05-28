import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { motion } from 'framer-motion'

import { Icon } from '@/components'
import { Category } from '@/types/domain'

interface SortableCategoryCellProps {
  category: Category
  index: number
  isEditMode: boolean
  isActive: boolean
  isReparentTarget: boolean
  onRequestDelete: (id: string) => void
  onSelect: (category: Category) => void
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

export function SortableCategoryCell({
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
                'absolute left-2 z-10 flex h-4.5 w-4.5',
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
              type: 'spring',
              stiffness: 400,
              damping: 25,
            }}
            style={
              isReparentTarget
                ? {
                  borderColor: 'color-mix(in srgb, var(--accent) 60%, transparent)',
                  backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                  boxShadow: '0 0 16px color-mix(in srgb, var(--accent) 35%, transparent)',
                }
                : undefined
            }
            className={[
              'flex w-full flex-col items-center gap-3 rounded-2xl py-2',
              isDragging
                ? 'opacity-40'
                : '',
            ].join(' ')}
          >
            <span
              className="grid h-14 w-14 place-items-center rounded-xl text-xl text-white/55"
              style={{
                background: isActive
                  ? 'color-mix(in srgb, var(--accent) 20%, transparent)'
                  : 'rgba(255,255,255,0.05)',
                color: isActive
                  ? 'var(--accent-light)'
                  : 'rgba(255,255,255,0.55)',
              }}
            >
              <Icon name={category.icon} className="text-2xl" />
            </span>
            <span className="text-center text-[12px] font-semibold leading-tight">{category.name}</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  )
}

