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
    <div className="grid rounded-xl bg-white/[0.06] p-0.5" style={{ gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))` }}>
      {segments.map((segment) => (
        <button
          key={segment.value}
          className={`rounded-[9px] px-3.5 py-1.5 text-xs font-semibold ${segment.value === value ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_2px_10px_rgba(16,185,129,0.4)]' : 'text-white/40'}`}
          onClick={() => onChange(segment.value)}
          type="button"
        >
          {segment.label}
        </button>
      ))}
    </div>
  )
}
