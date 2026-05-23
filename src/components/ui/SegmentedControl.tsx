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
    <div className="grid rounded-xl bg-white/[0.06] p-0.5" style={{ gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))` }}>
      {segments.map((segment) => (
        <button
          key={segment.value}
          className={cx('rounded-[9px] px-3.5 py-1.5 text-xs font-semibold', segment.value === value ? 'text-white' : 'text-white/40')}
          style={segment.value === value ? {
            background: 'linear-gradient(135deg, var(--accent-btn-1), var(--accent-btn-2))',
            boxShadow: '0 2px 10px color-mix(in srgb, var(--accent) 40%, transparent)',
          } : undefined}
          onClick={() => onChange(segment.value)}
          type="button"
        >
          {segment.label}
        </button>
      ))}
    </div>
  )
}
