import { Icon } from '@/components'

interface ReconciliationRowProps {
  cleared: boolean
  onToggle: () => void
}

export function ReconciliationRow({
  cleared,
  onToggle,
}: ReconciliationRowProps) {
  return (
    <button
      type="button"
      className={[
        'flex w-full items-center gap-3 rounded-2xl',
        'border border-white/[0.07] bg-white/[0.04] px-4 py-3 text-left',
      ].join(' ')}
      style={cleared
        ? { borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)' }
        : undefined}
      onClick={onToggle}
    >
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-xs"
        style={{
          background: cleared
            ? 'color-mix(in srgb, var(--accent) 15%, transparent)'
            : 'rgba(255,255,255,0.04)',
          color: cleared ? 'var(--accent-light)' : 'rgba(255,255,255,0.35)',
        }}
      >
        <Icon name={cleared ? 'fa-circle-check' : 'fa-circle'} />
      </div>
      <div className="flex-1">
        <p className="text-[11px] text-white/35">Reconciliation</p>
        <p
          className="mt-0.5 text-sm font-semibold"
          style={cleared ? { color: 'var(--accent-light)' } : undefined}
        >
          {cleared ? 'Cleared' : 'Not cleared'}
        </p>
      </div>
    </button>
  )
}
