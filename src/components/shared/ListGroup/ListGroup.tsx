export function ListGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 pl-1 text-[11px] uppercase tracking-[1.5px] text-white/30">{label}</p>
      <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/[0.04]">
        {children}
      </div>
    </div>
  )
}
