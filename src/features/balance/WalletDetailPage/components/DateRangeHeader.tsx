import { Card, Icon } from '@/components'

function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const monthName = new Date(Date.UTC(year, month - 1, 1))
    .toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })

  return `${day} ${monthName} ${year}`
}

export type DateRangeHeaderProps = {
  range: { start: string; end: string }
  onOpenPreset: () => void
}

export function DateRangeHeader({ range, onOpenPreset }: DateRangeHeaderProps) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <Card className="flex-1 p-2.5!">
        <p className="text-[10px] uppercase tracking-wide text-white/30">Begin</p>
        <p className="mt-0.5 text-sm font-semibold">{formatDateLabel(range.start)}</p>
      </Card>
      <Card className="flex-1 p-2.5!">
        <p className="text-[10px] uppercase tracking-wide text-white/30">End</p>
        <p className="mt-0.5 text-sm font-semibold">{formatDateLabel(range.end)}</p>
      </Card>
      <button
        aria-label="More date range options"
        onClick={onOpenPreset}
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          'border border-white/8 bg-white/5 text-white/50',
        ].join(' ')}
        type="button"
      >
        <Icon name="fa-ellipsis" />
      </button>
    </div>
  )
}
