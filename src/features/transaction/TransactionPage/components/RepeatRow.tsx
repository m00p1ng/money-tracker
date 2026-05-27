import cx from 'classnames'

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
  variant?: 'standalone' | 'flat'
  onClick: () => void
}

export function RepeatRow({
  repeatConfig,
  variant = 'standalone',
  onClick,
}: RepeatRowProps) {
  const isActive = repeatConfig.preset !== 'never'

  return (
    <button
      aria-label="Repeat"
      className={cx(
        'flex w-full items-center gap-1 px-4 py-3 text-left',
        variant === 'standalone' && 'rounded-2xl border border-white/[0.07] bg-white/4',
      )}
      style={variant === 'standalone' && isActive
        ? { borderColor: 'color-mix(in srgb, var(--accent) 20%, transparent)' }
        : undefined}
      onClick={onClick}
      type="button"
    >
      <div className="min-w-0 flex-1 px-1">
        <p className="font-semibold">Repeat</p>
      </div>
      <span
        className="shrink-0 text-sm"
        style={isActive
          ? { color: 'var(--accent-light)' }
          : { color: 'rgba(255,255,255,0.4)' }}
      >
        {formatRepeat(repeatConfig)}
      </span>
      <Icon name="fa-chevron-right" className="text-white/20 text-sm" />
    </button>
  )
}
