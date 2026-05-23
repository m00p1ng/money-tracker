interface ListGroupProps {
  label: string
  children: React.ReactNode
}

export function ListGroup({ label, children }: ListGroupProps) {
  return (
    <div>
      <p className="mb-2 pl-1 text-sm uppercase tracking-[1.5px] text-white/30">{label}</p>
      <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4">
        {children}
      </div>
    </div>
  )
}
