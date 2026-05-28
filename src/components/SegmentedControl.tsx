import cx from 'classnames'

export type Segment<T extends string> = { label: string; value: T }

interface SegmentedControlProps<T extends string> {
  value: T
  segments: Segment<T>[]
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({
  value,
  segments,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div
      className="grid rounded-xl border border-white/8 bg-white/[0.04] p-0.5"
      style={{ gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))` }}
    >
      {segments.map((segment) => (
        <button
          key={segment.value}
          className={cx(
            'cursor-pointer rounded-[9px] px-3.5 py-1.5 text-xs font-semibold',
            'transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
            segment.value === value
              ? 'text-white'
              : 'text-white/38 hover:text-white/60',
          )}
          style={segment.value === value
            ? {
              background: 'linear-gradient(135deg, var(--accent-btn-1), var(--accent-btn-2))',
              boxShadow: '0 1px 8px color-mix(in srgb, var(--accent) 35%, transparent)',
            }
            : undefined}
          onClick={() => onChange(segment.value)}
          type="button"
        >
          {segment.label}
        </button>
      ))}
    </div>
  )
}
