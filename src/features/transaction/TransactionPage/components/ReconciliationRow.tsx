import cx from 'classnames'

interface ReconciliationRowProps {
  cleared: boolean
  variant?: 'standalone' | 'flat'
  onToggle: () => void
}

export function ReconciliationRow({
  cleared,
  variant = 'standalone',
  onToggle,
}: ReconciliationRowProps) {
  return (
    <button
      type="button"
      className={cx(
        'flex w-full items-center gap-1 px-4 py-3 text-left',
        variant === 'standalone' && 'rounded-2xl border border-white/[0.07] bg-white/4',
      )}
      style={variant === 'standalone' && cleared
        ? { borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)' }
        : undefined}
      onClick={onToggle}
    >
      <div className="min-w-0 flex-1 px-1">
        <p
          className="font-semibold"
          style={cleared
            ? { color: 'var(--accent-light)' }
            : undefined}
        >
          {cleared
            ? 'Cleared'
            : 'Not cleared'}
        </p>
      </div>
    </button>
  )
}
