import cx from 'classnames'

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
        <span
          className={cx(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            checked
              ? 'translate-x-5'
              : 'translate-x-0.5',
          )}
        />
      </span>
    </label>
  )
}
