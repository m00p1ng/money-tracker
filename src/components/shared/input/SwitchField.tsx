import cx from 'classnames'
import { motion } from 'framer-motion'

interface SwitchField {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function Switch({
  label,
  description,
  checked,
  onChange,
}: SwitchField) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg bg-white/[0.03] px-3 py-3">
      <span className="min-w-0">
        <span className="block text-sm font-medium text-slate-200">{label}</span>
        {description
          ? (
            <span className="mt-0.5 block text-xs leading-5 text-white/40">{description}</span>
          )
          : null}
      </span>
      <span className="relative shrink-0">
        <input
          aria-label={label}
          checked={checked}
          className="sr-only"
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span
          className={cx(
            'block h-6 w-11 rounded-full transition-colors',
            checked
              ? 'bg-accent'
              : 'bg-white/15',
          )}
        />
        <motion.span
          animate={{
            x: checked
              ? 20
              : 2,
          }}
          className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow"
          initial={false}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 25,
            mass: 0.8,
          }}
          whileTap={{
            width: 26,
            transition: {
              type: 'spring',
              stiffness: 400,
              damping: 20,
            },
          }}
        />
      </span>
    </label>
  )
}
