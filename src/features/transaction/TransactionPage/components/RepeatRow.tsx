import { Icon } from '@/components'
import type { RepeatConfig } from '@/types/domain'

function formatRepeat(config: RepeatConfig): string {
  if (config.preset === 'daily') {
    return 'Daily'
  }

  if (config.preset === '2weeks') {
    return 'Every 2 Weeks'
  }

  if (config.preset === 'monthly') {
    return 'Monthly'
  }

  if (config.preset === 'yearly') {
    return 'Yearly'
  }

  if (config.preset === 'custom' && config.customEvery && config.customUnit) {
    const unit = config.customEvery === 1
      ? config.customUnit
      : `${config.customUnit}s`

    return `Every ${config.customEvery} ${unit}`
  }

  return 'Never'
}

interface RepeatRowProps {
  repeatConfig: RepeatConfig
  onClick: () => void
}

export function RepeatRow({
  repeatConfig,
  onClick,
}: RepeatRowProps) {
  return (
    <button
      aria-label="Repeat"
      className={[
        'flex w-full items-center gap-3 rounded-2xl',
        'border border-white/[0.07] bg-white/4 px-4 py-3 text-left',
      ].join(' ')}
      style={repeatConfig.preset !== 'never'
        ? { borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)' }
        : undefined}
      onClick={onClick}
      type="button"
    >
      <div
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs"
        style={{
          background: 'color-mix(in srgb, var(--accent) 15%, transparent)',
          color: 'var(--accent-light)',
        }}
      >
        <Icon name="fa-rotate" />
      </div>
      <div className="flex-1">
        <p className="text-xs text-white/35">Repeat</p>
        <p
          className="mt-0.5 text-sm font-semibold"
          style={repeatConfig.preset !== 'never'
            ? { color: 'var(--accent-light)' }
            : undefined
          }
        >
          {formatRepeat(repeatConfig)}
        </p>
      </div>
      <Icon name="fa-chevron-right" className="text-white/20 text-sm" />
    </button>
  )
}
