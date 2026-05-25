import cx from 'classnames'

import { Icon } from '@/components'

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
        'flex w-full items-center gap-3 px-4 py-3 text-left',
        variant === 'standalone' && 'rounded-2xl border border-white/[0.07] bg-white/4',
      )}
      style={variant === 'standalone' && cleared
        ? { borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)' }
        : undefined}
      onClick={onToggle}
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs"
        style={{
          background: cleared
            ? 'color-mix(in srgb, var(--accent) 15%, transparent)'
            : 'rgba(255,255,255,0.04)',
          color: cleared
            ? 'var(--accent-light)'
            : 'rgba(255,255,255,0.35)',
        }}
      >
        <Icon name={cleared
          ? 'fa-circle-check'
          : 'fa-circle'} />
      </div>
      <div className="flex-1">
        <p className="text-xs text-white/35">Reconciliation</p>
        <p
          className="mt-0.5 text-sm font-semibold"
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
