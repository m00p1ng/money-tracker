import { SectionLabel } from './SectionLabel'

interface ListGroupProps {
  label: string
  children: React.ReactNode
}

export function ListGroup({ label, children }: ListGroupProps) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="overflow-hidden rounded-2xl border border-white/6 bg-white/4 mt-2">
        {children}
      </div>
    </div>
  )
}
