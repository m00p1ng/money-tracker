export type Segment<T extends string> = { label: string; value: T }

export function SegmentedControl<T extends string>({
  value,
  segments,
  onChange,
}: {
  value: T
  segments: Segment<T>[]
  onChange: (value: T) => void
}) {
  return (
    <div className="grid rounded-lg bg-white/5 p-1" style={{ gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))` }}>
      {segments.map((segment) => (
        <button
          key={segment.value}
          className={`rounded-md px-3 py-2 text-sm font-semibold ${segment.value === value ? 'bg-gradient-to-br from-[var(--accent-btn-1)] to-[var(--accent-btn-2)] text-white' : 'text-slate-400'}`}
          onClick={() => onChange(segment.value)}
          type="button"
        >
          {segment.label}
        </button>
      ))}
    </div>
  )
}
