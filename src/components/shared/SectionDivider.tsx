interface SectionDividerProps {
  label: string
}

export function SectionDivider({ label }: SectionDividerProps) {
  return (
    <div className="mb-2.5 flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-widest text-white/30">{label}</span>
      <div className="h-px flex-1 bg-white/[0.06]" />
    </div>
  )
}
