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
        'flex w-full items-center gap-1 px-4 py-3 text-left',
        variant === 'standalone' && 'rounded-2xl border border-white/[0.07] bg-white/4',
      )}
      style={variant === 'standalone' && cleared
        ? { borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)' }
        : undefined}
      onClick={onToggle}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs"
        style={{
          background: cleared
            ? 'color-mix(in srgb, var(--accent) 15%, transparent)'
            : 'rgba(255,255,255,0.04)',
          color: cleared
            ? 'var(--accent-light)'
            : 'rgba(255,255,255,0.35)',
        }}
      >
        <Icon name={cleared ? 'fa-circle-check' : 'fa-circle'} />
      </div>
      <div className="min-w-0 flex-1 px-1">
        <p
          className="font-semibold"
          style={cleared ? { color: 'var(--accent-light)' } : undefined}
        >
          {cleared ? 'Cleared' : 'Not cleared'}
        </p>
      </div>
    </button>
  )
}
