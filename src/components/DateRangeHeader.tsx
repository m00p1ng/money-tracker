import { Icon } from '@/components'

function formatDateLabel(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const monthName = new Date(Date.UTC(year, month - 1, 1))
    .toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })

  return `${day} ${monthName} ${year}`
}

export type DateRangeHeaderProps = {
  range: { start: string; end: string }
  onClickStart: () => void
  onClickEnd: () => void
  onOpenPreset: () => void
}

export function DateRangeHeader({
  range,
  onClickStart,
  onClickEnd,
  onOpenPreset,
}: DateRangeHeaderProps) {
  return (
    <div className="mb-2 flex items-stretch overflow-hidden rounded-2xl border border-white/8.5 bg-white/8">
      <button
        type="button"
        aria-label="Begin"
        className="flex flex-1 flex-col justify-center px-4 py-3 text-left"
        onClick={onClickStart}
      >
        <p className="text-[10px] uppercase tracking-wide text-white/40">Begin</p>
        <p className="mt-0.5 text-sm font-semibold">{formatDateLabel(range.start)}</p>
      </button>

      <div className="flex items-center text-white/20">
        <Icon name="fa-chevron-right" />
      </div>

      <button
        type="button"
        aria-label="End"
        className="flex flex-1 flex-col justify-center px-4 py-3 text-left"
        onClick={onClickEnd}
      >
        <p className="text-[10px] uppercase tracking-wide text-white/40">End</p>
        <p className="mt-0.5 text-sm font-semibold">{formatDateLabel(range.end)}</p>
      </button>

      <button
        type="button"
        aria-label="More date range options"
        className="flex w-11 items-center justify-center border-l border-white/[0.07] text-white/40"
        onClick={onOpenPreset}
      >
        <Icon name="fa-ellipsis" />
      </button>
    </div>
  )
}
